import { useRef, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, Users } from 'lucide-react'

const VideoCall = ({ 
  localStream, 
  peers, 
  toggleVideo, 
  toggleAudio, 
  isVideoEnabled, 
  isAudioEnabled 
}) => {
  const localVideoRef = useRef(null)

  // Set local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4 md:p-6">
      <div className="flex items-center justify-between">
        {/* Local Video Preview */}
        <div className="flex items-center space-x-3 md:space-x-5">
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-20 h-15 md:w-28 md:h-21 bg-gray-900 rounded-lg object-cover border-2 border-gray-600"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
                <VideoOff className="w-5 h-5 md:w-7 md:h-7 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Peer Videos */}
          <div className="flex space-x-2 md:space-x-3 overflow-x-auto">
            {Object.entries(peers).slice(0, 4).map(([peerId, peer]) => (
              <PeerVideo key={peerId} peerId={peerId} peer={peer} />
            ))}
            {Object.keys(peers).length > 4 && (
              <div className="w-20 h-15 md:w-28 md:h-21 bg-gray-900 rounded-lg flex items-center justify-center text-sm text-gray-400 border-2 border-gray-600">
                +{Object.keys(peers).length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <span className="text-sm md:text-base text-gray-400 mr-2 md:mr-3 hidden sm:flex items-center">
            <Users className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            {Object.keys(peers).length + 1} in call
          </span>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 md:p-4 rounded-full transition-all duration-200 ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-md' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <MicOff className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 md:p-4 rounded-full transition-all duration-200 ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-md' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Component for individual peer videos
const PeerVideo = ({ peerId, peer }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream
    }
  }, [peer.stream])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-20 h-15 md:w-28 md:h-21 bg-gray-900 rounded-lg object-cover border-2 border-gray-600"
      />
      {!peer.videoEnabled && (
        <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
          <VideoOff className="w-5 h-5 md:w-7 md:h-7 text-gray-400" />
        </div>
      )}
      <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
        {peer.name || `User ${peerId.slice(0, 4)}`}
      </div>
      
      {/* Audio indicator */}
      {!peer.audioEnabled && (
        <div className="absolute top-1 right-1 bg-red-600 rounded-full p-1">
          <MicOff className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </div>
      )}
    </div>
  )
}

export default VideoCall
