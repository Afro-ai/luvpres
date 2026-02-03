import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePointerOptions {
    sessionId: string;
    role: 'presenter' | 'viewer';
    onMessage?: (msg: any) => void;
}

export function usePointer({ sessionId, role, onMessage }: UsePointerOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [lastMessage, setLastMessage] = useState<any>(null);
    const reconnectTimeoutRef = useRef<number>();
    const throttleRef = useRef<number>(0);

    const connect = useCallback(() => {
        // Determine WebSocket URL based on environment
        const isLocal = window.location.hostname === 'localhost';

        let wsUrl: string;
        if (isLocal) {
            // Local development - connect to worker dev server
            wsUrl = `ws://localhost:8787/api/pointer/${sessionId}/ws?role=${role}`;
        } else {
            // Production - connect to deployed worker
            wsUrl = `wss://love-api.tedguy280.workers.dev/api/pointer/${sessionId}/ws?role=${role}`;
        }

        console.log('Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setStatus('connected');
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setLastMessage(msg);
            onMessage?.(msg);
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setStatus('disconnected');
            // Reconnect after 2 seconds
            reconnectTimeoutRef.current = window.setTimeout(() => {
                if (wsRef.current?.readyState === WebSocket.CLOSED) {
                    setStatus('connecting');
                    connect();
                }
            }, 2000);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            ws.close();
        };
    }, [sessionId, role, onMessage]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, [connect]);

    // Throttled send for cursor updates (60fps max)
    const send = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const now = Date.now();
            // Throttle cursor messages to ~60fps (16ms)
            if (message.type === 'cursor' && now - throttleRef.current < 16) {
                return;
            }
            throttleRef.current = now;
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    return { send, status, lastMessage };
}
