# 03 - Cloudflare Worker API

## System Prompt for Coding Agent

You are building the **Cloudflare Worker API backend** for LOVE. This Worker handles all server-side logic, including generation requests, publishing, authentication, and payments.

---

# OBJECTIVE

Build a production-ready Cloudflare Worker that:
1. Handles all API endpoints
2. Integrates with KV for metadata
3. Integrates with R2 for file storage
4. Manages user sessions and auth
5. Processes Stripe webhooks
6. Implements rate limiting

---

# TECHNOLOGY STACK

```
Runtime: Cloudflare Workers
Language: TypeScript
Storage: Cloudflare KV (metadata), Cloudflare R2 (files)
Auth: JWT tokens
Payments: Stripe
```

---

# FILE STRUCTURE

```
worker/
├── src/
│   ├── index.ts              # Main entry, router
│   ├── router.ts             # URL routing logic
│   ├── handlers/
│   │   ├── generate.ts       # POST /api/generate
│   │   ├── publish.ts        # POST /api/publish
│   │   ├── dashboard.ts      # GET /api/dashboard/:id
│   │   ├── auth.ts           # Auth endpoints
│   │   └── stripe.ts         # Stripe webhooks
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── cors.ts           # CORS headers
│   │   └── rate-limit.ts     # Rate limiting
│   ├── generator/            # (from 02_DASHBOARD_GENERATOR.md)
│   │   └── ...
│   ├── utils/
│   │   ├── jwt.ts            # JWT helpers
│   │   ├── password.ts       # Password hashing
│   │   ├── id.ts             # ID generation
│   │   └── response.ts       # Response helpers
│   └── types.ts              # Type definitions
├── wrangler.toml
├── package.json
└── tsconfig.json
```

---

# WRANGLER CONFIGURATION

```toml
# wrangler.toml

name = "love-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Production routes
routes = [
  { pattern = "api.bankruptthebc.online/*", zone_name = "bankruptthebc.online" }
]

# KV Namespaces
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID"
preview_id = "YOUR_PREVIEW_KV_ID"

# R2 Bucket
[[r2_buckets]]
binding = "R2"
bucket_name = "love-dashboards"
preview_bucket_name = "love-dashboards-preview"

# Durable Objects (for Pointer - optional for MVP)
# [[durable_objects.bindings]]
# name = "POINTER"
# class_name = "PointerSession"

# Environment Variables
[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://bankruptthebc.online"
JWT_EXPIRY = "7d"

# Secrets (set via `wrangler secret put`)
# JWT_SECRET
# GEMINI_KEY
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
```

---

# TYPE DEFINITIONS

```typescript
// src/types.ts

export interface Env {
  // KV Namespace
  KV: KVNamespace;
  
  // R2 Bucket
  R2: R2Bucket;
  
  // Secrets
  JWT_SECRET: string;
  GEMINI_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Vars
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
  JWT_EXPIRY: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  stripeCustomerId?: string;
  createdAt: number;
}

export interface Dashboard {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  views: number;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number; // For free tier (7 days)
}

export interface Session {
  userId: string;
  email: string;
  plan: string;
  expiresAt: number;
}

export interface ApiError {
  error: string;
  message: string;
  code?: number;
}
```

---

# MAIN ROUTER

