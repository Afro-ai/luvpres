# 02 - Dashboard Generator Engine

## System Prompt for Coding Agent

You are building the **AI-powered dashboard generation engine** for LOVE. This is the core product - transforming simple topic descriptions into stunning interactive HTML dashboards.

---

# OBJECTIVE

Build a generation system that:
1. Takes topic + optional content from user
2. Constructs optimal prompts for Gemini AI
3. Generates complete, self-contained HTML dashboards
4. Validates and cleans the output
5. Returns production-ready HTML

---

# ARCHITECTURE

```
User Input → Prompt Builder → Gemini API → HTML Cleaner → Output

┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │  Input   │───▶│  Prompt  │───▶│  Gemini  │───▶│ Cleaner  │   │
│  │ Validator│    │ Builder  │    │   API    │    │ & Fixer  │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│                                                         │         │
│                                                         ▼         │
│                                                  ┌──────────┐    │
│                                                  │  Final   │    │
│                                                  │   HTML   │    │
│                                                  └──────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

# FILE STRUCTURE

```
worker/src/
├── generator/
│   ├── index.ts              # Main generate() function
│   ├── prompt-builder.ts     # Constructs the AI prompt
│   ├── themes/               # 6 Premium visual themes
│   │   ├── index.ts          # Theme loader
│   │   ├── nobel.ts          # Cream/Gold academic (default)
│   │   ├── midnight.ts       # Dark/Neon tech
│   │   ├── ocean.ts          # Blue/White corporate
│   │   ├── forest.ts         # Green/Earth organic
│   │   ├── sunset.ts         # Orange/Warm energetic
│   │   └── aurora.ts         # Purple/Gradient creative
│   ├── components.ts         # Component templates (quiz, flipcard, etc)
│   ├── gemini-client.ts      # Gemini API wrapper
│   ├── html-cleaner.ts       # Post-processing and validation
│   └── templates/
│       ├── base.html         # Base HTML structure
│       ├── quiz.html         # Quiz component template
│       ├── flipcards.html    # Flip cards template
│       └── practice.html     # Writing practice template
└── types.ts
```

---

# THEME SYSTEM

LOVE supports 6 premium visual themes. Each theme defines colors, typography, and component styling while maintaining the same interactive functionality.

## Available Themes

| Theme | Aesthetic | Best For |
|-------|-----------|----------|
| **nobel** | Cream/Gold, Academic | Education, IELTS, Formal |
| **midnight** | Dark/Neon, Tech | Programming, Gaming, Modern |
| **ocean** | Blue/White, Corporate | Healthcare, Finance, SaaS |
| **forest** | Green/Earth, Organic | Wellness, Sustainability |
| **sunset** | Orange/Warm, Energetic | Marketing, Sales, Motivation |
| **aurora** | Purple/Gradient, Creative | Design, Arts, Innovation |

See `saas/themes/` folder for detailed specifications.

## Theme Loader

```typescript
// generator/themes/index.ts

export type ThemeName = 'nobel' | 'midnight' | 'ocean' | 'forest' | 'sunset' | 'aurora';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    accent: string;
    accentLight: string;
    // ... full palette
  };
  fonts: {
    heading: string;
    body: string;
    fontUrls: string[];
  };
  css: string; // Full CSS variables and component styles
}

import { nobelTheme } from './nobel';
import { midnightTheme } from './midnight';
import { oceanTheme } from './ocean';
import { forestTheme } from './forest';
import { sunsetTheme } from './sunset';
import { auroraTheme } from './aurora';

const themes: Record<ThemeName, Theme> = {
  nobel: nobelTheme,
  midnight: midnightTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  aurora: auroraTheme
};

export function getTheme(name: ThemeName = 'nobel'): Theme {
  return themes[name] || themes.nobel;
}

