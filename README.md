# 🚀 Link Tracker Pro - Quick Start (5 Minutes)

## Step 1: Local Setup (2 minutes)

```bash
# Install dependencies
npm install

# Start server
npm start
```

✅ Server running at `http://localhost:3000`

---

## Step 2: Test It Works (1 minute)

```bash
# In another terminal
curl -X POST http://localhost:3000/api/links/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

You should get a response with your tracking link like:
```
{
  "shortCode": "abc123",
  "trackingUrl": "http://localhost:3000/t/abc123",
  ...
}
```

---

## Step 3: Deploy to Production (2 minutes)

### Using Render (Free, Easiest)

1. Go to **render.com** and sign up
2. Click **New +** → **Web Service**
3. Select **Deploy existing code from GitHub** 
   - Or upload these files directly
4. Fill in:
   - **Name**: `link-tracker-pro`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Environment** → Add variable:
   - **Key**: `BASE_URL`
   - **Value**: `https://link-tracker-pro.onrender.com` (Render will give you the URL)
6. Click **Deploy**
7. Wait 2-3 minutes
8. ✅ Your tracking links work globally!

---

## Step 4: Use the Dashboard

Update the API URL in your dashboard code:

```javascript
// In Dashboard.jsx or your React app
const API_URL = 'https://link-tracker-pro.onrender.com'; // Your Render URL
```

Then:
1. Open the dashboard
2. Go to **Create New Link** tab
3. Paste a URL: `instagram.com/yourprofile`
4. Get your tracking link
5. Share it (link looks normal, but you'll see who clicks)

---

## What Gets Tracked?

When someone clicks your tracking link:

✅ **IP Address** - Identify location, device  
✅ **Browser** - Chrome, Safari, Firefox, Edge, etc.  
✅ **Device** - iPhone, Android, MacBook, Windows PC, etc.  
✅ **OS** - iOS, Android, Windows, macOS, Linux  
✅ **Location** - City, Country (from IP)  
✅ **Coordinates** - Lat/Long of IP  
✅ **Timestamp** - Exact time of access  
✅ **User Agent** - Full browser/device details  

---

## Real Example

**You create:** `instagram.com/yourprofile`  
**You get:** `https://link-tracker-pro.onrender.com/t/abc123`

**Someone clicks it:**
```
🔗 IP: 192.168.1.105
📱 Device: iPhone 15
🌐 Browser: Safari 17
🖥️ OS: iOS 17.2
📍 Location: Los Angeles, CA, USA
⏰ Timestamp: 2024-01-15 14:32:45 UTC
```

---

## 🔐 Legal Reminder

✅ **People know they're being tracked** - Required by you  
✅ **They gave consent** - You confirmed this  
✅ **Legitimate security/monitoring** - Not spamming  

Always include a privacy notice in your bio/profile if required.

---

## Troubleshooting

**"Can't connect to server"**
- Is `npm start` running? Check terminal
- Is BASE_URL correct in dashboard?
- Are you using the right API URL?

**"Links not showing accesses"**
- Give it 10 seconds to sync
- Check browser console for errors
- Verify server health: `curl https://your-url/health`

**"IP shows as Unknown"**
- Some corporate/VPN IPs can't be geolocated
- This is normal - still tracked though
- Location data comes from offline IP database

---

## Files Included

- `server.js` - Backend server (handles tracking)
- `package.json` - Dependencies
- `.env.example` - Configuration template
- `Dashboard.jsx` - React dashboard (paste into your React project)
- `DEPLOYMENT_GUIDE.md` - Full detailed guide
- `README.md` - This file

---

## Next Features to Add

- 📧 Email alerts when someone accesses
- 🔔 Webhook notifications
- 📊 Advanced analytics/graphs
- 🎯 Custom landing pages before redirect
- 🔐 Password protection on tracking
- 📱 QR code generation
- 🌍 Heatmap of access locations

---

## Support

**Something not working?**
1. Check server logs: `npm start`
2. Test API: `curl http://localhost:3000/health`
3. Check .env file has BASE_URL
4. Look at browser console (F12) for errors

**Ready?** Go deploy! 🚀
