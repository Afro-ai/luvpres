# 06 - Live Presenter Mode (Pointer System)

## System Prompt for Coding Agent

You are building the **Live Presenter Mode** for LOVE - a real-time cursor/pointer synchronization system that lets presenters share their screen movements with an audience via WebSockets.

---

# OBJECTIVE

Build a real-time presenting system that:
1. Lets presenters share their dashboard with an audience
2. Syncs cursor movements in real-time (<100ms latency)
3. Supports highlights and annotations
4. Uses Cloudflare Durable Objects for WebSocket management
5. Works seamlessly with existing dashboards

---

# ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pointer System Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Presenter                              Viewers                   │
│  ┌──────────────┐                      ┌──────────────┐          │
│  │  Dashboard   │                      │  Dashboard   │          │
│  │  + Controls  │                      │  + Cursor    │          │
│  └──────────────┘                      └──────────────┘          │
│         │                                     ▲                   │
│         │ WebSocket                           │ WebSocket         │
│         ▼                                     │                   │
│  ┌───────────────────────────────────────────────────┐           │
│  │           Cloudflare Durable Object                │           │
│  │                                                     │           │
│  │  - Session state                                   │           │
│  │  - Presenter connection                            │           │
│  │  - Viewer connections (broadcast)                  │           │
│  │  - Cursor position (x%, y%)                        │           │
│  │  - Highlights/annotations                          │           │
│  │  - Scroll position                                 │           │
│  └───────────────────────────────────────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

# FILE STRUCTURE

```
Frontend:
src/
├── pages/
│   ├── Presenter.tsx        # Presenter view
│   └── Viewer.tsx           # Viewer (audience) view
├── components/
│   └── pointer/
│       ├── Cursor.tsx       # Remote cursor component
│       ├── Highlight.tsx    # Highlight overlay
│       ├── Controls.tsx     # Presenter controls
│       └── StatusBar.tsx    # Connection status
├── hooks/
│   └── usePointer.ts        # WebSocket management hook
└── lib/
    └── pointer.ts           # Pointer API client

Worker:
worker/src/
├── handlers/
│   └── pointer.ts           # HTTP handlers
└── durable-objects/
    └── PointerSession.ts    # Durable Object class
```

---

# DURABLE OBJECT: POINTER SESSION

