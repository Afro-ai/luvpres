import { Env } from '../index';

interface PublishRequest {
    html: string;
    title: string;
    theme?: string;
}

interface DashboardMetadata {
    id: string;
    title: string;
    theme?: string;
    createdAt: number;
    expiresAt: number | null;
    views: number;
}

// Generate a short, URL-safe ID
function generateId(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

export async function handlePublish(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as PublishRequest;
        const { html, title, theme } = body;

        if (!html || !title) {
            return Response.json(
                { error: 'HTML and title are required' },
                { status: 400 }
            );
        }

        // Generate unique ID
        const id = generateId();
        const now = Date.now();

        // Set expiration (7 days for free tier, can be extended for pro)
        const expiresAt = now + (7 * 24 * 60 * 60 * 1000);

        // Create metadata
        const metadata: DashboardMetadata = {
            id,
            title,
            theme,
            createdAt: now,
            expiresAt,
            views: 0
        };

        // Store HTML in KV (with TTL for auto-expiration)
        await env.KV.put(
            `dashboard:${id}:html`,
            html,
            { expirationTtl: 7 * 24 * 60 * 60 } // 7 days in seconds
        );

        // Store metadata in KV
        await env.KV.put(
            `dashboard:${id}:meta`,
            JSON.stringify(metadata),
            { expirationTtl: 7 * 24 * 60 * 60 }
        );

        // Generate public URL
        const baseUrl = 'https://luvpres.pages.dev';
        const url = `${baseUrl}/d/${id}`;

        return Response.json({
            success: true,
            id,
            url,
            expiresAt,
            message: `Dashboard published! Expires in 7 days.`
        });

    } catch (e: any) {
        console.error('Publish Error:', e);
        return Response.json(
            { error: e.message || 'Publish failed' },
            { status: 500 }
        );
    }
}

export async function handleGetDashboard(request: Request, env: Env, id: string): Promise<Response> {
    try {
        // Get HTML from KV
        const html = await env.KV.get(`dashboard:${id}:html`);

        if (!html) {
            return new Response(
                `<!DOCTYPE html>
<html>
<head>
  <title>Dashboard Not Found</title>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9f8f4; }
    .error { text-align: center; }
    h1 { color: #1c1917; }
    p { color: #78716c; }
    a { color: #C5A059; }
  </style>
</head>
<body>
  <div class="error">
    <h1>Dashboard Not Found</h1>
    <p>This dashboard may have expired or been deleted.</p>
    <p><a href="/">Create a new dashboard →</a></p>
  </div>
</body>
</html>`,
                {
                    status: 404,
                    headers: { 'Content-Type': 'text/html' }
                }
            );
        }

        // Increment view count (non-blocking)
        const metaStr = await env.KV.get(`dashboard:${id}:meta`);
        if (metaStr) {
            try {
                const meta: DashboardMetadata = JSON.parse(metaStr);
                meta.views++;
                // Non-blocking update
                env.KV.put(`dashboard:${id}:meta`, JSON.stringify(meta));
            } catch { }
        }

        // Return the dashboard HTML
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (e: any) {
        console.error('Get Dashboard Error:', e);
        return new Response('Server Error', { status: 500 });
    }
}

export async function handleGetDashboardMeta(request: Request, env: Env, id: string): Promise<Response> {
    try {
        const metaStr = await env.KV.get(`dashboard:${id}:meta`);

        if (!metaStr) {
            return Response.json({ error: 'Dashboard not found' }, { status: 404 });
        }

        const meta: DashboardMetadata = JSON.parse(metaStr);
        return Response.json(meta);

    } catch (e: any) {
        console.error('Get Meta Error:', e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}
