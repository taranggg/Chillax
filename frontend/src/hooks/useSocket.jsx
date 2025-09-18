import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { SOCKET_SERVER_URL } from '../utils/constants.js'

export const useSocket = (roomId, shouldCreateRoom = false) => {
  const [socket, setSocket] = useState(null)
  const [participants, setParticipants] = useState([])
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasShownConnectionError, setHasShownConnectionError] = useState(false)
  const currentUserRef = useRef(null)
  const roomCreatedRef = useRef(false)
  const [roomState, setRoomState] = useState({ currentVideo: null })

  useEffect(() => {
    roomCreatedRef.current = false
    setRoomState({ currentVideo: null })
  }, [roomId])

  useEffect(() => {
    if (!roomId) return

    // Connect to socket server
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    const setInitialRoomState = (roomData, userId) => {
      if (!roomData) return

      if (Array.isArray(roomData.participants)) {
        setParticipants(roomData.participants.map(participant => ({
          ...participant,
          isYou: participant.id === userId,
          isOnline: participant.isOnline ?? true,
          audioEnabled: participant.audioEnabled ?? false,
          videoEnabled: participant.videoEnabled ?? false
        })))
      }

      if (roomData.currentVideo) {
        setRoomState(prev => ({
          ...prev,
          currentVideo: roomData.currentVideo
        }))
      }

      if (Array.isArray(roomData.messages)) {
        setMessages(roomData.messages.map(message => ({
          id: message.id ?? `${message.userId}-${Date.now()}`,
          text: message.content ?? message.text ?? '',
          userId: message.userId ?? 'system',
          userName: message.userName ?? 'System',
          timestamp: message.timestamp ? new Date(message.timestamp).getTime() : Date.now(),
          type: message.type ?? (message.userId ? 'user' : 'system')
        })))
      }
    }

    newSocket.on('connect', () => {
      console.log('Connected to server with socket ID:', newSocket.id)
      setIsConnected(true)
      setHasShownConnectionError(false)

      // Set current user after socket connects
      const userName = `User${Math.floor(Math.random() * 1000)}`
      currentUserRef.current = { id: newSocket.id, name: userName }
      
      const handleCreateRoomResponse = (response) => {
        if (response?.success) {
          roomCreatedRef.current = true
          setInitialRoomState(response.room, newSocket.id)
        } else {
          console.error('Failed to create room:', response?.error)
          setMessages(prev => [...prev, {
            id: 'error-' + Date.now(),
            userId: 'system',
            userName: 'System',
            content: response?.error || 'Failed to create room.',
            text: response?.error || 'Failed to create room.',
            timestamp: Date.now(),
            type: 'error'
          }])
        }
      }

      const attemptJoinRoom = () => {
        newSocket.emit('join-room', { roomId, userId: newSocket.id, userName }, (response) => {
          if (response?.success) {
            setInitialRoomState(response.room, newSocket.id)
          } else if (response?.error) {
            console.error('Failed to join room:', response.error)

            // If the room was supposed to be created by us but disappeared, re-create it
            if (shouldCreateRoom && !roomCreatedRef.current) {
              newSocket.emit('create-room', { roomId, name: userName }, handleCreateRoomResponse)
              return
            }

            setMessages(prev => [...prev, {
              id: 'error-' + Date.now(),
              userId: 'system',
              userName: 'System',
              content: response.error,
              text: response.error,
              timestamp: Date.now(),
              type: 'error'
            }])
          }
        })
      }

      if (shouldCreateRoom && !roomCreatedRef.current) {
        newSocket.emit('create-room', { roomId, name: userName }, (response) => {
          if (response?.error === 'Room ID already exists') {
            roomCreatedRef.current = true
            attemptJoinRoom()
            return
          }

          handleCreateRoomResponse(response)
        })
      } else {
        attemptJoinRoom()
      }
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

    newSocket.on('video-url-changed', (data) => {
      setRoomState(prev => ({
        ...prev,
        currentVideo: {
          ...prev.currentVideo,
          url: data.url,
          currentTime: data.currentTime,
          isPlaying: data.isPlaying
        }
      }))
    })

    // Handle chat messages
    newSocket.on('new-message', (data) => {
      console.log('Received message:', data) // Debug log
      console.log('Current user ID:', currentUserRef.current?.id) // Debug log

      const resolvedTimestamp = data.timestamp 
        ? new Date(data.timestamp).getTime()
        : Date.now()

      // Only add messages from other users, not our own (we add those immediately when sending)
      if (data.userId !== currentUserRef.current?.id) {
        setMessages(prev => [...prev, {
          id: data.id || Date.now(),
          text: data.content ?? data.text ?? '',
          userId: data.userId,
          userName: data.userName,
          timestamp: resolvedTimestamp,
          type: data.type ?? 'user'
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
    currentUser: currentUserRef.current,
    roomState
  }
}
