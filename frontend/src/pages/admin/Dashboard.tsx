import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Trash2, LogOut, RefreshCw, Users } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardData {
    id: string;
    title?: string;
    theme?: string;
    createdAt?: string;
}

interface Stats {
    totalDashboards: number;
    activeSessions: number;
    storageKeys: number;
}

interface AnalyticsData {
    period: string;
    totalGenerates: number;
    totalPublishes: number;
    conversionRate: number;
    successRate: number;
    themeBreakdown: Record<string, number>;
    hourlyActivity: number[];
    dailyStats: Array<{ date: string; generates: number; publishes: number }>;
}

export function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [dashboards, setDashboards] = useState<DashboardData[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'dashboards' | 'settings'>('overview');

    const API_BASE = import.meta.env.DEV
        ? 'http://localhost:8787/api'
        : 'https://love-api.tedguy280.workers.dev/api';

    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchData();
    }, [token, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, dashboardsRes, analyticsRes] = await Promise.all([
                fetch(`${API_BASE}/admin/stats`, { headers }),
                fetch(`${API_BASE}/admin/dashboards`, { headers }),
                fetch(`${API_BASE}/admin/analytics`, { headers })
            ]);

            if (!statsRes.ok || !dashboardsRes.ok) {
                if (statsRes.status === 401 || dashboardsRes.status === 401) {
                    localStorage.removeItem('admin_token');
                    navigate('/admin');
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const statsData = await statsRes.json();
            const dashboardsData = await dashboardsRes.json();
            const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

            setStats(statsData);
            setDashboards(dashboardsData.dashboards || []);
            setAnalytics(analyticsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteDashboard = async (id: string) => {
        if (!confirm('Delete this dashboard?')) return;

        try {
            const res = await fetch(`${API_BASE}/admin/dashboards/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setDashboards(prev => prev.filter(d => d.id !== id));
                setStats(prev => prev ? { ...prev, totalDashboards: prev.totalDashboards - 1 } : null);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin');
    };

    const StatCard = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) => (
        <div style={{
            background: '#252542',
            borderRadius: '12px',
            padding: '1.5rem',
            flex: 1,
            minWidth: '200px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Icon size={24} color="#C5A059" />
                <span style={{ color: '#a0a0c0', fontSize: '0.875rem' }}>{label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: 'white' }}>{value}</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a2e' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                background: '#16162a',
                borderBottom: '1px solid #252542'
            }}>
                <h1 style={{ color: 'white', fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LayoutDashboard size={24} color="#C5A059" />
                    Admin Dashboard
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={fetchData} style={{ background: 'transparent', border: 'none', color: '#a0a0c0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button onClick={logout} style={{ background: 'transparent', border: '1px solid #3a3a5a', borderRadius: '6px', padding: '0.5rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <nav style={{ display: 'flex', gap: '0.5rem', padding: '1rem 2rem', borderBottom: '1px solid #252542' }}>
                {(['overview', 'analytics', 'dashboards', 'settings'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: activeTab === tab ? '#C5A059' : 'transparent',
                            border: '1px solid #3a3a5a',
                            borderRadius: '6px',
                            color: activeTab === tab ? '#1a1a2e' : 'white',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: activeTab === tab ? '600' : '400'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Content */}
            <main style={{ padding: '2rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#a0a0c0', padding: '4rem' }}>Loading...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', color: '#ff4466', padding: '4rem' }}>{error}</div>
                ) : (
                    <>
                        {activeTab === 'overview' && stats && (
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <StatCard label="Total Dashboards" value={stats.totalDashboards} icon={FileText} />
                                <StatCard label="Active Sessions" value={stats.activeSessions} icon={Users} />
                                <StatCard label="Storage Keys" value={stats.storageKeys} icon={LayoutDashboard} />
                            </div>
                        )}

                        {activeTab === 'analytics' && analytics && (
                            <AnalyticsPanel analytics={analytics} />
                        )}

                        {activeTab === 'dashboards' && (
                            <div>
                                <h2 style={{ color: 'white', marginBottom: '1rem' }}>Dashboards ({dashboards.length})</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {dashboards.length === 0 ? (
                                        <p style={{ color: '#a0a0c0' }}>No dashboards found</p>
                                    ) : dashboards.map(d => (
                                        <div key={d.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            background: '#252542',
                                            borderRadius: '8px'
                                        }}>
                                            <div>
                                                <div style={{ color: 'white', fontWeight: '500' }}>{d.title || 'Untitled'}</div>
                                                <div style={{ color: '#a0a0c0', fontSize: '0.875rem' }}>
                                                    ID: {d.id} • Theme: {d.theme || 'nobel'}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a
                                                    href={`https://luvpres.pages.dev/view/${d.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: 'transparent',
                                                        border: '1px solid #3a3a5a',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        textDecoration: 'none',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    View
                                                </a>
                                                <button
                                                    onClick={() => deleteDashboard(d.id)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: '#ff446622',
                                                        border: '1px solid #ff4466',
                                                        borderRadius: '6px',
                                                        color: '#ff4466',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <SettingsPanel token={token!} apiBase={API_BASE} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// Settings sub-component
function SettingsPanel({ token, apiBase }: { token: string; apiBase: string }) {
    const [settings, setSettings] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch(`${apiBase}/admin/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(console.error);
    }, [token, apiBase]);

    const saveSettings = async () => {
        setSaving(true);
        try {
            await fetch(`${apiBase}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const SettingRow = ({ label, keyName, type = 'text' }: { label: string; keyName: string; type?: string }) => (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#a0a0c0', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                {label}
            </label>
            <input
                type={type}
                value={settings[keyName] || ''}
                onChange={(e) => setSettings({ ...settings, [keyName]: e.target.value })}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#252542',
                    border: '1px solid #3a3a5a',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                }}
            />
        </div>
    );

    return (
        <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>System Settings</h2>

            <SettingRow label="Dashboard Expiry (days)" keyName="dashboardExpiryDays" type="number" />
            <SettingRow label="Max Dashboards per User" keyName="maxDashboardsPerUser" type="number" />
            <SettingRow label="CORS Origin" keyName="corsOrigin" />

            <button
                onClick={saveSettings}
                disabled={saving}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: saved ? '#00ff88' : 'linear-gradient(135deg, #C5A059 0%, #D4AF61 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: saved ? '#1a1a2e' : '#1a1a2e',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    marginTop: '1rem'
                }}
            >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
            </button>
        </div>
    );
}

// Analytics Panel component
function AnalyticsPanel({ analytics }: { analytics: AnalyticsData }) {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#a0a0c0' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#a0a0c0' },
                grid: { color: '#252542' }
            },
            y: {
                ticks: { color: '#a0a0c0' },
                grid: { color: '#252542' }
            }
        }
    };

    // Daily usage line chart data
    const dailyData = {
        labels: analytics.dailyStats.map(d => d.date.slice(5)), // MM-DD format
        datasets: [
            {
                label: 'Generates',
                data: analytics.dailyStats.map(d => d.generates),
                borderColor: '#C5A059',
                backgroundColor: 'rgba(197, 160, 89, 0.2)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Publishes',
                data: analytics.dailyStats.map(d => d.publishes),
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    // Theme breakdown doughnut
    const themeColors: Record<string, string> = {
        nobel: '#C5A059',
        midnight: '#3b82f6',
        ocean: '#06b6d4',
        forest: '#22c55e',
        sunset: '#f97316',
        aurora: '#a855f7'
    };

    const themeData = {
        labels: Object.keys(analytics.themeBreakdown),
        datasets: [{
            data: Object.values(analytics.themeBreakdown),
            backgroundColor: Object.keys(analytics.themeBreakdown).map(t => themeColors[t] || '#666'),
            borderWidth: 0
        }]
    };

    // Hourly activity bar chart
    const hourlyData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        datasets: [{
            label: 'Activity',
            data: analytics.hourlyActivity,
            backgroundColor: '#C5A059',
            borderRadius: 4
        }]
    };

    return (
        <div>
            {/* Key Metrics */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div style={{ background: '#252542', borderRadius: '12px', padding: '1.5rem', flex: 1, minWidth: '150px' }}>
                    <div style={{ color: '#a0a0c0', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Generates</div>
                    <div style={{ fontSize: '2rem', fontWeight: '600', color: 'white' }}>{analytics.totalGenerates}</div>
                </div>
                <div style={{ background: '#252542', borderRadius: '12px', padding: '1.5rem', flex: 1, minWidth: '150px' }}>
                    <div style={{ color: '#a0a0c0', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Publishes</div>
                    <div style={{ fontSize: '2rem', fontWeight: '600', color: '#00ff88' }}>{analytics.totalPublishes}</div>
                </div>
                <div style={{ background: '#252542', borderRadius: '12px', padding: '1.5rem', flex: 1, minWidth: '150px' }}>
                    <div style={{ color: '#a0a0c0', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Conversion Rate</div>
                    <div style={{ fontSize: '2rem', fontWeight: '600', color: '#C5A059' }}>{analytics.conversionRate}%</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Daily Usage Chart */}
                <div style={{ background: '#252542', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Daily Usage (7 Days)</h3>
                    <div style={{ height: '250px' }}>
                        <Line data={dailyData} options={chartOptions} />
                    </div>
                </div>

                {/* Theme Breakdown */}
                <div style={{ background: '#252542', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Theme Popularity</h3>
                    <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={themeData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'right', labels: { color: '#a0a0c0' } } }
                            }}
                        />
                    </div>
                </div>

                {/* Hourly Activity */}
                <div style={{ background: '#252542', borderRadius: '12px', padding: '1.5rem', gridColumn: 'span 2' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Hourly Activity (UTC)</h3>
                    <div style={{ height: '200px' }}>
                        <Bar data={hourlyData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
