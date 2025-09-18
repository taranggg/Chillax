// Socket.IO configuration
export const SOCKET_SERVER_URL = 'http://localhost:3001'

// WebRTC configuration
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

// Video player supported URLs
export const SUPPORTED_VIDEO_FORMATS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'dailymotion.com',
  'mp4',
  'webm',
  'ogg'
]

// Default video URLs for testing
export const DEFAULT_VIDEOS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
]

// Chat message types
export const MESSAGE_TYPES = {
  USER: 'user',
  SYSTEM: 'system',
  ERROR: 'error'
}

// Room events
export const ROOM_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  PARTICIPANTS_UPDATE: 'participants-update'
}

// Video sync events
export const VIDEO_EVENTS = {
  VIDEO_CHANGE: 'video-change',
  VIDEO_ACTION: 'video-action',
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  SYNC: 'sync'
}

// Chat events
export const CHAT_EVENTS = {
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop'
}

// WebRTC events
export const WEBRTC_EVENTS = {
  WEBRTC_SIGNAL: 'webrtc-signal',
  MEDIA_STATUS_UPDATE: 'media-status-update',
  PEER_JOINED: 'peer-joined',
  PEER_LEFT: 'peer-left'
}

// Utility functions
export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const generateUserId = () => {
  return Math.random().toString(36).substring(2, 15)
}

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const isValidVideoUrl = (url) => {
  if (!url) return false
  return SUPPORTED_VIDEO_FORMATS.some(format => 
    url.toLowerCase().includes(format)
  )
}

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
