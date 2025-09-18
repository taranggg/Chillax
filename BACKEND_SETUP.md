# Backend Setup Guide

This project already includes a fully-featured Socket.IO backend located in the `Backend/` directory. Follow the steps below to get it running locally and understand the available configuration and features.

## 1. Prerequisites

- **Node.js 18+** (Node 16 works, but 18+ is recommended)
- npm (comes with Node) or another compatible package manager

## 2. Install Dependencies

```bash
cd Backend
npm install
```

This installs runtime dependencies such as `express`, `socket.io`, and `multer` (used for local video uploads).

## 3. Environment Variables

Create a `.env` file inside the `Backend/` directory. You can copy from `.env.example` if present or create a new file with the following defaults:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
# Optional: public URL used when generating links for uploaded videos
BACKEND_PUBLIC_URL=http://localhost:3001
```

- `PORT` – Port for the backend server.
- `FRONTEND_URL` – Allowed origin for CORS during local development.
- `BACKEND_PUBLIC_URL` – Base URL used when the server returns links to uploaded files. In production this should be the HTTPS URL that browsers can reach.

## 4. Run the Server

### Development
```bash
npm run dev
```
Starts the server with `nodemon`, reloading on file changes.

### Production
```bash
npm start
```
Runs the server with Node.

The health check endpoint will be available at `http://localhost:3001/health` (adjust the port if you changed it).

## 5. What the Backend Provides

### REST Endpoints

| Method | Endpoint          | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/health`          | Basic health check                        |
| GET    | `/rooms`           | List currently active rooms              |
| GET    | `/rooms/:roomId`   | Inspect a specific room                  |
| POST   | `/upload`          | Upload a local video file (host only)    |

Uploaded files are stored under `Backend/uploads/` (ignored by git) and served statically at `/uploads/<filename>`.

### Socket.IO Events

**Room lifecycle**
- `create-room` / `join-room`
- `user-joined`, `user-left`, `participants-update`

**Video synchronisation**
- `video-url-change` (host broadcasts new source)
- `video-play`, `video-pause`, `video-seek`, `video-sync`

**Chat**
- `send-message`, `new-message`

**WebRTC signalling**
- `webrtc-signal` (simple-peer signalling bus)

**Media status**
- `media-status-update`

Every event emitted by the backend includes the `roomId` so that the frontend can ignore updates for other rooms.

## 6. Local Upload Notes

- Only the room host should invoke `/upload`; the frontend UI already enforces this.
- Files are capped at **1 GB** by default. Adjust `fileSize` in `server.js` if you need larger assets.
- When deploying, ensure the `uploads/` directory is writable and the resulting URLs are exposed through your reverse proxy.

## 7. Development Tips

- The backend logs each connection and key video/chat events — keep the terminal open while testing.
- If you see repeated connect/disconnect logs when the frontend starts, that is expected in React 19 development because of Strict Mode.
- To wipe all uploaded media in development simply delete the `Backend/uploads/` folder while the server is stopped.

## 8. Next Steps

When you are ready for production:
- Serve the backend behind HTTPS (required for camera/microphone access).
- Set `BACKEND_PUBLIC_URL` to the public HTTPS origin.
- Consider moving room state to a persistent store (Redis, database) if you need durability beyond the in-memory implementation.

That’s it! With the backend running, the frontend (`frontend/`) will automatically connect on `http://localhost:3001` and expose all chat, call, and synchronized video features.