export function getThemeCss(name: ThemeName = 'nobel'): string {
  return getTheme(name).css;
}
```

---

# DESIGN SYSTEM: "NOBEL AESTHETIC"

The generated dashboards MUST follow this design language. Include these exact values in the prompt.

## Core CSS Variables

```css
:root {
  /* Colors */
  --cream: #F9F8F4;
  --stone-white: #F5F4F0;
  --stone-900: #1c1917;
  --stone-800: #292524;
  --stone-700: #44403c;
  --stone-600: #57534e;
  --stone-500: #78716c;
  --stone-400: #a8a29e;
  --stone-300: #d6d3d1;
  --stone-200: #e7e5e4;
  --stone-100: #f5f5f4;
  --nobel-gold: #C5A059;
  --nobel-gold-light: #d4b76a;
  --success: #22c55e;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Typography */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}
```

## Required CDNs

```html
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- Confetti (for quiz completion) -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
```

---

# PROMPT BUILDER

## Main Prompt Template

```typescript
// generator/prompt-builder.ts

export function buildPrompt(input: GenerateInput): string {
  const { topic, content, level = 'intermediate', subject = 'general' } = input;
  
  return `
# ROLE
You are a Senior UI Developer creating premium interactive HTML dashboards. Your output rivals $10,000 custom web applications.

# OUTPUT REQUIREMENTS
- Single HTML file (completely self-contained)
- All CSS in <style> tags
- All JavaScript in <script> tags
- NO external dependencies except the CDNs specified
- NO placeholder content - use real, educational content
- Mobile-first responsive design
- Dark mode support
- Print-friendly styles

# DESIGN SYSTEM: "NOBEL AESTHETIC"
${DESIGN_SYSTEM_CSS}

# REQUIRED COMPONENTS
Every dashboard MUST include:

1. **Glassmorphism Navigation Bar**
   - Sticky header with blur backdrop
   - Session timer (auto-counting)
   - Dark mode toggle
   - Brand: "LOVE" (or leave space for white-label)

2. **Progress Tracker**
   - Persistent via localStorage
   - Visual progress bar with milestones
   - Confetti celebration at 100%

3. **Tabbed Content**
   - Minimum 4 tabs: Overview, Practice, Quiz, Resources
   - Keyboard accessible (arrow keys)
   - Smooth transitions

4. **Flip Cards** (at least 6)
   - 3D flip animation
   - Front: concept/term
   - Back: definition + example
   - Grid layout (responsive)

5. **Interactive Quiz** (at least 5 questions)
   - Multiple choice (A/B/C/D)
   - Immediate feedback with explanations
   - Score tracking
   - "Try Again" functionality
   - Confetti on perfect score

6. **Accordion Sections**
   - For detailed content
   - Smooth expand/collapse
   - Only one open at a time

7. **Writing/Practice Area** (if applicable)
   - Textarea with word count
   - Auto-save to localStorage
   - Basic validation hints

8. **Tooltips**
   - On key terms
   - CSS-only implementation

# ACCESSIBILITY
- Semantic HTML (header, main, section, article)
- ARIA labels where needed
- Keyboard navigable
- Sufficient color contrast

# PERFORMANCE
- Minimal JavaScript
- CSS animations over JS
- Lazy load images if any
- No layout shifts

# CONTENT TO TRANSFORM

**Topic**: ${topic}
**Level**: ${level}
**Subject**: ${subject}

**Additional Content/Notes**:
${content || 'Generate appropriate educational content for this topic.'}

# OUTPUT
Generate ONLY the complete HTML file. No markdown code blocks. No explanations before or after. Start with <!DOCTYPE html> and end with </html>.
`;
}
```

## Component Templates (for reference in prompt)

```typescript
// generator/components.ts

export const COMPONENT_TEMPLATES = {
  navigation: `
<nav class="glass-nav">
  <div class="nav-left">
    <h1 class="brand">LOVE</h1>
    <div class="divider-vertical"></div>
    <span class="meta-label">Interactive Dashboard</span>
  </div>
  <div class="nav-right">
    <div class="timer-block">
      <span class="meta-label">Session</span>
      <span id="timer" class="timer-display">00:00:00</span>
    </div>
    <button id="darkToggle" class="icon-btn" aria-label="Toggle dark mode">
      <i class="fa-solid fa-moon"></i>
    </button>
  </div>
</nav>`,

  progressBar: `
<div class="progress-container">
  <div class="progress-header">
    <span class="meta-label">Your Progress</span>
    <span id="progressPercent" class="progress-percent">0%</span>
  </div>
  <div class="progress-track">
    <div id="progressBar" class="progress-fill"></div>
  </div>
</div>`,

  flipCard: `
<div class="flip-card" tabindex="0">
  <div class="flip-card-inner">
    <div class="flip-card-front">
      <span class="meta-label">Concept</span>
      <h3>{TERM}</h3>
      <p class="flip-hint">Click to reveal</p>
    </div>
    <div class="flip-card-back">
      <span class="meta-label">Definition</span>
      <p>{DEFINITION}</p>
      <div class="flip-example">
        <span class="meta-label">Example</span>
        <p>{EXAMPLE}</p>
      </div>
    </div>
  </div>
</div>`,

  quizQuestion: `
<div class="quiz-question" data-correct="{CORRECT}">
  <p class="question-text">{NUMBER}. {QUESTION}</p>
  <div class="options">
    <button class="option" data-value="a">
      <span class="option-letter">A</span>
      <span>{OPTION_A}</span>
    </button>
    <button class="option" data-value="b">
      <span class="option-letter">B</span>
      <span>{OPTION_B}</span>
    </button>
    <button class="option" data-value="c">
      <span class="option-letter">C</span>
      <span>{OPTION_C}</span>
    </button>
    <button class="option" data-value="d">
      <span class="option-letter">D</span>
      <span>{OPTION_D}</span>
    </button>
  </div>
  <div class="feedback hidden">
    <div class="feedback-correct">
      <i class="fa-solid fa-check-circle"></i>
      <span>{CORRECT_FEEDBACK}</span>
    </div>
    <div class="feedback-incorrect">
      <i class="fa-solid fa-times-circle"></i>
      <span>{INCORRECT_FEEDBACK}</span>
    </div>
  </div>
</div>`
};
```

---

# GEMINI API CLIENT

```typescript
// generator/gemini-client.ts

interface GeminiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callGemini(
  prompt: string, 
  apiKey: string,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const { 
    model = 'gemini-3-pro-high',
    temperature = 0.3 
  } = options || {};
  
  const response = await fetch('http://127.0.0.1:8045/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a UI generator. Output valid HTML only. No markdown blocks. No explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: 32000
    })
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }
  
  const data: GeminiResponse = await response.json();
  return data.choices[0].message.content;
}
```

---

# HTML CLEANER & VALIDATOR

```typescript
// generator/html-cleaner.ts

