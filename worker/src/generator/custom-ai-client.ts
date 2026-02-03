// Custom AI Client - calls user's personal AI endpoint (Gemini API format)

export interface CustomAIConfig {
    baseUrl: string;  // e.g., https://your-proxy.trycloudflare.com/v1beta/models
    apiKey?: string;  // Optional API key
    model?: string;   // e.g., gemini-3-flash
}

export async function callCustomAI(
    prompt: string,
    config: CustomAIConfig
): Promise<string> {
    // Use Gemini API format: {baseUrl}/{model}:generateContent?key={apiKey}
    const model = config.model || 'gemini-3-flash';
    const apiKey = config.apiKey || 'sk-332e1e76cbfc4dbdaa64c975672703be';
    const url = `${config.baseUrl}/${model}:generateContent?key=${apiKey}`;

    console.log(`Calling Custom AI (Gemini format): ${config.baseUrl}`);

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
            throw new Error(`Custom AI error: ${response.status} - ${err}`);
        }

        const data = await response.json() as any;

        // Handle Gemini response format
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content?.parts?.[0]?.text || '';
        }

        throw new Error('Unexpected response format from Custom AI');
    } catch (error) {
        console.error('Custom AI Request Failed:', error);
        throw error;
    }
}
