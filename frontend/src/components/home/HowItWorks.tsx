const steps = [
  {
    number: '01',
    title: 'Describe Your Topic',
    description: 'Type what you want to teach. Add bullet points, paste notes, or just write a sentence.',
    visual: 'Step 1 Visual'
  },
  {
    number: '02',
    title: 'AI Creates Your Dashboard',
    description: 'Our AI generates a complete interactive presentation with quizzes, flip cards, and more.',
    visual: 'Step 2 Visual'
  },
  {
    number: '03',
    title: 'Share & Present',
    description: 'Get an instant link. Share with students. Or use Live Mode to present in real-time.',
    visual: 'Step 3 Visual'
  }
];

export function HowItWorks() {
  return (
    <section className="how-it-works section">
      <div className="container">
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
              <div className="step__visual" style={{ background: '#f5f5f4', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
