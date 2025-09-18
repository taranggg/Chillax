# Chill Together Frontend

A React-based frontend for a synchronized video watching, chatting, and video calling web application.

## Features

### 🎥 Video Synchronization
- Watch YouTube videos and direct video files in sync with friends
- Play/pause/seek controls synchronized across all participants
- Custom video player controls with progress bar
- Support for various video formats (YouTube, Vimeo, MP4, WebM, etc.)

### 💬 Real-time Chat
- Live messaging with all room participants
- System messages for user join/leave events
- Participant avatars and status indicators
- Message timestamps and user identification

### 📞 Video & Voice Calls
- WebRTC-based peer-to-peer video calling
- Camera and microphone toggle controls
- Participant video grid display
- Audio/video status indicators

### 🏠 Room Management
- Create rooms with shareable room IDs
- Join existing rooms via room ID
- Participant list with online status
- Connection status indicators

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling and UI components
- **Socket.IO Client** - Real-time communication
- **React Player** - Video player component
- **Simple Peer** - WebRTC implementation
- **Lucide React** - Icon components

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- A backend server running on `http://localhost:5000` (Socket.IO server)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd Chill-Together/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

## Project Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── VideoPlayer.jsx  # Video player with sync controls
│   ├── ChatBox.jsx      # Real-time chat component
│   ├── VideoCall.jsx    # WebRTC video calling
│   └── ParticipantsList.jsx # Participants management
├── pages/               # Main page components
│   ├── HomePage.jsx     # Landing page for room creation/joining
│   └── RoomPage.jsx     # Main room interface
├── hooks/               # Custom React hooks
│   ├── useSocket.jsx    # Socket.IO connection management
│   └── useWebRTC.jsx    # WebRTC peer connections
├── utils/               # Utility functions and constants
│   └── constants.js     # App constants and helpers
├── App.jsx             # Main application component
├── App.css             # Custom styles
└── main.jsx           # Application entry point
```

## Usage

### Creating a Room
1. Open the application in your browser
2. Click "Create New Room" on the homepage
3. Share the generated room ID with friends

### Joining a Room
1. Get a room ID from someone who created a room
2. Enter the room ID in the "Join a Room" section
3. Click "Join Room"

### Watching Videos Together
1. In the room, paste a video URL (YouTube, direct video links, etc.)
2. Use the play/pause controls - all participants will sync automatically
3. Use the "Sync All" button if anyone gets out of sync

### Video Calling
1. Click the camera and microphone buttons to enable your video/audio
2. Other participants' videos will appear in the video grid
3. Toggle your camera/mic anytime during the session

### Chatting
1. Use the chat box on the right side of the room
2. Type messages and press Enter or click the send button
3. See when others join or leave the room via system messages

## Configuration

### Backend Server
The frontend expects a Socket.IO server running on `http://localhost:5000`. You can change this in:
- `src/hooks/useSocket.jsx` - Update the `SOCKET_SERVER_URL`
- `src/utils/constants.js` - Update the `SOCKET_SERVER_URL` constant

### Video Player
Supported video sources are configured in `src/utils/constants.js`:
- YouTube URLs
- Vimeo URLs
- Direct video file URLs (MP4, WebM, OGG)

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. **New Components**: Add to `src/components/`
2. **New Hooks**: Add to `src/hooks/`
3. **New Pages**: Add to `src/pages/`
4. **Utilities**: Add to `src/utils/`

### WebRTC Configuration
WebRTC uses STUN servers configured in `src/utils/constants.js`. For production, you may need to add TURN servers for NAT traversal.

## Browser Requirements

- Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone permissions for video calling
- LocalStorage for user preferences

## Troubleshooting

### Common Issues

1. **Video not syncing**: Check if all participants have a stable internet connection and try the "Sync All" button

2. **Camera/microphone not working**: Ensure browser permissions are granted and devices are not in use by other applications

3. **Connection issues**: Verify the backend server is running on `http://localhost:5000`

4. **Video not loading**: Ensure the video URL is supported and accessible

### Browser Developer Tools
Open browser developer tools (F12) to see console logs for debugging connection and WebRTC issues.

## Future Enhancements

- [ ] Screen sharing capability
- [ ] File sharing in chat
- [ ] Room passwords and moderation
- [ ] User profiles and avatars
- [ ] Recording functionality
- [ ] Mobile app support
- [ ] Multiple video sources
- [ ] Playlist support

## License

This project is part of the Chill Together application suite.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
