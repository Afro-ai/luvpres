import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePeerPointer } from '../hooks/usePeerPointer';
import { Cursor } from '../components/pointer/Cursor';
import { Highlight } from '../components/pointer/Highlight';

interface HighlightData {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export function ViewerPage() {
    const { sessionId } = useParams<{ sessionId: string }>();

    const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
    const [highlights, setHighlights] = useState<HighlightData[]>([]);
    const [clickEffect, setClickEffect] = useState<{ x: number; y: number } | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [dashboardHtml, setDashboardHtml] = useState<string>('<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#1a1a2e;color:white;"><h2>Connecting to presenter...</h2></body></html>');

    const { status } = usePeerPointer({
        sessionId: sessionId!,
        role: 'viewer',
        onMessage: (msg) => {
            switch (msg.type) {
                case 'cursor':
                    setCursorPosition(msg.data);
                    break;

                case 'scroll':
                    // Scroll sync handled differently with srcDoc
                    break;

                case 'highlight':
                    setHighlights(prev => [...prev, msg.data]);
                    break;

                case 'clear_highlights':
                    setHighlights([]);
                    break;

                case 'click':
                    setClickEffect(msg.data);
                    setTimeout(() => setClickEffect(null), 500);
                    break;

                case 'init':
                    setCursorPosition(msg.data.cursorPosition);
                    setHighlights(msg.data.highlights || []);
                    if (msg.data.dashboardHtml) {
                        setDashboardHtml(msg.data.dashboardHtml);
                    }
                    break;

                case 'viewer_count':
                    setViewerCount(msg.data.count);
                    break;
            }
        }
    });

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a2e' }}>
            {/* Status Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                background: '#16162a',
                borderBottom: '1px solid #252542'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        color: '#a0a0c0'
                    }}>
                        Session: {sessionId?.toUpperCase()}
                    </span>
                    <span style={{
                        fontSize: '0.875rem',
                        color: status === 'connected' ? '#00ff88' : status === 'connecting' ? '#ffcc00' : '#ff4466'
                    }}>
                        {status === 'connected' ? '🟢 Connected' : status === 'connecting' ? '⏳ Connecting...' : '🔴 Presenter Offline'}
                    </span>
                </div>
                <span style={{ color: '#a0a0c0', fontSize: '0.75rem' }}>
                    {viewerCount} watching • Powered by LOVE
                </span>
            </div>

            {/* Dashboard with overlays */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe
                    srcDoc={dashboardHtml}
                    title="Dashboard"
                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                />

                {/* Remote Cursor */}
                {status === 'connected' && cursorPosition.x >= 0 && cursorPosition.y >= 0 && (
                    <Cursor
                        x={cursorPosition.x}
                        y={cursorPosition.y}
                        label="Presenter"
                    />
                )}

                {/* Highlights */}
                {highlights.map(h => (
                    <Highlight key={h.id} {...h} />
                ))}

                {/* Click Effect */}
                {clickEffect && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${clickEffect.x}%`,
                            top: `${clickEffect.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '3px solid #C5A059',
                            animation: 'click-ripple 0.5s ease-out forwards',
                            pointerEvents: 'none',
                            zIndex: 1001
                        }}
                    />
                )}
            </div>

            {/* CSS for animations */}
            <style>{`
        @keyframes click-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        @keyframes highlight-pulse {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
        </div>
    );
}