```typescript
// worker/src/durable-objects/PointerSession.ts

interface SessionState {
  dashboardId: string;
  dashboardHtml?: string;
  presenterId?: string;
  cursorPosition: { x: number; y: number };
  scrollPosition: { x: number; y: number };
  highlights: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  createdAt: number;
}

interface WebSocketSession {
  socket: WebSocket;
  role: 'presenter' | 'viewer';
  joinedAt: number;
}

export class PointerSession {
  state: DurableObjectState;
  sessions: Map<WebSocket, WebSocketSession>;
  sessionState: SessionState;
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sessions = new Map();
    this.sessionState = {
      dashboardId: '',
      cursorPosition: { x: 50, y: 50 },
      scrollPosition: { x: 0, y: 0 },
      highlights: [],
      createdAt: Date.now()
    };
    
    // Restore state from storage
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<SessionState>('session');
      if (stored) {
        this.sessionState = stored;
      }
    });
  }
  
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Initialize session
    if (url.pathname === '/init' && request.method === 'POST') {
      const { dashboardId, dashboardHtml } = await request.json() as {
        dashboardId: string;
        dashboardHtml?: string;
      };
      
      this.sessionState.dashboardId = dashboardId;
      if (dashboardHtml) {
        this.sessionState.dashboardHtml = dashboardHtml;
      }
      this.sessionState.createdAt = Date.now();
      
      await this.state.storage.put('session', this.sessionState);
      
      return new Response(JSON.stringify({ success: true }));
    }
    
    // Get session info
    if (url.pathname === '/info') {
      return new Response(JSON.stringify({
        dashboardId: this.sessionState.dashboardId,
        viewerCount: this.getViewerCount(),
        hasPresenter: this.hasPresenter(),
        createdAt: this.sessionState.createdAt
      }));
    }
    
    // Get dashboard HTML
    if (url.pathname === '/dashboard') {
      return new Response(this.sessionState.dashboardHtml || '', {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    return new Response('Not found', { status: 404 });
  }
  
  handleWebSocket(request: Request): Response {
    const url = new URL(request.url);
    const role = url.searchParams.get('role') as 'presenter' | 'viewer' || 'viewer';
    
    // Only one presenter allowed
    if (role === 'presenter' && this.hasPresenter()) {
      return new Response('Session already has a presenter', { status: 409 });
    }
    
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    // Accept the WebSocket
    this.state.acceptWebSocket(server);
    
    // Store session info
    this.sessions.set(server, {
      socket: server,
      role,
      joinedAt: Date.now()
    });
    
    // Send initial state to new connection
    server.send(JSON.stringify({
      type: 'init',
      data: {
        cursorPosition: this.sessionState.cursorPosition,
        scrollPosition: this.sessionState.scrollPosition,
        highlights: this.sessionState.highlights,
        viewerCount: this.getViewerCount()
      }
    }));
    
    // Notify others of viewer count change
    this.broadcastViewerCount();
    
    return new Response(null, { status: 101, webSocket: client });
  }
  
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const session = this.sessions.get(ws);
    if (!session) return;
    
    const msg = JSON.parse(message as string);
    
    // Only presenter can send control messages
    if (session.role !== 'presenter') return;
    
    switch (msg.type) {
      case 'cursor': {
        this.sessionState.cursorPosition = msg.data;
        this.broadcastToViewers({
          type: 'cursor',
          data: msg.data
        });
        break;
      }
      
      case 'scroll': {
        this.sessionState.scrollPosition = msg.data;
        this.broadcastToViewers({
          type: 'scroll',
          data: msg.data
        });
        break;
      }
      
      case 'highlight': {
        const highlight = {
          id: crypto.randomUUID(),
          ...msg.data
        };
        this.sessionState.highlights.push(highlight);
        this.broadcastToViewers({
          type: 'highlight',
          data: highlight
        });
        break;
      }
      
      case 'clear_highlights': {
        this.sessionState.highlights = [];
        this.broadcastToViewers({
          type: 'clear_highlights',
          data: null
        });
        break;
      }
      
      case 'click': {
        this.broadcastToViewers({
          type: 'click',
          data: msg.data
        });
        break;
      }
    }
  }
  
  async webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws);
    this.broadcastViewerCount();
  }
  
  async webSocketError(ws: WebSocket) {
    this.sessions.delete(ws);
    this.broadcastViewerCount();
  }
  
  broadcastToViewers(message: object) {
    const msg = JSON.stringify(message);
    for (const [socket, session] of this.sessions) {
      if (session.role === 'viewer') {
        socket.send(msg);
      }
    }
  }
  
  broadcastViewerCount() {
    const count = this.getViewerCount();
    const msg = JSON.stringify({
      type: 'viewer_count',
      data: { count }
    });
    
    for (const [socket] of this.sessions) {
      socket.send(msg);
    }
  }
  
  getViewerCount(): number {
    let count = 0;
    for (const [, session] of this.sessions) {
      if (session.role === 'viewer') count++;
    }
    return count;
  }
  
  hasPresenter(): boolean {
    for (const [, session] of this.sessions) {
      if (session.role === 'presenter') return true;
    }
    return false;
  }
}
```

---

# WORKER HANDLERS

