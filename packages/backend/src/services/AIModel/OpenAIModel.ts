import { AIModel, AIQuery } from './types'
import OpenAI from 'openai'
import { config } from '../../config'

const LLM_MODEL = 'gpt-4o-mini'

export class OpenAIModel implements AIModel {
    openai = new OpenAI({
        apiKey: config.openAIApiKey
    })

    async ask(query: AIQuery): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: LLM_MODEL,
            messages: [{ role: 'user', content: query.prompt }],
            max_completion_tokens: query.maxResponseTokens,
            temperature: query.temperature,
            top_p: query.topP
        })
        return response.choices[0]?.message?.content?.trim() || 'Unclear'
    }
}
