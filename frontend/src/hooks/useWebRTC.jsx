import { useState, useEffect, useRef, useCallback } from 'react'
// Use the browser-friendly build to avoid Node.js polyfill warnings in Vite
import SimplePeerModule from 'simple-peer/simplepeer.min.js'

const SimplePeer = SimplePeerModule.default ?? SimplePeerModule

export const useWebRTC = (socket, roomId, participants = []) => {
  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState({})
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)

  const peersRef = useRef({})
  const localStreamRef = useRef(null)
  const pendingSignalsRef = useRef([])

  // Initialize local media stream once
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

        // Start with both video and audio muted until user opts in
        stream.getVideoTracks().forEach(track => {
          track.enabled = false
        })
        stream.getAudioTracks().forEach(track => {
          track.enabled = false
        })
      } catch (error) {
        console.error('Error accessing media devices:', error)

        // Create a silent/black fallback stream so UI still renders
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

  const removePeer = useCallback((userId) => {
    const existingPeer = peersRef.current[userId]
    if (existingPeer) {
      delete peersRef.current[userId]
      if (typeof existingPeer.destroy === 'function') {
        existingPeer.destroy()
      }
    }

    setPeers(prev => {
      if (!prev[userId]) return prev
      const updated = { ...prev }
      delete updated[userId]
      return updated
    })
  }, [])

  const createPeer = useCallback((userId, initiator = false, metadata = {}, incomingSignal = null) => {
    if (!socket || !roomId || !localStreamRef.current) return null

    let peer = peersRef.current[userId]
    if (peer) {
      if (incomingSignal) {
        peer.signal(incomingSignal)
      }
      return peer
    }

    peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localStreamRef.current
    })

    peersRef.current[userId] = peer

    const displayName = metadata.name || `User ${userId.slice(0, 4)}`
    const initialAudio = metadata.audioEnabled ?? true
    const initialVideo = metadata.videoEnabled ?? true

    peer.on('signal', signal => {
      socket.emit('webrtc-signal', {
        roomId,
        signal,
        to: userId
      })
    })

    peer.on('stream', stream => {
      setPeers(prev => ({
        ...prev,
        [userId]: {
          peer,
          stream,
          audioEnabled: initialAudio,
          videoEnabled: initialVideo,
          name: displayName
        }
      }))
    })

    peer.on('close', () => {
      removePeer(userId)
    })

    peer.on('error', error => {
      console.error('Peer error:', error)
    })

    if (incomingSignal) {
      peer.signal(incomingSignal)
    }

    return peer
  }, [socket, roomId, removePeer])

  const processSignal = useCallback((data) => {
    const peer = createPeer(data.from, false, { name: data.fromName }, data.signal)
    if (!peer && data.signal) {
      createPeer(data.from, false, { name: data.fromName }, data.signal)
    }
  }, [createPeer])

  // React to socket events for signaling and presence
  useEffect(() => {
    if (!socket) return

    const handleUserJoined = (data) => {
      if (!localStreamRef.current || data.userId === socket.id) return
      createPeer(data.userId, true, { name: data.userName })
    }

    const handleWebRTCSignal = (data) => {
      if (data.roomId && data.roomId !== roomId) return
      if (data.to !== socket.id) return

      if (!localStreamRef.current) {
        pendingSignalsRef.current.push(data)
        return
      }

      processSignal(data)
    }

    const handleUserLeft = (data) => {
      removePeer(data.userId)
    }

    const handleMediaStatus = (data) => {
      if (data.roomId && data.roomId !== roomId) return
      setPeers(prev => {
        if (!prev[data.userId]) return prev
        return {
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            audioEnabled: data.audioEnabled ?? prev[data.userId].audioEnabled,
            videoEnabled: data.videoEnabled ?? prev[data.userId].videoEnabled
          }
        }
      })
    }

    socket.on('user-joined', handleUserJoined)
    socket.on('webrtc-signal', handleWebRTCSignal)
    socket.on('user-left', handleUserLeft)
    socket.on('media-status-update', handleMediaStatus)

    return () => {
      socket.off('user-joined', handleUserJoined)
      socket.off('webrtc-signal', handleWebRTCSignal)
      socket.off('user-left', handleUserLeft)
      socket.off('media-status-update', handleMediaStatus)
    }
  }, [socket, roomId, createPeer, removePeer, processSignal])

  // Replay any buffered signals once media access is granted
  useEffect(() => {
    if (!localStreamRef.current) return

    const pending = pendingSignalsRef.current.splice(0, pendingSignalsRef.current.length)
    pending.forEach(processSignal)
  }, [localStream, processSignal])

  // Keep peer metadata aligned with participant updates
  useEffect(() => {
    const others = participants.filter(participant => participant.id && participant.id !== socket.id)

    others.forEach(participant => {
      setPeers(prev => {
        if (!prev[participant.id]) return prev
        return {
          ...prev,
          [participant.id]: {
            ...prev[participant.id],
            name: participant.name || prev[participant.id].name,
            audioEnabled: participant.audioEnabled ?? prev[participant.id].audioEnabled,
            videoEnabled: participant.videoEnabled ?? prev[participant.id].videoEnabled
          }
        }
      })
    })

    Object.keys(peersRef.current).forEach(peerId => {
      if (!others.some(participant => participant.id === peerId)) {
        removePeer(peerId)
      }
    })
  }, [participants, socket, removePeer])

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      const newVideoState = !isVideoEnabled

      videoTracks.forEach(track => {
        track.enabled = newVideoState
      })

      setIsVideoEnabled(newVideoState)

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

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      const newAudioState = !isAudioEnabled

      audioTracks.forEach(track => {
        track.enabled = newAudioState
      })

      setIsAudioEnabled(newAudioState)

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

  // Destroy remaining peers and media on unmount
  useEffect(() => {
    return () => {
      Object.keys(peersRef.current).forEach(peerId => {
        removePeer(peerId)
      })

      const stream = localStreamRef.current
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [removePeer])

  return {
    localStream,
    peers,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  }
}
