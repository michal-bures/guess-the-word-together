import { Ollama } from 'ollama'
import { AIModel, AIQuery } from './types'

const LLM_MODEL = 'llama3.2:3b'

export class LocalOllamaModel implements AIModel {
    ollama = new Ollama({ host: 'http://localhost:11434' })

    async ask(query: AIQuery): Promise<string> {
        const response = await this.ollama.generate({
            model: LLM_MODEL,
            prompt: query.prompt,
            stream: false,
            options: {
                temperature: query.temperature,
                top_p: query.topP
            }
        })

        return response.response.trim().toLowerCase()
    }
}
