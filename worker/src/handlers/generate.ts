import { Env } from '../index';
import { generateDashboard } from '../generator';

export async function handleGenerate(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { topic, content, level } = body;

    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Use the real generator
    // env.GEMINI_KEY should be set in wrangler.toml or via secrets
    // For local dev without a key, the client will fall back to mock
    const apiKey = (env as any).GEMINI_KEY || 'mock-key';

    const result = await generateDashboard(
      { topic, content, level },
      apiKey
    );

    return Response.json(result);
    
  } catch (e: any) {
    console.error('Generate Error:', e);
    return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
  }
}