```typescript
// worker/src/handlers/pointer.ts

export async function handleCreateSession(
  request: Request,
  env: Env,
  user: User
): Promise<Response> {
  const { dashboardId } = await request.json() as { dashboardId: string };
  
  // Get dashboard HTML
  const dashboardData = await env.KV.get(`dashboard:${dashboardId}`);
  if (!dashboardData) {
    return Response.json({ error: 'dashboard_not_found' }, { status: 404 });
  }
  
  const dashboard = JSON.parse(dashboardData);
  
  // Check ownership
  if (dashboard.userId !== user.id) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  
  // Get HTML from R2
  const htmlObject = await env.R2.get(`dashboards/${dashboardId}.html`);
  const html = htmlObject ? await htmlObject.text() : null;
  
  // Generate session ID
  const sessionId = crypto.randomUUID().substring(0, 8);
  
  // Get Durable Object
  const id = env.POINTER.idFromName(sessionId);
  const stub = env.POINTER.get(id);
  
  // Initialize session
  await stub.fetch('https://pointer/init', {
    method: 'POST',
    body: JSON.stringify({
      dashboardId,
      dashboardHtml: html
    })
  });
  
  // Store session reference
  await env.KV.put(`pointer_session:${sessionId}`, JSON.stringify({
    dashboardId,
    userId: user.id,
    createdAt: Date.now()
  }), { expirationTtl: 86400 }); // 24 hour expiry
  
  return Response.json({
    sessionId,
    presenterUrl: `https://bankruptthebc.online/present/${sessionId}`,
    viewerUrl: `https://bankruptthebc.online/view/${sessionId}`
  });
}

export async function handleGetSession(
  request: Request,
  env: Env,
  sessionId: string
): Promise<Response> {
  // Get Durable Object
  const id = env.POINTER.idFromName(sessionId);
  const stub = env.POINTER.get(id);
  
  // Get session info
  const response = await stub.fetch('https://pointer/info');
  const info = await response.json();
  
  return Response.json(info);
}

export async function handleWebSocket(
  request: Request,
  env: Env,
  sessionId: string
): Promise<Response> {
  // Validate session exists
  const sessionData = await env.KV.get(`pointer_session:${sessionId}`);
  if (!sessionData) {
    return Response.json({ error: 'session_not_found' }, { status: 404 });
  }
  
  // Get Durable Object and proxy the WebSocket
  const id = env.POINTER.idFromName(sessionId);
  const stub = env.POINTER.get(id);
  
  return stub.fetch(request);
}
```

---

# FRONTEND: PRESENTER VIEW

```tsx
// pages/Presenter.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePointer } from '../hooks/usePointer';

