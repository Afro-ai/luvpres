import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

interface Message {
    type: 'cursor' | 'scroll' | 'highlight' | 'clear_highlights' | 'click' | 'viewer_count' | 'init';
    data: any;
}

interface UsePeerPointerOptions {
    sessionId: string;
    role: 'presenter' | 'viewer';
    onMessage?: (msg: Message) => void;
    dashboardHtml?: string;
}

// Generate a short random session ID
export function generateSessionId(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

export function usePeerPointer({ sessionId, role, onMessage, dashboardHtml }: UsePeerPointerOptions) {
    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [viewerCount, setViewerCount] = useState(0);
    const throttleRef = useRef<number>(0);

    // Initialize peer connection
    useEffect(() => {
        let peer: Peer;

        if (role === 'presenter') {
            // Presenter creates a peer with the session ID as their peer ID
            peer = new Peer(sessionId, {
                debug: 1,
            });

            peer.on('open', (id) => {
                console.log('Presenter peer opened:', id);
                setStatus('connected');
            });

            peer.on('connection', (conn) => {
                console.log('Viewer connected:', conn.peer);

                conn.on('open', () => {
                    connectionsRef.current.set(conn.peer, conn);
                    const count = connectionsRef.current.size;
                    setViewerCount(count);

                    // Send init data to new viewer
                    conn.send({
                        type: 'init',
                        data: {
                            cursorPosition: { x: 50, y: 50 },
                            highlights: [],
                            viewerCount: count,
                            dashboardHtml: dashboardHtml
                        }
                    });

                    // Broadcast updated viewer count to all
                    broadcastToAll({ type: 'viewer_count', data: { count } });
                });

                conn.on('close', () => {
                    connectionsRef.current.delete(conn.peer);
                    const count = connectionsRef.current.size;
                    setViewerCount(count);
                    broadcastToAll({ type: 'viewer_count', data: { count } });
                });

                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    connectionsRef.current.delete(conn.peer);
                });
            });

        } else {
            // Viewer connects to presenter's peer ID
            peer = new Peer();

            peer.on('open', () => {
                console.log('Viewer peer opened, connecting to:', sessionId);

                const conn = peer.connect(sessionId, { reliable: true });

                conn.on('open', () => {
                    console.log('Connected to presenter');
                    connectionsRef.current.set(sessionId, conn);
                    setStatus('connected');
                });

                conn.on('data', (data) => {
                    const msg = data as Message;
                    onMessage?.(msg);
                });

                conn.on('close', () => {
                    console.log('Connection to presenter closed');
                    setStatus('disconnected');
                    connectionsRef.current.delete(sessionId);
                });

                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    setStatus('disconnected');
                });
            });
        }

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            if (err.type === 'unavailable-id') {
                // Session ID already taken
                setStatus('disconnected');
            } else if (err.type === 'peer-unavailable') {
                // Presenter not found
                setStatus('disconnected');
            }
        });

        peer.on('disconnected', () => {
            console.log('Peer disconnected');
            setStatus('disconnected');
            // Try to reconnect
            setTimeout(() => {
                if (peer && !peer.destroyed) {
                    peer.reconnect();
                }
            }, 2000);
        });

        peerRef.current = peer;

        return () => {
            connectionsRef.current.forEach(conn => conn.close());
            connectionsRef.current.clear();
            peer.destroy();
        };
    }, [sessionId, role, onMessage, dashboardHtml]);

    // Broadcast to all connected viewers (presenter only)
    const broadcastToAll = useCallback((message: Message) => {
        connectionsRef.current.forEach(conn => {
            if (conn.open) {
                conn.send(message);
            }
        });
    }, []);

    // Send message (throttled for cursor)
    const send = useCallback((message: Message) => {
        if (role === 'presenter') {
            const now = Date.now();
            // Throttle cursor messages to ~60fps (16ms)
            if (message.type === 'cursor' && now - throttleRef.current < 16) {
                return;
            }
            throttleRef.current = now;
            broadcastToAll(message);
        }
    }, [role, broadcastToAll]);

    return { send, status, viewerCount };
}
