import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield } from 'lucide-react';

export function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE = import.meta.env.DEV
        ? 'http://localhost:8787/api'
        : 'https://love-api.tedguy280.workers.dev/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token
            localStorage.setItem('admin_token', data.token);
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)'
        }}>
            <div style={{
                background: '#1e1e38',
                borderRadius: '16px',
                padding: '3rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} color="#C5A059" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Admin Access</h1>
                    <p style={{ color: '#a0a0c0', marginTop: '0.5rem' }}>Enter your admin password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#252542',
                            borderRadius: '8px',
                            padding: '0 1rem',
                            border: error ? '1px solid #ff4466' : '1px solid #3a3a5a'
                        }}>
                            <Lock size={20} color="#666" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p style={{ color: '#ff4466', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#666' : 'linear-gradient(135deg, #C5A059 0%, #D4AF61 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#1a1a2e',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
