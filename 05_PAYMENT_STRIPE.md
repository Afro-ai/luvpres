# 05 - Payment System (Stripe Integration)

## System Prompt for Coding Agent

You are building the **Stripe payment integration** for LOVE. This handles subscriptions, checkout, and billing management.

---

# OBJECTIVE

Build a complete payment system that:
1. Displays pricing tiers
2. Handles Stripe Checkout for subscriptions
3. Processes webhooks to update user plans
4. Manages billing portal access
5. Works entirely on Cloudflare (no server)

---

# STRIPE SETUP

```
Required Stripe Resources:
- 3 Products: Pro, Team, Enterprise
- 3 Prices: Monthly for each
- 3 Prices: Annual for each (20% discount)
- Customer Portal: Enabled
- Webhooks: checkout.session.completed, customer.subscription.updated/deleted
```

---

# FRONTEND FILES

```
src/
├── pages/
│   └── Pricing.tsx           # Pricing page with checkout
├── components/
│   └── pricing/
│       ├── PricingCard.tsx   # Individual plan card
│       ├── PricingToggle.tsx # Monthly/Annual toggle
│       └── CheckoutButton.tsx # Checkout trigger
└── lib/
    └── stripe.ts             # Stripe API helpers
```

---

# PRICING PAGE

```tsx
// pages/Pricing.tsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { createCheckoutSession } from '../lib/stripe';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying it out',
    price: { monthly: 0, annual: 0 },
    features: [
      '3 dashboards',
      'Basic analytics (views)',
      'LOVE branding on dashboards',
      '7-day link expiry',
      'Community support'
    ],
    cta: 'Get Started',
    priceId: null // No checkout needed
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators',
    price: { monthly: 9, annual: 7 }, // $7/mo = $84/yr (save $24)
    features: [
      'Unlimited dashboards',
      'Full analytics dashboard',
      'No LOVE branding',
      'Permanent links',
      'Custom domain support',
      'Priority email support',
      'Early access to features'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    badge: 'Most Popular',
    priceId: {
      monthly: 'price_xxxxxxxxxxxxx', // Replace with real Stripe price ID
      annual: 'price_xxxxxxxxxxxxx'
    }
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For organizations',
    price: { monthly: 29, annual: 23 },
    features: [
      'Everything in Pro',
      '5 team members',
      'Shared dashboard workspace',
      'Team analytics',
      'Admin controls',
      'Priority support',
      'Custom onboarding'
    ],
    cta: 'Start Team Trial',
    priceId: {
      monthly: 'price_xxxxxxxxxxxxx',
      annual: 'price_xxxxxxxxxxxxx'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 99, annual: 79 },
    features: [
      'Everything in Team',
      'Unlimited team members',
      'White-label branding',
      'API access',
      'SSO integration',
      'Dedicated support',
      'Custom SLA'
    ],
    cta: 'Contact Sales',
    priceId: {
      monthly: 'price_xxxxxxxxxxxxx',
      annual: 'price_xxxxxxxxxxxxx'
    }
  }
];

export function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const handleCheckout = async (plan: typeof PLANS[0]) => {
    if (!plan.priceId) {
      // Free plan - just sign up
      window.location.href = '/signup';
      return;
    }
    
    if (!isAuthenticated) {
      // Redirect to signup with plan in state
      window.location.href = `/signup?plan=${plan.id}`;
      return;
    }
    
    if (plan.id === 'enterprise') {
      // Contact sales
      window.location.href = 'mailto:sales@bankruptthebc.online?subject=Enterprise Plan Inquiry';
      return;
    }
    
    setIsLoading(plan.id);
    
    try {
      const priceId = plan.priceId[billingPeriod];
      const checkoutUrl = await createCheckoutSession(priceId, user!.id);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };
  
  return (
    <Layout>
      <div className="pricing-page">
        <div className="pricing-header">
          <span className="meta-label">Pricing</span>
          <h1>Simple, transparent pricing</h1>
          <p>Start free, upgrade when you're ready</p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle">
            <button 
              className={billingPeriod === 'monthly' ? 'active' : ''}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button 
              className={billingPeriod === 'annual' ? 'active' : ''}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual
              <span className="save-badge">Save 20%</span>
            </button>
          </div>
        </div>
        
        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`pricing-card ${plan.highlighted ? 'pricing-card--highlighted' : ''}`}
            >
              {plan.badge && (
                <span className="pricing-badge">{plan.badge}</span>
              )}
              
              <h2 className="pricing-name">{plan.name}</h2>
              <p className="pricing-description">{plan.description}</p>
              
              <div className="pricing-price">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">
                  {billingPeriod === 'annual' ? plan.price.annual : plan.price.monthly}
                </span>
                <span className="pricing-period">/month</span>
              </div>
              
              {billingPeriod === 'annual' && plan.price.monthly > 0 && (
                <p className="pricing-billed">
                  Billed ${plan.price.annual * 12}/year
                </p>
              )}
              
              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <i className="fa-solid fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className={`btn ${plan.highlighted ? 'btn--primary' : 'btn--outline'} btn--full`}
                onClick={() => handleCheckout(plan)}
                disabled={isLoading === plan.id || user?.plan === plan.id}
              >
                {isLoading === plan.id ? (
                  <span className="spinner"></span>
                ) : user?.plan === plan.id ? (
                  'Current Plan'
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>
        
        {/* FAQ */}
        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period.</p>
            </div>
            <div className="faq-item">
              <h3>What happens to my dashboards if I downgrade?</h3>
              <p>Your dashboards remain accessible. On the free plan, LOVE branding will be added and you'll be limited to viewing only.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a free trial for Pro?</h3>
              <p>The free plan is effectively a trial. You can upgrade when you need more dashboards or want to remove branding.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer refunds?</h3>
              <p>Yes, we offer a 14-day money-back guarantee. Contact support if you're not satisfied.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

# STRIPE API CLIENT

```typescript
// lib/stripe.ts

