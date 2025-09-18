import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [isRoomCreator, setIsRoomCreator] = useState(false)

  const handleJoinRoom = (roomId, wasCreated = false) => {
    setCurrentRoom(roomId)
    setIsRoomCreator(wasCreated)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setIsRoomCreator(false)
  }

  return (
    <div className="bg-gray-900 min-h-screen w-full overflow-hidden">
      {!currentRoom ? (
        <HomePage onJoinRoom={handleJoinRoom} />
      ) : (
        <RoomPage 
          roomId={currentRoom} 
          isCreator={isRoomCreator}
          onLeaveRoom={handleLeaveRoom} 
        />
      )}
    </div>
  )
}

export default App
