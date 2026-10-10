# 🚀 KisanSaathi Deployment Guide

This guide explains how to deploy **KisanSaathi** to **Vercel**, **GitHub Pages**, **Netlify**, or run it locally using Node.js.

---

## 1. Deploying to Vercel (Recommended)

KisanSaathi includes pre-configured `vercel.json` with optimized caching and clean URLs.

### Method A: 1-Click Import from GitHub
1. Push this repository to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** ➔ **"Project"**.
3. Select your `KisaanSaathi` repository.
4. Leave all settings default (Framework Preset: **Other**, Root Directory: `./`).
5. Click **"Deploy"**.
6. Your platform will be live with an HTTPS URL (e.g., `https://kisaansaathi.vercel.app`) in under 30 seconds!

### Method B: Deploy using Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# In project root, run:
vercel

# Deploy to production:
vercel --prod
```

---

## 2. Deploying to GitHub Pages

1. Go to your GitHub repository **Settings** ➔ **Pages**.
2. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
3. Click **Save**.
4. GitHub Pages will build and host your platform at:
   `https://<your-username>.github.io/KisaanSaathi/`

---

## 3. Deploying to Netlify

1. Drag-and-drop the project folder directly into [Netlify Drop](https://app.netlify.com/drop).
2. Or connect your GitHub repository; Netlify will auto-detect the root `index.html`.

---

## 4. Local Development

### Prerequisites
- Node.js (version 16+)

### Run Locally
```bash
# Clone the repository
git clone https://github.com/<your-username>/KisaanSaathi.git
cd KisaanSaathi

# Start the built-in server
npm start
# OR: node server.js

# Open in your browser:
# http://localhost:3000
```
