# Chill Together Backend

A Node.js backend server for the Chill Together synchronized video watching application. Built with Express.js and Socket.IO for real-time communication.

## Features

- **Real-time Communication**: Socket.IO for instant messaging and video synchronization
- **Room Management**: Create and join rooms with unique IDs
- **Video Synchronization**: Play, pause, seek, URL changes, and explicit sync broadcasts
- **Chat System**: Real-time messaging within rooms
- **WebRTC Signaling**: Peer-to-peer video/audio call support
- **Participant Management**: Track online users, audio/video status
- **Host Controls**: Room host can load remote videos or upload local files for the room
- **File Uploads**: Optional `/upload` endpoint stores media in `uploads/`

## API Endpoints

### REST API

| Method | Endpoint        | Description                               |
|--------|-----------------|-------------------------------------------|
| GET    | `/health`        | Health check endpoint                     |
| GET    | `/rooms`         | List all active rooms                     |
| GET    | `/rooms/:roomId` | Get specific room information             |
| POST   | `/upload`        | Upload and host a local video file        |

### Socket.IO Events

#### Room Management
- `create-room` - Create a new room
- `join-room` - Join an existing room
- `user-joined` - Notification when user joins
- `user-left` - Notification when user leaves

#### Video Synchronization
- `video-url-change` - Host broadcasts a new source URL
- `video-play` - Play video for all participants
- `video-pause` - Pause video for all participants
- `video-seek` - Seek to a specific moment
- `video-sync` - Broadcast the authoritative time/play state

#### Chat
- `send-message` - Send chat message
- `new-message` - Receive new message

#### WebRTC Signaling
- `webrtc-signal` - Unified simple-peer signalling bus
- `webrtc-offer` / `webrtc-answer` / `webrtc-ice-candidate` *(legacy helpers, optional)*

#### Media Controls
- `media-status-update` - Broadcast current audio/video state
- `toggle-audio` - (Legacy) Toggle user's audio
- `toggle-video` - (Legacy) Toggle user's video

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. For production:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP listen port | `3001` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `BACKEND_PUBLIC_URL` | Public origin used when returning uploaded file URLs | `http://localhost:3001` |
| `NODE_ENV` | Environment flag | `development` |

## Room Structure

Each room contains:
- **ID**: Unique 8-character identifier
- **Host**: User who created the room
- **Participants**: List of connected users
- **Current Video**: URL, timestamp, play state
- **Messages**: Chat history (last 100 messages)
- **Created At**: Room creation timestamp

## Participant Structure

Each participant has:
- **ID**: Socket connection ID
- **Name**: Display name
- **Is Host**: Host privileges
- **Is Online**: Connection status
- **Audio/Video Enabled**: Media status
- **Joined At**: Join timestamp

## Error Handling

The server handles:
- Invalid room IDs and duplicate creates
- Graceful cleanup when users disconnect
- Host transfer / room deletion when the host leaves
- Automatic trimming of chat history (last 100 messages)
- File size validation during uploads (default 1 GB)

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-restart
npm run dev

# Run in production mode
npm start
```

## Production Deployment

1. Set environment variables
2. Use PM2 or similar for process management
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Configure proper CORS settings

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Redis for session management
- [ ] User authentication
- [ ] Room passwords
- [ ] File sharing
- [ ] Screen sharing support
- [ ] Recording capabilities
