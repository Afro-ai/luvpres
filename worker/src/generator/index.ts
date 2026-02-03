import { buildPrompt, GenerateInput } from './prompt-builder';
import { callGemini } from './gemini-client';
import { cleanHtml, validateHtml } from './html-cleaner';

export interface GenerateOutput {
  html: string;
  metadata: {
    generatedAt: number;
    topic: string;
    wordCount: number;
  };
}

export async function generateDashboard(
  input: GenerateInput,
  apiKey: string
): Promise<GenerateOutput> {
  // 1. Build Prompt
  const prompt = buildPrompt(input);
  
  // 2. Call AI
  const rawHtml = await callGemini(prompt, apiKey);
  
  // 3. Clean
  const html = cleanHtml(rawHtml);
  
  // 4. Validate (Log only for now)
  const validation = validateHtml(html);
  if (!validation.valid) {
    console.warn('Validation errors:', validation.errors);
  }

  return {
    html,
    metadata: {
      generatedAt: Date.now(),
      topic: input.topic,
      wordCount: html.length
    }
  };
}
