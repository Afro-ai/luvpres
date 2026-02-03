# Theme 4: FOREST (Natural Earthy Green)

Organic, grounded aesthetic with earth tones. Calming, sustainable, wellness-focused.

---

## Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #fafaf5;
    --bg-secondary: #f5f5eb;
    --bg-card: #ffffff;
    --bg-dark: #1a2f1a;
    
    /* Text */
    --text-primary: #1a2f1a;
    --text-secondary: #4a5d4a;
    --text-muted: #6b7c6b;
    
    /* Accent - Forest Green */
    --accent: #2d6a4f;
    --accent-light: #40916c;
    --accent-dark: #1b4332;
    --accent-50: rgba(45, 106, 79, 0.1);
    
    /* Secondary - Warm Wood */
    --accent2: #8b5a2b;
    --accent2-light: #a67c52;
    
    /* Tertiary - Sage */
    --sage: #b7c4a7;
    --sage-dark: #95a884;
    
    /* Borders */
    --border-light: #e5e5d5;
    --border-medium: #d4d4c4;
    
    /* Semantic */
    --success: #52b788;
    --error: #c75d4c;
    --warning: #d4a574;
    --info: #5a94b8;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(26, 47, 26, 0.06);
    --shadow-md: 0 4px 12px rgba(26, 47, 26, 0.08);
    --shadow-lg: 0 8px 24px rgba(26, 47, 26, 0.12);
}

[data-theme="dark"] {
    --bg-primary: #1a2f1a;
    --bg-secondary: #243524;
    --bg-card: #2a402a;
    --text-primary: #e5eae0;
    --text-secondary: #b5c4b0;
    --text-muted: #7a8c75;
    --border-light: #3d5040;
    --border-medium: #4a6050;
}
```

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Source Sans 3', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
}

h1, h2, h3, .heading {
    font-family: 'Lora', Georgia, serif;
    font-weight: 600;
    letter-spacing: -0.01em;
}

.meta-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
}
```

---

## Navigation

```css
.nav {
    background: rgba(250, 250, 245, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-light);
}

.brand {
    font-family: 'Lora', serif;
    font-weight: 600;
    font-size: 1.35rem;
    color: var(--accent-dark);
}

.brand-accent {
    color: var(--accent2);
}
```

---

## Buttons

```css
.btn-primary {
    background: var(--accent);
    color: white;
    padding: 0.85rem 2rem;
    border-radius: 24px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: var(--accent-dark);
    transform: scale(1.02);
}

.btn-outline {
    border: 2px solid var(--accent);
    color: var(--accent);
    background: transparent;
    padding: 0.85rem 2rem;
    border-radius: 24px;
}

.btn-outline:hover {
    background: var(--accent-50);
}

/* Organic button style */
.btn-organic {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    color: white;
    padding: 0.85rem 2rem;
    border-radius: 50px;
    position: relative;
    overflow: hidden;
}

.btn-organic::before {
    content: '🌿';
    position: absolute;
    right: 1rem;
    opacity: 0.3;
}
```

---

## Progress Bar

```css
.progress-container {
    background: var(--sage);
    padding: 1.5rem;
    border-radius: 16px;
}

.progress-track {
    height: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
    border-radius: 6px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Growing tree metaphor */
.progress-tree {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    height: 60px;
}

.tree-stage {
    transition: all 0.3s;
    opacity: 0.3;
}

.tree-stage.achieved {
    opacity: 1;
}
```

---

## Flip Cards

```css
.flip-card-front {
    background: white;
    border: 1px solid var(--border-light);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
}

.flip-card-front::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent), var(--sage));
    border-radius: 16px 16px 0 0;
}

.flip-card-back {
    background: var(--accent-dark);
    color: white;
    border-radius: 16px;
}

.flip-card-back .meta-label {
    color: var(--sage);
}
```

---

## Quiz Options

```css
.option {
    border: 2px solid var(--border-light);
    background: white;
    border-radius: 12px;
    transition: all 0.25s;
}

.option:hover {
    border-color: var(--accent);
    background: var(--accent-50);
    transform: translateX(4px);
}

.option-letter {
    background: var(--sage);
    color: var(--accent-dark);
    font-weight: 700;
    border-radius: 50%;
}

.option.correct {
    border-color: var(--success);
    background: rgba(82, 183, 136, 0.15);
}

.option.incorrect {
    border-color: var(--error);
    background: rgba(199, 93, 76, 0.1);
}
```

---

## Tabs

```css
.tabs-header {
    background: var(--sage);
    border-radius: 12px;
    padding: 6px;
}

.tab-btn {
    color: var(--text-secondary);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
}

.tab-btn.active {
    background: white;
    color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.tab-btn i {
    color: var(--accent);
}
```

---

## Decorative Elements

```css
/* Leaf decoration */
.leaf-decoration {
    position: relative;
}

.leaf-decoration::after {
    content: '🍃';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 1.5rem;
    opacity: 0.5;
}

/* Organic border */
.organic-border {
    border: 2px solid var(--sage);
    border-radius: 30px 4px 30px 4px;
}

/* Subtle texture */
.paper-texture {
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
}
```

---

## Best For
- Wellness & mindfulness content
- Sustainability training
- Nature-focused education
- Organic/eco brands
- Yoga & meditation
- Health coaching
