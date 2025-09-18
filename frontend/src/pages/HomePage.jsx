import { useState } from 'react'
import { Users, Video } from 'lucide-react'

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-md w-full mx-6">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Video className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Chill Together</h1>
          </div>
          <p className="text-gray-300">
            Watch videos, chat, and video call with friends in sync!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
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
