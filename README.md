# 🎬 Chill Together

A real-time synchronized video watching application where multiple users can join rooms, watch videos together, chat, and make video/voice calls.

## ✨ Features

- **🏠 Room Management**: Create and join rooms with unique IDs
- **🎥 Video Synchronization**: Watch videos in perfect sync across all participants
- **💬 Real-time Chat**: Instant messaging within rooms
- **📹 Video Calls**: WebRTC-powered video and voice calls
- **👥 User Management**: See who's online and their media status
- **🎛️ Host Controls**: Room creators can load YouTube links or upload local videos for everyone
- **📂 Local Uploads**: Hosts can upload MP4/WebM files that are streamed directly from the backend
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite 7.1.1** - Fast build tool and dev server
- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React Player** - Video player with multiple format support
- **Simple Peer** - WebRTC wrapper for peer-to-peer connections
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Option 1: Use the startup script (Recommended)
```bash
# Clone or navigate to the project directory
cd Chill-Together

# Run the development startup script
./start-dev.sh
```

### Option 2: Manual startup

1. **Start the Backend:**
```bash
cd Backend
npm install
npm run dev
```
Backend will run on: http://localhost:3001

2. **Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:5173 (or next available port)

## 🎮 How to Use

1. **Create a Room:**
   - Click **Create Room** (a random room ID is generated automatically)
   - Share the room ID with friends

2. **Join a Room:**
   - Enter the room ID you received
   - Click **Join Room**

3. **Watch Videos Together:**
   - Only the host sees the **Load URL** and **Upload Local** controls
   - Paste a YouTube URL or direct link and click **Load URL**
   - Or click **Upload Local** to push an MP4/WebM file from your machine (1 GB default limit)
   - Play, pause, seek, or press **Sync All** to broadcast the current state to every participant

4. **Chat:**
   - Use the chat panel to communicate
   - Messages are shared in real-time

5. **Video Calls:**
   - Click the camera/microphone buttons to join video calls
   - WebRTC enables peer-to-peer communication

> ℹ️ Browsers often block autoplay with sound. If a new video appears paused, the host can click the play button once to start playback for everyone.

## 📁 Project Structure

```
Chill-Together/
├── Backend/                 # Node.js backend server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── .env               # Environment variables
│   └── README.md          # Backend documentation
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── main.jsx       # App entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── start-dev.sh           # Development startup script
└── README.md              # This file
```

## 🔧 Configuration

### Backend Environment Variables
Create `.env` inside `Backend/`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
# Public origin used when returning uploaded file URLs
BACKEND_PUBLIC_URL=http://localhost:3001
```

Adjust `BACKEND_PUBLIC_URL` when deploying behind a domain/HTTPS proxy.

### Frontend Configuration
The frontend reads the socket/API origin from `src/utils/constants.js` (defaults to `http://localhost:3001`). Update this file for production builds if needed.

## 🌐 API Endpoints

### REST API

| Method | Endpoint          | Description                               |
|--------|-------------------|-------------------------------------------|
| GET    | `/health`          | Basic health check                        |
| GET    | `/rooms`           | List active rooms                         |
| GET    | `/rooms/:roomId`   | Inspect a specific room                   |
| POST   | `/upload`          | Upload a local video (host use only)      |

Uploaded assets are served at `/uploads/<filename>`.

### Socket.IO Events

- **Room Management**: `create-room`, `join-room`, `user-joined`, `user-left`, `participants-update`
- **Video Sync**: `video-url-change`, `video-play`, `video-pause`, `video-seek`, `video-sync`
- **Chat**: `send-message`, `new-message`
- **WebRTC**: `webrtc-signal`
- **Media Status**: `media-status-update`

## 🔍 Supported Video Formats

- **YouTube** (`youtube.com`, `youtu.be`)
- **Vimeo** (`vimeo.com`)
- **Direct video files** (`.mp4`, `.webm`, `.ogg`)
- **Locally uploaded files** (served from `/uploads/...`)
- **And more** (via React Player support)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Backend: Change `PORT` in `.env` file
   - Frontend: Vite will automatically find next available port

2. **Video stuck on “Loading”:**
   - Make sure the host clicked **Load URL** after pasting a link
   - Wait for the spinner to disappear; autoplay may require a manual play click
   - Inspect the browser console for ReactPlayer errors (invalid URL, blocked content, etc.)

3. **CORS errors:**
   - Ensure backend CORS matches your frontend origin (`FRONTEND_URL`)
   - Check both servers are running

4. **WebRTC connection issues:**
   - Ensure HTTPS in production (required for camera/microphone access)
   - Check firewall settings for peer-to-peer connections

5. **Video not syncing:**
   - Verify Socket.IO connection in browser dev tools
   - Click **Sync All** to broadcast the current state
   - Check network connectivity

## 🚀 Deployment

### Backend
1. Set up environment variables
2. Use PM2 or similar for process management
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Configure proper CORS settings

### Frontend
1. Build the application: `npm run build`
2. Serve static files with nginx or similar
3. Update backend URL in production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.IO for real-time communication
- TailwindCSS for the styling system
- All the open-source contributors who made this possible

---

**Happy watching together! 🎬🍿**
