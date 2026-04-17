# Link Tracker Pro - Complete Setup Guide

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```
Edit `.env` and set:
- `PORT=3000`
- `BASE_URL=http://localhost:3000`

### 3. Run the Server
```bash
npm start
```

Server runs at `http://localhost:3000`

### 4. Test the API
```bash
# Create a tracked link
curl -X POST http://localhost:3000/api/links/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get all links
curl http://localhost:3000/api/links

# Health check
curl http://localhost:3000/health
```

---

## 🌐 Deploy to Production (Free)

### Option 1: Render (Recommended - Easiest)

1. **Sign up at render.com** (free tier available)

2. **Create New Web Service**
   - Connect your GitHub repo (or paste code)
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: Node
   - Plan: Free

3. **Add Environment Variables**
   - In Render dashboard → Environment
   - Set `BASE_URL` to your Render URL (e.g., `https://link-tracker-pro.onrender.com`)

4. **Deploy**
   - Render auto-deploys on push
   - Your tracking links work immediately

### Option 2: Railway (Also Free)

1. **Sign up at railway.app**
2. **Deploy from GitHub** or upload project
3. **Set environment variables** in dashboard
4. **Get public URL** and update `BASE_URL`

### Option 3: Heroku (Paid, but was free - Alternative)

Heroku no longer has free tier, but you can use Render or Railway instead.

---

## 🔗 How Tracking Links Work

### Creating a Link
**Request:**
```bash
POST /api/links/create
Content-Type: application/json

{
  "url": "https://instagram.com/yourprofile"
}
```

**Response:**
```json
{
  "id": "1712345678",
  "shortCode": "abc123",
  "trackingUrl": "https://your-domain.com/t/abc123",
  "originalUrl": "https://instagram.com/yourprofile",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### How It Captures Data

When someone clicks `https://your-domain.com/t/abc123`:

1. **Server captures:**
   - IP address
   - Browser (Chrome, Safari, Firefox, etc.)
   - Device type (Desktop, Mobile, Tablet)
   - Operating system (iOS, Windows, Android, etc.)
   - Location (Country, City from IP geolocation)
   - Exact timestamp
   - User agent string (full browser/device info)

2. **Stores in database:**
   - All metadata permanently saved
   - Updates click count
   - Records last accessed time

3. **Redirects user:**
   - User is redirected to original URL
   - Appears completely normal to them
   - They don't see any tracking indication

### Example: What You'll See

```
Access Log Entry:
├── Timestamp: 2024-01-15 14:32:45 UTC
├── IP: 192.168.1.105
├── Browser: Chrome 121
├── Device: iPhone 15
├── OS: iOS 17
├── Location: Los Angeles, CA, USA
└── Coordinates: 34.0522, -118.2437
```

---

## 📊 API Endpoints Reference

### Create Tracked Link
```
POST /api/links/create
Body: { "url": "https://target-url.com" }
Returns: { id, shortCode, trackingUrl, originalUrl, createdAt }
```

### Get All Links & Analytics
```
GET /api/links
Returns: Array of all tracked links with access logs
```

### Get Single Link Details
```
GET /api/links/{id}
Returns: Link details + complete access log
```

### Delete Link
```
DELETE /api/links/{id}
Returns: { success: true }
```

### Health Check
```
GET /health
Returns: { status: "ok" }
```

---

## 🔐 Security Considerations

1. **Consent is Required**
   - Recipients must know they're being tracked
   - Include disclosure if required by law

2. **Data Privacy**
   - Don't store unnecessary personal info
   - Follow GDPR/CCPA if applicable
   - Have a privacy policy

3. **Secure Your Dashboard**
   - Add authentication to `/api/links` endpoints
   - Use HTTPS only (automatic on Render/Railway)
   - Consider IP whitelisting

4. **Add Password Protection (Optional)**
   ```javascript
   // Add to server.js before routes
   const basicAuth = require('express-basic-auth');
   app.use(basicAuth({
     users: { 'admin': 'your-strong-password' },
     challenge: true
   }));
   ```

---

## 🎯 Integration with Dashboard

The frontend dashboard needs to point to your backend:

In your dashboard code, update API calls:

```javascript
// Before (local only)
const API_URL = 'http://localhost:3000';

// After (production)
const API_URL = 'https://your-render-app.onrender.com';
```

Then all link creation, retrieval, and deletion will use your live backend.

---

## 📱 Accessing From Mobile

Once deployed:
- Share `https://your-domain.com/t/abc123` with anyone
- Clicks from phone/tablet are tracked normally
- IP geolocation still works
- Device/browser/OS detection works perfectly

---

## 🐛 Troubleshooting

**"Link not tracking"**
- Check `BASE_URL` is set correctly in `.env`
- Ensure server is running: `curl https://your-domain/health`
- Check database isn't full

**"Location shows Unknown"**
- Geoip-lite uses offline database
- Some IPs can't be geolocated
- This is normal behavior

**"Rate limiting"**
- Render free tier has limits
- Upgrade to paid for higher traffic
- Or use Railway/other provider

**"Links not persisting after restart"**
- Using in-memory SQLite (automatic reset)
- For persistence, upgrade to PostgreSQL:
  ```bash
  npm install pg sequelize
  ```
  Then modify `server.js` to use PostgreSQL

---

## 🚀 Next Steps

1. ✅ Set up server locally
2. ✅ Test API endpoints
3. ✅ Deploy to Render/Railway
4. ✅ Update dashboard with production URL
5. ✅ Create and share tracking links
6. ✅ Monitor access logs in real-time

---

## 📧 Support

For issues:
- Check server logs: `npm start`
- Test health endpoint: `/health`
- Verify environment variables
- Check browser console for frontend errors

Need more features?
- Add email alerts on access
- Webhook notifications
- Custom landing pages
- QR code generation
- Advanced analytics/graphs
