import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174" // Additional port for development
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174" // Additional port for development
  ],
  credentials: true
}));
app.use(express.json());

// In-memory storage (in production, use Redis or database)
const rooms = new Map();
const users = new Map();

// Room management utilities
class Room {
  constructor(id, host) {
    this.id = id;
    this.host = host;
    this.participants = new Map();
    this.currentVideo = {
      url: '',
      currentTime: 0,
      isPlaying: false,
      duration: 0
    };
    this.messages = [];
    this.createdAt = new Date();
  }

  addParticipant(user) {
    this.participants.set(user.id, {
      ...user,
      joinedAt: new Date(),
      isOnline: true,
      audioEnabled: false,
      videoEnabled: false
    });
  }

  removeParticipant(userId) {
    this.participants.delete(userId);
  }

  getParticipants() {
    return Array.from(this.participants.values());
  }

  updateParticipant(userId, updates) {
    const participant = this.participants.get(userId);
    if (participant) {
      this.participants.set(userId, { ...participant, ...updates });
    }
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    });
    
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
  }

  updateVideo(videoData) {
    this.currentVideo = { ...this.currentVideo, ...videoData };
  }
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: room.id,
    participantCount: room.participants.size,
    currentVideo: room.currentVideo,
    createdAt: room.createdAt
  });
});

app.get('/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    participantCount: room.participants.size,
    createdAt: room.createdAt
  }));
  
  res.json(roomList);
});

// Socket.IO Connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create or join room
  socket.on('create-room', (userData, callback) => {
    const roomId = userData.roomId || uuidv4().substring(0, 8);
    
    // Check if room already exists
    if (rooms.has(roomId)) {
      return callback({ success: false, error: 'Room ID already exists' });
    }
    
    const user = {
      id: socket.id,
      name: userData.name || `User-${socket.id.substring(0, 6)}`,
      isHost: true
    };

    const room = new Room(roomId, user);
    room.addParticipant(user);
    
    rooms.set(roomId, room);
    users.set(socket.id, { ...user, roomId });

    socket.join(roomId);
    
    console.log(`Room ${roomId} created by ${user.name}`);
    
    callback({
      success: true,
      roomId,
      user,
      room: {
        id: room.id,
        participants: room.getParticipants(),
        currentVideo: room.currentVideo,
        messages: room.messages
      }
    });
  });

  socket.on('join-room', (data, callback) => {
    const { roomId, name, userName } = data;
    const room = rooms.get(roomId);

    if (!room) {
      if (callback && typeof callback === 'function') {
        return callback({ success: false, error: 'Room not found' });
      }
      return;
    }

    const user = {
      id: socket.id,
      name: userName || name || `User-${socket.id.substring(0, 6)}`,
      isHost: false
    };

    room.addParticipant(user);
    users.set(socket.id, { ...user, roomId });

    socket.join(roomId);
    
    console.log(`${user.name} joined room ${roomId}`);

    // Notify existing participants
    socket.to(roomId).emit('user-joined', {
      userId: user.id,
      userName: user.name,
      isHost: user.isHost,
      participants: room.getParticipants()
    });

    if (callback && typeof callback === 'function') {
      callback({
        success: true,
        user,
        room: {
          id: room.id,
          participants: room.getParticipants(),
          currentVideo: room.currentVideo,
          messages: room.messages
        }
      });
    }
  });

  // Video synchronization
  socket.on('video-play', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    room.updateVideo({
      isPlaying: true,
      currentTime: data.currentTime || 0
    });

    socket.to(user.roomId).emit('video-play', {
      currentTime: data.currentTime,
      timestamp: Date.now()
    });

    console.log(`Video play in room ${user.roomId} at ${data.currentTime}s`);
  });

  socket.on('video-pause', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    room.updateVideo({
      isPlaying: false,
      currentTime: data.currentTime || 0
    });

    socket.to(user.roomId).emit('video-pause', {
      currentTime: data.currentTime,
      timestamp: Date.now()
    });

    console.log(`Video pause in room ${user.roomId} at ${data.currentTime}s`);
  });

  socket.on('video-seek', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    room.updateVideo({
      currentTime: data.currentTime
    });

    socket.to(user.roomId).emit('video-seek', {
      currentTime: data.currentTime,
      timestamp: Date.now()
    });

    console.log(`Video seek in room ${user.roomId} to ${data.currentTime}s`);
  });

  socket.on('video-url-change', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room || !user.isHost) return; // Only host can change video

    room.updateVideo({
      url: data.url,
      currentTime: 0,
      isPlaying: false
    });

    io.to(user.roomId).emit('video-url-changed', {
      url: data.url,
      currentTime: 0,
      isPlaying: false
    });

    console.log(`Video URL changed in room ${user.roomId} to ${data.url}`);
  });

  // Chat functionality
  socket.on('send-message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    const message = {
      userId: user.id,
      userName: user.name,
      content: data.content,
      type: data.type || 'text'
    };

    room.addMessage(message);

    io.to(user.roomId).emit('new-message', {
      ...message,
      id: room.messages[room.messages.length - 1].id,
      timestamp: room.messages[room.messages.length - 1].timestamp
    });

    console.log(`Message from ${user.name} in room ${user.roomId}: ${data.content}`);
  });

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(data.targetId).emit('webrtc-offer', {
      offer: data.offer,
      fromId: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.targetId).emit('webrtc-answer', {
      answer: data.answer,
      fromId: socket.id
    });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(data.targetId).emit('webrtc-ice-candidate', {
      candidate: data.candidate,
      fromId: socket.id
    });
  });

  // Media status updates
  socket.on('toggle-audio', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    room.updateParticipant(socket.id, { audioEnabled: data.enabled });

    socket.to(user.roomId).emit('user-audio-toggled', {
      userId: socket.id,
      enabled: data.enabled
    });
  });

  socket.on('toggle-video', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    room.updateParticipant(socket.id, { videoEnabled: data.enabled });

    socket.to(user.roomId).emit('user-video-toggled', {
      userId: socket.id,
      enabled: data.enabled
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      const room = rooms.get(user.roomId);
      
      if (room) {
        room.removeParticipant(socket.id);
        
        // Notify other participants
        socket.to(user.roomId).emit('user-left', {
          userId: socket.id,
          userName: user.name,
          participants: room.getParticipants()
        });

        // If room is empty or host left, clean up
        if (room.participants.size === 0 || user.isHost) {
          rooms.delete(user.roomId);
          console.log(`Room ${user.roomId} deleted`);
        } else if (user.isHost) {
          // Transfer host to another participant
          const participants = room.getParticipants();
          if (participants.length > 0) {
            const newHost = participants[0];
            room.host = newHost;
            room.updateParticipant(newHost.id, { isHost: true });
            
            io.to(user.roomId).emit('host-changed', {
              newHostId: newHost.id,
              newHostName: newHost.name
            });
          }
        }
      }
      
      users.delete(socket.id);
      console.log(`User ${user.name} disconnected from room ${user.roomId}`);
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Chill Together Backend running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
