import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

function App() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('test-response', (data: string) => {
      setResponse(data)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit('test-message', message)
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Guess the Word Together
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Connected to server' : 'Disconnected from server'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a test message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!connected || !message.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Collaborative Text Area</h2>
          <textarea
            className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="This will be collaborative soon..."
          />
        </div>
      </div>
    </div>
  )
}

export default App
