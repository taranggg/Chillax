import { useState } from 'react'
import { LogOut, Copy, Check } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'
import ChatBox from '../components/ChatBox'
import VideoCall from '../components/VideoCall'
import ParticipantsList from '../components/ParticipantsList'
import { useSocket } from '../hooks/useSocket'
import { useWebRTC } from '../hooks/useWebRTC'

const RoomPage = ({ roomId, isCreator = false, onLeaveRoom }) => {
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // Default video
  const [copied, setCopied] = useState(false)
  
  // Socket connection for real-time sync and chat
  const { 
    socket, 
    participants, 
    messages, 
    sendMessage, 
    isConnected 
  } = useSocket(roomId, isCreator)

  // WebRTC for video/audio calls
  const {
    localStream,
    peers,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  } = useWebRTC(socket, roomId)

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
    // Emit video change to other participants
    if (socket) {
      socket.emit('video-change', { url: newUrl, roomId })
    }
  }

  // Handle video sync events
  const handleVideoSync = (action, data) => {
    if (socket) {
      socket.emit('video-action', {
        action,
        data,
        roomId,
        timestamp: Date.now()
      })
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 md:px-8 py-4 md:py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            <h1 className="text-lg md:text-xl font-bold text-purple-400">Chill Together</h1>
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-gray-400">Room:</span>
              <code className="bg-gray-700 px-3 py-2 rounded-lg text-sm font-mono">{roomId}</code>
              <button
                onClick={copyRoomId}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy Room ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs md:text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <button
              onClick={onLeaveRoom}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 md:px-5 md:py-3 rounded-lg transition-colors text-sm font-medium"
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
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Video URL Input */}
          <div className="bg-gray-800 p-4 md:p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex space-x-3">
              <input
                type="url"
                placeholder="Paste YouTube/video URL here..."
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 md:px-5 py-3 md:py-4 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 bg-black min-h-0 relative">
            <VideoPlayer
              url={videoUrl}
              socket={socket}
              roomId={roomId}
              onVideoAction={handleVideoSync}
            />
          </div>

          {/* Video Call Controls */}
          <div className="flex-shrink-0">
            <VideoCall
              localStream={localStream}
              peers={peers}
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        </div>

        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:flex w-80 xl:w-96 bg-gray-800 border-l border-gray-700 flex-col min-h-0">
          {/* Participants */}
          <div className="border-b border-gray-700 flex-shrink-0">
            <ParticipantsList participants={participants} />
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              participants={participants}
            />
          </div>
        </div>

        {/* Mobile Bottom Panel */}
        <div className="lg:hidden bg-gray-800 border-t border-gray-700 h-64 flex-shrink-0">
          <div className="flex h-full">
            {/* Mobile Participants */}
            <div className="w-1/3 border-r border-gray-700">
              <ParticipantsList participants={participants} />
            </div>
            
            {/* Mobile Chat */}
            <div className="flex-1">
              <ChatBox
                messages={messages}
                onSendMessage={sendMessage}
                participants={participants}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomPage
