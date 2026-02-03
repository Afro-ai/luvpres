import { handleGenerate } from './handlers/generate';
import { handlePublish, handleGetDashboard, handleGetDashboardMeta } from './handlers/publish';
// Pointer handlers commented out - we now use PeerJS (P2P, no server needed)
// import {
//   handleCreatePointerSession,
//   handleGetPointerSession,
//   handleGetPointerDashboard,
//   handlePointerWebSocket
// } from './handlers/pointer';
import {
  handleAdminLogin,
  handleAdminVerify,
  handleAdminStats,
  handleAdminDashboards,
  handleAdminDeleteDashboard,
  handleAdminGetSettings,
  handleAdminUpdateSettings
} from './handlers/admin';

// Durable Objects commented out - we now use PeerJS (P2P, no server needed)
// export { PointerSession } from './durable-objects/PointerSession';

export interface Env {
  KV: KVNamespace;
  R2: R2Bucket;
  // POINTER: DurableObjectNamespace; // Not needed with PeerJS
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    };

    // Helper to add CORS headers
    const withCors = (response: Response): Response => {
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    };

    try {
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', version: '1.2.0' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Generate dashboard
      if (path === '/api/generate' && request.method === 'POST') {
        return withCors(await handleGenerate(request, env));
      }

      // Publish dashboard
      if (path === '/api/publish' && request.method === 'POST') {
        return withCors(await handlePublish(request, env));
      }

      // Get dashboard HTML (public route - serves full HTML page)
      const dashboardMatch = path.match(/^\/d\/([a-z0-9]+)$/);
      if (dashboardMatch && request.method === 'GET') {
        const id = dashboardMatch[1];
        return await handleGetDashboard(request, env, id);
      }

      // Get dashboard metadata (API route)
      const metaMatch = path.match(/^\/api\/dashboard\/([a-z0-9]+)$/);
      if (metaMatch && request.method === 'GET') {
        return withCors(await handleGetDashboardMeta(request, env, metaMatch[1]));
      }

      // ============ POINTER/PRESENTER MODE ============

      // Create pointer session
      if (path === '/api/pointer/create' && request.method === 'POST') {
        return withCors(await handleCreatePointerSession(request, env));
      }

      // Get pointer session info
      const pointerInfoMatch = path.match(/^\/api\/pointer\/([a-z0-9]+)$/);
      if (pointerInfoMatch && request.method === 'GET') {
        return withCors(await handleGetPointerSession(request, env, pointerInfoMatch[1]));
      }

      // Get pointer dashboard HTML
      const pointerDashMatch = path.match(/^\/api\/pointer\/([a-z0-9]+)\/dashboard$/);
      if (pointerDashMatch && request.method === 'GET') {
        return await handleGetPointerDashboard(request, env, pointerDashMatch[1]);
      }

      // WebSocket upgrade for pointer
      const pointerWsMatch = path.match(/^\/api\/pointer\/([a-z0-9]+)\/ws$/);
      if (pointerWsMatch) {
        // Check for WebSocket upgrade
        if (request.headers.get('Upgrade') === 'websocket') {
          return await handlePointerWebSocket(request, env, pointerWsMatch[1]);
        }
        return Response.json({ error: 'WebSocket upgrade required' }, { status: 426 });
      }

      // ============ ADMIN ROUTES ============

      // Admin login
      if (path === '/api/admin/login' && request.method === 'POST') {
        return withCors(await handleAdminLogin(request, env));
      }

      // Admin verify
      if (path === '/api/admin/verify' && request.method === 'GET') {
        return withCors(await handleAdminVerify(request, env));
      }

      // Admin stats
      if (path === '/api/admin/stats' && request.method === 'GET') {
        return withCors(await handleAdminStats(request, env));
      }

      // Admin dashboards list
      if (path === '/api/admin/dashboards' && request.method === 'GET') {
        return withCors(await handleAdminDashboards(request, env));
      }

      // Admin delete dashboard
      const adminDeleteMatch = path.match(/^\/api\/admin\/dashboards\/([a-z0-9]+)$/);
      if (adminDeleteMatch && request.method === 'DELETE') {
        return withCors(await handleAdminDeleteDashboard(request, env, adminDeleteMatch[1]));
      }

      // Admin settings
      if (path === '/api/admin/settings') {
        if (request.method === 'GET') {
          return withCors(await handleAdminGetSettings(request, env));
        }
        if (request.method === 'PUT') {
          return withCors(await handleAdminUpdateSettings(request, env));
        }
      }

      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
