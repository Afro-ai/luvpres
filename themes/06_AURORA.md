# Theme 6: AURORA (Creative Purple Gradient)

Vibrant, imaginative, creative aesthetic. Gradient-heavy, modern, design-forward.

---

## Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #faf9fc;
    --bg-secondary: #f5f3ff;
    --bg-card: #ffffff;
    --bg-dark: #1e1b2e;
    
    /* Text */
    --text-primary: #1e1b2e;
    --text-secondary: #4c4575;
    --text-muted: #7c75a5;
    
    /* Accent - Electric Purple */
    --accent: #8b5cf6;
    --accent-light: #a78bfa;
    --accent-dark: #7c3aed;
    --accent-50: rgba(139, 92, 246, 0.1);
    
    /* Secondary - Hot Pink */
    --accent2: #ec4899;
    --accent2-light: #f472b6;
    
    /* Tertiary - Electric Blue */
    --accent3: #06b6d4;
    --accent3-light: #22d3ee;
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #06b6d4 100%);
    --gradient-subtle: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1));
    --gradient-card: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
    
    /* Borders */
    --border-light: #ececf3;
    --border-medium: #dddaeb;
    
    /* Semantic */
    --success: #10b981;
    --error: #f43f5e;
    --warning: #f59e0b;
    --info: #3b82f6;
    
    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(139, 92, 246, 0.08);
    --shadow-md: 0 4px 16px rgba(139, 92, 246, 0.12);
    --shadow-lg: 0 8px 32px rgba(139, 92, 246, 0.18);
    --shadow-glow: 0 0 40px rgba(139, 92, 246, 0.25);
}

[data-theme="dark"] {
    --bg-primary: #0f0d1a;
    --bg-secondary: #1a1730;
    --bg-card: #1e1b35;
    --text-primary: #f5f3ff;
    --text-secondary: #c4b5fd;
    --text-muted: #8b85a8;
    --border-light: #2d2650;
    --border-medium: #3d356a;
    --gradient-card: linear-gradient(180deg, #1e1b35 0%, #0f0d1a 100%);
}
```

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Sora', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.65;
}

h1, h2, h3, .heading {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.meta-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.display {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 4rem;
    line-height: 1.05;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## Navigation

```css
.nav {
    background: rgba(250, 249, 252, 0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-light);
}

.brand {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 1.35rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## Buttons

```css
.btn-primary {
    background: var(--gradient-primary);
    color: white;
    padding: 0.9rem 2.25rem;
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
}

.btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s;
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-glow);
}

.btn-primary:hover::before {
    opacity: 1;
}

.btn-outline {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box, 
                var(--gradient-primary) border-box;
    color: var(--accent);
    padding: 0.9rem 2.25rem;
    border-radius: 50px;
    font-weight: 600;
}

.btn-outline:hover {
    background: var(--gradient-subtle) padding-box,
                var(--gradient-primary) border-box;
}

/* Glass button */
.btn-glass {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.9rem 2.25rem;
    border-radius: 50px;
}
```

---

## Progress Bar

```css
.progress-container {
    background: var(--gradient-subtle);
    padding: 1.5rem 2rem;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
}

.progress-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0.05;
}

.progress-track {
    height: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}

.progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 6px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.progress-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
    animation: shine 2s infinite;
}

@keyframes shine {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
}
```

---

## Flip Cards

```css
.flip-card-front {
    background: var(--gradient-card);
    border: 1px solid var(--border-light);
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
}

.flip-card-front::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
}

.flip-card:hover .flip-card-front::after {
    opacity: 1;
}

.flip-card-back {
    background: var(--gradient-primary);
    color: white;
    border-radius: 20px;
}

.flip-card-back .meta-label {
    color: rgba(255,255,255,0.8);
    -webkit-text-fill-color: rgba(255,255,255,0.8);
}
```

---

## Quiz Options

```css
.option {
    border: 1px solid var(--border-light);
    background: white;
    border-radius: 14px;
    transition: all 0.25s;
    position: relative;
}

.option::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 15px;
    padding: 1px;
    background: var(--gradient-primary);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s;
}

.option:hover::before {
    opacity: 1;
}

.option:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.option-letter {
    background: var(--gradient-primary);
    color: white;
    font-weight: 600;
}

.option.correct {
    border-color: var(--success);
    background: rgba(16, 185, 129, 0.08);
}

.option.incorrect {
    border-color: var(--error);
    background: rgba(244, 63, 94, 0.08);
}
```

---

## Tabs

```css
.tabs-header {
    display: flex;
    gap: 0.25rem;
    background: var(--gradient-subtle);
    padding: 6px;
    border-radius: 50px;
}

.tab-btn {
    color: var(--text-muted);
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 500;
    transition: all 0.3s;
}

.tab-btn.active {
    background: white;
    color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.tab-btn.active i {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## Special Effects

```css
/* Aurora glow */
.aurora-glow {
    position: relative;
}

.aurora-glow::before {
    content: '';
    position: absolute;
    inset: -20px;
    background: var(--gradient-primary);
    filter: blur(40px);
    opacity: 0.3;
    z-index: -1;
    animation: aurora 8s infinite alternate;
}

@keyframes aurora {
    0% { transform: translateX(-10%) translateY(-10%); }
    100% { transform: translateX(10%) translateY(10%); }
}

/* Floating orbs decoration */
.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    pointer-events: none;
}

.orb-1 {
    width: 400px;
    height: 400px;
    background: var(--accent);
    top: -200px;
    right: -100px;
}

.orb-2 {
    width: 300px;
    height: 300px;
    background: var(--accent2);
    bottom: -100px;
    left: -150px;
}

/* Glassmorphism card */
.glass-card {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
}

/* Gradient border */
.gradient-border {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                var(--gradient-primary) border-box;
}
```

---

## Best For
- Design & creative courses
- Art & illustration training
- Innovation workshops
- Creative agencies
- Portfolio presentations
- Music & entertainment
