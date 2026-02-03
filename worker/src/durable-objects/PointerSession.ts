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

    constructor(state: DurableObjectState, env: any) {
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

            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get session info
        if (url.pathname === '/info') {
            return new Response(JSON.stringify({
                dashboardId: this.sessionState.dashboardId,
                viewerCount: this.getViewerCount(),
                hasPresenter: this.hasPresenter(),
                createdAt: this.sessionState.createdAt
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
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
                try {
                    socket.send(msg);
                } catch (e) {
                    // Socket closed
                }
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
            try {
                socket.send(msg);
            } catch (e) {
                // Socket closed
            }
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
