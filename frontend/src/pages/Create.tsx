import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowLeft, Globe, Loader, Palette, Copy, Check, ExternalLink } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { api } from '../lib/api';

// Theme options
const themes = [
  { id: 'nobel', name: 'Nobel', description: 'Elegant cream with gold accents', color: '#C5A059' },
  { id: 'midnight', name: 'Midnight', description: 'Dark mode neon tech', color: '#00f0ff' },
  { id: 'ocean', name: 'Ocean', description: 'Calm blues and teals', color: '#0284c7' },
  { id: 'forest', name: 'Forest', description: 'Earthy greens', color: '#2d5a27' },
  { id: 'sunset', name: 'Sunset', description: 'Warm oranges and corals', color: '#ea580c' },
  { id: 'aurora', name: 'Aurora', description: 'Gradient purple/pink/teal', color: '#8b5cf6' }
];

// Simple Step Component
const Step = ({ children, active, done }: { children: React.ReactNode, active?: boolean, done?: boolean }) => (
  <div className={`step-indicator ${active ? 'active' : ''} ${done ? 'done' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0', opacity: active || done ? 1 : 0.5 }}>
    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: done ? 'var(--success)' : active ? 'var(--gold)' : 'var(--stone-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
      {done ? '✓' : ''}
    </div>
    <span>{children}</span>
  </div>
);

export function CreatePage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'input' | 'generating' | 'preview' | 'publishing' | 'published'>('input');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('nobel');
  const [level, setLevel] = useState('intermediate');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');

  // Progress simulation
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (searchParams.get('topic')) {
      setTopic(searchParams.get('topic')!);
    }
  }, [searchParams]);

  useEffect(() => {
    if (step === 'generating') {
      const interval = setInterval(() => {
        setProgressStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setProgressStep(0);
    }
  }, [step]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setStep('generating');
    setError('');

    try {
      const response = await api.generate({ topic, content, level, theme: selectedTheme });
      setGeneratedHtml(response.html);
      setStep('preview');
    } catch (err) {
      setError('Generation failed. Please try again.');
      setStep('input');
    }
  };

  const handlePublish = async () => {
    setStep('publishing');
    try {
      const result = await api.publish({ html: generatedHtml, title: topic, theme: selectedTheme });
      setPublishedUrl(result.url);
      setStep('published');
    } catch (err) {
      setError('Failed to publish. Please try again.');
      setStep('preview');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="create-page-wrapper">
      <Header />
      <div className="container section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {step === 'input' && (
          <div className="create-input" style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>What do you want to teach?</h1>

            {/* Topic Input */}
            <div className="create-input__topic" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="topic" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Topic *</label>
              <input
                id="topic"
                type="text"
                placeholder="e.g., Introduction to Machine Learning"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--stone-300)', fontSize: '1.125rem' }}
              />
            </div>

            {/* Theme Selector */}
            <div className="create-input__theme" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 500 }}>
                <Palette className="w-4 h-4" /> Choose Theme
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: selectedTheme === theme.id ? `2px solid ${theme.color}` : '1px solid var(--stone-200)',
                      background: selectedTheme === theme.id ? `${theme.color}10` : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.color }}></div>
                      <strong style={{ fontSize: '0.9rem' }}>{theme.name}</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--stone-500)', margin: 0 }}>{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="create-input__content" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Additional Context (optional)</label>
              <textarea
                id="content"
                placeholder="Add key points, notes, or any content you want to include..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--stone-300)', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            </div>

            {/* Level Selector */}
            <div className="create-input__options" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--stone-300)', width: '100%', fontSize: '1rem' }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {error && <p className="error" style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

            <button
              className="btn btn--primary btn--lg"
              onClick={handleGenerate}
              style={{ width: '100%' }}
            >
              Generate Dashboard <Sparkles className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="create-generating" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div className="create-generating__animation" style={{ marginBottom: '2rem' }}>
              <Loader className="w-16 h-16 spin" style={{ color: 'var(--gold)', margin: '0 auto' }} />
            </div>
            <h2>Creating your dashboard...</h2>
            <p style={{ color: 'var(--stone-500)', marginBottom: '2rem' }}>Using {themes.find(t => t.id === selectedTheme)?.name} theme</p>

            <div className="create-generating__steps">
              <Step done={progressStep >= 1} active={progressStep === 0}>Analyzing topic</Step>
              <Step done={progressStep >= 2} active={progressStep === 1}>Generating content</Step>
              <Step done={progressStep >= 3} active={progressStep === 2}>Applying {themes.find(t => t.id === selectedTheme)?.name} theme</Step>
              <Step active={progressStep === 3}>Finalizing dashboard</Step>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="create-preview" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="create-preview__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button
                className="btn btn--outline"
                onClick={() => setStep('input')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Editor
              </button>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn--outline"
                  onClick={() => handleGenerate()}
                >
                  Regenerate
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handlePublish}
                >
                  <Globe className="w-4 h-4 mr-2" /> Publish
                </button>
              </div>
            </div>

            <div className="create-preview__frame" style={{ border: '1px solid var(--stone-200)', borderRadius: '12px', overflow: 'hidden', height: '70vh' }}>
              <iframe
                srcDoc={generatedHtml}
                title="Dashboard Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )}

        {step === 'publishing' && (
          <div className="create-publishing" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <Loader className="w-16 h-16 spin" style={{ color: 'var(--gold)', margin: '0 auto 2rem' }} />
            <h2>Publishing your dashboard...</h2>
            <p style={{ color: 'var(--stone-500)' }}>Creating shareable link</p>
          </div>
        )}

        {step === 'published' && (
          <div className="create-published" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              ✓
            </div>

            <h2 style={{ marginBottom: '0.5rem' }}>Dashboard Published! 🎉</h2>
            <p style={{ color: 'var(--stone-500)', marginBottom: '2rem' }}>
              Share this link with your audience. Expires in 7 days.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--stone-100)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <input
                type="text"
                value={publishedUrl}
                readOnly
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                className="btn btn--outline"
                onClick={copyUrl}
                style={{ padding: '0.5rem 1rem' }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? ' Copied!' : ' Copy'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Open Dashboard
              </a>
              <button
                className="btn btn--outline"
                onClick={() => {
                  setStep('input');
                  setTopic('');
                  setContent('');
                  setGeneratedHtml('');
                  setPublishedUrl('');
                }}
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}