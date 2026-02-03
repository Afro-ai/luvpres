import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowLeft, Globe, Loader } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { api } from '../lib/api';

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
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [content, setContent] = useState('');
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
      const response = await api.generate({ topic, content });
      setGeneratedHtml(response.html);
      setStep('preview');
    } catch (err) {
      setError('Generation failed. Please try again.');
      setStep('input');
    }
  };
  
  const handlePublish = async () => {
    try {
      await api.publish({ html: generatedHtml, title: topic });
      alert('Published! (Mock)');
    } catch (err) {
      alert('Failed to publish');
    }
  };
  
  return (
    <div className="create-page-wrapper">
      <Header />
      <div className="container section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {step === 'input' && (
          <div className="create-input" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>What do you want to teach?</h1>
            
            <div className="create-input__form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label htmlFor="topic" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Topic</label>
                <input
                  id="topic"
                  type="text"
                  placeholder="e.g., 'IELTS Writing Task 2 - Opinion Essays'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--stone-300)', fontSize: '1rem' }}
                />
              </div>
              
              <div>
                <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Key Points (optional)</label>
                <textarea
                  id="content"
                  placeholder="Add bullet points, paste existing notes, or describe what to cover..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--stone-300)', fontSize: '1rem', fontFamily: 'inherit' }}
                />
              </div>
              
              <div className="create-input__options">
                <select style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--stone-300)' }}>
                  <option value="intermediate">Intermediate Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              {error && <p className="error" style={{ color: 'var(--error)' }}>{error}</p>}
              
              <button 
                className="btn btn--primary btn--lg"
                onClick={handleGenerate}
                style={{ width: '100%' }}
              >
                Generate Dashboard <Sparkles className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
        
        {step === 'generating' && (
          <div className="create-generating" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div className="create-generating__animation" style={{ marginBottom: '2rem' }}>
              <Loader className="spin" style={{ width: '48px', height: '48px', color: 'var(--gold)' }} />
            </div>
            <h2>Creating your dashboard...</h2>
            <p style={{ color: 'var(--stone-500)', marginBottom: '2rem' }}>This usually takes 15-30 seconds</p>
            
            <div className="create-generating__steps" style={{ textAlign: 'left' }}>
              <Step done={progressStep > 0} active={progressStep === 0}>Analyzing your topic</Step>
              <Step done={progressStep > 1} active={progressStep === 1}>Generating interactive components</Step>
              <Step done={progressStep > 2} active={progressStep === 2}>Building quiz questions</Step>
              <Step done={progressStep > 3} active={progressStep === 3}>Applying premium styling</Step>
            </div>
          </div>
        )}
        
        {step === 'preview' && (
          <div className="create-preview" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="create-preview__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Your dashboard is ready!</h2>
              <div className="create-preview__actions" style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn--outline"
                  onClick={() => setStep('input')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Edit Topic
                </button>
                <button 
                  className="btn btn--primary"
                  onClick={handlePublish}
                >
                  <Globe className="w-4 h-4 mr-2" /> Publish & Share
                </button>
              </div>
            </div>
            
            <div className="create-preview__frame" style={{ flex: 1, border: '1px solid var(--stone-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <iframe
                srcDoc={generatedHtml}
                title="Dashboard Preview"
                sandbox="allow-scripts"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}