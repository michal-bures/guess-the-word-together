import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  userId?: string
  timestamp: Date
}

interface ConnectedUser {
  id: string
  name: string
  typing: string
  lastTyped: Date
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [question, setQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
      setCurrentUserId(newSocket.id!)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('test-response', (data: string) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: data,
        sender: 'ai',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, newMessage])
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const sendQuestion = () => {
    if (socket && question.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: question,
        sender: 'user',
        userId: currentUserId,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, userMessage])
      socket.emit('test-message', question)
      setQuestion('')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold text-gray-900">
              Guess the Word Together
            </h1>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg">Ask your first question to start the game!</p>
              <p className="text-sm">The AI will respond with yes, no, or maybe.</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Question Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendQuestion()}
              placeholder="Ask a yes/no question about the word..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={sendQuestion}
              disabled={!connected || !question.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Connected Users & Typing Indicators */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 h-16 flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">Players Online</h2>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {connectedUsers.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-sm">No other players yet</p>
              <p className="text-xs text-gray-400">Share the room to invite friends!</p>
            </div>
          ) : (
            connectedUsers.map((user) => (
              <div key={user.id} className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Typing Indicator */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  {user.typing ? (
                    <div className="mt-1 bg-gray-100 rounded-lg p-2 border-l-2 border-blue-400">
                      <p className="text-xs text-gray-600">typing...</p>
                      <p className="text-sm text-gray-800">{user.typing}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Ready to play</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Game Status */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Game Status</p>
            <p className="text-xs text-gray-600">Waiting for word...</p>
            <p className="text-xs text-gray-400 mt-1">Questions asked: 0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
