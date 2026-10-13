# 🚀 Vercel Deployment Guide

This guide outlines everything you need to deploy **The Dive Village Frontend** to Vercel seamlessly with zero hassle.

---

## ⚡ Quick 1-Click Deployment

1. **Push to GitHub**: Make sure all changes on `TheDiveVillage-Frontend` are committed and pushed to your GitHub repository.
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
   - Select and import your **`TheDiveVillage-Frontend`** GitHub repository.
3. **Configure Settings**:
   - **Framework Preset**: Vite (detected automatically)
   - **Root Directory**: `./` (Default - root monorepo config handles workspaces automatically)
   - **Build Command**: `npm run build --workspace=Frontend` (configured in `vercel.json`)
   - **Output Directory**: `Frontend/dist` (configured in `vercel.json`)
4. **Environment Variables**: Add your backend URL and Firebase configuration (see list below).
5. **Deploy**: Click **Deploy**!

---

## 🔑 Environment Variables

In your Vercel Dashboard, go to **Project Settings > Environment Variables** and add the following:

| Variable Name | Description | Example / Fallback |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Your Backend API base URL | `https://api.thedivevillage.com` (or your deployed backend) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `thedivevillage.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `thedivevillage` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `thedivevillage.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:web:abcdef` |

*(Note: If Firebase environment variables are not provided, the app will gracefully run in guest/demo mode without crashing).*

---

## 🛠️ Built-in Production Optimizations

This repo is pre-configured with:
- **SPA Deep-Linking & Routing**: `vercel.json` rewrites all client-side routes (e.g. `/shop`, `/book-us`, `/about`, `/services`) to `/index.html`, eliminating `404 Not Found` errors on page reloads.
- **Aggressive Asset Caching**: Static chunks and media under `/assets/` are served with `Cache-Control: public, max-age=31536000, immutable` for maximum speed.
- **Optimized Assets**: Lightweight compressed video and image assets are configured for smooth streaming across devices.
- **Clean URLs**: Clean URL resolution is enabled out-of-the-box.

