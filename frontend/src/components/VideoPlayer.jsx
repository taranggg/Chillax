import { useRef, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

const VideoPlayer = ({ url, socket, roomId, onVideoAction }) => {
  const playerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isReady, setIsReady] = useState(false)
  
  // Track if we should ignore the next play/pause (to prevent loops)
  const ignoringRemoteUpdate = useRef(false)

  useEffect(() => {
    setIsReady(false)
    setDuration(0)
    setProgress(0)
  }, [url])

  // Listen for remote video actions from other participants
  useEffect(() => {
    if (!socket) return

    const beginIgnoreWindow = () => {
      ignoringRemoteUpdate.current = true
      setTimeout(() => {
        ignoringRemoteUpdate.current = false
      }, 500)
    }

    const handleRemotePlay = (data) => {
      if (data.roomId !== roomId) return
      beginIgnoreWindow()
      setPlaying(true)
      const newTime = data.currentTime ?? 0
      if (playerRef.current) {
        playerRef.current.seekTo(newTime)
      }
      if (duration > 0) {
        setProgress(newTime / duration)
      } else {
        setProgress(0)
      }
      setIsReady(true)
    }

    const handleRemotePause = (data) => {
      if (data.roomId !== roomId) return
      beginIgnoreWindow()
      setPlaying(false)
      const newTime = data.currentTime ?? playerRef.current?.getCurrentTime?.() ?? 0
      if (playerRef.current) {
        playerRef.current.seekTo(newTime)
      }
      if (duration > 0) {
        setProgress(newTime / duration)
      } else {
        setProgress(0)
      }
      setIsReady(true)
    }

    const handleRemoteSeek = (data) => {
      if (data.roomId !== roomId) return
      beginIgnoreWindow()
      if (playerRef.current) {
        playerRef.current.seekTo(data.currentTime ?? 0)
      }
      const newTime = data.currentTime ?? 0
      if (duration > 0) {
        setProgress(newTime / duration)
      } else {
        setProgress(0)
      }
      setIsReady(true)
    }

    const handleRemoteSync = (data) => {
      if (data.roomId !== roomId) return
      beginIgnoreWindow()
      if (playerRef.current) {
        playerRef.current.seekTo(data.currentTime ?? 0)
      }
      if (duration > 0) {
        setProgress((data.currentTime ?? 0) / duration)
      } else {
        setProgress(0)
      }
      setPlaying(!!data.playing)
      setIsReady(true)
    }

    const handleVideoChange = (data) => {
      if (data.roomId === roomId) {
        setPlaying(false)
        setProgress(0)
        setDuration(0)
        setIsReady(false)
      }
    }

    socket.on('video-play', handleRemotePlay)
    socket.on('video-pause', handleRemotePause)
    socket.on('video-seek', handleRemoteSeek)
    socket.on('video-sync', handleRemoteSync)
    socket.on('video-url-changed', handleVideoChange)

    return () => {
      socket.off('video-play', handleRemotePlay)
      socket.off('video-pause', handleRemotePause)
      socket.off('video-seek', handleRemoteSeek)
      socket.off('video-sync', handleRemoteSync)
      socket.off('video-url-changed', handleVideoChange)
    }
  }, [socket, roomId, duration])

  // Handle play/pause
  const handlePlayPause = () => {
    if (ignoringRemoteUpdate.current) return

    const newPlaying = !playing
    setPlaying(newPlaying)
    
    if (newPlaying) {
      onVideoAction('play', { currentTime: progress * duration })
    } else {
      onVideoAction('pause', { currentTime: progress * duration })
    }
  }

  // Handle progress update
  const handleProgress = (state) => {
    if (!seeking) {
      setProgress(state.played)
    }

    const playerDuration = playerRef.current?.getDuration?.()
    if (
      playerDuration &&
      !Number.isNaN(playerDuration) &&
      Math.abs(playerDuration - duration) > 0.25
    ) {
      setDuration(playerDuration)
    }

    if (!isReady) {
      setIsReady(true)
    }
  }

  // Handle seek
  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value)
    setProgress(seekTime)
  }

  const handleSeekMouseDown = () => {
    setSeeking(true)
  }

  const handleSeekMouseUp = (e) => {
    setSeeking(false)
    const seekTime = parseFloat(e.target.value)
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime)
      onVideoAction('seek', { seekTime: seekTime * duration })
    }
  }

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Sync button - forces sync with other users
  const handleSync = () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0
    onVideoAction('sync', { 
      currentTime, 
      playing 
    })
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* React Player */}
      {url ? (
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          muted={muted}
          volume={volume}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onReady={() => {
            const playerDuration = playerRef.current?.getDuration?.()
            if (
              playerDuration &&
              !Number.isNaN(playerDuration)
            ) {
              setDuration(playerDuration)
            }
            setIsReady(true)
          }}
          onPlay={() => {
            if (!ignoringRemoteUpdate.current) {
              setPlaying(true)
              onVideoAction('play', { currentTime: progress * duration })
            }
          }}
          onPause={() => {
            if (!ignoringRemoteUpdate.current) {
              setPlaying(false)
              onVideoAction('pause', { currentTime: progress * duration })
            }
          }}
          onError={(error) => {
            console.error('Video player error:', error)
          }}
          config={{
            youtube: {
              playerVars: {
                showinfo: 1,
                controls: 0, // We'll use custom controls
              }
            }
          }}
        />
      ) : (
        <div className="flex flex-col items-center space-y-6 text-gray-400 p-8">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-2">
            <Play className="w-12 h-12" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold mb-3">No Video Selected</h3>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Paste a YouTube URL or video link above to start watching together
            </p>
          </div>
        </div>
      )}

      {/* Modern Custom Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 md:p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={progress}
            onChange={handleSeekChange}
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            className="w-full h-2 bg-gray-600/50 rounded-full appearance-none cursor-pointer slider-modern"
          />
          <div className="flex justify-between text-xs md:text-sm text-gray-300 mt-3">
            <span>{formatTime(progress * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {playing ? (
                <Pause className="w-5 h-5 md:w-7 md:h-7 text-white" />
              ) : (
                <Play className="w-5 h-5 md:w-7 md:h-7 text-white ml-0.5" />
              )}
            </button>

            {/* Volume Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMuted(!muted)}
                className="p-3 md:p-4 hover:bg-white/10 rounded-full transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                )}
              </button>
              <div className="hidden md:block">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-gray-600/50 rounded-full appearance-none cursor-pointer slider-volume"
                />
              </div>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Sync Button */}
            <button
              onClick={handleSync}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Sync All
            </button>
            
            {/* Video Quality Info */}
            {url && (
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>HD</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {url && !isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
