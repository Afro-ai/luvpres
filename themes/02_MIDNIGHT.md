# Theme 2: MIDNIGHT (Dark Mode Neon Tech)

Sleek dark interface with neon accents. Modern, tech-forward, cyberpunk-inspired.

---

## Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #0f0f1a;
    --bg-secondary: #1a1a2e;
    --bg-card: #16162a;
    --bg-elevated: #252542;
    
    /* Text */
    --text-primary: #ffffff;
    --text-secondary: #a0a0c0;
    --text-muted: #6b6b8a;
    
    /* Accent - Electric Cyan */
    --accent: #00f0ff;
    --accent-light: #66f7ff;
    --accent-dark: #00b8c4;
    --accent-glow: 0 0 20px rgba(0, 240, 255, 0.3);
    
    /* Secondary Accent - Magenta */
    --accent2: #ff00aa;
    --accent2-light: #ff66cc;
    
    /* Borders */
    --border-light: rgba(255, 255, 255, 0.08);
    --border-medium: rgba(255, 255, 255, 0.12);
    --border-accent: rgba(0, 240, 255, 0.3);
    
    /* Semantic */
    --success: #00ff88;
    --error: #ff4466;
    --warning: #ffaa00;
    --info: #00aaff;
    
    /* Cards */
    --card-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    --card-glow: 0 0 30px rgba(0, 240, 255, 0.1);
}

/* No separate dark mode - this IS dark mode */
```

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

h1, h2, h3, .heading {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
}

code, .mono {
    font-family: 'JetBrains Mono', monospace;
}

.meta-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
}
```

---

## Navigation

```css
.nav {
    background: rgba(15, 15, 26, 0.9);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-light);
    box-shadow: 0 0 40px rgba(0, 240, 255, 0.05);
}

.brand {
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.brand-accent {
    color: var(--accent);
    text-shadow: 0 0 10px var(--accent);
}
```

---

## Buttons

```css
.btn-primary {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    color: var(--bg-primary);
    padding: 0.75rem 2rem;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.3s;
    box-shadow: var(--accent-glow);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
}

.btn-outline {
    border: 1px solid var(--accent);
    color: var(--accent);
    background: transparent;
    padding: 0.75rem 2rem;
    border-radius: 4px;
}

.btn-outline:hover {
    background: rgba(0, 240, 255, 0.1);
    box-shadow: var(--accent-glow);
}
```

---

## Progress Bar

```css
.progress-track {
    height: 4px;
    background: var(--bg-elevated);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 2px;
    box-shadow: var(--accent-glow);
    transition: width 0.5s;
}
```

---

## Flip Cards

```css
.flip-card-front {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    box-shadow: var(--card-shadow);
}

.flip-card-front:hover {
    border-color: var(--border-accent);
    box-shadow: var(--card-glow);
}

.flip-card-back {
    background: linear-gradient(135deg, var(--accent-dark) 0%, #1a0033 100%);
    color: white;
    border: 1px solid var(--accent);
}

.flip-card-back .meta-label {
    color: var(--accent-light);
}
```

---

## Quiz Options

```css
.option {
    border: 1px solid var(--border-light);
    background: var(--bg-card);
    transition: all 0.2s;
}

.option:hover {
    border-color: var(--accent);
    background: rgba(0, 240, 255, 0.05);
    box-shadow: var(--accent-glow);
}

.option-letter {
    background: var(--bg-elevated);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
}

.option.correct {
    border-color: var(--success);
    background: rgba(0, 255, 136, 0.1);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.option.incorrect {
    border-color: var(--error);
    background: rgba(255, 68, 102, 0.1);
}
```

---

## Tabs

```css
.tabs-header {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 4px;
}

.tab-btn {
    color: var(--text-muted);
    border-radius: 6px;
    transition: all 0.2s;
}

.tab-btn.active {
    background: var(--bg-elevated);
    color: var(--accent);
    box-shadow: var(--accent-glow);
}
```

---

## Special Effects

```css
/* Glow on hover */
.glow-hover:hover {
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
}

/* Gradient text */
.gradient-text {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Scanline effect (optional) */
.scanlines::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.1) 2px,
        rgba(0, 0, 0, 0.1) 4px
    );
    pointer-events: none;
}
```

---

## Best For
- Programming/coding courses
- Tech training
- Gaming-related content
- Developer documentation
- Modern SaaS products
- Gen-Z audience
