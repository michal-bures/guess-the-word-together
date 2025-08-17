export function createAIModel(type: string) {
    switch (type) {
        case 'openai':
            return import('./OpenAIModel').then(module => new module.OpenAIModel())
        case 'ollama':
            return import('./LocalOllamaModel').then(module => new module.LocalOllamaModel())
        default:
            throw new Error(`Unsupported LLM type: ${type}`)
    }
}
