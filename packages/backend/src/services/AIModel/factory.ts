export async function createAIModel(type: string) {
    switch (type) {
        case 'openai': {
            const { OpenAIModel } = await import('./OpenAIModel')
            return new OpenAIModel()
        }
        case 'ollama': {
            const { LocalOllamaModel } = await import('./LocalOllamaModel')
            return new LocalOllamaModel()
        }
        default:
            throw new Error(`Unsupported LLM type: ${type}`)
    }
}
