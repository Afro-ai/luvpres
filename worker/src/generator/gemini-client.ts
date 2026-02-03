// Using User's Custom Proxy Server for Gemini
const PROXY_CONFIG = {
  baseUrl: 'http://127.0.0.1:8045/v1beta/models',
  apiKey: 'sk-332e1e76cbfc4dbdaa64c975672703be',
  model: 'gemini-3-pro-high'
};

export async function callGemini(
  prompt: string, 
  apiKey: string, // Kept for signature compatibility, but we'll prefer the proxy config if active
  options?: { model?: string }
): Promise<string> {
  const model = PROXY_CONFIG.model;
  // Construct URL using the proxy base
  const url = `${PROXY_CONFIG.baseUrl}/${model}:generateContent?key=${PROXY_CONFIG.apiKey}`;

  console.log(`Calling Gemini Proxy: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini Proxy error: ${response.status} - ${err}`);
    }

    const data = await response.json() as any;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini Proxy');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini Request Failed:', error);
    throw error;
  }
}

function mockResponse(prompt: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<style>body{font-family:sans-serif;padding:2rem;text-align:center}</style>
</head>
<body>
  <h1>Mock Dashboard</h1>
  <p>To generate real content, please add GEMINI_KEY to your wrangler.toml or secrets.</p>
  <p>Topic found in prompt: ${prompt.substring(0, 50)}...</p>
</body>
</html>`;
}
