import { Env } from '../index';

// Simple JWT-like token (base64 encoded JSON with expiry)
function createAdminToken(secret: string): string {
    const payload = {
        role: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
    const encoded = btoa(JSON.stringify(payload));
    const signature = btoa(secret.slice(0, 8) + encoded.slice(0, 8));
    return `${encoded}.${signature}`;
}

function verifyAdminToken(token: string, secret: string): boolean {
    try {
        const [encoded, signature] = token.split('.');
        const expectedSig = btoa(secret.slice(0, 8) + encoded.slice(0, 8));
        if (signature !== expectedSig) return false;

        const payload = JSON.parse(atob(encoded));
        if (payload.exp < Date.now()) return false;
        if (payload.role !== 'admin') return false;

        return true;
    } catch {
        return false;
    }
}

// Admin login
export async function handleAdminLogin(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        const { password } = await request.json() as { password: string };

        // Check against stored admin password
        const adminPassword = (env as any).ADMIN_PASSWORD;
        if (!adminPassword) {
            return Response.json({ error: 'Admin not configured' }, { status: 500 });
        }

        if (password !== adminPassword) {
            return Response.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Create session token
        const token = createAdminToken(adminPassword);

        return Response.json({
            success: true,
            token,
            expiresIn: 24 * 60 * 60 * 1000
        });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Verify admin session
export async function handleAdminVerify(
    request: Request,
    env: Env
): Promise<Response> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return Response.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const adminPassword = (env as any).ADMIN_PASSWORD;

    if (!adminPassword || !verifyAdminToken(token, adminPassword)) {
        return Response.json({ valid: false }, { status: 401 });
    }

    return Response.json({ valid: true });
}

// Middleware to check admin auth
export function requireAdmin(request: Request, env: Env): Response | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const adminPassword = (env as any).ADMIN_PASSWORD;

    if (!adminPassword || !verifyAdminToken(token, adminPassword)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null; // Authorized
}

// Get dashboard stats
export async function handleAdminStats(
    request: Request,
    env: Env
): Promise<Response> {
    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        // Get all dashboard keys from KV
        const dashboardList = await env.KV.list({ prefix: 'dashboard:' });
        const pointerList = await env.KV.list({ prefix: 'pointer_session:' });

        // Count dashboards (filter out :html suffix keys)
        const dashboards = dashboardList.keys.filter(k => !k.name.includes(':html'));

        return Response.json({
            totalDashboards: dashboards.length,
            activeSessions: pointerList.keys.length,
            storageKeys: dashboardList.keys.length + pointerList.keys.length
        });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Get all dashboards
export async function handleAdminDashboards(
    request: Request,
    env: Env
): Promise<Response> {
    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        const list = await env.KV.list({ prefix: 'dashboard:' });

        // Filter to metadata keys only (not :html)
        const metaKeys = list.keys.filter(k => !k.name.includes(':html'));

        const dashboards = await Promise.all(
            metaKeys.slice(0, 50).map(async (key) => {
                const data = await env.KV.get(key.name);
                if (!data) return null;
                const parsed = JSON.parse(data);
                return {
                    id: key.name.replace('dashboard:', ''),
                    ...parsed
                };
            })
        );

        return Response.json({
            dashboards: dashboards.filter(Boolean),
            total: metaKeys.length
        });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Delete a dashboard
export async function handleAdminDeleteDashboard(
    request: Request,
    env: Env,
    id: string
): Promise<Response> {
    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        await env.KV.delete(`dashboard:${id}`);
        await env.KV.delete(`dashboard:${id}:html`);

        return Response.json({ success: true, deleted: id });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Get system settings
export async function handleAdminGetSettings(
    request: Request,
    env: Env
): Promise<Response> {
    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        const settingsJson = await env.KV.get('system:settings');
        const settings = settingsJson ? JSON.parse(settingsJson) : {
            dashboardExpiryDays: 7,
            maxDashboardsPerUser: 10,
            corsOrigin: env.CORS_ORIGIN || '*'
        };

        return Response.json(settings);
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// Update system settings
export async function handleAdminUpdateSettings(
    request: Request,
    env: Env
): Promise<Response> {
    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        const updates = await request.json() as Record<string, any>;

        // Get existing settings
        const existingJson = await env.KV.get('system:settings');
        const existing = existingJson ? JSON.parse(existingJson) : {};

        // Merge updates
        const newSettings = { ...existing, ...updates };

        // Save
        await env.KV.put('system:settings', JSON.stringify(newSettings));

        return Response.json({ success: true, settings: newSettings });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
