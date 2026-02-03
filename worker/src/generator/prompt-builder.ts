import { nobelTheme } from './themes/nobel';

export interface GenerateInput {
  topic: string;
  content?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
}

export function buildPrompt(input: GenerateInput): string {
  const { topic, content, level = 'intermediate', subject = 'general' } = input;
  
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

# DESIGN SYSTEM: "NOBEL AESTHETIC"
${nobelTheme.css}

# REQUIRED CDNs
- Fonts: Google Fonts (Inter, Playfair Display)
- Icons: FontAwesome 6 (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css)
- Confetti: https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js

# REQUIRED COMPONENTS structure
1. **Glassmorphism Navigation Bar** (Sticky, "LOVE" brand, Session timer)
2. **Progress Tracker** (Visual bar, % text)
3. **Hero Section** (Title, subtitle, "Start Learning" CTA that scrolls to content)
4. **Key Concepts** (Grid of 6 Flip Cards - 3D animation on hover/click)
5. **Interactive Quiz** (5 Multiple choice questions. Show feedback immediately. Track score.)
6. **Summary/Takeaways** (Bulleted list)

# INTERACTIVITY REQUIREMENTS (JavaScript)
- Update session timer every second (MM:SS)
- Flip cards must flip on click (add 'flipped' class)
- Quiz buttons must validate answer on click:
  - If correct: Turn green, show "Correct!" msg, disable other options
  - If wrong: Turn red, show explanation
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
