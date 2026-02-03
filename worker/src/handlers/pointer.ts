import { Env } from '../index';

// Create a new pointer session from a published dashboard
export async function handleCreatePointerSession(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        const { dashboardId } = await request.json() as { dashboardId: string };

        if (!dashboardId) {
            return Response.json({ error: 'dashboardId is required' }, { status: 400 });
        }

        // Get dashboard HTML from KV
        const html = await env.KV.get(`dashboard:${dashboardId}:html`);
        if (!html) {
            return Response.json({ error: 'Dashboard not found' }, { status: 404 });
        }

        // Generate short session ID
        const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
        let sessionId = '';
        for (let i = 0; i < 6; i++) {
            sessionId += chars[Math.floor(Math.random() * chars.length)];
        }

        // Get Durable Object and initialize
        const id = env.POINTER.idFromName(sessionId);
        const stub = env.POINTER.get(id);

        await stub.fetch(new Request('https://pointer/init', {
            method: 'POST',
            body: JSON.stringify({
                dashboardId,
                dashboardHtml: html
            })
        }));

        // Store session reference in KV (24h expiry)
        await env.KV.put(`pointer_session:${sessionId}`, JSON.stringify({
            dashboardId,
            createdAt: Date.now()
        }), { expirationTtl: 86400 });

        // Generate URLs
        const baseUrl = 'https://luvpres.pages.dev';

        return Response.json({
            success: true,
            sessionId,
            presenterUrl: `${baseUrl}/present/${sessionId}`,
            viewerUrl: `${baseUrl}/view/${sessionId}`
        });

    } catch (e: any) {
        console.error('Create Session Error:', e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Get session info
export async function handleGetPointerSession(
    request: Request,
    env: Env,
    sessionId: string
): Promise<Response> {
    try {
        // Check session exists
        const sessionData = await env.KV.get(`pointer_session:${sessionId}`);
        if (!sessionData) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        // Get info from Durable Object
        const id = env.POINTER.idFromName(sessionId);
        const stub = env.POINTER.get(id);

        const response = await stub.fetch(new Request('https://pointer/info'));
        const info = await response.json();

        return Response.json(info);

    } catch (e: any) {
        console.error('Get Session Error:', e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Get dashboard HTML for embedding in presenter/viewer
export async function handleGetPointerDashboard(
    request: Request,
    env: Env,
    sessionId: string
): Promise<Response> {
    try {
        const id = env.POINTER.idFromName(sessionId);
        const stub = env.POINTER.get(id);

        return await stub.fetch(new Request('https://pointer/dashboard'));

    } catch (e: any) {
        console.error('Get Dashboard Error:', e);
        return new Response('Error loading dashboard', { status: 500 });
    }
}

// Proxy WebSocket connection to Durable Object
export async function handlePointerWebSocket(
    request: Request,
    env: Env,
    sessionId: string
): Promise<Response> {
    try {
        // Check session exists
        const sessionData = await env.KV.get(`pointer_session:${sessionId}`);
        if (!sessionData) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        // Get Durable Object and proxy WebSocket
        const id = env.POINTER.idFromName(sessionId);
        const stub = env.POINTER.get(id);

        // Forward the request with query params
        return stub.fetch(request);

    } catch (e: any) {
        console.error('WebSocket Error:', e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}
