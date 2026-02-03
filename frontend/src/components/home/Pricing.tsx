import { useState } from 'react';
import { Check } from 'lucide-react';

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
    <section className="pricing section" id="pricing">
      <div className="container">
        <div className="pricing__header">
          <span className="meta-label">Pricing</span>
          <h2>Simple, transparent pricing</h2>
          
          <div className="pricing__toggle">
            <span className={!annual ? 'active' : ''}>Monthly</span>
            <button 
              className="toggle" 
              onClick={() => setAnnual(!annual)}
              aria-pressed={annual}
              aria-label="Toggle annual pricing"
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
                  {annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price}
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
      </div>
    </section>
  );
}