```typescript
// src/index.ts

import { handleCors, corsHeaders } from './middleware/cors';
import { handleGenerate } from './handlers/generate';
import { handlePublish, handleGetDashboard, handleListDashboards } from './handlers/dashboard';
import { handleLogin, handleSignup, handleLogout, handleMe } from './handlers/auth';
import { handleStripeWebhook } from './handlers/stripe';
import { verifyAuth } from './middleware/auth';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors(request, env);
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    try {
      // Public routes (no auth required)
      if (path === '/api/health') {
        return json({ status: 'ok', timestamp: Date.now() });
      }
      
      if (path === '/api/auth/login' && method === 'POST') {
        return handleLogin(request, env);
      }
      
      if (path === '/api/auth/signup' && method === 'POST') {
        return handleSignup(request, env);
      }
      
      if (path === '/api/stripe/webhook' && method === 'POST') {
        return handleStripeWebhook(request, env);
      }
      
      // Public dashboard viewing
      if (path.match(/^\/api\/dashboard\/[\w-]+$/) && method === 'GET') {
        const id = path.split('/').pop()!;
        return handleGetDashboard(id, request, env);
      }
      
      // Semi-protected (works without auth but limited)
      if (path === '/api/generate' && method === 'POST') {
        return handleGenerate(request, env);
      }
      
      // Protected routes (auth required)
      const authResult = await verifyAuth(request, env);
      if (!authResult.valid) {
        return json({ error: 'unauthorized', message: 'Please log in' }, 401);
      }
      
      const user = authResult.user!;
      
      if (path === '/api/auth/me' && method === 'GET') {
        return handleMe(user);
      }
      
      if (path === '/api/auth/logout' && method === 'POST') {
        return handleLogout(request, env);
      }
      
      if (path === '/api/publish' && method === 'POST') {
        return handlePublish(request, env, user);
      }
      
      if (path === '/api/dashboards' && method === 'GET') {
        return handleListDashboards(request, env, user);
      }
      
      // 404
      return json({ error: 'not_found', message: 'Endpoint not found' }, 404);
      
    } catch (error) {
      console.error('Worker error:', error);
      return json(
        { error: 'internal_error', message: 'An unexpected error occurred' },
        500
      );
    }
  }
};

// Helper
function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
```

---

# AUTHENTICATION HANDLERS

```typescript
// src/handlers/auth.ts

import { hashPassword, verifyPassword } from '../utils/password';
import { createToken, generateId } from '../utils/jwt';
import { User } from '../types';

export async function handleSignup(request: Request, env: Env): Promise<Response> {
  const { email, password, name } = await request.json() as {
    email: string;
    password: string;
    name: string;
  };
  
  // Validate
  if (!email || !password || !name) {
    return json({ error: 'invalid_input', message: 'Email, password, and name required' }, 400);
  }
  
  if (password.length < 8) {
    return json({ error: 'weak_password', message: 'Password must be at least 8 characters' }, 400);
  }
  
  // Check if user exists
  const existingUser = await env.KV.get(`user:${email}`);
  if (existingUser) {
    return json({ error: 'user_exists', message: 'An account with this email already exists' }, 409);
  }
  
  // Create user
  const userId = generateId();
  const passwordHash = await hashPassword(password);
  
  const user: User = {
    id: userId,
    email: email.toLowerCase(),
    name,
    plan: 'free',
    createdAt: Date.now()
  };
  
  // Store user
  await env.KV.put(`user:${email}`, JSON.stringify({ ...user, passwordHash }));
  await env.KV.put(`user_id:${userId}`, email);
  
  // Create session token
  const token = await createToken(user, env.JWT_SECRET);
  
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    },
    token
  });
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { email, password } = await request.json() as {
    email: string;
    password: string;
  };
  
  // Find user
  const userData = await env.KV.get(`user:${email.toLowerCase()}`);
  if (!userData) {
    return json({ error: 'invalid_credentials', message: 'Invalid email or password' }, 401);
  }
  
  const storedUser = JSON.parse(userData);
  
  // Verify password
  const isValid = await verifyPassword(password, storedUser.passwordHash);
  if (!isValid) {
    return json({ error: 'invalid_credentials', message: 'Invalid email or password' }, 401);
  }
  
  // Create session token
  const user: User = {
    id: storedUser.id,
    email: storedUser.email,
    name: storedUser.name,
    plan: storedUser.plan,
    createdAt: storedUser.createdAt
  };
  
  const token = await createToken(user, env.JWT_SECRET);
  
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    },
    token
  });
}

export async function handleMe(user: User): Promise<Response> {
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    }
  });
}

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  // For JWT, logout is client-side (just delete the token)
  // Optionally, we could maintain a blacklist
  return json({ success: true });
}
```

