# 04 - Authentication System

## System Prompt for Coding Agent

You are building the **authentication system** for LOVE. This covers user signup, login, session management, and account settings - all integrated with the Cloudflare Worker API.

---

# OBJECTIVE

Build a complete auth system that:
1. Allows email/password signup and login
2. Issues JWT tokens for session management
3. Integrates with the React frontend
4. Supports OAuth (Google) as a future enhancement
5. Is secure, fast, and serverless

---

# ARCHITECTURE

```
Frontend (React)              Backend (Worker)
┌──────────────────┐         ┌──────────────────┐
│  AuthProvider    │────────▶│  /api/auth/*     │
│  - useAuth hook  │         │  - signup        │
│  - Login page    │         │  - login         │
│  - Signup page   │         │  - me            │
│  - Token storage │         │  - logout        │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Cloudflare KV   │
                             │  - User data     │
                             │  - Sessions      │
                             └──────────────────┘
```

---

# FRONTEND FILES

```
src/
├── contexts/
│   └── AuthContext.tsx      # Auth provider and context
├── hooks/
│   └── useAuth.ts           # Auth hook (login, signup, logout)
├── pages/
│   ├── Login.tsx            # Login page
│   ├── Signup.tsx           # Signup page
│   └── Account.tsx          # Account settings
├── components/
│   └── auth/
│       ├── LoginForm.tsx    # Login form component
│       ├── SignupForm.tsx   # Signup form component
│       ├── ProtectedRoute.tsx # Route guard
│       └── AuthModal.tsx    # Modal for login/signup
└── lib/
    └── auth.ts              # Auth API client
```

---

# AUTH CONTEXT

```tsx
// contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'love_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const { user } = await authApi.me(token);
      setUser(user);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };
  
  const signup = async (email: string, password: string, name: string) => {
    const { user, token } = await authApi.signup(email, password, name);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };
  
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Get token for API calls
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
```

---

# AUTH API CLIENT

```typescript
// lib/auth.ts

const API_BASE = '/api';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
  token: string;
}

interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
}

class AuthApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new AuthApiError(
        data.message || 'Login failed',
        data.error || 'unknown',
        res.status
      );
    }
    
    return data;
  },
  
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new AuthApiError(
        data.message || 'Signup failed',
        data.error || 'unknown',
        res.status
      );
    }
    
    return data;
  },
  
  async me(token: string): Promise<MeResponse> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new AuthApiError('Session expired', 'session_expired', res.status);
    }
    
    return res.json();
  },
  
  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};
```

---

# LOGIN PAGE

```tsx
// pages/Login.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/account');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Log in to your LOVE account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                Password
                <Link to="/forgot-password" className="form-link">
                  Forgot password?
                </Link>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn--primary btn--full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup">Sign up free</Link>
            </p>
          </div>
          
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          
          <button className="btn btn--outline btn--full btn--google" disabled>
            <svg viewBox="0 0 24 24" width="20" height="20">
              {/* Google icon SVG */}
            </svg>
            Google (coming soon)
          </button>
        </div>
      </div>
    </Layout>
  );
}
```

---

# SIGNUP PAGE

```tsx
// pages/Signup.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/account');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(email, password, name);
      navigate('/create'); // Take them straight to creation
    } catch (err: any) {
      if (err.code === 'user_exists') {
        setError('An account with this email already exists. Try logging in.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create your account</h1>
            <p>Start creating stunning presentations for free</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <span className="form-hint">
                Use 8+ characters with a mix of letters and numbers
              </span>
            </div>
            
            <button 
              type="submit" 
              className="btn btn--primary btn--full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create free account'
              )}
            </button>
            
            <p className="auth-terms">
              By signing up, you agree to our{' '}
              <Link to="/terms">Terms</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </p>
          </form>
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

# PROTECTED ROUTE COMPONENT

```tsx
// components/auth/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePlan?: 'pro' | 'team' | 'enterprise';
}

export function ProtectedRoute({ children, requirePlan }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner--lg"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check plan requirement
  if (requirePlan && user) {
    const planHierarchy = ['free', 'pro', 'team', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(user.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requirePlan);
    
    if (userPlanIndex < requiredPlanIndex) {
      return <Navigate to="/pricing" state={{ required: requirePlan }} replace />;
    }
  }
  
  return <>{children}</>;
}
```

---

# AUTH PAGE STYLES

```css
/* styles/auth.css */

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-dark) 100%);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-header h1 {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  margin-bottom: var(--space-sm);
}

.auth-header p {
  color: var(--stone-500);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-link {
  color: var(--gold);
  text-decoration: none;
  font-weight: 400;
}

.form-link:hover {
  text-decoration: underline;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--stone-400);
}

.auth-error {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: var(--radius-md);
  color: var(--error);
  font-size: 0.875rem;
}

.auth-footer {
  text-align: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--stone-100);
}

.auth-footer a {
  color: var(--gold);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-lg) 0;
  color: var(--stone-400);
  font-size: 0.75rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--stone-200);
}

.auth-terms {
  font-size: 0.75rem;
  color: var(--stone-400);
  text-align: center;
}

.auth-terms a {
  color: var(--stone-500);
  text-decoration: underline;
}

.btn--google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner--lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
}
```

---

# ACCOUNT PAGE

```tsx
// pages/Account.tsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function AccountContent() {
  const { user, logout } = useAuth();
  
  return (
    <Layout>
      <div className="account-page">
        <div className="account-header">
          <h1>Account Settings</h1>
        </div>
        
        <div className="account-grid">
          {/* Profile Section */}
          <section className="account-section">
            <h2>Profile</h2>
            <div className="account-card">
              <div className="account-field">
                <label>Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="account-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
            </div>
          </section>
          
          {/* Plan Section */}
          <section className="account-section">
            <h2>Your Plan</h2>
            <div className="account-card plan-card">
              <div className="plan-info">
                <span className="plan-badge">{user?.plan}</span>
                <p className="plan-description">
                  {user?.plan === 'free' 
                    ? 'Limited to 3 dashboards'
                    : 'Unlimited dashboards, no branding'
                  }
                </p>
              </div>
              {user?.plan === 'free' && (
                <a href="/pricing" className="btn btn--primary">
                  Upgrade to Pro
                </a>
              )}
            </div>
          </section>
          
          {/* Danger Zone */}
          <section className="account-section account-section--danger">
            <h2>Session</h2>
            <div className="account-card">
              <button 
                className="btn btn--outline btn--danger"
                onClick={logout}
              >
                Log out
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
```

---

# ROUTER INTEGRATION

```tsx
// main.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { AccountPage } from './pages/Account';
import { CreatePage } from './pages/Create';
import { PricingPage } from './pages/Pricing';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/p/:id" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

# SECURITY CONSIDERATIONS

1. **Password Requirements**: Minimum 8 characters
2. **Token Storage**: localStorage (consider httpOnly cookies for higher security)
3. **Token Expiry**: 7 days, with refresh on activity
4. **Rate Limiting**: Handled by Cloudflare + Worker
5. **CORS**: Strict origin checking in production

---

# OUTPUT

Generate the complete auth system with:
1. AuthContext and useAuth hook
2. Login and Signup pages
3. ProtectedRoute component
4. Auth API client
5. CSS styles
6. Router integration

Ensure proper error handling, loading states, and a smooth UX.
