# 🎬 Chill Together

A real-time synchronized video watching application where multiple users can join rooms, watch videos together, chat, and make video/voice calls.

## ✨ Features

- **🏠 Room Management**: Create and join rooms with unique IDs
- **🎥 Video Synchronization**: Watch videos in perfect sync across all participants
- **💬 Real-time Chat**: Instant messaging within rooms
- **📹 Video Calls**: WebRTC-powered video and voice calls
- **👥 User Management**: See who's online and their media status
- **🎛️ Host Controls**: Room creators have additional privileges
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
   - Enter your name on the homepage
   - Click "Create Room"
   - Share the room ID with friends

2. **Join a Room:**
   - Enter your name and the room ID
   - Click "Join Room"

3. **Watch Videos Together:**
   - Host can paste YouTube URLs or direct video links
   - All participants see the same video in sync
   - Play, pause, and seek controls affect everyone

4. **Chat:**
   - Use the chat panel to communicate
   - Messages are shared in real-time

5. **Video Calls:**
   - Click the camera/microphone buttons to join video calls
   - WebRTC enables peer-to-peer communication

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
Create `.env` file in the Backend directory:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend Configuration
The frontend automatically connects to `http://localhost:3001` for the backend.

## 🌐 API Endpoints

### REST API
- `GET /health` - Server health check
- `GET /rooms` - List all active rooms
- `GET /rooms/:roomId` - Get room information

### Socket.IO Events
- **Room Management**: `create-room`, `join-room`, `user-joined`, `user-left`
- **Video Sync**: `video-play`, `video-pause`, `video-seek`, `video-url-change`
- **Chat**: `send-message`, `new-message`
- **WebRTC**: `webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`
- **Media**: `toggle-audio`, `toggle-video`

## 🔍 Supported Video Formats

- **YouTube** (`youtube.com`, `youtu.be`)
- **Vimeo** (`vimeo.com`)
- **Direct video files** (`.mp4`, `.webm`, `.ogg`)
- **And more** (via React Player)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Backend: Change `PORT` in `.env` file
   - Frontend: Vite will automatically find next available port

2. **CORS errors:**
   - Ensure backend CORS is configured for your frontend URL
   - Check that both servers are running

3. **WebRTC connection issues:**
   - Ensure HTTPS in production (required for camera/microphone access)
   - Check firewall settings for peer-to-peer connections

4. **Video not syncing:**
   - Verify Socket.IO connection in browser dev tools
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
