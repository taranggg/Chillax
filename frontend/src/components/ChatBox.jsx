import { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react";
import VideoCall from "./VideoCall";

const ChatBox = ({
  messages,
  onSendMessage,
  participants,
  localStream,
  peers,
  toggleVideo,
  toggleAudio,
  isVideoEnabled,
  isAudioEnabled,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      inputRef.current?.focus();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get participant name by ID
  const getParticipantName = (userId) => {
    const participant = participants.find((p) => p.id === userId);
    return participant?.name || "Unknown User";
  };

  // Get participant color for avatar
  const getParticipantColor = (userId) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const index = userId
      ? userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 0;
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
          <h3 className="font-semibold text-white text-base md:text-lg">
            Chat
          </h3>
          <span className="text-sm md:text-base text-gray-400 bg-gray-700/70 px-3 py-1 rounded-full">
            {messages.length}
          </span>
        </div>
        {(localStream || Object.keys(peers || {}).length > 0) && (
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-full border transition-colors ${
                isAudioEnabled
                  ? "bg-white/10 border-white/25 text-white"
                  : "bg-red-500/80 border-red-400/60 text-white shadow"
              }`}
              title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
              type="button"
            >
              {isAudioEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-2.5 rounded-full border transition-colors ${
                isVideoEnabled
                  ? "bg-white/10 border-white/25 text-white"
                  : "bg-red-500/80 border-red-400/60 text-white shadow"
              }`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              type="button"
            >
              {isVideoEnabled ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {(localStream || Object.keys(peers || {}).length > 0) && (
        <div className="px-4 md:px-6 pt-4 pb-6 bg-transparent relative">
          <VideoCall
            localStream={localStream}
            peers={peers}
            toggleVideo={toggleVideo}
            toggleAudio={toggleAudio}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
          />
          <div className="pointer-events-none absolute inset-x-6 bottom-[-18px] h-16 bg-gradient-to-b from-gray-900/18 via-gray-900/10 to-transparent blur-xl rounded-[24px]" />
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-hidden relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-900/18 via-gray-900/10 to-transparent blur-xl rounded-[24px]" />
        <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4 custom-scroll">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-12 space-y-4">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <div className="space-y-2">
                <p className="text-lg font-medium">No messages yet...</p>
                <p className="text-sm text-gray-400">Start the conversation!</p>
              </div>
            </div>
          ) : (
            // Remove duplicates and limit to last 30 messages
            messages
              .filter(
                (msg, index, arr) =>
                  index ===
                  arr.findIndex(
                    (m) =>
                      m.text === msg.text &&
                      m.type === msg.type &&
                      Math.abs(m.timestamp - msg.timestamp) < 1000
                  )
              )
              .slice(-30)
              .map((msg) => (
                <div
                  key={`${msg.id}-${msg.timestamp}`}
                  className="flex space-x-3"
                >
                  {/* User Avatar */}
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-sm md:text-base font-medium flex-shrink-0 ${
                      msg.type === "system"
                        ? "bg-yellow-600"
                        : getParticipantColor(msg.userId)
                    }`}
                  >
                    {msg.type === "system"
                      ? "⚠️"
                      : getParticipantName(msg.userId).charAt(0).toUpperCase()}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline space-x-3">
                      <span className="font-medium text-white text-sm md:text-base">
                        {msg.type === "system"
                          ? "System"
                          : getParticipantName(msg.userId)}
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {msg.type === "system" ? (
                      <p className="text-sm md:text-base text-yellow-300 italic break-words font-medium bg-yellow-900/20 p-3 rounded-lg">
                        {msg.text}
                      </p>
                    ) : (
                      <p className="text-sm md:text-base text-gray-200 break-words bg-gray-700/50 p-3 rounded-lg">
                        {msg.text}
                      </p>
                    )}
                  </div>
                </div>
              ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 italic">
                  {isTyping} is typing...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 md:p-5 border-t border-white/10 bg-white/5 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 md:py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm md:text-base"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-3 md:p-4 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </form>

        {/* Character count */}
        {message.length > 400 && (
          <div className="text-right mt-2">
            <span
              className={`text-xs md:text-sm ${
                message.length > 480 ? "text-red-400" : "text-gray-400"
              }`}
            >
              {message.length}/500
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