export function PresenterPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [mode, setMode] = useState<'pointer' | 'highlight'>('pointer');
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightStart, setHighlightStart] = useState<{x: number, y: number} | null>(null);
  
  const { send, status, lastMessage } = usePointer({
    sessionId: sessionId!,
    role: 'presenter',
    onMessage: (msg) => {
      if (msg.type === 'viewer_count') {
        setViewerCount(msg.data.count);
      }
    }
  });
  
  // Track cursor movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!iframeRef.current) return;
    
    const rect = iframeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Throttle to 60fps
    send({
      type: 'cursor',
      data: { x, y }
    });
  }, [send]);
  
  // Handle clicks
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!iframeRef.current) return;
    
    const rect = iframeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (mode === 'highlight') {
      if (!isHighlighting) {
        setHighlightStart({ x, y });
        setIsHighlighting(true);
      } else {
        // Create highlight from start to current position
        const highlight = {
          x: Math.min(highlightStart!.x, x),
          y: Math.min(highlightStart!.y, y),
          width: Math.abs(x - highlightStart!.x),
          height: Math.abs(y - highlightStart!.y)
        };
        
        send({
          type: 'highlight',
          data: highlight
        });
        
        setIsHighlighting(false);
        setHighlightStart(null);
      }
    } else {
      send({
        type: 'click',
        data: { x, y }
      });
    }
  }, [mode, isHighlighting, highlightStart, send]);
  
  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!iframeRef.current?.contentWindow) return;
      
      const doc = iframeRef.current.contentWindow.document;
      const x = (doc.documentElement.scrollLeft / doc.documentElement.scrollWidth) * 100;
      const y = (doc.documentElement.scrollTop / doc.documentElement.scrollHeight) * 100;
      
      send({
        type: 'scroll',
        data: { x, y }
      });
    };
    
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.addEventListener('scroll', handleScroll);
      return () => iframe.contentWindow?.removeEventListener('scroll', handleScroll);
    }
  }, [send]);
  
  const copyViewerLink = () => {
    const url = `${window.location.origin}/view/${sessionId}`;
    navigator.clipboard.writeText(url);
    alert('Viewer link copied!');
  };
  
  return (
    <div className="presenter-page">
      {/* Control Bar */}
      <div className="presenter-controls">
        <div className="controls-left">
          <span className="session-id">Session: {sessionId}</span>
          <span className={`status ${status}`}>
            {status === 'connected' ? '🟢 Live' : '🔴 Connecting...'}
          </span>
          <span className="viewer-count">
            <i className="fa-solid fa-users"></i> {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="controls-center">
          <button 
            className={`control-btn ${mode === 'pointer' ? 'active' : ''}`}
            onClick={() => setMode('pointer')}
          >
            <i className="fa-solid fa-arrow-pointer"></i> Pointer
          </button>
          <button 
            className={`control-btn ${mode === 'highlight' ? 'active' : ''}`}
            onClick={() => setMode('highlight')}
          >
            <i className="fa-solid fa-highlighter"></i> Highlight
          </button>
          <button 
            className="control-btn"
            onClick={() => send({ type: 'clear_highlights', data: null })}
          >
            <i className="fa-solid fa-eraser"></i> Clear
          </button>
        </div>
        
        <div className="controls-right">
          <button className="btn btn--outline" onClick={copyViewerLink}>
            <i className="fa-solid fa-link"></i> Copy Link
          </button>
          <button className="btn btn--outline" onClick={() => navigate('/account')}>
            End Session
          </button>
        </div>
      </div>
      
      {/* Dashboard Area */}
      <div 
        className="presenter-dashboard"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <iframe
          ref={iframeRef}
          src={`/api/pointer/${sessionId}/dashboard`}
          title="Dashboard"
          className="dashboard-iframe"
        />
        
        {/* Highlight preview while dragging */}
        {isHighlighting && highlightStart && (
          <div 
            className="highlight-preview"
            style={{
              left: `${highlightStart.x}%`,
              top: `${highlightStart.y}%`
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

# FRONTEND: VIEWER VIEW

```tsx
// pages/Viewer.tsx

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { usePointer } from '../hooks/usePointer';
import { Cursor } from '../components/pointer/Cursor';
import { Highlight } from '../components/pointer/Highlight';

export function ViewerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const [highlights, setHighlights] = useState<any[]>([]);
  const [clickEffect, setClickEffect] = useState<{x: number, y: number} | null>(null);
  
  const { status } = usePointer({
    sessionId: sessionId!,
    role: 'viewer',
    onMessage: (msg) => {
      switch (msg.type) {
        case 'cursor':
          setCursorPosition(msg.data);
          break;
          
        case 'scroll':
          if (iframeRef.current?.contentWindow) {
            const doc = iframeRef.current.contentWindow.document;
            const scrollX = (msg.data.x / 100) * doc.documentElement.scrollWidth;
            const scrollY = (msg.data.y / 100) * doc.documentElement.scrollHeight;
            iframeRef.current.contentWindow.scrollTo(scrollX, scrollY);
          }
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
          setHighlights(msg.data.highlights);
          break;
      }
    }
  });
  
  return (
    <div className="viewer-page">
      {/* Status Bar */}
      <div className="viewer-status">
        <span className={`status ${status}`}>
          {status === 'connected' ? '🟢 Connected' : '⏳ Connecting...'}
        </span>
        <span className="powered-by">Powered by LOVE</span>
      </div>
      
      {/* Dashboard */}
      <div className="viewer-dashboard">
        <iframe
          ref={iframeRef}
          src={`/api/pointer/${sessionId}/dashboard`}
          title="Dashboard"
          className="dashboard-iframe"
        />
        
        {/* Remote Cursor */}
        <Cursor 
          x={cursorPosition.x} 
          y={cursorPosition.y}
          label="Presenter"
        />
        
        {/* Highlights */}
        {highlights.map(h => (
          <Highlight key={h.id} {...h} />
        ))}
        
        {/* Click Effect */}
        {clickEffect && (
          <div 
            className="click-effect"
            style={{
              left: `${clickEffect.x}%`,
              top: `${clickEffect.y}%`
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

# HOOK: usePointer

```typescript
// hooks/usePointer.ts

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
  
  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/pointer/${sessionId}/ws?role=${role}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setStatus('connected');
    };
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setLastMessage(msg);
      onMessage?.(msg);
    };
    
    ws.onclose = () => {
      setStatus('disconnected');
      // Reconnect after 2 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 2000);
    };
    
    ws.onerror = () => {
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
  
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);
  
  return { send, status, lastMessage };
}
```

---

# COMPONENTS

```tsx
// components/pointer/Cursor.tsx

interface CursorProps {
  x: number;
  y: number;
  label?: string;
}

export function Cursor({ x, y, label }: CursorProps) {
  return (
    <div 
      className="remote-cursor"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path 
          d="M5.5 3.21V20.8L10.5 15.8L14.79 15.8L5.5 3.21Z" 
          fill="#C5A059"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      {label && <span className="cursor-label">{label}</span>}
    </div>
  );
}

// components/pointer/Highlight.tsx

interface HighlightProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Highlight({ x, y, width, height }: HighlightProps) {
  return (
    <div 
      className="remote-highlight"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`
      }}
    />
  );
}
```

---

# PRESENTER STYLES

```css
/* styles/pointer.css */

.presenter-page,
.viewer-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--stone-900);
}

.presenter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--stone-800);
  border-bottom: 1px solid var(--stone-700);
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.controls-center {
  display: flex;
  gap: 0.5rem;
}

.session-id {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--stone-400);
}

.status {
  font-size: 0.875rem;
}

.status.connected { color: var(--success); }
.status.connecting { color: var(--gold); }
.status.disconnected { color: var(--error); }

.viewer-count {
  color: var(--stone-300);
  font-size: 0.875rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: var(--stone-700);
  border: 1px solid var(--stone-600);
  border-radius: var(--radius-md);
  color: var(--stone-200);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.control-btn:hover {
  background: var(--stone-600);
}

.control-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: white;
}

.presenter-dashboard,
.viewer-dashboard {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.dashboard-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.remote-cursor {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
  transition: left 0.05s linear, top 0.05s linear;
}

.cursor-label {
  position: absolute;
  left: 20px;
  top: 20px;
  background: var(--gold);
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.remote-highlight {
  position: absolute;
  background: rgba(197, 160, 89, 0.3);
  border: 2px solid var(--gold);
  border-radius: var(--radius-sm);
  pointer-events: none;
  z-index: 999;
}

.highlight-preview {
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(197, 160, 89, 0.3);
  border: 2px dashed var(--gold);
  border-radius: var(--radius-sm);
  pointer-events: none;
}

.click-effect {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid var(--gold);
  border-radius: 50%;
  pointer-events: none;
  animation: clickPulse 0.5s ease-out forwards;
}

@keyframes clickPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.viewer-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--stone-800);
  border-bottom: 1px solid var(--stone-700);
}

.powered-by {
  font-size: 0.75rem;
  color: var(--stone-500);
}
```

---

# WRANGLER CONFIG UPDATE

```toml
# Add to wrangler.toml

[[durable_objects.bindings]]
name = "POINTER"
class_name = "PointerSession"

[[migrations]]
tag = "v1"
new_classes = ["PointerSession"]
```

---

# OUTPUT

Generate the complete Pointer system with:
1. Durable Object class
2. Worker handlers
3. Presenter and Viewer pages
4. usePointer hook
5. Cursor and Highlight components
6. CSS styles
7. Wrangler config updates

Ensure low-latency cursor sync and robust reconnection handling.
