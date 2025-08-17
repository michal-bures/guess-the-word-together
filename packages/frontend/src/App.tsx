import { Header } from './components/Header'
import { QuestionsBoard } from './components/QuestionsBoard/QuestionsBoard'
import { QuestionInput } from './components/QuestionInput'
import { PlayersSidebar } from './components/PlayersSidebar'
import { AppContextProvider } from './contexts/AppContext/AppContextProvider'

function App() {
    return (
        <AppContextProvider>
            <div className="h-screen bg-gray-50 flex">
                <div className="flex-1 flex flex-col">
                    <Header />
                    <QuestionsBoard />
                    <QuestionInput />
                </div>
                <PlayersSidebar />
            </div>
        </AppContextProvider>
    )
}

export default App
