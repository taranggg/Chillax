import { useState } from 'react'
import { Users } from 'lucide-react'
import glitchLogo from '../assets/glitchlong.png'

const HomePage = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoom = () => {
    setIsCreating(true)
    
    // Generate a room ID and let the RoomPage handle creation
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    setTimeout(() => {
      setIsCreating(false)
      onJoinRoom(newRoomId, true) // Pass true to indicate this should be created
    }, 500)
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (roomId.trim()) {
      onJoinRoom(roomId.trim())
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/85 to-indigo-900 px-4 py-10">
      <div className="max-w-md w-full mx-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center">
            <img src={glitchLogo} alt="Glitchy" className="h-16 w-auto drop-shadow-[0_20px_45px_rgba(168,85,247,0.55)]" />
          </div>
          <p className="text-gray-200 text-base leading-relaxed">
            Stream YouTube links, local videos, and voice/video chat — all in perfect sync with your crew.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_25px_70px_rgba(59,7,100,0.45)] border border-white/15">
          {/* Create Room Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Create a Room</h2>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Room...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  Create New Room
                </>
              )}
            </button>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-400" />
            <span className="px-3 text-gray-300 text-sm">OR</span>
            <hr className="flex-1 border-gray-400" />
          </div>

          {/* Join Room Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Join a Room</h2>
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!roomId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Share room IDs with friends to watch together!
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
