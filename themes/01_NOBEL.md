# Theme 1: NOBEL (Original Premium Academic)

Elegant cream and gold aesthetic inspired by prestigious academic institutions.

---

## Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #F9F8F4;
    --bg-secondary: #F5F4F0;
    --bg-card: #FFFFFF;
    --bg-dark: #1c1917;
    
    /* Text */
    --text-primary: #1c1917;
    --text-secondary: #57534e;
    --text-muted: #78716c;
    --text-light: #a8a29e;
    
    /* Accent */
    --accent: #C5A059;
    --accent-light: #d4b76a;
    --accent-dark: #a68542;
    
    /* Borders */
    --border-light: #e7e5e4;
    --border-medium: #d6d3d1;
    
    /* Semantic */
    --success: #22c55e;
    --error: #ef4444;
    --warning: #f59e0b;
    --info: #3b82f6;
    
    /* Cards */
    --card-shadow: 0 1px 3px rgba(0,0,0,0.05);
    --card-hover-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

[data-theme="dark"] {
    --bg-primary: #1c1917;
    --bg-secondary: #292524;
    --bg-card: #292524;
    --text-primary: #f5f5f4;
    --text-secondary: #d6d3d1;
    --text-muted: #a8a29e;
    --border-light: #44403c;
    --border-medium: #57534e;
}
```

---

## Typography

```css
/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

h1, h2, h3, .heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 600;
    letter-spacing: -0.02em;
}

.meta-label {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-muted);
}
```

---

## Navigation

```css
.nav {
    background: rgba(249, 248, 244, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-light);
}

.brand {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
}

.brand-accent {
    color: var(--accent);
}
```

---

## Buttons

```css
.btn-primary {
    background: var(--bg-dark);
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: var(--accent);
    transform: translateY(-1px);
}

.btn-outline {
    border: 1px solid var(--border-medium);
    background: transparent;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
}

.btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
}
```

---

## Progress Bar

```css
.progress-track {
    height: 8px;
    background: var(--border-light);
    border-radius: 4px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Flip Cards

```css
.flip-card-front {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
}

.flip-card-back {
    background: var(--bg-dark);
    color: white;
}

.flip-card-back .meta-label {
    color: var(--accent);
}
```

---

## Quiz Options

```css
.option {
    border: 1px solid var(--border-light);
    background: white;
}

.option:hover {
    border-color: var(--accent);
    background: var(--bg-secondary);
}

.option.correct {
    border-color: var(--success);
    background: rgba(34, 197, 94, 0.1);
}

.option.incorrect {
    border-color: var(--error);
    background: rgba(239, 68, 68, 0.1);
}
```

---

## Tabs

```css
.tab-btn {
    border-bottom: 2px solid transparent;
    color: var(--text-muted);
}

.tab-btn.active {
    color: var(--text-primary);
    border-bottom-color: var(--accent);
}
```

---

## Best For
- IELTS/Education platforms
- Professional training
- Academic content
- Corporate learning
- Formal presentations
