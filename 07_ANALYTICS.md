# 07 - Analytics System

## System Prompt for Coding Agent

You are building the **Analytics System** for LOVE - tracking views and engagement.

---

# OBJECTIVE

Build analytics that:
1. Tracks dashboard views and quiz completions
2. Provides insights via a dashboard UI
3. Works within Cloudflare KV Free Tier

---

# STORAGE (KV)

```
analytics:{dashboardId}:daily:{date} → { views, quizCompletes }
analytics:{dashboardId}:totals → { totalViews, totalQuizzes }
```

---

# WORKER HANDLERS

```typescript
// handlers/analytics.ts

export async function handleTrackEvent(request: Request, env: Env) {
  const { type, dashboardId, ...data } = await request.json();
  
  const date = new Date().toISOString().split('T')[0];
  const dailyKey = `analytics:${dashboardId}:daily:${date}`;
  
  const existing = await env.KV.get(dailyKey);
  const daily = existing ? JSON.parse(existing) : { views: 0, quizCompletes: 0 };
  
  if (type === 'view') daily.views++;
  if (type === 'quiz_complete') daily.quizCompletes++;
  
  await env.KV.put(dailyKey, JSON.stringify(daily), { expirationTtl: 90 * 86400 });
  
  return Response.json({ success: true });
}

export async function handleGetAnalytics(request: Request, env: Env, user: User, dashboardId: string) {
  // Verify ownership then return totals + last 30 days
  const totalsKey = `analytics:${dashboardId}:totals`;
  const totals = await env.KV.get(totalsKey) || '{"totalViews":0}';
  return Response.json(JSON.parse(totals));
}
```

---

# FRONTEND

```tsx
// pages/Analytics.tsx
function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  
  useEffect(() => { fetchAnalytics(); }, []);
  
  return (
    <Layout>
      <div className="analytics-page">
        <h1>Analytics</h1>
        <div className="summary-cards">
          <div className="card">
            <span className="value">{stats?.totalViews}</span>
            <span className="label">Total Views</span>
          </div>
        </div>
        {user?.plan === 'free' && <UpgradePrompt />}
      </div>
    </Layout>
  );
}
```

---

# TRACKING SCRIPT (Injected into dashboards)

```javascript
(function() {
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ type: 'view', dashboardId: '{{ID}}' })
  });
  
  document.addEventListener('quizComplete', (e) => {
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ type: 'quiz_complete', dashboardId: '{{ID}}', score: e.detail.score })
    });
  });
})();
```

---

# OUTPUT

Generate: Worker handlers, Analytics page, Tracking script, CSS styles.
