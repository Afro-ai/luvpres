# 01 - Landing Page & Create Flow

## System Prompt for Coding Agent

You are building the **landing page and dashboard creation flow** for LOVE, a SaaS that lets anyone create stunning interactive presentations in seconds.

---

# OBJECTIVE

Build a high-converting landing page with an integrated "Create" experience that:
1. Captures attention in < 3 seconds
2. Lets users generate a dashboard WITHOUT signing up
3. Converts free users to paid via value demonstration
4. Is 100% static (Cloudflare Pages compatible)

---

# TECHNOLOGY STACK

```
Framework: React 18 + TypeScript
Build: Vite
Styling: Vanilla CSS (CSS Variables + Modern CSS)
Icons: Lucide React
Animations: CSS @keyframes + Intersection Observer
Hosting: Cloudflare Pages (static)
```

**NO Tailwind.** Use a custom CSS design system.

---

# FILE STRUCTURE

```
src/
├── pages/
│   ├── Home.tsx              # Landing page
│   ├── Create.tsx            # Dashboard creation flow
│   ├── Preview.tsx           # Preview generated dashboard
│   ├── Pricing.tsx           # Pricing page
│   └── Dashboard.tsx         # View published dashboard (public)
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Navigation bar
│   │   ├── Footer.tsx        # Footer with links
│   │   └── Layout.tsx        # Page wrapper
│   ├── home/
│   │   ├── Hero.tsx          # Hero section with CTA
│   │   ├── Features.tsx      # Feature highlights
│   │   ├── HowItWorks.tsx    # 3-step process
│   │   ├── Testimonials.tsx  # Social proof
│   │   ├── Pricing.tsx       # Pricing cards
│   │   └── FAQ.tsx           # Frequently asked questions
│   ├── create/
│   │   ├── TopicInput.tsx    # Topic and content input
│   │   ├── GenerateButton.tsx # Generate with loading state
│   │   ├── PreviewPane.tsx   # Live preview iframe
│   │   └── PublishModal.tsx  # Publish confirmation
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── styles/
│   ├── index.css             # CSS variables + reset
│   ├── components.css        # Component styles
│   └── animations.css        # Keyframe animations
├── hooks/
│   ├── useApi.ts             # API calls to Worker
│   └── useLocalStorage.ts    # Persist drafts
├── lib/
│   └── api.ts                # API client
└── main.tsx
```

---

# DESIGN SYSTEM

## Color Palette

```css
:root {
  /* Primary - Nobel Aesthetic */
  --cream: #F9F8F4;
  --cream-dark: #F0EDE5;
  --stone-900: #1c1917;
  --stone-800: #292524;
  --stone-700: #44403c;
  --stone-600: #57534e;
  --stone-500: #78716c;
  --stone-400: #a8a29e;
  --stone-300: #d6d3d1;
  --stone-200: #e7e5e4;
  --stone-100: #f5f5f4;
  
  /* Accent */
  --gold: #C5A059;
  --gold-light: #d4b76a;
  --gold-dark: #a68542;
  
  /* Semantic */
  --success: #22c55e;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 50px rgba(0,0,0,0.15);
  
  /* Typography */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;
}
```

## Typography Scale

```css
/* Headings */
h1 { font-family: var(--font-heading); font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; line-height: 1.1; }
h2 { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3rem); font-weight: 600; line-height: 1.2; }
h3 { font-family: var(--font-heading); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 600; line-height: 1.3; }

/* Body */
.text-lg { font-size: 1.125rem; line-height: 1.75; }
.text-base { font-size: 1rem; line-height: 1.6; }
.text-sm { font-size: 0.875rem; line-height: 1.5; }
.text-xs { font-size: 0.75rem; line-height: 1.4; }

/* Meta Label */
.meta-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--stone-500);
}
```

---

# COMPONENT SPECIFICATIONS

## 1. Header Component