---

# DASHBOARD HANDLERS

```typescript
// src/handlers/dashboard.ts

import { generateDashboard } from '../generator';
import { generateId } from '../utils/id';
import { Dashboard, User } from '../types';

export async function handlePublish(
  request: Request, 
  env: Env, 
  user: User
): Promise<Response> {
  const { html, title } = await request.json() as {
    html: string;
    title: string;
  };
  
  // Validate
  if (!html || !title) {
    return json({ error: 'invalid_input', message: 'HTML and title required' }, 400);
  }
  
  // Check dashboard limit for free tier
  const dashboardCount = await getDashboardCount(user.id, env);
  const limit = user.plan === 'free' ? 3 : user.plan === 'pro' ? 1000 : Infinity;
  
  if (dashboardCount >= limit) {
    return json({
      error: 'dashboard_limit',
      message: `You've reached your dashboard limit (${limit})`,
      upgrade: '/pricing'
    }, 403);
  }
  
  // Generate unique ID
  const id = generateId(8);
  
  // Store HTML in R2
  await env.R2.put(`dashboards/${id}.html`, html, {
    customMetadata: {
      userId: user.id,
      title
    }
  });
  
  // Store metadata in KV
  const dashboard: Dashboard = {
    id,
    userId: user.id,
    title,
    isPublic: true,
    views: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // Free tier dashboards expire after 7 days
    expiresAt: user.plan === 'free' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : undefined
  };
  
  await env.KV.put(`dashboard:${id}`, JSON.stringify(dashboard));
  
  // Add to user's dashboard list
  await addDashboardToUser(user.id, id, env);
  
  return json({
    id,
    url: `https://bankruptthebc.online/p/${id}`,
    expiresAt: dashboard.expiresAt
  });
}

export async function handleGetDashboard(
  id: string, 
  request: Request, 
  env: Env
): Promise<Response> {
  // Get metadata
  const metadata = await env.KV.get(`dashboard:${id}`);
  if (!metadata) {
    return json({ error: 'not_found', message: 'Dashboard not found' }, 404);
  }
  
  const dashboard: Dashboard = JSON.parse(metadata);
  
  // Check expiry
  if (dashboard.expiresAt && Date.now() > dashboard.expiresAt) {
    return json({ error: 'expired', message: 'This dashboard has expired' }, 410);
  }
  
  // Get HTML from R2
  const object = await env.R2.get(`dashboards/${id}.html`);
  if (!object) {
    return json({ error: 'not_found', message: 'Dashboard content not found' }, 404);
  }
  
  const html = await object.text();
  
  // Increment view count (async, don't wait)
  incrementViews(id, env);
  
  // Return HTML directly (for iframe embedding)
  const wantsJson = request.headers.get('Accept')?.includes('application/json');
  
  if (wantsJson) {
    return json({
      id: dashboard.id,
      title: dashboard.title,
      html,
      views: dashboard.views,
      createdAt: dashboard.createdAt
    });
  }
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

export async function handleListDashboards(
  request: Request, 
  env: Env,
  user: User
): Promise<Response> {
  const dashboardIds = await getUserDashboards(user.id, env);
  
  const dashboards = await Promise.all(
    dashboardIds.map(async (id) => {
      const data = await env.KV.get(`dashboard:${id}`);
      return data ? JSON.parse(data) : null;
    })
  );
  
  return json({
    dashboards: dashboards
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt)
  });
}

// Helper functions
async function getDashboardCount(userId: string, env: Env): Promise<number> {
  const dashboards = await getUserDashboards(userId, env);
  return dashboards.length;
}

async function getUserDashboards(userId: string, env: Env): Promise<string[]> {
  const data = await env.KV.get(`user_dashboards:${userId}`);
  return data ? JSON.parse(data) : [];
}

async function addDashboardToUser(userId: string, dashboardId: string, env: Env): Promise<void> {
  const existing = await getUserDashboards(userId, env);
  existing.push(dashboardId);
  await env.KV.put(`user_dashboards:${userId}`, JSON.stringify(existing));
}