const API_BASE = '/api';

export async function createCheckoutSession(
  priceId: string, 
  userId: string
): Promise<string> {
  const token = localStorage.getItem('love_auth_token');
  
  const res = await fetch(`${API_BASE}/stripe/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ priceId })
  });
  
  if (!res.ok) {
    throw new Error('Failed to create checkout session');
  }
  
  const data = await res.json();
  return data.url;
}

export async function createPortalSession(): Promise<string> {
  const token = localStorage.getItem('love_auth_token');
  
  const res = await fetch(`${API_BASE}/stripe/create-portal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to create portal session');
  }
  
  const data = await res.json();
  return data.url;
}
```

---

# WORKER STRIPE HANDLERS

```typescript
// worker/src/handlers/stripe.ts

import Stripe from 'stripe';

export async function handleCreateCheckout(
  request: Request,
  env: Env,
  user: User
): Promise<Response> {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const { priceId } = await request.json() as { priceId: string };
  
  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id }
    });
    customerId = customer.id;
    
    // Save customer ID to user
    await updateUserStripeCustomer(user.id, customerId, env);
  }
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `https://bankruptthebc.online/account?checkout=success`,
    cancel_url: `https://bankruptthebc.online/pricing?checkout=cancelled`,
    metadata: {
      userId: user.id
    },
    subscription_data: {
      metadata: {
        userId: user.id
      }
    },
    allow_promotion_codes: true
  });
  
  return Response.json({ url: session.url });
}

export async function handleCreatePortal(
  request: Request,
  env: Env,
  user: User
): Promise<Response> {
  if (!user.stripeCustomerId) {
    return Response.json(
      { error: 'no_subscription', message: 'No active subscription' },
      { status: 400 }
    );
  }
  
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: 'https://bankruptthebc.online/account'
  });
  
  return Response.json({ url: session.url });
}

