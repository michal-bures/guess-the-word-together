export interface AIQuery {
    prompt: string
    maxResponseTokens?: number
    temperature?: number
    topP?: number
}

export interface AIModel {
    ask(prompt: AIQuery): Promise<string>
}
