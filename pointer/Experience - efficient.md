I need you to build a drag-and-drop HTML dashboard sharing system with real-time pointer control for live teaching sessions.

PROJECT GOAL:  
Create a simple web application where I can:  
1\. Drag and drop my HTML dashboard file  
2\. Instantly make it available to my students via a shareable link  
3\. Control a pointer that all students see in real-time on their screens  
4\. Provide a smooth, high-quality experience without video streaming

TECHNICAL STACK:  
\- Frontend: Clean web interface for drag-and-drop and viewing  
\- Backend: Cloudflare Workers \+ Durable Objects \+ R2 (for file storage)  
\- Real-time: WebSocket for pointer synchronization  
\- I'm already using Cloudflare

COMPONENTS TO BUILD:

1\. PRESENTER INTERFACE (presenter.html):  
   \- Clean drag-and-drop zone for HTML files  
   \- Upload the HTML file and get a shareable session link immediately  
   \- Show the uploaded dashboard with pointer control active  
   \- Visual controls: pointer mode, highlight mode, clear highlights button  
   \- Display session code/link prominently for easy sharing with students  
   \- Connection status indicator  
   \- Simple, intuitive UI

2\. VIEWER INTERFACE (viewer.html):  
   \- Students enter session code or use direct link  
   \- Loads the shared HTML dashboard  
   \- Displays presenter's pointer in real-time as a colored cursor/dot  
   \- Shows highlights/annotations from presenter  
   \- Connection status indicator  
   \- Fully responsive

3\. CLOUDFLARE WORKER (worker.js):  
   \- Handle HTML file uploads to Cloudflare R2  
   \- Generate unique session IDs  
   \- Serve uploaded HTML to viewers  
   \- WebSocket endpoint for real-time coordination  
   \- Route requests appropriately

4\. DURABLE OBJECT (session-sync.js):  
   \- Manage WebSocket connections per session  
   \- Track one presenter and multiple viewers per session  
   \- Broadcast pointer position (x%, y% as percentages for responsiveness)  
   \- Broadcast click events and highlight rectangles  
   \- Handle reconnection logic

5\. FILE STORAGE:  
   \- Use Cloudflare R2 for storing uploaded HTML files  
   \- Files can be temporary (auto-delete after 24 hours is fine)  
   \- Simple key structure: session-id.html

KEY FEATURES:  
\- Drag and drop HTML file → instant session creation  
\- Generate shareable link like: yourdomain.com/view?session=abc123  
\- Pointer appears as a distinctive colored dot/cursor on viewer screens  
\- Click-and-drag to create temporary highlight boxes  
\- Smooth animations for pointer movement  
\- Auto-reconnect if connection drops  
\- Works across different screen sizes (use percentage-based coordinates)

IMPORTANT REQUIREMENTS:  
\- Keep it SIMPLE \- minimal UI, maximum clarity  
\- No authentication needed (sessions are temporary)  
\- Fast upload and instant availability  
\- Clear visual feedback for all actions  
\- Vanilla JavaScript preferred, minimal dependencies  
\- Mobile-friendly responsive design  
\- Good error handling with user-friendly messages

DELIVERABLES:  
1\. presenter.html \- Drag-and-drop interface for teachers  
2\. viewer.html \- Clean viewing interface for students  
3\. worker.js \- Main Cloudflare Worker  
4\. session-sync.js \- Durable Object for WebSocket coordination  
5\. wrangler.toml \- Complete Cloudflare configuration (including R2 bucket)  
6\. README.md \- Step-by-step deployment guide including:  
   \- How to create R2 bucket  
   \- How to deploy Worker  
   \- How to use the system  
7\. styles.css \- Clean, modern styling (if needed separately)

DEPLOYMENT NOTES:  
\- Explain how to set up Cloudflare R2 bucket  
\- Provide wrangler commands for deployment  
\- Include environment variable setup if needed  
\- Make it easy to test locally with wrangler dev

USER FLOW:  
PRESENTER:  
1\. Opens presenter.html  
2\. Drags HTML dashboard file onto page  
3\. Gets shareable link instantly  
4\. Shares link with students  
5\. Opens their view and starts moving pointer/highlighting

STUDENTS:  
1\. Click shared link or enter session code  
2\. See the dashboard load immediately  
3\. Watch presenter's pointer in real-time  
4\. Experience smooth, high-quality visuals

Please create a complete, production-ready system with clear comments and documentation.  