```tsx
// components/layout/Header.tsx

interface HeaderProps {
  transparent?: boolean; // For hero overlay
}

export function Header({ transparent = false }: HeaderProps) {
  return (
    <header className={`header ${transparent ? 'header--transparent' : ''}`}>
      <nav className="header__nav">
        <a href="/" className="header__logo">
          <span className="header__logo-text">LOVE</span>
          <span className="header__logo-badge">beta</span>
        </a>
        
        <div className="header__links">
          <a href="/pricing">Pricing</a>
          <a href="/examples">Examples</a>
          <a href="/login" className="header__link--ghost">Log in</a>
          <a href="/create" className="btn btn--primary">Create Free</a>
        </div>
      </nav>
    </header>
  );
}
```

**CSS Requirements:**
- Sticky on scroll with blur backdrop
- Logo: "LOVE" in Playfair Display, gold accent
- Mobile: hamburger menu with slide-out drawer
- Transition from transparent to solid on scroll

---

## 2. Hero Section

```tsx
// components/home/Hero.tsx

export function Hero() {
  const [topic, setTopic] = useState('');
  
  return (
    <section className="hero">
      <div className="hero__content">
        <span className="meta-label">AI-Powered Presentation Builder</span>
        <h1 className="hero__title">
          Create Stunning Presentations
          <span className="hero__title--gold">in Seconds</span>
        </h1>
        <p className="hero__subtitle">
          Type your topic. Get a professional, interactive dashboard.
          No design skills needed.
        </p>
        
        {/* Inline Create Form */}
        <form className="hero__form" onSubmit={handleCreate}>
          <div className="hero__input-wrapper">
            <input
              type="text"
              placeholder="Enter your topic (e.g., 'Introduction to Machine Learning')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="hero__input"
            />
            <button type="submit" className="btn btn--primary btn--lg">
              Generate Free <ArrowRight />
            </button>
          </div>
        </form>
        
        <p className="hero__social-proof">
          <span className="hero__avatars">
            {/* Stack of user avatars */}
          </span>
          <span>Join 5,000+ educators and trainers</span>
        </p>
      </div>
      
      {/* Animated Dashboard Preview */}
      <div className="hero__preview">
        <div className="hero__browser-frame">
          <img src="/preview-dashboard.png" alt="Dashboard preview" />
        </div>
      </div>
    </section>
  );
}
```

**CSS Requirements:**
- Full viewport height on desktop
- Gradient background: cream → cream-dark
- Animated floating elements (subtle)
- Browser frame mockup for preview
- Mobile: Stack vertically, smaller font

---

## 3. Features Section

```tsx
// components/home/Features.tsx

const features = [
  {
    icon: <Sparkles />,
    title: 'AI-Powered Generation',
    description: 'Just describe your topic. Our AI creates a complete interactive dashboard with quizzes, flip cards, and progress tracking.'
  },
  {
    icon: <Zap />,
    title: 'Instant Publishing',
    description: 'Get a shareable link in seconds. No downloads, no installs. Works on any device.'
  },
  {
    icon: <Users />,
    title: 'Live Presenter Mode',
    description: 'Sync your cursor with your audience in real-time. Perfect for remote teaching.'
  },
  {
    icon: <BarChart />,
    title: 'Built-in Analytics',
    description: 'See who viewed your content, how long they stayed, and which sections engaged them most.'
  },
  {
    icon: <Palette />,
    title: 'Professional Design',
    description: 'Every dashboard uses our "Nobel Aesthetic" - premium typography, animations, and interactions.'
  },
  {
    icon: <Lock />,
    title: 'Your Brand, Your Domain',
    description: 'Remove our branding. Use your custom domain. Make it yours.'
  }
];

export function Features() {
  return (
    <section className="features">
      <div className="features__header">
        <span className="meta-label">Why LOVE?</span>
        <h2>Everything you need to look professional</h2>
      </div>
      
      <div className="features__grid">
        {features.map((feature, i) => (
          <div key={i} className="feature-card" style={{ '--delay': `${i * 0.1}s` }}>
            <div className="feature-card__icon">{feature.icon}</div>
            <h3 className="feature-card__title">{feature.title}</h3>
            <p className="feature-card__description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**CSS Requirements:**
- 3-column grid on desktop, 1 on mobile
- Cards with subtle hover lift + shadow
- Icons in gold circles
- Staggered fade-in animation on scroll

---

## 4. How It Works

```tsx
// components/home/HowItWorks.tsx

