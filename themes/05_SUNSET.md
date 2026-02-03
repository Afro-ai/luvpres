# Theme 5: SUNSET (Warm Orange Energetic)

Bold, warm, energizing palette. Motivational, action-oriented, high-conversion.

---

## Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #fffbf5;
    --bg-secondary: #fff5eb;
    --bg-card: #ffffff;
    --bg-dark: #2d1f14;
    
    /* Text */
    --text-primary: #2d1f14;
    --text-secondary: #5c4a3d;
    --text-muted: #8c7a6d;
    
    /* Accent - Sunset Orange */
    --accent: #f97316;
    --accent-light: #fb923c;
    --accent-dark: #ea580c;
    --accent-50: rgba(249, 115, 22, 0.1);
    
    /* Secondary - Warm Red */
    --accent2: #dc2626;
    --accent2-light: #ef4444;
    
    /* Tertiary - Coral */
    --coral: #ff7f6e;
    --peach: #ffd4c4;
    
    /* Borders */
    --border-light: #f5e6d8;
    --border-medium: #e8d5c4;
    
    /* Semantic */
    --success: #16a34a;
    --error: #dc2626;
    --warning: #fbbf24;
    --info: #6366f1;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(249, 115, 22, 0.08);
    --shadow-md: 0 4px 12px rgba(249, 115, 22, 0.12);
    --shadow-lg: 0 8px 24px rgba(249, 115, 22, 0.18);
    --shadow-glow: 0 0 30px rgba(249, 115, 22, 0.2);
}

[data-theme="dark"] {
    --bg-primary: #1a1412;
    --bg-secondary: #2d2420;
    --bg-card: #352b25;
    --text-primary: #fff5eb;
    --text-secondary: #e8d5c4;
    --text-muted: #a89080;
    --border-light: #4a3d35;
    --border-medium: #5c4d45;
}
```

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Outfit:wght@400;500;600;700;800&display=swap');

body {
    font-family: 'DM Sans', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

h1, h2, h3, .heading {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.meta-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
}

.display {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 3.5rem;
    line-height: 1.1;
}
```

---

## Navigation

```css
.nav {
    background: rgba(255, 251, 245, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-light);
}

.brand {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 1.35rem;
    color: var(--accent);
}

.brand-accent {
    color: var(--accent2);
}
```

---

## Buttons

```css
.btn-primary {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    color: white;
    padding: 0.9rem 2.25rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.3s;
    box-shadow: var(--shadow-md);
}

.btn-primary:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-glow);
}

.btn-primary:active {
    transform: translateY(0) scale(0.98);
}

.btn-outline {
    border: 2px solid var(--accent);
    color: var(--accent);
    background: transparent;
    padding: 0.9rem 2.25rem;
    border-radius: 10px;
    font-weight: 700;
}

.btn-outline:hover {
    background: var(--accent-50);
    transform: translateY(-2px);
}

/* CTA Button with pulse */
.btn-cta {
    background: var(--accent);
    color: white;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    font-weight: 700;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
    50% { box-shadow: 0 0 0 15px rgba(249, 115, 22, 0); }
}
```

---

## Progress Bar

```css
.progress-container {
    background: linear-gradient(135deg, var(--peach) 0%, var(--bg-secondary) 100%);
    padding: 1.5rem 2rem;
    border-radius: 16px;
}

.progress-track {
    height: 14px;
    background: white;
    border-radius: 7px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--coral), var(--accent2));
    background-size: 200% 100%;
    border-radius: 7px;
    transition: width 0.5s;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}

/* Fire milestone icons */
.milestone-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--peach);
    display: flex;
    align-items: center;
    justify-content: center;
}

.milestone-icon.achieved {
    background: var(--accent);
    color: white;
    animation: pop 0.3s ease;
}

@keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}
```

---

## Flip Cards

```css
.flip-card-front {
    background: white;
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-md);
}

.flip-card-front::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, var(--accent), var(--coral));
    border-radius: 18px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s;
}

.flip-card:hover .flip-card-front::before {
    opacity: 1;
}

.flip-card-back {
    background: linear-gradient(180deg, var(--accent) 0%, var(--accent2) 100%);
    color: white;
    border-radius: 16px;
}

.flip-card-back .meta-label {
    color: var(--peach);
}
```

---

## Quiz Options

```css
.option {
    border: 2px solid var(--border-light);
    background: white;
    border-radius: 12px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
}

.option::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--accent-50), transparent);
    opacity: 0;
    transition: opacity 0.2s;
}

.option:hover {
    border-color: var(--accent);
    transform: translateX(6px);
}

.option:hover::before {
    opacity: 1;
}

.option-letter {
    background: linear-gradient(135deg, var(--accent), var(--coral));
    color: white;
    font-weight: 700;
}

.option.correct {
    border-color: var(--success);
    background: rgba(22, 163, 74, 0.1);
}

.option.incorrect {
    border-color: var(--error);
    background: rgba(220, 38, 38, 0.1);
}
```

---

## Tabs

```css
.tabs-header {
    display: flex;
    gap: 0.5rem;
    padding: 6px;
    background: var(--bg-secondary);
    border-radius: 14px;
}

.tab-btn {
    color: var(--text-muted);
    padding: 0.85rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s;
}

.tab-btn.active {
    background: white;
    color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.tab-btn:hover:not(.active) {
    color: var(--accent);
}
```

---

## Special Effects

```css
/* Gradient text */
.gradient-text {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Warm glow */
.warm-glow {
    box-shadow: var(--shadow-glow);
}

/* Badge */
.badge-hot {
    background: var(--accent2);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
}
```

---

## Best For
- Sales & marketing training
- Motivational content
- Fitness & coaching
- E-commerce presentations
- Launch announcements
- High-energy workshops
