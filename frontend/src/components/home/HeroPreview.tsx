import { useEffect, useState } from 'react';

// Animated dashboard preview for hero section
export function HeroPreview() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    // Auto-scroll the preview content
    const interval = setInterval(() => {
      setScrollY(prev => (prev >= 100 ? 0 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-preview">
      <div className="hero-preview__browser">
        {/* Browser chrome */}
        <div className="hero-preview__chrome">
          <div className="hero-preview__dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="hero-preview__url">love-app.com/dashboard</div>
        </div>
        
        {/* Dashboard content */}
        <div className="hero-preview__content" style={{ transform: `translateY(-${scrollY}px)` }}>
          {/* Header */}
          <div className="preview-dashboard">
            <div className="preview-dashboard__header">
              <div className="preview-dashboard__timer">
                <span>⏱</span> 45:00
              </div>
              <div className="preview-dashboard__title">
                Introduction to Machine Learning
              </div>
              <div className="preview-dashboard__progress">
                <div className="preview-dashboard__progress-bar" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            {/* Content cards */}
            <div className="preview-dashboard__grid">
              <div className="preview-card preview-card--topic">
                <div className="preview-card__icon">💡</div>
                <div className="preview-card__title">Topic Generator</div>
                <div className="preview-card__content">
                  <div className="preview-shimmer"></div>
                  <div className="preview-shimmer" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div className="preview-card preview-card--vocab">
                <div className="preview-card__icon">📚</div>
                <div className="preview-card__title">Vocabulary</div>
                <div className="preview-card__flip-cards">
                  <div className="mini-flip-card">Neural</div>
                  <div className="mini-flip-card">Algorithm</div>
                  <div className="mini-flip-card">Data</div>
                </div>
              </div>
              
              <div className="preview-card preview-card--quiz">
                <div className="preview-card__icon">✓</div>
                <div className="preview-card__title">Quick Quiz</div>
                <div className="preview-card__options">
                  <div className="mini-option"></div>
                  <div className="mini-option mini-option--selected"></div>
                  <div className="mini-option"></div>
                </div>
              </div>
              
              <div className="preview-card preview-card--notes">
                <div className="preview-card__icon">📝</div>
                <div className="preview-card__title">Smart Notes</div>
                <div className="preview-shimmer"></div>
                <div className="preview-shimmer" style={{ width: '60%' }}></div>
                <div className="preview-shimmer" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="hero-preview__float hero-preview__float--1 float delay-100">
        <span>🎯</span> Interactive Quizzes
      </div>
      <div className="hero-preview__float hero-preview__float--2 float delay-300">
        <span>⚡</span> AI-Powered
      </div>
      <div className="hero-preview__float hero-preview__float--3 float delay-500">
        <span>📊</span> Real-time Analytics
      </div>
    </div>
  );
}
