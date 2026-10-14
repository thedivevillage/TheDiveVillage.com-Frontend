# 🚀 Deployment Guide (Cloudflare Pages)

This guide outlines everything you need to deploy **The Dive Village Frontend** to **Cloudflare Pages** seamlessly.

---

## ☁️ Cloudflare Pages Deployment

### 1. Project Configuration in Cloudflare Dashboard
1. Go to your **Cloudflare Dashboard** -> **Compute (Workers & Pages)** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository: **`thedivevillage/TheDiveVillage.com-Frontend`**.
3. In **Set up builds and deployments**, configure:
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `Frontend/dist` (or `dist` — both work with the included sync script)
   - **Root directory**: `/` (Leave blank or `/` — do **NOT** set to `Frontend` because the LFS hydrator runs from the repo root)
4. Under **Environment variables**, add your production variables (see list below).
5. Click **Save and Deploy**.

### 2. Built-in Cloudflare Pages Support
- **`wrangler.json`**: Pre-configured with `"pages_build_output_dir": "Frontend/dist"`.
- **`Frontend/public/_redirects`**: Automatically provides SPA fallback (`/* /index.html 200`) so refreshing routes (e.g., `/shop`, `/book-us`, `/about`) works without 404s.
- **`Frontend/public/_headers`**: Configured with CORS and immutable caching for static assets.
- **`scripts/sync-dist.js`**: Automatically mirrors `Frontend/dist` to root `./dist` upon build completion, ensuring deployments succeed regardless of whether the output directory is configured as `Frontend/dist` or `dist`.

---

## 🔑 Environment Variables Reference

In Cloudflare Pages Dashboard, go to **Settings > Environment variables** and add:

| Variable Name | Description | Example / Fallback |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Your Backend API base URL | `https://the-dive-village-backend.onrender.com` (or left blank for static fallback) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `thedivevillage.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `thedivevillage` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `thedivevillage.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:web:abcdef` |

*(Note: When `VITE_API_BASE_URL` is omitted, the frontend automatically serves catalog items and experiences using static offline assets and will never request local device permissions).*

---

## 🛠️ Built-in Production Optimizations

This repo is pre-configured with:
- **SPA Deep-Linking & Routing**: `vercel.json` rewrites all client-side routes (e.g. `/shop`, `/book-us`, `/about`, `/services`) to `/index.html`, eliminating `404 Not Found` errors on page reloads.
- **Aggressive Asset Caching**: Static chunks and media under `/assets/` are served with `Cache-Control: public, max-age=31536000, immutable` for maximum speed.
- **Optimized Assets**: Lightweight compressed video and image assets are configured for smooth streaming across devices.
- **Clean URLs**: Clean URL resolution is enabled out-of-the-box.

