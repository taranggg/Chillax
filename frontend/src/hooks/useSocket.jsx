import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { SOCKET_SERVER_URL } from '../utils/constants.js'

export const useSocket = (roomId, shouldCreateRoom = false) => {
  const [socket, setSocket] = useState(null)
  const [participants, setParticipants] = useState([])
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasShownConnectionError, setHasShownConnectionError] = useState(false)
  const [roomCreated, setRoomCreated] = useState(false)
  const currentUserRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    // Connect to socket server
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to server with socket ID:', newSocket.id)
      // Set current user after socket connects
      const userName = `User${Math.floor(Math.random() * 1000)}`
      currentUserRef.current = { id: newSocket.id, name: userName }
      
      // Join the room
      newSocket.emit('join-room', { roomId, userId: newSocket.id, userName })
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('connect_error', (error) => {
      setIsConnected(false)
      console.error('Connection error:', error)
      
      // Only show one connection error message
      if (!hasShownConnectionError) {
        setHasShownConnectionError(true)
        setMessages([{
          id: 'error-' + Date.now(),
          userId: 'system',
          userName: 'System',
          content: 'Connection lost. Check if the backend server is running.',
          timestamp: new Date(),
          type: 'error'
        }])
      }
    })

    // Handle room events
    newSocket.on('user-joined', (data) => {
      setParticipants(prev => {
        const existing = prev.find(p => p.id === data.userId)
        if (existing) return prev
        
        return [...prev, {
          id: data.userId,
          name: data.userName,
          isOnline: true,
          isHost: data.isHost,
          isYou: data.userId === currentUserRef.current?.id,
          audioEnabled: false,
          videoEnabled: false,
          joinedAt: Date.now()
        }]
      })

      // Add system message
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: `${data.userName} joined the room`,
        timestamp: Date.now(),
        userId: 'system'
      }])
    })

    newSocket.on('user-left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId))
      
      // Add system message
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: `${data.userName} left the room`,
        timestamp: Date.now(),
        userId: 'system'
      }])
    })

    newSocket.on('participants-update', (data) => {
      setParticipants(data.participants.map(p => ({
        ...p,
        isYou: p.id === currentUserRef.current?.id
      })))
    })

    // Handle chat messages
    newSocket.on('new-message', (data) => {
      console.log('Received message:', data) // Debug log
      console.log('Current user ID:', currentUserRef.current?.id) // Debug log
      
      // Only add messages from other users, not our own (we add those immediately when sending)
      if (data.userId !== currentUserRef.current?.id) {
        setMessages(prev => [...prev, {
          id: data.id || Date.now(),
          text: data.content,
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp || Date.now(),
          type: 'user'
        }])
      }
    })

    // Handle WebRTC signaling (for simple-peer)
    newSocket.on('webrtc-signal', (data) => {
      // This will be handled by the useWebRTC hook
      console.log('WebRTC signal received:', data)
    })

    // Handle media status updates
    newSocket.on('media-status-update', (data) => {
      setParticipants(prev => prev.map(p => 
        p.id === data.userId 
          ? { 
              ...p, 
              audioEnabled: data.audioEnabled, 
              videoEnabled: data.videoEnabled 
            }
          : p
      ))
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [roomId, hasShownConnectionError, shouldCreateRoom])

  // Send message function
  const sendMessage = (message) => {
    if (socket && message.trim()) {
      const messageData = {
        roomId,
        content: message.trim(),
        userId: currentUserRef.current?.id,
        userName: currentUserRef.current?.name,
        timestamp: Date.now()
      }
      
      // Add the message to local state immediately so user sees their own message
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: message.trim(),
        userId: currentUserRef.current?.id,
        userName: currentUserRef.current?.name,
        timestamp: Date.now(),
        type: 'user'
      }])
      
      socket.emit('send-message', messageData)
    }
  }

  // Update media status
  const updateMediaStatus = (audioEnabled, videoEnabled) => {
    if (socket) {
      socket.emit('media-status-update', {
        roomId,
        userId: currentUserRef.current?.id,
        audioEnabled,
        videoEnabled
      })

      // Update local participant status
      setParticipants(prev => prev.map(p => 
        p.isYou 
          ? { ...p, audioEnabled, videoEnabled }
          : p
      ))
    }
  }

  return {
    socket,
    participants,
    messages,
    sendMessage,
    updateMediaStatus,
    isConnected,
    currentUser: currentUserRef.current
  }
}
