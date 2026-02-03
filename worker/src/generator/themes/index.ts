// Theme definitions for dashboard generation

export interface Theme {
    id: string;
    name: string;
    description: string;
    css: string;
}

export const themes: Record<string, Theme> = {
    nobel: {
        id: 'nobel',
        name: 'Nobel',
        description: 'Elegant cream aesthetic with gold accents. Timeless, sophisticated, editorial.',
        css: `
:root {
  --bg-primary: #F9F8F4;
  --bg-secondary: #FFFFFF;
  --bg-card: #FFFFFF;
  --text-primary: #1c1917;
  --text-secondary: #57534e;
  --text-muted: #78716c;
  --accent: #C5A059;
  --accent-light: #d4b76a;
  --accent-dark: #a68542;
  --success: #22c55e;
  --error: #ef4444;
  --border-light: rgba(0,0,0,0.05);
  --border-medium: rgba(0,0,0,0.1);
  --card-shadow: 0 4px 20px rgba(0,0,0,0.06);
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }
h1,h2,h3 { font-family: var(--font-heading); }
.meta-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted); }
`
    },

    midnight: {
        id: 'midnight',
        name: 'Midnight',
        description: 'Dark mode neon tech. Cyberpunk-inspired with electric cyan and magenta.',
        css: `
:root {
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --bg-card: #16162a;
  --bg-elevated: #252542;
  --text-primary: #ffffff;
  --text-secondary: #a0a0c0;
  --text-muted: #6b6b8a;
  --accent: #00f0ff;
  --accent-light: #66f7ff;
  --accent-dark: #00b8c4;
  --accent2: #ff00aa;
  --success: #00ff88;
  --error: #ff4466;
  --border-light: rgba(255,255,255,0.08);
  --card-shadow: 0 4px 24px rgba(0,0,0,0.4);
  --accent-glow: 0 0 20px rgba(0,240,255,0.3);
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }
.meta-label { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); }
.gradient-text { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
`
    },

    ocean: {
        id: 'ocean',
        name: 'Ocean',
        description: 'Calm blues and teals. Professional, trustworthy, corporate-friendly.',
        css: `
:root {
  --bg-primary: #f0f9ff;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #0c4a6e;
  --text-secondary: #0369a1;
  --text-muted: #64748b;
  --accent: #0284c7;
  --accent-light: #38bdf8;
  --accent-dark: #0369a1;
  --success: #10b981;
  --error: #ef4444;
  --border-light: rgba(2,132,199,0.1);
  --card-shadow: 0 4px 20px rgba(2,132,199,0.1);
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }
h1,h2,h3 { font-family: var(--font-heading); }
.meta-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); }
`
    },

    forest: {
        id: 'forest',
        name: 'Forest',
        description: 'Earthy greens and warm browns. Natural, organic, sustainable vibes.',
        css: `
:root {
  --bg-primary: #faf9f6;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #1a2e1a;
  --text-secondary: #3d5a3d;
  --text-muted: #6b7c6b;
  --accent: #2d5a27;
  --accent-light: #4a8c42;
  --accent-dark: #1e3d1a;
  --accent2: #8b6914;
  --success: #22c55e;
  --error: #dc2626;
  --border-light: rgba(45,90,39,0.1);
  --card-shadow: 0 4px 20px rgba(45,90,39,0.08);
  --font-heading: 'Fraunces', serif;
  --font-body: 'Source Sans 3', sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }
h1,h2,h3 { font-family: var(--font-heading); }
.meta-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent2); }
`
    },

    sunset: {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm oranges, corals, and golden hues. Energetic, creative, inspiring.',
        css: `
:root {
  --bg-primary: #fffbf5;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #451a03;
  --text-secondary: #7c2d12;
  --text-muted: #92400e;
  --accent: #ea580c;
  --accent-light: #fb923c;
  --accent-dark: #c2410c;
  --accent2: #dc2626;
  --success: #16a34a;
  --error: #dc2626;
  --border-light: rgba(234,88,12,0.1);
  --card-shadow: 0 4px 20px rgba(234,88,12,0.1);
  --font-heading: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }
h1,h2,h3 { font-family: var(--font-heading); }
.meta-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
`
    },

    aurora: {
        id: 'aurora',
        name: 'Aurora',
        description: 'Gradient-rich with purple, pink, and teal. Magical, modern, Gen-Z friendly.',
        css: `
:root {
  --bg-primary: #faf5ff;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #3b0764;
  --text-secondary: #6b21a8;
  --text-muted: #7c3aed;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --accent-dark: #7c3aed;
  --accent2: #ec4899;
  --accent3: #06b6d4;
  --success: #10b981;
  --error: #f43f5e;
  --border-light: rgba(139,92,246,0.1);
  --card-shadow: 0 4px 20px rgba(139,92,246,0.15);
  --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #06b6d4 100%);
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }
h1,h2,h3 { font-family: var(--font-heading); }
.meta-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.gradient-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
`
    }
};

export function getTheme(themeId: string): Theme {
    return themes[themeId] || themes.nobel;
}

export const themeList = Object.values(themes);
