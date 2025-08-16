import { Ollama } from 'ollama'
import * as fs from 'fs'
import * as path from 'path'
import { Answer } from 'shared'

const ollama = new Ollama({ host: 'http://localhost:11434' })

const LLM_MODEL = 'llama3.2:3b'

export class WordGameAI {
    private wordList: string[] | null = null

    private loadWordList(): string[] {
        if (this.wordList !== null) {
            return this.wordList
        }
        const wordListPath = path.join(__dirname, '../../data/word-list.txt')
        const wordListContent = fs.readFileSync(wordListPath, 'utf8')
        this.wordList = wordListContent.split(/\s+/).filter(word => word.length > 0)
        console.log(`Loaded ${this.wordList.length} words from word list`)
        return this.wordList
    }

    async pickRandomWord(): Promise<string> {
        const wordList = this.loadWordList()
        const randomIndex = Math.floor(Math.random() * wordList.length)
        const selectedWord = wordList[randomIndex]
        console.log(`Selected word: ${selectedWord} (${randomIndex + 1}/${wordList.length})`)
        return selectedWord
    }

    async categorizeWord(word: string): Promise<string> {
        const prompt = `What category does the word "${word}" belong to? 
    Choose from: living thing, object, place, food, vehicle, nature, technology, other.
    Return only the category name.`

        try {
            const response = await ollama.generate({
                model: LLM_MODEL,
                prompt: prompt,
                stream: false
            })

            return response.response.trim().toLowerCase()
        } catch (_error) {
            return 'unknown'
        }
    }

    async answerQuestion(
        question: string,
        targetWord: string
    ): Promise<Omit<Answer, 'questionId'>> {
        try {
            // Check if this is a direct guess (contains the word)
            const isDirectGuess = this.checkDirectGuess(question, targetWord)
            if (isDirectGuess) {
                return {
                    answer: `🎉 Correct!`,
                    isCorrectGuess: true
                }
            }

            // Use AI to answer the question
            const answer = await this.askAI(question, targetWord)

            return {
                answer: answer,
                isCorrectGuess: false
            }
        } catch (error) {
            console.error(`Error answering question "${question}":`, error)
            return {
                answer: '⚠️ Error',
                isCorrectGuess: false,
                isError: true
            }
        }
    }

    checkDirectGuess(question: string, targetWord: string): boolean {
        const cleanQuestion = question.toLowerCase().replace(/[^a-z\s]/g, '')
        const cleanTarget = targetWord.toLowerCase()

        // Check if the question contains the exact word
        return cleanQuestion.includes(cleanTarget)
    }

    async askAI(question: string, targetWord: string): Promise<string> {
        const prompt = `
The secret word  is "${targetWord}". 
    
<instructions>
Think step by step:
1. Is this a yes/no question about properties of ${targetWord}?
2. What specific property or characteristic is being asked about?
3. Does ${targetWord} clearly have this property?

Examples:
- "Is it edible?" about "apple" → Yes (apples are food)
- "Is it metal?" about "apple" → No (apples are organic, not metal)
- "Can you hold it?" about "mountain" → No (mountains are too large)
- "Is it alive?" about "tree" → Yes (trees are living organisms)
- "Is it bigger than a car?" about "house" → Yes (houses are typically larger)
- "Is it used for transportation?" about "bicycle" → Yes (bicycles transport people)
- "Does it have wings?" about "airplane" → Yes (airplanes have wings)
- "Is it an animal?" about "dog" → Yes (dogs are animals)
- "Is it big?" about "house" → Maybe (depends on context, could be big or small)
- "Is it plastic?" about "chair" → Maybe (depends on the chair type)
- "Does it store treasure?" about "chest" → Sometimes (it depends on the chest)

Rules:
- Answer "Unclear" if the question isn't a yes/no question, is too vague, or you're unsure
- Answer "Yes" ONLY if the question is ALWAYS, EVERY TIME true about ${targetWord}
- Answer "Sometimes" if the question is sometimes true and sometimes false about ${targetWord}
- Answer "No" if the question is usually false about ${targetWord}
- Answer "Maybe" only if it's ambiguous or depends on context/interpretation

Answer with ONLY one word: Unclear, Yes, No, Maybe, Sometimes.
</instructions>

User said: "${question}"
Secret word is: "${targetWord}"
Your Answer:`

        console.log('Q: ', question, `(secret word: ${targetWord})`)
        const response = await ollama.generate({
            model: LLM_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.1,
                top_p: 0.9
            }
        })

        const rawAnswer = response.response.trim()
        const processedAnswer = this.postProcessAnswer(rawAnswer)
        console.log('A: ', processedAnswer, `(raw: ${rawAnswer})`)

        return processedAnswer
    }

    private postProcessAnswer(rawAnswer: string): string {
        // Clean the response and extract the answer
        const cleaned = rawAnswer.toLowerCase().trim()

        // Look for valid answers in the response
        if (cleaned.includes('yes') && !cleaned.includes('no')) {
            return '✅'
        }
        if (cleaned.includes('no') && !cleaned.includes('yes')) {
            return '❌'
        }
        if (cleaned.includes('maybe')) {
            return 'Maybe'
        }
        if (cleaned.includes('sometimes')) {
            return 'Sometimes'
        }
        if (cleaned.includes('unclear')) {
            return '😛'
        }

        // If the response starts with a valid answer
        if (cleaned.startsWith('yes')) return 'Yes'
        if (cleaned.startsWith('no')) return 'No'
        if (cleaned.startsWith('maybe')) return 'Maybe'
        if (cleaned.startsWith('unclear')) return 'Unclear'

        // Fallback for unexpected responses
        console.warn('Unexpected AI response format:', rawAnswer)
        return 'Unclear'
    }
}

export const wordGameAI = new WordGameAI()