export async function handleStripeWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return Response.json({ error: 'missing_signature' }, { status: 400 });
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return Response.json({ error: 'invalid_signature' }, { status: 400 });
  }
  
  console.log(`Processing webhook: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session, env);
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription, env);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancel(subscription, env);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice, env);
      break;
    }
  }
  
  return Response.json({ received: true });
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  env: Env
) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }
  
  // Determine plan from price
  const plan = getPlanFromPriceId(session.line_items?.data[0]?.price?.id || '');
  
  // Update user plan
  await updateUserPlan(userId, plan, env);
  
  console.log(`User ${userId} upgraded to ${plan}`);
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  env: Env
) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  
  const status = subscription.status;
  
  if (status === 'active' || status === 'trialing') {
    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
    await updateUserPlan(userId, plan, env);
  } else if (status === 'past_due' || status === 'unpaid') {
    // Keep current plan but flag for follow-up
    console.log(`Subscription ${subscription.id} is ${status}`);
  }
}

async function handleSubscriptionCancel(
  subscription: Stripe.Subscription,
  env: Env
) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  
  // Downgrade to free
  await updateUserPlan(userId, 'free', env);
  
  console.log(`User ${userId} downgraded to free`);
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  env: Env
) {
  // Send notification or flag account
  console.log(`Payment failed for invoice ${invoice.id}`);
}

// Helper to map price IDs to plan names
function getPlanFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    'price_pro_monthly': 'pro',
    'price_pro_annual': 'pro',
    'price_team_monthly': 'team',
    'price_team_annual': 'team',
    'price_enterprise_monthly': 'enterprise',
    'price_enterprise_annual': 'enterprise'
  };
  
  return priceMap[priceId] || 'pro';
}

async function updateUserPlan(userId: string, plan: string, env: Env) {
  const email = await env.KV.get(`user_id:${userId}`);
  if (!email) return;
  
  const userData = await env.KV.get(`user:${email}`);
  if (!userData) return;
  
  const user = JSON.parse(userData);
  user.plan = plan;
  user.updatedAt = Date.now();
  
  await env.KV.put(`user:${email}`, JSON.stringify(user));
}

async function updateUserStripeCustomer(
  userId: string, 
  customerId: string, 
  env: Env
) {
  const email = await env.KV.get(`user_id:${userId}`);
  if (!email) return;
  
  const userData = await env.KV.get(`user:${email}`);
  if (!userData) return;
  
  const user = JSON.parse(userData);
  user.stripeCustomerId = customerId;
  
  await env.KV.put(`user:${email}`, JSON.stringify(user));
}
```

---

# PRICING STYLES

```css
/* styles/pricing.css */

.pricing-page {
  padding: var(--space-3xl) var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-header {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.pricing-header h1 {
  font-family: var(--font-heading);
  margin: var(--space-sm) 0;
}

.pricing-header p {
  color: var(--stone-500);
  font-size: 1.125rem;
}

.billing-toggle {
  display: inline-flex;
  background: var(--stone-100);
  border-radius: var(--radius-full);
  padding: 4px;
  margin-top: var(--space-lg);
}

.billing-toggle button {
  padding: 0.5rem 1.5rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.billing-toggle button.active {
  background: white;
  box-shadow: var(--shadow-sm);
}

.save-badge {
  background: var(--gold);
  color: white;
  font-size: 0.65rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.pricing-card {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  position: relative;
  transition: all 0.3s;
}

.pricing-card:hover {
  box-shadow: var(--shadow-lg);
}

.pricing-card--highlighted {
  border-color: var(--gold);
  box-shadow: 0 0 0 1px var(--gold), var(--shadow-lg);
  transform: scale(1.02);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gold);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 1rem;
  border-radius: var(--radius-full);
}

.pricing-name {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.pricing-description {
  color: var(--stone-500);
  font-size: 0.875rem;
  margin-bottom: var(--space-lg);
}

.pricing-price {
  display: flex;
  align-items: baseline;
  margin-bottom: var(--space-xs);
}

.pricing-currency {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--stone-600);
}

.pricing-amount {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.pricing-period {
  color: var(--stone-500);
  margin-left: 0.25rem;
}

.pricing-billed {
  font-size: 0.75rem;
  color: var(--stone-400);
  margin-bottom: var(--space-lg);
}

.pricing-features {
  list-style: none;
  margin: var(--space-lg) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pricing-features li {
  display: flex;
  align-items: start;
  gap: var(--space-sm);
  font-size: 0.875rem;
}

.pricing-features i {
  color: var(--success);
  margin-top: 0.2rem;
}

.pricing-faq {
  margin-top: var(--space-3xl);
  text-align: center;
}

.pricing-faq h2 {
  font-family: var(--font-heading);
  margin-bottom: var(--space-xl);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
  text-align: left;
}

.faq-item {
  background: var(--stone-100);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
}

.faq-item h3 {
  font-size: 1rem;
  margin-bottom: var(--space-sm);
}

.faq-item p {
  color: var(--stone-600);
  font-size: 0.875rem;
}
```

---

# STRIPE SETUP CHECKLIST

1. Create Stripe account
2. Create Products (Pro, Team, Enterprise)
3. Create Prices (monthly + annual for each)
4. Enable Customer Portal
5. Set up Webhook endpoint: `https://api.bankruptthebc.online/api/stripe/webhook`
6. Add webhook secret to Worker secrets
7. Test with Stripe CLI: `stripe trigger checkout.session.completed`

---

# OUTPUT

Generate the complete payment system with:
1. Pricing page component
2. Stripe API client
3. Worker handlers for checkout/webhook
4. CSS styles
5. Integration with auth system

Ensure proper error handling and security for payment flows.
