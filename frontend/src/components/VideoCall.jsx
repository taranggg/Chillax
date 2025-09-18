import React, { useRef, useEffect } from 'react'
import { Video, VideoOff, MicOff } from 'lucide-react'

const VideoCall = ({
  localStream,
  peers,
  toggleVideo,
  toggleAudio,
  isVideoEnabled,
  isAudioEnabled
}) => {
  const localVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const peerEntries = Object.entries(peers)

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-3 overflow-x-auto pb-1">
        <CallCircle
          ref={localVideoRef}
          label="You"
          stream={localStream}
          videoEnabled={isVideoEnabled}
          audioEnabled={isAudioEnabled}
          isLocal
        />
        {peerEntries.map(([peerId, peer]) => (
          <CallCircle
            key={peerId}
            label={peer.name || `User ${peerId.slice(0, 4)}`}
            stream={peer.stream}
            videoEnabled={peer.videoEnabled}
            audioEnabled={peer.audioEnabled}
          />
        ))}
      </div>
    </div>
  )
}

const CallCircle = React.forwardRef(({ label, stream, videoEnabled, audioEnabled, isLocal = false }, videoRef) => {
  const [expanded, setExpanded] = React.useState(false)

  useEffect(() => {
    if (videoRef?.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, videoRef])

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="relative rounded-full border border-white/30 shadow-[0_10px_30px_rgba(88,28,135,0.45)] overflow-hidden bg-purple-950/50 transition-all duration-300 ease-out"
        style={{
          width: expanded ? '6.5rem' : '4rem',
          height: expanded ? '6.5rem' : '4rem'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${videoEnabled ? '' : 'opacity-30'}`}
        />
        {!videoEnabled && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <VideoOff className="w-6 h-6 text-purple-200" />
          </div>
        )}
        {!audioEnabled && !isLocal && (
          <div className="absolute bottom-1 right-1 bg-red-500 rounded-full p-1 shadow">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
      </button>
      <span className="text-xs text-gray-200/80 truncate max-w-[80px] text-center">{label}</span>
    </div>
  )
})

CallCircle.displayName = 'CallCircle'

export default VideoCall
