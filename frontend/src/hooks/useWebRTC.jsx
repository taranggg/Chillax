import { useState, useEffect, useRef } from 'react'
// Use the browser-friendly build to avoid Node.js polyfill warnings in Vite
import SimplePeerModule from 'simple-peer/simplepeer.min.js'

const SimplePeer = SimplePeerModule.default ?? SimplePeerModule

export const useWebRTC = (socket, roomId) => {
  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState({})
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  
  const peersRef = useRef({})
  const localStreamRef = useRef(null)

  // Initialize local media stream
  useEffect(() => {
    let mounted = true

    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        localStreamRef.current = stream
        setLocalStream(stream)
        
        // Initially disable both video and audio
        stream.getVideoTracks().forEach(track => {
          track.enabled = false
        })
        stream.getAudioTracks().forEach(track => {
          track.enabled = false
        })

      } catch (error) {
        console.error('Error accessing media devices:', error)
        
        // Create a silent/black stream as fallback
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = 320
          canvas.height = 240
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          const stream = canvas.captureStream()
          
          if (mounted) {
            localStreamRef.current = stream
            setLocalStream(stream)
          }
        } catch (fallbackError) {
          console.error('Failed to create fallback stream:', fallbackError)
        }
      }
    }

    initializeMedia()

    return () => {
      mounted = false
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Handle WebRTC signaling through socket
  useEffect(() => {
    if (!socket || !localStream) return

  // Create peer connection
  const createPeer = (userId, isInitiator, incomingSignal = null) => {
      if (!localStream || peersRef.current[userId]) return

      const peer = new SimplePeer({
        initiator: isInitiator,
        trickle: false,
        stream: localStream
      })

      peersRef.current[userId] = peer

      peer.on('signal', signal => {
        // Send signaling data through socket
        if (socket) {
          socket.emit('webrtc-signal', {
            roomId,
            signal,
            from: socket.id,
            to: userId
          })
        }
      })

      peer.on('stream', stream => {
        setPeers(prev => ({
          ...prev,
          [userId]: {
            peer,
            stream,
            videoEnabled: true,
            audioEnabled: true,
            name: `User ${userId.slice(0, 4)}`
          }
        }))
      })

      peer.on('error', error => {
        console.error('Peer error:', error)
      })

      peer.on('close', () => {
        if (peersRef.current[userId]) {
          delete peersRef.current[userId]
          setPeers(prev => {
            const newPeers = { ...prev }
            delete newPeers[userId]
            return newPeers
          })
        }
      })

      // If we received an incoming signal, use it
      if (incomingSignal) {
        peer.signal(incomingSignal)
      }

      return peer
    }

    const handleUserJoined = (data) => {
      // Create peer connection for new user
      createPeer(data.userId, true)
    }

    const handleWebRTCSignal = (data) => {
      if (data.roomId !== roomId) return

      const { signal, from, to } = data

      // Only process signals meant for us
      if (to !== socket.id) return

      if (peersRef.current[from]) {
        // Signal existing peer
        peersRef.current[from].signal(signal)
      } else {
        // Create peer for incoming connection
        createPeer(from, false, signal)
      }
    }

    const handleUserLeft = (data) => {
      if (peersRef.current[data.userId]) {
        peersRef.current[data.userId].destroy()
        delete peersRef.current[data.userId]
        
        setPeers(prev => {
          const newPeers = { ...prev }
          delete newPeers[data.userId]
          return newPeers
        })
      }
    }

    socket.on('user-joined', handleUserJoined)
    socket.on('webrtc-signal', handleWebRTCSignal)
    socket.on('user-left', handleUserLeft)

    return () => {
      socket.off('user-joined', handleUserJoined)
      socket.off('webrtc-signal', handleWebRTCSignal)
      socket.off('user-left', handleUserLeft)
    }
  }, [socket, localStream, roomId])

  // Create peer connection
  const createPeer = (userId, isInitiator, incomingSignal = null) => {
    if (!localStream || peersRef.current[userId]) return

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream: localStream
    })

    peersRef.current[userId] = peer

    peer.on('signal', signal => {
      // Send signaling data through socket
      if (socket) {
        socket.emit('webrtc-signal', {
          roomId,
          signal,
          from: socket.id,
          to: userId
        })
      }
    })

    peer.on('stream', stream => {
      setPeers(prev => ({
        ...prev,
        [userId]: {
          peer,
          stream,
          videoEnabled: true,
          audioEnabled: true,
          name: `User ${userId.slice(0, 4)}`
        }
      }))
    })

    peer.on('error', error => {
      console.error('Peer error:', error)
    })

    peer.on('close', () => {
      if (peersRef.current[userId]) {
        delete peersRef.current[userId]
        setPeers(prev => {
          const newPeers = { ...prev }
          delete newPeers[userId]
          return newPeers
        })
      }
    })

    // If we received an incoming signal, use it
    if (incomingSignal) {
      peer.signal(incomingSignal)
    }

    return peer
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      const newVideoState = !isVideoEnabled
      
      videoTracks.forEach(track => {
        track.enabled = newVideoState
      })
      
      setIsVideoEnabled(newVideoState)

      // Notify other participants through socket
      if (socket) {
        socket.emit('media-status-update', {
          roomId,
          userId: socket.id,
          videoEnabled: newVideoState,
          audioEnabled: isAudioEnabled
        })
      }
    }
  }

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      const newAudioState = !isAudioEnabled
      
      audioTracks.forEach(track => {
        track.enabled = newAudioState
      })
      
      setIsAudioEnabled(newAudioState)

      // Notify other participants through socket
      if (socket) {
        socket.emit('media-status-update', {
          roomId,
          userId: socket.id,
          audioEnabled: newAudioState,
          videoEnabled: isVideoEnabled
        })
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    const currentPeers = peersRef.current
    const currentLocalStream = localStreamRef.current

    return () => {
      // Destroy all peer connections
      Object.values(currentPeers).forEach(peer => {
        if (peer && typeof peer.destroy === 'function') {
          peer.destroy()
        }
      })
      
      // Stop local stream
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    localStream,
    peers,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  }
}
