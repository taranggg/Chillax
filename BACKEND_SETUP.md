# Backend Server Setup Instructions

Since the frontend is ready to connect to a backend server, here are the instructions to set up a basic Socket.IO server for testing:

## Quick Backend Server Setup

Create a simple Node.js + Socket.IO server in the `Backend` folder:

### 1. Initialize Backend Project
```bash
cd ../Backend
npm init -y
npm install express socket.io cors
```

### 2. Create server.js
```javascript
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const httpServer = createServer(app)

// Configure CORS
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}))

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"]
  }
})

// Store rooms and participants
const rooms = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle joining a room
  socket.on('join-room', (data) => {
    const { roomId, userId, userName } = data
    
    socket.join(roomId)
    socket.userId = userId
    socket.userName = userName
    socket.roomId = roomId

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: new Map(),
        host: userId
      })
    }

    const room = rooms.get(roomId)
    room.participants.set(userId, {
      id: userId,
      name: userName,
      socketId: socket.id,
      isHost: room.host === userId,
      isOnline: true,
      audioEnabled: false,
      videoEnabled: false
    })

    // Notify room about new participant
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      isHost: room.host === userId
    })

    // Send updated participants list to all
    const participants = Array.from(room.participants.values())
    io.to(roomId).emit('participants-update', { participants })
  })

  // Handle video synchronization
  socket.on('video-action', (data) => {
    socket.to(data.roomId).emit('video-action', data)
  })

  socket.on('video-change', (data) => {
    socket.to(data.roomId).emit('video-change', data)
  })

  // Handle chat messages
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('new-message', data)
  })

  // Handle WebRTC signaling
  socket.on('webrtc-signal', (data) => {
    socket.to(data.to).emit('webrtc-signal', data)
  })

  // Handle media status updates
  socket.on('media-status-update', (data) => {
    const room = rooms.get(data.roomId)
    if (room && room.participants.has(data.userId)) {
      const participant = room.participants.get(data.userId)
      participant.audioEnabled = data.audioEnabled
      participant.videoEnabled = data.videoEnabled
      
      socket.to(data.roomId).emit('media-status-update', data)
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    if (socket.roomId && socket.userId) {
      const room = rooms.get(socket.roomId)
      if (room) {
        room.participants.delete(socket.userId)
        
        // Notify room about user leaving
        socket.to(socket.roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName
        })

        // Update participants list
        const participants = Array.from(room.participants.values())
        socket.to(socket.roomId).emit('participants-update', { participants })

        // Clean up empty rooms
        if (room.participants.size === 0) {
          rooms.delete(socket.roomId)
        }
      }
    }
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

### 3. Run the Backend Server
```bash
node server.js
```

The backend server will run on `http://localhost:5000` and handle:
- Room creation and joining
- Real-time video synchronization
- Chat messages
- WebRTC signaling for video/audio calls
- Participant management

## Testing the Complete Application

1. **Start Backend**: Run `node server.js` in the Backend folder
2. **Start Frontend**: Run `npm run dev` in the frontend folder  
3. **Open Browser**: Navigate to `http://localhost:5174`
4. **Test Features**:
   - Create a room and copy the room ID
   - Open another browser tab/window and join the same room
   - Test video synchronization by pasting a YouTube URL
   - Test chat functionality
   - Test video/audio calling (requires camera/microphone permissions)

The frontend is fully functional and will connect to any Socket.IO server that implements the expected events!
