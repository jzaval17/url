const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const geoip = require('geoip-lite');
const cors = require('cors');
const UAParser = require('ua-parser-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tracked_links (
      id TEXT PRIMARY KEY,
      original_url TEXT,
      short_code TEXT UNIQUE,
      created_at DATETIME,
      click_count INTEGER DEFAULT 0,
      last_accessed DATETIME
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp DATETIME,
      browser TEXT,
      device TEXT,
      os TEXT,
      country TEXT,
      city TEXT,
      latitude REAL,
      longitude REAL,
      FOREIGN KEY(link_id) REFERENCES tracked_links(id)
    )
  `);
});

// Generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Parse user agent
function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  return {
    browser: result.browser.name || 'Unknown',
    device: result.device.name || (result.device.type === 'mobile' ? 'Mobile' : 'Desktop'),
    os: result.os.name || 'Unknown'
  };
}

// API: Create tracked link
app.post('/api/links/create', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  const id = Date.now().toString();
  const shortCode = generateShortCode();
  const trackingUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/t/${shortCode}`;

  db.run(
    'INSERT INTO tracked_links (id, original_url, short_code, created_at) VALUES (?, ?, ?, ?)',
    [id, url, shortCode, new Date().toISOString()],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id, shortCode, trackingUrl, originalUrl: url, createdAt: new Date().toISOString() });
    }
  );
});

// API: Get all tracked links
app.get('/api/links', (req, res) => {
  db.all(
    `SELECT 
      id, original_url as originalUrl, short_code as shortCode, 
      created_at as createdAt, click_count as clicks, 
      last_accessed as lastAccessed 
    FROM tracked_links ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      // Fetch access logs for each link
      const links = rows.map(row => {
        return new Promise((resolve) => {
          db.all(
            'SELECT * FROM access_logs WHERE link_id = ? ORDER BY timestamp DESC',
            [row.id],
            (err, accesses) => {
              resolve({
                ...row,
                trackingUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/t/${row.shortCode}`,
                accesses: accesses || []
              });
            }
          );
        });
      });

      Promise.all(links).then(results => res.json(results));
    }
  );
});

// Tracking redirect - captures metadata
app.get('/t/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const userAgent = req.headers['user-agent'];
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  db.get('SELECT * FROM tracked_links WHERE short_code = ?', [shortCode], (err, link) => {
    if (!link) return res.status(404).send('Link not found');

    // Parse user agent
    const ua = parseUserAgent(userAgent);
    
    // Get geolocation
    const geo = geoip.lookup(clientIp) || {};

    // Log access
    db.run(
      `INSERT INTO access_logs 
       (link_id, ip_address, user_agent, timestamp, browser, device, os, country, city, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        link.id,
        clientIp,
        userAgent,
        new Date().toISOString(),
        ua.browser,
        ua.device,
        ua.os,
        geo.country || 'Unknown',
        geo.city || 'Unknown',
        geo.ll ? geo.ll[0] : null,
        geo.ll ? geo.ll[1] : null
      ]
    );

    // Update click count and last accessed
    db.run(
      'UPDATE tracked_links SET click_count = click_count + 1, last_accessed = ? WHERE id = ?',
      [new Date().toISOString(), link.id]
    );

    // Redirect to original URL
    res.redirect(302, link.original_url);
  });
});

// API: Get link details
app.get('/api/links/:id', (req, res) => {
  db.get(
    'SELECT * FROM tracked_links WHERE id = ?',
    [req.params.id],
    (err, link) => {
      if (!link) return res.status(404).json({ error: 'Link not found' });
      
      db.all(
        'SELECT * FROM access_logs WHERE link_id = ? ORDER BY timestamp DESC',
        [req.params.id],
        (err, accesses) => {
          res.json({ ...link, accesses });
        }
      );
    }
  );
});

// API: Delete link
app.delete('/api/links/:id', (req, res) => {
  db.run('DELETE FROM access_logs WHERE link_id = ?', [req.params.id]);
  db.run('DELETE FROM tracked_links WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔍 Link Tracker running on port ${PORT}`);
  console.log(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