export function cleanHtml(raw: string): string {
  let html = raw;
  
  // 1. Remove markdown code blocks if present
  html = html.replace(/^```html\s*/i, '');
  html = html.replace(/```\s*$/i, '');
  html = html.trim();
  
  // 2. Ensure starts with DOCTYPE
  if (!html.toLowerCase().startsWith('<!doctype')) {
    // Try to find it in the string
    const doctypeIndex = html.toLowerCase().indexOf('<!doctype');
    if (doctypeIndex > 0) {
      html = html.substring(doctypeIndex);
    } else {
      // Prepend if missing
      html = '<!DOCTYPE html>\n' + html;
    }
  }
  
  // 3. Ensure ends with </html>
  if (!html.toLowerCase().endsWith('</html>')) {
    const htmlEndIndex = html.toLowerCase().lastIndexOf('</html>');
    if (htmlEndIndex > 0) {
      html = html.substring(0, htmlEndIndex + 7);
    } else {
      html += '\n</html>';
    }
  }
  
  // 4. Remove any text after </html>
  const endIndex = html.toLowerCase().lastIndexOf('</html>');
  if (endIndex > 0) {
    html = html.substring(0, endIndex + 7);
  }
  
  // 5. Fix common issues
  html = fixCommonIssues(html);
  
  return html;
}

function fixCommonIssues(html: string): string {
  // Fix unclosed tags
  html = html.replace(/<br>/g, '<br/>');
  html = html.replace(/<hr>/g, '<hr/>');
  html = html.replace(/<img([^>]*)(?<!\/)>/g, '<img$1/>');
  
  // Fix script issues
  html = html.replace(/<\/script>\s*<\/script>/g, '</script>');
  
  // Ensure proper encoding
  html = html.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, '&amp;');
  
  return html;
}

