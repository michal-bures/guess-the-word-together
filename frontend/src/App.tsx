import { GameProvider } from './context/GameContext'
import { Header } from './components/Header'
import { ChatArea } from './components/ChatArea'
import { QuestionInput } from './components/QuestionInput'
import { PlayersSidebar } from './components/PlayersSidebar'

function App() {
  return (
    <GameProvider>
      <div className="h-screen bg-gray-50 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Header />
          <ChatArea />
          <QuestionInput />
        </div>

        {/* Right Sidebar */}
        <PlayersSidebar />
      </div>
    </GameProvider>
  )
}

export default App