# LOVE Platform - System Prompts

## Overview

This folder contains detailed system prompts for building the LOVE (Learning Online Visualization Engine) SaaS platform. Each file guides a coding agent through a specific component with exhaustive detail.

## Architecture

```
100% Cloudflare Free Tier
├── Frontend: React + Vite → Cloudflare Pages
├── API: Cloudflare Workers
├── Database: Cloudflare KV
├── Storage: Cloudflare R2
└── Live Sync: Durable Objects
```

## Files

| File | Component | Priority |
|------|-----------|----------|
| `01_LANDING_PAGE.md` | Marketing site + Create flow | P0 - Week 1 |
| `02_DASHBOARD_GENERATOR.md` | AI generation engine | P0 - Week 1 |
| `03_CLOUDFLARE_WORKER.md` | API backend | P0 - Week 1 |
| `04_AUTH_SYSTEM.md` | User accounts | P1 - Week 2 |
| `05_PAYMENT_STRIPE.md` | Monetization | P1 - Week 2 |
| `06_POINTER_LIVE.md` | Live presenter mode | P2 - Week 3 |
| `07_ANALYTICS.md` | Usage tracking | P2 - Week 3 |
| `08_DEPLOYMENT.md` | CI/CD setup | P0 - Week 1 |

## How to Use

1. Start with `08_DEPLOYMENT.md` to set up Cloudflare resources
2. Then `03_CLOUDFLARE_WORKER.md` for the API foundation
3. Then `01_LANDING_PAGE.md` + `02_DASHBOARD_GENERATOR.md` for MVP
4. Layer on auth, payments, and advanced features

## Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3 dashboards, branded |
| Pro | $9/mo | Unlimited, no branding, analytics |
| Team | $29/mo | 5 seats, shared workspace |
| Enterprise | $99/mo | White-label, API access |

## Target Market

- Teachers & Educators
- Corporate Trainers
- Course Creators
- Coaches & Consultants
- Anyone who presents content

## Domain

- Main: `bankruptthebc.online`
- Lessons: `lesson.bankruptthebc.online`  
- App: `app.bankruptthebc.online`