export function validateHtml(html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required elements
  if (!html.includes('<html')) errors.push('Missing <html> tag');
  if (!html.includes('<head')) errors.push('Missing <head> tag');
  if (!html.includes('<body')) errors.push('Missing <body> tag');
  if (!html.includes('<style')) errors.push('Missing <style> tag');
  
  // Check for design system
  if (!html.includes('--nobel-gold')) errors.push('Missing Nobel color palette');
  if (!html.includes('Playfair Display')) errors.push('Missing heading font');
  
  // Check for required components
  if (!html.includes('glass-nav')) errors.push('Missing navigation');
  if (!html.includes('progress')) errors.push('Missing progress tracker');
  if (!html.includes('flip-card')) errors.push('Missing flip cards');
  if (!html.includes('quiz')) errors.push('Missing quiz section');
  
  // Check for interactive features
  if (!html.includes('localStorage')) errors.push('Missing localStorage persistence');
  if (!html.includes('dark')) errors.push('Missing dark mode support');
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

# MAIN GENERATOR FUNCTION

```typescript
// generator/index.ts

import { buildPrompt } from './prompt-builder';
import { callGemini } from './gemini-client';
import { cleanHtml, validateHtml } from './html-cleaner';

export interface GenerateInput {
  topic: string;
  content?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
}

export interface GenerateOutput {
  html: string;
  metadata: {
    generatedAt: number;
    topic: string;
    wordCount: number;
    hasQuiz: boolean;
    hasFlipCards: boolean;
    hasPractice: boolean;
  };
}

export async function generateDashboard(
  input: GenerateInput,
  apiKey: string
): Promise<GenerateOutput> {
  // 1. Build the prompt
  const prompt = buildPrompt(input);
  
  // 2. Call Gemini
  let rawHtml: string;
  try {
    rawHtml = await callGemini(prompt, apiKey);
  } catch (error) {
    throw new Error(`Generation failed: ${error.message}`);
  }
  
  // 3. Clean the output
  const html = cleanHtml(rawHtml);
  
  // 4. Validate
  const validation = validateHtml(html);
  if (!validation.valid) {
    console.warn('HTML validation warnings:', validation.errors);
    // Don't fail, just log warnings
  }
  
  // 5. Extract metadata
  const metadata = {
    generatedAt: Date.now(),
    topic: input.topic,
    wordCount: html.split(/\s+/).length,
    hasQuiz: html.includes('quiz-question'),
    hasFlipCards: html.includes('flip-card'),
    hasPractice: html.includes('practice-area')
  };
  
  return { html, metadata };
}
```

---

# WORKER INTEGRATION

```typescript
// worker/src/handlers/generate.ts

import { generateDashboard } from '../generator';

export async function handleGenerate(
  request: Request, 
  env: Env
): Promise<Response> {
  // 1. Parse request
  const body = await request.json() as {
    topic: string;
    content?: string;
    level?: string;
  };
  
  // 2. Validate
  if (!body.topic || body.topic.trim().length < 3) {
    return Response.json(
      { error: 'invalid_topic', message: 'Topic must be at least 3 characters' },
      { status: 400 }
    );
  }
  
  // 3. Check rate limits (if user is on free tier)
  const userId = getUserIdFromRequest(request);
  if (userId) {
    const isWithinLimit = await checkRateLimit(userId, env);
    if (!isWithinLimit) {
      return Response.json(
        { 
          error: 'limit_reached', 
          message: 'Daily generation limit reached',
          upgrade: '/pricing'
        },
        { status: 429 }
      );
    }
  }
  
  // 4. Generate
  try {
    const result = await generateDashboard(
      {
        topic: body.topic,
        content: body.content,
        level: body.level as any
      },
      env.GEMINI_KEY
    );
    
    // 5. Increment usage counter
    if (userId) {
      await incrementUsage(userId, env);
    }
    
    return Response.json({
      html: result.html,
      metadata: result.metadata
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'generation_failed', message: 'Failed to generate dashboard' },
      { status: 500 }
    );
  }
}
```

---

# RATE LIMITING

```typescript
// worker/src/utils/rate-limit.ts

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 100;

export async function checkRateLimit(
  userId: string, 
  env: Env
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;
  
  const usage = parseInt(await env.KV.get(key) || '0');
  const plan = await getUserPlan(userId, env);
  const limit = plan === 'pro' ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  
  return usage < limit;
}

export async function incrementUsage(
  userId: string, 
  env: Env
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;
  
  const current = parseInt(await env.KV.get(key) || '0');
  await env.KV.put(key, String(current + 1), {
    expirationTtl: 86400 * 2 // Expire after 2 days
  });
}
```

---

# TESTING

```typescript
// generator/__tests__/generator.test.ts

describe('Dashboard Generator', () => {
  it('generates valid HTML for a simple topic', async () => {
    const result = await generateDashboard({
      topic: 'Introduction to Photosynthesis'
    }, TEST_API_KEY);
    
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('</html>');
    expect(result.html).toContain('Photosynthesis');
  });
  
  it('includes all required components', async () => {
    const result = await generateDashboard({
      topic: 'IELTS Writing Task 2'
    }, TEST_API_KEY);
    
    expect(result.metadata.hasQuiz).toBe(true);
    expect(result.metadata.hasFlipCards).toBe(true);
  });
  
  it('cleans markdown artifacts', () => {
    const dirty = '```html\n<!DOCTYPE html>\n<html></html>\n```';
    const clean = cleanHtml(dirty);
    
    expect(clean).not.toContain('```');
    expect(clean).toContain('<!DOCTYPE html>');
  });
});
```

---

# OUTPUT

Generate the complete generator module with:
1. All TypeScript files
2. Comprehensive prompt template
3. HTML cleaner with edge case handling
4. Rate limiting logic
5. Error handling
6. Test cases

The generator is the heart of LOVE - it must produce stunning, interactive dashboards every time.