async function incrementViews(dashboardId: string, env: Env): Promise<void> {
  const data = await env.KV.get(`dashboard:${dashboardId}`);
  if (data) {
    const dashboard: Dashboard = JSON.parse(data);
    dashboard.views++;
    await env.KV.put(`dashboard:${dashboardId}`, JSON.stringify(dashboard));
  }
}
```

---

# STRIPE WEBHOOK HANDLER

```typescript
// src/handlers/stripe.ts

import Stripe from 'stripe';

export async function handleStripeWebhook(
  request: Request, 
  env: Env
): Promise<Response> {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return json({ error: 'missing_signature' }, 400);
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return json({ error: 'invalid_signature' }, 400);
  }
  
  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session, env);
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription, env);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancel(subscription, env);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session, env: Env) {
  const userId = session.metadata?.userId;
  if (!userId) return;
  
  // Get user email from ID
  const email = await env.KV.get(`user_id:${userId}`);
  if (!email) return;
  
  // Update user plan
  const userData = await env.KV.get(`user:${email}`);
  if (!userData) return;
  
  const user = JSON.parse(userData);
  user.plan = session.metadata?.plan || 'pro';
  user.stripeCustomerId = session.customer as string;
  
  await env.KV.put(`user:${email}`, JSON.stringify(user));
  
  console.log(`User ${userId} upgraded to ${user.plan}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, env: Env) {
  // Find user by stripeCustomerId and update their plan status
  // Implementation depends on your subscription model
}

async function handleSubscriptionCancel(subscription: Stripe.Subscription, env: Env) {
  // Downgrade user to free plan
  // Don't delete their dashboards, just disable premium features
}
```

---

# UTILITY FUNCTIONS

```typescript
// src/utils/jwt.ts

export async function createToken(user: User, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    email: user.email,
    plan: user.plan,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = await sign(`${header}.${payload}`, secret);
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decoded = JSON.parse(atob(payload));
    
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return decoded;
  } catch {
    return null;
  }
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// src/utils/password.ts

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordData = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const saltStr = btoa(String.fromCharCode(...salt));
  const hashStr = btoa(String.fromCharCode(...new Uint8Array(hash)));
  
  return `${saltStr}:${hashStr}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltStr, hashStr] = stored.split(':');
  const salt = Uint8Array.from(atob(saltStr), c => c.charCodeAt(0));
  
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const computedHash = btoa(String.fromCharCode(...new Uint8Array(hash)));
  
  return computedHash === hashStr;
}

// src/utils/id.ts

export function generateId(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array, b => chars[b % chars.length]).join('');
}
```

---

# CORS MIDDLEWARE

```typescript
// src/middleware/cors.ts

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In prod, use specific origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

export function handleCors(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
```

---

# AUTH MIDDLEWARE

```typescript
// src/middleware/auth.ts

import { verifyToken } from '../utils/jwt';
import { User } from '../types';

interface AuthResult {
  valid: boolean;
  user?: User;
  error?: string;
}

export async function verifyAuth(request: Request, env: Env): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyToken(token, env.JWT_SECRET);
  
  if (!payload) {
    return { valid: false, error: 'Invalid or expired token' };
  }
  
  // Get fresh user data
  const email = await env.KV.get(`user_id:${payload.sub}`);
  if (!email) {
    return { valid: false, error: 'User not found' };
  }
  
  const userData = await env.KV.get(`user:${email}`);
  if (!userData) {
    return { valid: false, error: 'User not found' };
  }
  
  const user = JSON.parse(userData);
  
  return {
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt
    }
  };
}
```

---

# OUTPUT

Generate the complete Cloudflare Worker with:
1. All handler files
2. Middleware implementations
3. Utility functions
4. Type definitions
5. Wrangler configuration
6. Package.json with dependencies

Ensure the Worker is production-ready with proper error handling, logging, and security measures.
