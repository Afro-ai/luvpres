import { handleGenerate } from './handlers/generate';
import { handlePublish, handleGetDashboard, handleGetDashboardMeta } from './handlers/publish';

export interface Env {
  KV: KVNamespace;
  R2: R2Bucket;
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
        return new Response(JSON.stringify({ status: 'ok', version: '1.1.0' }), {
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
