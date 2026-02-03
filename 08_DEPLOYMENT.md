# 08 - Deployment Guide

## System Prompt for Coding Agent

You are deploying the **LOVE Platform** to production using Cloudflare's free tier.

---

# INFRASTRUCTURE

```
Cloudflare Services (All Free Tier):
├── Pages: Frontend hosting (React app)
├── Workers: API backend
├── KV: Key-value storage (users, metadata)
├── R2: Object storage (HTML dashboards)
└── Durable Objects: WebSocket sessions (Pointer)
```

---

# STEP 1: CLOUDFLARE ACCOUNT SETUP

1. Create Cloudflare account at cloudflare.com
2. Enable Workers (free tier)
3. Create KV namespace: `love-data`
4. Create R2 bucket: `love-dashboards`
5. Note your Account ID

---

# STEP 2: WRANGLER CONFIG

```toml
# wrangler.toml

name = "love-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# KV
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID"

# R2
[[r2_buckets]]
binding = "R2"
bucket_name = "love-dashboards"

# Durable Objects
[[durable_objects.bindings]]
name = "POINTER"
class_name = "PointerSession"

[[migrations]]
tag = "v1"
new_classes = ["PointerSession"]
```

---

# STEP 3: SECRETS

```bash
# Set secrets (never commit these!)
wrangler secret put JWT_SECRET
wrangler secret put GEMINI_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

---

# STEP 4: DEPLOY WORKER

```bash
cd worker
npm install
npm run build
wrangler deploy
```

---

# STEP 5: DEPLOY FRONTEND

```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name love-app
```

---

# STEP 6: CUSTOM DOMAIN

1. Go to Cloudflare Dashboard → Pages → love-app
2. Custom domains → Add `bankruptthebc.online`
3. Add CNAME record pointing to `love-app.pages.dev`

---

# STEP 7: STRIPE WEBHOOK

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.bankruptthebc.online/api/stripe/webhook`
3. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted

---

# CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          workingDirectory: worker
          command: deploy

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        working-directory: frontend
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: love-app
          directory: frontend/dist
```

---

# MONITORING

- **Workers Analytics**: Cloudflare Dashboard → Workers → Analytics
- **Error Tracking**: Use `console.error()` + Logpush (or Sentry)
- **Uptime**: Cloudflare Health Checks or external (UptimeRobot)

---

# SECURITY CHECKLIST

- [ ] JWT_SECRET is 32+ random characters
- [ ] Stripe webhook secret configured
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] No secrets in code/commits

---

# ROLLBACK

```bash
# List deployments
wrangler deployments list

# Rollback to previous
wrangler rollback
```

---

# OUTPUT

Generate:
1. Complete wrangler.toml
2. GitHub Actions workflow
3. Environment setup scripts
4. Deployment checklist
