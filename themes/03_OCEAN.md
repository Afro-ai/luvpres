# Theme 3: OCEAN (Fresh Blue Corporate)

Clean, professional blue palette. Trustworthy, calming, enterprise-ready.

---

## Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #f8fafc;
    --bg-secondary: #f1f5f9;
    --bg-card: #ffffff;
    --bg-dark: #0f172a;
    
    /* Text */
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    
    /* Accent - Ocean Blue */
    --accent: #0ea5e9;
    --accent-light: #38bdf8;
    --accent-dark: #0284c7;
    --accent-50: rgba(14, 165, 233, 0.1);
    
    /* Secondary - Navy */
    --accent2: #1e3a5f;
    
    /* Borders */
    --border-light: #e2e8f0;
    --border-medium: #cbd5e1;
    
    /* Semantic */
    --success: #10b981;
    --error: #f43f5e;
    --warning: #f59e0b;
    --info: #6366f1;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-card: #1e293b;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-muted: #64748b;
    --border-light: #334155;
    --border-medium: #475569;
}
```

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

body {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.65;
}

h1, h2, h3, .heading {
    font-weight: 700;
    letter-spacing: -0.025em;
}

.meta-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
}
```

---

## Navigation

```css
.nav {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
}

.brand {
    font-weight: 800;
    font-size: 1.25rem;
    color: var(--accent2);
}

.brand-accent {
    color: var(--accent);
}
```

---

## Buttons

```css
.btn-primary {
    background: var(--accent);
    color: white;
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

.btn-primary:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.btn-outline {
    border: 2px solid var(--accent);
    color: var(--accent);
    background: transparent;
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
}

.btn-outline:hover {
    background: var(--accent-50);
}
```

---

## Progress Bar

```css
.progress-track {
    height: 10px;
    background: var(--border-light);
    border-radius: 5px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-dark), var(--accent-light));
    border-radius: 5px;
    transition: width 0.5s;
}

.progress-steps {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
}

.progress-step {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--border-light);
    border: 2px solid white;
    box-shadow: var(--shadow-sm);
}

.progress-step.completed {
    background: var(--accent);
}
```

---

## Flip Cards

```css
.flip-card-front {
    background: white;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-md);
    border-radius: 12px;
}

.flip-card-front:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
}

.flip-card-back {
    background: linear-gradient(135deg, var(--accent2) 0%, var(--accent-dark) 100%);
    color: white;
    border-radius: 12px;
}

.flip-card-back .meta-label {
    color: var(--accent-light);
}
```

---

## Quiz Options

```css
.option {
    border: 2px solid var(--border-light);
    background: white;
    border-radius: 10px;
    transition: all 0.2s;
}

.option:hover {
    border-color: var(--accent);
    background: var(--accent-50);
}

.option-letter {
    background: var(--bg-secondary);
    color: var(--accent);
    font-weight: 700;
}

.option.correct {
    border-color: var(--success);
    background: rgba(16, 185, 129, 0.1);
}

.option.correct .option-letter {
    background: var(--success);
    color: white;
}

.option.incorrect {
    border-color: var(--error);
    background: rgba(244, 63, 94, 0.1);
}
```

---

## Tabs

```css
.tabs-header {
    border-bottom: 2px solid var(--border-light);
}

.tab-btn {
    color: var(--text-muted);
    padding: 1rem 1.5rem;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
}

.tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
}
```

---

## Cards

```css
.card {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-md);
    padding: 1.5rem;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--accent-50);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
}
```

---

## Best For
- Healthcare/Medical training
- Corporate presentations
- Financial services
- SaaS product demos
- Science & research content
- Professional development
