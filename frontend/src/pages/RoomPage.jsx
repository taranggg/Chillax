import { useEffect, useMemo, useRef, useState } from 'react'
import { LogOut, Copy, Check } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'
import ChatBox from '../components/ChatBox'
import { useSocket } from '../hooks/useSocket'
import { useWebRTC } from '../hooks/useWebRTC'
import { API_BASE_URL } from '../utils/constants'
import glitchLogo from '../assets/glitchlong.png'

const RoomPage = ({ roomId, isCreator = false, onLeaveRoom }) => {
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // Default video
  const [copied, setCopied] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)
  
  // Socket connection for real-time sync and chat
  const { 
    socket, 
    participants, 
    messages, 
    sendMessage, 
    isConnected,
    roomState
  } = useSocket(roomId, isCreator)

  // WebRTC for video/audio calls
  const {
    localStream,
    peers,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  } = useWebRTC(socket, roomId, participants)

  const currentParticipant = useMemo(() => participants.find(p => p.isYou), [participants])
  const canControlVideo = !!(currentParticipant?.isHost ?? isCreator)

  useEffect(() => {
    if (roomState.currentVideo && typeof roomState.currentVideo.url === 'string') {
      setVideoUrl(roomState.currentVideo.url)
    }
  }, [roomState.currentVideo])

  // Copy room ID to clipboard
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy room ID:', err)
    }
  }

  // Handle video URL change
  const handleVideoUrlChange = (newUrl) => {
    setVideoUrl(newUrl)
  }

  const handleVideoUrlSubmit = (event) => {
    event.preventDefault()
    if (!socket || !canControlVideo) return

    const trimmedUrl = videoUrl?.trim()
    if (!trimmedUrl) return

    setUploadError(null)
    socket.emit('video-url-change', { url: trimmedUrl, roomId })
  }

  const handleVideoEvent = (action, data) => {
    if (!socket) return

    switch (action) {
      case 'play':
        socket.emit('video-play', { roomId, currentTime: data.currentTime })
        break
      case 'pause':
        socket.emit('video-pause', { roomId, currentTime: data.currentTime })
        break
      case 'seek':
        socket.emit('video-seek', { roomId, currentTime: data.seekTime })
        break
      case 'sync':
        socket.emit('video-sync', { roomId, currentTime: data.currentTime, playing: data.playing })
        break
      default:
        break
    }
  }

  const handleOpenFileDialog = () => {
    if (!canControlVideo) return
    fileInputRef.current?.click()
  }

  const handleLocalFileSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !socket || !canControlVideo) {
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.error || 'Failed to upload video')
      }

      const result = await response.json()
      if (result.url) {
        setVideoUrl(result.url)
        socket.emit('video-url-change', { url: result.url, roomId })
      }
    } catch (error) {
      console.error('Video upload failed:', error)
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-purple-950/80 to-indigo-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 md:px-8 py-4 md:py-5 flex-shrink-0">
        <div className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(59,7,100,0.35)] px-5 md:px-7 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={glitchLogo}
              alt="Glitchy logo"
              className="h-9 md:h-11 w-auto drop-shadow-[0_10px_25px_rgba(168,85,247,0.5)]"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs uppercase tracking-[0.35em] text-purple-200/70">Watch in sync</span>
              <span className="text-sm text-gray-200/80">Room {roomId}</span>
            </div>
            <div className="sm:hidden text-xs text-gray-200/80">Room: {roomId}</div>
            <button
              onClick={copyRoomId}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/15"
              title="Copy Room ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Copy className="w-4 h-4 text-purple-200" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
              <span className="text-xs md:text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <button
              onClick={onLeaveRoom}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 md:px-5 md:py-3 rounded-xl transition-colors text-sm font-medium shadow"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Leave</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Room ID */}
        <div className="md:hidden mt-3 flex items-center space-x-3">
          <span className="text-xs text-gray-400">Room:</span>
          <code className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">{roomId}</code>
          <button
            onClick={copyRoomId}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Copy Room ID"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>
      </header>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-center space-x-3 text-yellow-300 text-sm md:text-base">
            <span>⚠️ Backend server not running.</span>
            <span className="hidden md:inline">Chat, video sync, and calls require a backend server</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row gap-4 px-5 pb-5">
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Video URL Input */}
          <div className="bg-white/6 border border-white/15 backdrop-blur-xl rounded-2xl shadow-[0_12px_45px_rgba(15,6,46,0.45)] p-4 md:p-6">
            <form className="flex flex-col sm:flex-row sm:space-x-3 gap-3 sm:gap-0" onSubmit={handleVideoUrlSubmit}>
              <input
                type="url"
                placeholder="Paste YouTube/video URL here..."
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                disabled={!canControlVideo}
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base text-white placeholder-gray-200/60 focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!canControlVideo}
                className="px-4 md:px-5 py-3 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm md:text-base font-medium transition-colors shadow-lg shadow-purple-900/40"
              >
                Load URL
              </button>
              <button
                type="button"
                onClick={handleOpenFileDialog}
                disabled={!canControlVideo || isUploading}
                className="px-4 md:px-5 py-3 md:py-4 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm md:text-base font-medium transition-colors border border-white/15 shadow"
              >
                {isUploading ? 'Uploading...' : 'Upload Local'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleLocalFileSelected}
              />
            </form>
            {uploadError && (
              <p className="mt-2 text-sm text-red-400">{uploadError}</p>
            )}
          </div>

          {/* Video Player */}
          <div className="flex-1 bg-black/80 min-h-0 relative rounded-[2.2rem] overflow-hidden shadow-[0_40px_80px_rgba(17,0,32,0.6)] border border-white/10 backdrop-blur">
            <VideoPlayer
              url={videoUrl}
              socket={socket}
              roomId={roomId}
              onVideoAction={handleVideoEvent}
            />
          </div>

        </div>

        {/* Chat Area */}
        <div className="lg:w-[420px] w-full flex flex-col min-h-0 lg:flex-none flex-1">
          <div className="flex-1 min-h-[320px] bg-white/7 border border-white/15 rounded-2xl backdrop-blur-xl shadow-[0_18px_60px_rgba(15,6,46,0.5)] overflow-hidden">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              participants={participants}
              localStream={localStream}
              peers={peers}
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomPage
