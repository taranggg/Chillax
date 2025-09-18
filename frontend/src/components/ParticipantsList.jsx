import { Users, Crown, Mic, MicOff, Video, VideoOff } from 'lucide-react'

const ParticipantsList = ({ participants }) => {
  // Get participant color for avatar
  const getParticipantColor = (userId) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ]
    const index = userId ? userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
    return colors[index % colors.length]
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
        <h3 className="font-semibold text-white text-base md:text-lg">
          Participants ({participants.length})
        </h3>
      </div>

      {/* Participants List */}
      <div className="space-y-3 md:space-y-4">
        {participants.length === 0 ? (
          <div className="text-center text-gray-500 py-8 md:py-12">
            <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm md:text-base">No participants yet</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div 
              key={participant.id} 
              className="flex items-center space-x-4 p-3 md:p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-sm md:text-base font-medium ${getParticipantColor(participant.id)}`}>
                {participant.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Participant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white text-sm md:text-base font-medium truncate">
                    {participant.name || `User ${participant.id.slice(0, 4)}`}
                  </span>
                  
                  {/* Host indicator */}
                  {participant.isHost && (
                    <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" title="Room Host" />
                  )}
                  
                  {/* "You" indicator */}
                  {participant.isYou && (
                    <span className="text-xs md:text-sm text-purple-400 font-medium">(You)</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                    participant.isOnline ? 'bg-green-400' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-xs md:text-sm text-gray-400">
                    {participant.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Media Status */}
              <div className="flex items-center space-x-2 md:space-x-3">
                {/* Audio Status */}
                <div className={`p-2 md:p-3 rounded-lg ${
                  participant.audioEnabled 
                    ? 'text-green-400 bg-green-900/30' 
                    : 'text-red-400 bg-red-900/30'
                }`}>
                  {participant.audioEnabled ? (
                    <Mic className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <MicOff className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>

                {/* Video Status */}
                <div className={`p-2 md:p-3 rounded-lg ${
                  participant.videoEnabled 
                    ? 'text-green-400 bg-green-900/30' 
                    : 'text-red-400 bg-red-900/30'
                }`}>
                  {participant.videoEnabled ? (
                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <VideoOff className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Room Stats */}
      {participants.length > 0 && (
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-700">
          <div className="text-sm md:text-base text-gray-400 space-y-2 md:space-y-3">
            <div className="flex justify-between">
              <span>Online:</span>
              <span className="text-white font-medium">{participants.filter(p => p.isOnline).length}</span>
            </div>
            <div className="flex justify-between">
              <span>In call:</span>
              <span className="text-white font-medium">{participants.filter(p => p.audioEnabled || p.videoEnabled).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantsList
