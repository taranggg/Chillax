# Chill Together Backend

A Node.js backend server for the Chill Together synchronized video watching application. Built with Express.js and Socket.IO for real-time communication.

## Features

- **Real-time Communication**: Socket.IO for instant messaging and video synchronization
- **Room Management**: Create and join rooms with unique IDs
- **Video Synchronization**: Play, pause, seek, and URL changes synced across all participants
- **Chat System**: Real-time messaging within rooms
- **WebRTC Signaling**: Peer-to-peer video/audio call support
- **Participant Management**: Track online users, audio/video status
- **Host Controls**: Room host can control video and manage participants

## API Endpoints

### REST API
- `GET /health` - Health check endpoint
- `GET /rooms` - List all active rooms
- `GET /rooms/:roomId` - Get specific room information

### Socket.IO Events

#### Room Management
- `create-room` - Create a new room
- `join-room` - Join an existing room
- `user-joined` - Notification when user joins
- `user-left` - Notification when user leaves

#### Video Synchronization
- `video-play` - Play video for all participants
- `video-pause` - Pause video for all participants
- `video-seek` - Seek to specific time
- `video-url-change` - Change video URL (host only)

#### Chat
- `send-message` - Send chat message
- `new-message` - Receive new message

#### WebRTC Signaling
- `webrtc-offer` - WebRTC offer exchange
- `webrtc-answer` - WebRTC answer exchange
- `webrtc-ice-candidate` - ICE candidate exchange

#### Media Controls
- `toggle-audio` - Toggle user's audio
- `toggle-video` - Toggle user's video

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

- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `NODE_ENV` - Environment (development/production)

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
- Invalid room IDs
- Disconnected users
- Host transfers when host leaves
- Room cleanup when empty
- Message limits and validation

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
