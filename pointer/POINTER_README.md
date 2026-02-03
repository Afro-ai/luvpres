
# Pointer System - Low Latency Teaching

## Overview
This system allows an admin to drag-and-drop an HTML dashboard/lesson and instantly share a synchronized view with students. It uses WebSockets (Cloudflare Durable Objects) to sync mouse movements, clicks, and scrolling in real-time.

## Architecture
- **Backend**: Cloudflare Worker + Durable Objects + R2 Storage.
- **Frontend**: React Components (`PresenterMode`, `ViewerMode`) integrated into the main app.
- **Communication**: WebSockets & Cross-Origin `postMessage` (via injected script).

## Setup & Deployment

### 1. Prerequisites
- Cloudflare Account with Workers Paid (for Durable Objects) or proper Free tier config.
- R2 Bucket named `ielts-calm-cbt`.

### 2. Backend Deployment
Navigate to `worker/`:
```bash
cd worker
npm install
npx wrangler deploy
```
*Note: This registers the `PointerSession` Durable Object.*

### 3. Frontend Deployment
Navigate to `stillmail/`:
```bash
cd stillmail
npm run build
npx wrangler pages deploy dist
```

## Usage

### For Presenter (Teacher)
1. Go to `/pointer` (e.g., `https://your-app.com/pointer`).
2. Drag & Drop an HTML file.
3. Wait for upload.
4. Copy the "Viewer Link".
5. Move your mouse freely over the content.

### For Viewer (Student)
1. Open the shared link.
2. Watch the cursor and content move in real-time.