const steps = [
  {
    number: '01',
    title: 'Describe Your Topic',
    description: 'Type what you want to teach. Add bullet points, paste notes, or just write a sentence.',
    visual: '/step-1.gif'
  },
  {
    number: '02',
    title: 'AI Creates Your Dashboard',
    description: 'Our AI generates a complete interactive presentation with quizzes, flip cards, and more.',
    visual: '/step-2.gif'
  },
  {
    number: '03',
    title: 'Share & Present',
    description: 'Get an instant link. Share with students. Or use Live Mode to present in real-time.',
    visual: '/step-3.gif'
  }
];

export function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-it-works__header">
        <span className="meta-label">Simple as 1-2-3</span>
        <h2>From idea to presentation in seconds</h2>
      </div>
      
      <div className="how-it-works__steps">
        {steps.map((step, i) => (
          <div key={i} className="step">
            <div className="step__content">
              <span className="step__number">{step.number}</span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__description">{step.description}</p>
            </div>
            <div className="step__visual">
              <img src={step.visual} alt={step.title} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**CSS Requirements:**
- Alternating left/right layout
- Large step numbers in gold
- Animated GIFs showing the actual flow
- Connected by dotted line

---

## 5. Pricing Section

```tsx
// components/home/Pricing.tsx

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying it out',
    features: [
      '3 dashboards',
      'Basic analytics (views)',
      'LOVE branding',
      '7-day link expiry'
    ],
    cta: 'Start Free',
    highlighted: false
  },
  {
    name: 'Pro',
    price: 9,
    description: 'For serious creators',
    features: [
      'Unlimited dashboards',
      'Full analytics',
      'No branding',
      'Permanent links',
      'Custom domain',
      'Priority support'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    badge: 'Most Popular'
  },
  {
    name: 'Team',
    price: 29,
    description: 'For organizations',
    features: [
      'Everything in Pro',
      '5 team members',
      'Shared workspace',
      'Team analytics',
      'Admin controls'
    ],
    cta: 'Start Team Trial',
    highlighted: false
  }
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  
  return (
    <section className="pricing" id="pricing">
      <div className="pricing__header">
        <span className="meta-label">Pricing</span>
        <h2>Simple, transparent pricing</h2>
        
        <div className="pricing__toggle">
          <span className={!annual ? 'active' : ''}>Monthly</span>
          <button 
            className="toggle" 
            onClick={() => setAnnual(!annual)}
            aria-pressed={annual}
          >
            <span className="toggle__knob" />
          </button>
          <span className={annual ? 'active' : ''}>
            Annual <span className="pricing__save">Save 20%</span>
          </span>
        </div>
      </div>
      
      <div className="pricing__cards">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`pricing-card ${plan.highlighted ? 'pricing-card--highlighted' : ''}`}
          >
            {plan.badge && <span className="pricing-card__badge">{plan.badge}</span>}
            <h3 className="pricing-card__name">{plan.name}</h3>
            <div className="pricing-card__price">
              <span className="pricing-card__currency">$</span>
              <span className="pricing-card__amount">
                {annual ? Math.round(plan.price * 0.8) : plan.price}
              </span>
              <span className="pricing-card__period">/mo</span>
            </div>
            <p className="pricing-card__description">{plan.description}</p>
            
            <ul className="pricing-card__features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <Check className="pricing-card__check" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className={`btn ${plan.highlighted ? 'btn--primary' : 'btn--outline'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**CSS Requirements:**
- 3-column layout, center card raised
- Gold border on highlighted plan
- "Most Popular" badge
- Smooth annual/monthly price animation
- Mobile: stack with highlight first

---

## 6. Create Page (Dashboard Creation Flow)

```tsx
// pages/Create.tsx

export function CreatePage() {
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    setStep('generating');
    setError('');
    
    try {
      const response = await api.generate({ topic, content });
      setGeneratedHtml(response.html);
      setStep('preview');
    } catch (err) {
      setError('Generation failed. Please try again.');
      setStep('input');
    }
  };
  
  const handlePublish = async () => {
    const response = await api.publish({ html: generatedHtml, title: topic });
    // Show success modal with URL
  };
  
  return (
    <Layout>
      <div className="create-page">
        {step === 'input' && (
          <div className="create-input">
            <h1>What do you want to teach?</h1>
            
            <div className="create-input__form">
              <label htmlFor="topic">Topic</label>
              <input
                id="topic"
                type="text"
                placeholder="e.g., 'IELTS Writing Task 2 - Opinion Essays'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              
              <label htmlFor="content">Key Points (optional)</label>
              <textarea
                id="content"
                placeholder="Add bullet points, paste existing notes, or describe what to cover..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
              
              <div className="create-input__options">
                <select>
                  <option value="intermediate">Intermediate Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              {error && <p className="error">{error}</p>}
              
              <button 
                className="btn btn--primary btn--lg"
                onClick={handleGenerate}
              >
                Generate Dashboard <Sparkles />
              </button>
            </div>
          </div>
        )}
        
        {step === 'generating' && (
          <div className="create-generating">
            <div className="create-generating__animation">
              {/* Animated loading indicator */}
              <Loader className="spin" />
            </div>
            <h2>Creating your dashboard...</h2>
            <p>This usually takes 15-30 seconds</p>
            
            {/* Progress messages */}
            <div className="create-generating__steps">
              <Step done>Analyzing your topic</Step>
              <Step active>Generating interactive components</Step>
              <Step>Building quiz questions</Step>
              <Step>Applying premium styling</Step>
            </div>
          </div>
        )}
        
        {step === 'preview' && (
          <div className="create-preview">
            <div className="create-preview__header">
              <h2>Your dashboard is ready!</h2>
              <div className="create-preview__actions">
                <button 
                  className="btn btn--outline"
                  onClick={() => setStep('input')}
                >
                  <ArrowLeft /> Edit Topic
                </button>
                <button 
                  className="btn btn--primary"
                  onClick={handlePublish}
                >
                  <Globe /> Publish & Share
                </button>
              </div>
            </div>
            
            <div className="create-preview__frame">
              <iframe
                srcDoc={generatedHtml}
                title="Dashboard Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

**CSS Requirements:**
- Clean, focused input form
- Animated progress during generation
- Full-width iframe preview with browser chrome
- Floating action bar for publish

---

# API INTEGRATION

```typescript
// lib/api.ts

const API_BASE = '/api'; // Proxied to Worker

export const api = {
  async generate(data: { topic: string; content: string; level?: string }) {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      if (error.error === 'limit_reached') {
        throw new Error('LIMIT_REACHED');
      }
      throw new Error(error.message || 'Generation failed');
    }
    
    return res.json();
  },
  
  async publish(data: { html: string; title: string }) {
    const res = await fetch(`${API_BASE}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      if (error.error === 'dashboard_limit') {
        throw new Error('DASHBOARD_LIMIT');
      }
      throw new Error(error.message || 'Publish failed');
    }
    
    return res.json(); // { url, id }
  }
};
```

---

# SEO & META

```tsx
// pages/Home.tsx - Head section

<Helmet>
  <title>LOVE - Create Stunning Presentations in Seconds</title>
  <meta name="description" content="AI-powered presentation builder. Type your topic, get a professional interactive dashboard. No design skills needed." />
  <meta property="og:title" content="LOVE - Create Stunning Presentations" />
  <meta property="og:description" content="AI-powered presentation builder for educators and trainers" />
  <meta property="og:image" content="https://bankruptthebc.online/og-image.png" />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://bankruptthebc.online/" />
</Helmet>
```

---

# PERFORMANCE REQUIREMENTS

- **Lighthouse Score**: 90+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 150KB gzipped
- **Images**: WebP with AVIF fallback, lazy loaded

---

# OUTPUT

Generate the complete React application with:
1. All component files
2. CSS files with design system
3. Router setup (React Router v6)
4. API client
5. Vite configuration
6. Build-ready for Cloudflare Pages

Include placeholder images where noted. Ensure mobile-first responsive design.
