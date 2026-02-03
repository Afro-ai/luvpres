import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Link, MousePointer, Highlighter, Eraser, X } from 'lucide-react';
import { usePeerPointer } from '../hooks/usePeerPointer';

export function PresenterPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const containerRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'pointer' | 'highlight'>('pointer');
    const [copied, setCopied] = useState(false);

    // Get dashboard HTML from URL params (passed from Create page)
    const dashboardHtml = searchParams.get('html')
        ? decodeURIComponent(searchParams.get('html')!)
        : '<html><body><h1>No Dashboard Loaded</h1></body></html>';

    const { send, status, viewerCount } = usePeerPointer({
        sessionId: sessionId!,
        role: 'presenter',
        dashboardHtml
    });

    // Track cursor movement over container
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        send({
            type: 'cursor',
            data: { x, y }
        });
    }, [send]);

    // Handle clicks
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (mode === 'highlight') {
            send({
                type: 'highlight',
                data: { id: Date.now().toString(), x: x - 5, y: y - 2, width: 10, height: 4 }
            });
        } else {
            send({
                type: 'click',
                data: { x, y }
            });
        }
    }, [mode, send]);

    const copyViewerLink = () => {
        const url = `${window.location.origin}/view/${sessionId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a2e' }}>
            {/* Control Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#16162a',
                borderBottom: '1px solid #252542'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: '1rem',
                        color: 'white',
                        background: '#C5A059',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px'
                    }}>
                        Code: {sessionId?.toUpperCase()}
                    </span>
                    <span style={{
                        fontSize: '0.875rem',
                        color: status === 'connected' ? '#00ff88' : status === 'connecting' ? '#ffcc00' : '#ff4466'
                    }}>
                        {status === 'connected' ? '🟢 Live' : status === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'}
                    </span>
                    <span style={{ color: '#a0a0c0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setMode('pointer')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: mode === 'pointer' ? '#C5A059' : '#252542',
                            border: '1px solid #3a3a5a',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <MousePointer size={16} /> Pointer
                    </button>
                    <button
                        onClick={() => setMode('highlight')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: mode === 'highlight' ? '#C5A059' : '#252542',
                            border: '1px solid #3a3a5a',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Highlighter size={16} /> Highlight
                    </button>
                    <button
                        onClick={() => send({ type: 'clear_highlights', data: null })}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#252542',
                            border: '1px solid #3a3a5a',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Eraser size={16} /> Clear
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={copyViewerLink}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid #3a3a5a',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Link size={16} /> {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid #3a3a5a',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <X size={16} /> End
                    </button>
                </div>
            </div>

            {/* Dashboard Area */}
            <div
                ref={containerRef}
                style={{ flex: 1, position: 'relative', cursor: mode === 'highlight' ? 'crosshair' : 'default' }}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                <iframe
                    srcDoc={dashboardHtml}
                    title="Dashboard"
                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                />
            </div>
        </div>
    );
}
