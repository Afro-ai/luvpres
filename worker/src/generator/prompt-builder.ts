import { getTheme } from './themes';

export interface GenerateInput {
  topic: string;
  content?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
  theme?: string;
}

export function buildPrompt(input: GenerateInput): string {
  const { topic, content, level = 'intermediate', subject = 'general', theme = 'nobel' } = input;

  const selectedTheme = getTheme(theme);

  return `
# ROLE
You are a Senior UI Developer creating premium interactive HTML dashboards. Your output rivals $10,000 custom web applications.

# OUTPUT REQUIREMENTS
- Single HTML file (completely self-contained)
- All CSS in <style> tags (Use the provided Design System)
- All JavaScript in <script> tags
- NO external dependencies except the CDNs specified below
- NO placeholder content - use real, educational content
- Mobile-first responsive design

# DESIGN SYSTEM: "${selectedTheme.name.toUpperCase()}" THEME
${selectedTheme.description}

## CSS Variables & Base Styles
${selectedTheme.css}

# REQUIRED CDNs
- Fonts: Google Fonts (specified in theme)
- Icons: FontAwesome 6 (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css)
- Confetti: https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js

# REQUIRED COMPONENTS structure
1. **Glassmorphism Navigation Bar** (Sticky, "LOVE" brand with theme accent colors, Session timer)
2. **Progress Tracker** (Visual bar using theme's accent color, % text)
3. **Hero Section** (Title using theme's heading font, subtitle, "Start Learning" CTA)
4. **Key Concepts** (Grid of 6 Flip Cards with theme-appropriate styling)
5. **Interactive Quiz** (5 Multiple choice questions with theme's success/error colors)
6. **Summary/Takeaways** (Bulleted list)

# INTERACTIVITY REQUIREMENTS (JavaScript)
- Update session timer every second (MM:SS)
- Flip cards must flip on click (add 'flipped' class)
- Quiz buttons must validate answer on click:
  - If correct: Turn green (--success), show "Correct!" msg, disable other options
  - If wrong: Turn red (--error), show explanation
  - Update progress bar as user completes items
- At 100% progress (quiz done + all cards flipped), trigger confetti()

# CONTENT TO TRANSFORM
**Topic**: ${topic}
**Level**: ${level}
**Subject**: ${subject}

**Additional Context**:
${content || 'Generate comprehensive educational content for this topic.'}

# OUTPUT FORMAT
Generate ONLY the valid HTML code. Start with <!DOCTYPE html>. Do not wrap in markdown code blocks.
`;
}
