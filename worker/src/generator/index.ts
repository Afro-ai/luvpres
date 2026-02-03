import { buildPrompt, GenerateInput } from './prompt-builder';
import { callGemini } from './gemini-client';
import { callCustomAI } from './custom-ai-client';
import { cleanHtml, validateHtml } from './html-cleaner';

export interface GenerateOutput {
  html: string;
  metadata: {
    generatedAt: number;
    topic: string;
    wordCount: number;
    provider: string;
  };
}

export interface AISettings {
  aiProvider?: 'gemini' | 'custom';
  customAiUrl?: string;
  customAiKey?: string;
  customAiModel?: string;
}

export async function generateDashboard(
  input: GenerateInput,
  apiKey: string,
  settings?: AISettings
): Promise<GenerateOutput> {
  // 1. Build Prompt
  const prompt = buildPrompt(input);

  // 2. Determine provider (default to gemini)
  const provider = settings?.aiProvider || 'gemini';
  let rawHtml: string;

  if (provider === 'custom' && settings?.customAiUrl) {
    // Call custom AI endpoint (Gemini format)
    rawHtml = await callCustomAI(prompt, {
      baseUrl: settings.customAiUrl,
      apiKey: settings.customAiKey,
      model: settings.customAiModel
    });
  } else {
    // Call Gemini (default)
    rawHtml = await callGemini(prompt, apiKey);
  }

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
      wordCount: html.length,
      provider
    }
  };
}

