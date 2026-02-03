import { Sparkles, Zap, Users, BarChart, Palette, Lock } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI-Powered Generation',
    description: 'Just describe your topic. Our AI creates a complete interactive dashboard with quizzes, flip cards, and progress tracking.'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Publishing',
    description: 'Get a shareable link in seconds. No downloads, no installs. Works on any device.'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Live Presenter Mode',
    description: 'Sync your cursor with your audience in real-time. Perfect for remote teaching.'
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: 'Built-in Analytics',
    description: 'See who viewed your content, how long they stayed, and which sections engaged them most.'
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Professional Design',
    description: 'Every dashboard uses our "Nobel Aesthetic" - premium typography, animations, and interactions.'
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Your Brand, Your Domain',
    description: 'Remove our branding. Use your custom domain. Make it yours.'
  }
];

export function Features() {
  return (
    <section className="features section">
      <div className="container">
        <div className="features__header">
          <span className="meta-label">Why LOVE?</span>
          <h2>Everything you need to look professional</h2>
        </div>
        
        <div className="features__grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
              <div className="feature-card__icon">{feature.icon}</div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
