import React, { useState, useEffect } from 'react';

export default function LinkTrackerDashboard() {
  // 🔧 UPDATE THIS TO YOUR SERVER URL
  const API_URL = process.env.REACT_APP_API_URL || 'https://link-tracker-pro.onrender.com';

  const [links, setLinks] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLink, setSelectedLink] = useState(null);
  const [copied, setCopied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all links on mount and periodically
  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/links`);
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
      setError(null);
    } catch (err) {
      setError('Unable to connect to server. Make sure it\'s running.');
      console.error(err);
    }
  };

  const createTrackedLink = async (url) => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/links/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.startsWith('http') ? url : 'https://' + url })
      });
      if (!response.ok) throw new Error('Failed to create link');
      
      setUrlInput('');
      await fetchLinks();
      setActiveTab('dashboard');
    } catch (err) {
      setError('Failed to create tracked link. Check server connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (linkId) => {
    if (!window.confirm('Delete this tracked link?')) return;
    try {
      const response = await fetch(`${API_URL}/api/links/${linkId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      setSelectedLink(null);
      await fetchLinks();
    } catch (err) {
      setError('Failed to delete link');
      console.error(err);
    }
  };

  const copyToClipboard = (text, linkId) => {
    navigator.clipboard.writeText(text);
    setCopied(linkId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  const getUniqueIPs = (accesses) => {
    return new Set(accesses.map(a => a.ip_address)).size;
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', padding: '24px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '18px' }}>🔍</div>
            <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '28px', fontWeight: 600 }}>Link Tracker Pro</h1>
          </div>
          <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>Real-time tracking with IP, device & location metadata</p>
          {error && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
          {['dashboard', 'create'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === tab ? '#3b82f6' : '#94a3b8',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {tab === 'dashboard' ? `Dashboard (${links.length})` : 'Create New Link'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {links.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>No tracked links yet. Create one to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {links.map(link => {
                  const uniqueIPs = getUniqueIPs(link.accesses);
                  const isExpanded = selectedLink?.id === link.id;
                  return (
                    <div
                      key={link.id}
                      onClick={() => setSelectedLink(isExpanded ? null : link)}
                      style={{
                        background: isExpanded ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                        border: isExpanded ? '1px solid #3b82f6' : '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target URL</p>
                          <p style={{ color: '#f1f5f9', fontSize: '14px', margin: 0, wordBreak: 'break-all', opacity: 0.8 }}>{link.originalUrl}</p>
                        </div>
                        <span style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                          {link.clicks} clicks
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)' }}>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>Unique IPs</p>
                          <p style={{ color: '#60a5fa', fontSize: '18px', fontWeight: 600, margin: '4px 0 0 0' }}>{uniqueIPs}</p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>Created</p>
                          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '4px 0 0 0' }}>{new Date(link.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>Last Access</p>
                          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '4px 0 0 0' }}>{link.lastAccessed ? new Date(link.lastAccessed).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ animation: 'slideDown 0.3s ease' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Tracking URL</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                value={link.trackingUrl}
                                readOnly
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  background: 'rgba(15, 23, 42, 0.8)',
                                  border: '1px solid rgba(148, 163, 184, 0.3)',
                                  borderRadius: '6px',
                                  color: '#cbd5e1',
                                  fontSize: '12px',
                                  fontFamily: 'monospace'
                                }}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(link.trackingUrl, link.id); }}
                                style={{
                                  padding: '8px 16px',
                                  background: copied === link.id ? '#10b981' : '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  transition: 'all 0.2s'
                                }}
                              >
                                {copied === link.id ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Real-Time Access Log</p>
                            {link.accesses.length === 0 ? (
                              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No access yet</p>
                            ) : (
                              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {link.accesses.map((access, idx) => (
                                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '12px', borderLeft: '3px solid #f59e0b' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <p style={{ color: '#f1f5f9', margin: 0, fontWeight: 500 }}>🔗 {access.ip_address}</p>
                                      <p style={{ color: '#64748b', margin: 0, fontSize: '11px' }}>{formatDate(access.timestamp)}</p>
                                    </div>
                                    <p style={{ color: '#94a3b8', margin: '2px 0', fontSize: '11px' }}>
                                      {access.device} • {access.browser} • {access.os}
                                    </p>
                                    <p style={{ color: '#64748b', margin: 0, fontSize: '11px' }}>
                                      📍 {access.city}, {access.country}
                                      {access.latitude && ` (${access.latitude.toFixed(2)}, ${access.longitude.toFixed(2)})`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); deleteLink(link.id); }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            Delete Link
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div style={{ maxWidth: '500px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ color: '#f1f5f9', fontSize: '18px', margin: '0 0 16px 0', fontWeight: 600 }}>Create a New Tracked Link</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  URL to Track
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && createTrackedLink(urlInput)}
                  placeholder="example.com or https://example.com/page"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.6 : 1
                  }}
                />
              </div>

              <button
                onClick={() => createTrackedLink(urlInput)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Creating...' : 'Generate Tracking Link'}
              </button>

              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <p style={{ color: '#60a5fa', fontSize: '12px', margin: '0 0 8px 0', fontWeight: 500 }}>💡 Live Tracking Features:</p>
                <ul style={{ color: '#94a3b8', fontSize: '12px', margin: '0', paddingLeft: '20px' }}>
                  <li>Real IP address capture</li>
                  <li>Browser & OS detection</li>
                  <li>Device type identification</li>
                  <li>Geographic location (City/Country)</li>
                  <li>Precise timestamps</li>
                  <li>Auto-refresh every 5 seconds</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 1000px; }
        }
      `}</style>
    </div>
  );
}
