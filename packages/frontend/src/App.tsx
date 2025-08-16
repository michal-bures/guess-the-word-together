import { Header } from './components/Header'
import { QuestionsBoard } from './components/QuestionsBoard/QuestionsBoard'
import { QuestionInput } from './components/QuestionInput'
import { PlayersSidebar } from './components/PlayersSidebar'
import { GameProvider } from './contexts/AppContext/AppContextProvider'

function App() {
    return (
        <GameProvider>
            <div className="h-screen bg-gray-50 flex">
                <div className="flex-1 flex flex-col">
                    <Header />
                    <QuestionsBoard />
                    <QuestionInput />
                </div>
                <PlayersSidebar />
            </div>
        </GameProvider>
    )
}

export default App
