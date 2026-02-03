import { Env } from '../index';
import { generateDashboard } from '../generator';

export async function handleGenerate(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { topic, content, level, theme } = body;

    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Use the real generator
    const apiKey = (env as any).GEMINI_KEY || 'mock-key';

    const result = await generateDashboard(
      { topic, content, level, theme },
      apiKey
    );

    // Track analytics (non-blocking)
    try {
      const analyticsKey = `analytics:generate:${Date.now()}`;
      await env.KV.put(analyticsKey, JSON.stringify({
        timestamp: Date.now(),
        theme: theme || 'nobel',
        topic: topic.slice(0, 50),
        success: true,
        hour: new Date().getUTCHours()
      }), { expirationTtl: 30 * 24 * 60 * 60 }); // 30 days
    } catch (e) {
      console.error('Analytics tracking failed:', e);
    }

    return Response.json(result);

  } catch (e: any) {
    console.error('Generate Error:', e);
    return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
  }
}