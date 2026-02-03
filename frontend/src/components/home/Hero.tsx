import { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeroPreview } from './HeroPreview';

export function Hero() {
  const [topic, setTopic] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      navigate(`/create?topic=${encodeURIComponent(topic)}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero__bg"></div>

      <div className="hero__content fade-in-up">
        <span className="hero__badge">
          <span className="hero__badge-dot"></span>
          AI-Powered Presentation Builder
        </span>

        <h1 className="hero__title">
          Create Stunning Presentations
          <span className="hero__title--gold">in Seconds</span>
        </h1>

        <p className="hero__subtitle">
          Type your topic. Get a professional, interactive dashboard with quizzes,
          flip cards, and progress tracking. No design skills needed.
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
            <button type="submit" className="btn btn--primary btn--lg hero__cta">
              Generate Free <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Social Proof */}
        <div className="hero__social-proof">
          <div className="hero__avatars">
            <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>JD</div>
            <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>SM</div>
            <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>AK</div>
            <div className="hero__avatar" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>+</div>
          </div>
          <div className="hero__proof-text">
            <strong>5,000+</strong> educators and trainers
            <span className="hero__proof-rating">★★★★★ 4.9/5</span>
          </div>
        </div>

        {/* Watch Demo Link */}
        <button className="hero__demo-link">
          <Play className="w-4 h-4" />
          Watch 2-min demo
        </button>
      </div>

      {/* Animated Dashboard Preview */}
      <HeroPreview />
    </section>
  );
}
