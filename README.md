# LOVE Platform - Setup & Deployment Guide

## Domain: teddie.qzz.io

---

## 1. Cloudflare Account Setup

### Worker Secrets
Set these secrets in your Cloudflare Worker:

```bash
# Navigate to worker directory
cd worker

# Set Gemini API key (for AI generation)
npx wrangler secret put GEMINI_KEY
# Paste your key when prompted

# Set Admin password (for /admin access)
npx wrangler secret put ADMIN_PASSWORD
# Choose a strong password

# Set CORS origin (your frontend domain)
npx wrangler secret put CORS_ORIGIN
# Enter: https://teddie.qzz.io
```

### Environment Variables (wrangler.toml)
These are already in `wrangler.toml`:
```toml
[vars]
ENVIRONMENT = "production"
```

---

## 2. Custom Domain Setup

### Frontend (Cloudflare Pages)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your Pages project: `luvpres`
3. Go to **Custom domains** → **Set up a custom domain**
4. Enter: `teddie.qzz.io`
5. Follow DNS verification steps

### Worker API
1. Go to your Worker: `love-api`
2. Go to **Triggers** → **Custom Domains**
3. Add: `api.teddie.qzz.io` (optional, or keep current URL)

---

## 3. Update Frontend API Base

Edit `frontend/src/lib/api.ts` and admin pages:
```typescript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8787/api' 
  : 'https://love-api.tedguy280.workers.dev/api';
```

---

## 4. Required Secrets Summary

| Secret | Purpose | Where to Get |
|--------|---------|-------------|
| `GEMINI_KEY` | AI dashboard generation | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `ADMIN_PASSWORD` | Admin panel access | Choose your own |
| `CORS_ORIGIN` | Frontend domain | `https://teddie.qzz.io` |

---

## 5. Deploy Commands

```bash
# Deploy Worker (API)
cd worker
npx wrangler deploy

# Deploy Frontend
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=luvpres
```

---

## 6. Verify Deployment

1. **Health check**: `https://love-api.tedguy280.workers.dev/api/health`
2. **Frontend**: `https://teddie.qzz.io`
3. **Admin**: `https://teddie.qzz.io/admin`

---

## Troubleshooting

### "Admin not configured" error
```bash
npx wrangler secret put ADMIN_PASSWORD
```

### CORS errors
```bash
npx wrangler secret put CORS_ORIGIN
# Enter: https://teddie.qzz.io
```

### Check secrets are set
```bash
npx wrangler secret list
```
