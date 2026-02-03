# LOVE Dashboard Themes

This folder contains 6 premium visual themes for generating dashboards. Each theme maintains the same interactive components but with a unique visual identity.

## Available Themes

| Theme | Aesthetic | Best For |
|-------|-----------|----------|
| **Nobel** | Cream/Gold, Academic | IELTS, Education, Formal |
| **Midnight** | Dark/Neon, Modern | Tech, Programming, Modern |
| **Ocean** | Blue/White, Fresh | Healthcare, Science, Corporate |
| **Forest** | Green/Earth, Organic | Sustainability, Nature, Wellness |
| **Sunset** | Orange/Warm, Energetic | Marketing, Sales, Motivation |
| **Aurora** | Purple/Gradient, Creative | Design, Arts, Innovation |

## Usage

Each theme file contains:
1. Color palette (CSS variables)
2. Typography settings
3. Component styling
4. Dark mode variants
5. Sample code

When generating dashboards, specify the theme:
```javascript
const theme = 'midnight'; // or 'ocean', 'forest', etc.
const prompt = loadTheme(theme) + contentPrompt;
```

## Interactive Components (All Themes)

Every theme includes these components:
- Glassmorphism navigation with timer
- Progress tracking bar
- Tabbed content navigation
- 3D flip cards
- Interactive quizzes with scoring
- Accordion/expandable sections
- Writing practice areas
- Tooltips
- Dark mode toggle
- Confetti celebrations

The visual styling changes, but functionality remains consistent.
