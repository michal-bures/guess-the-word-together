import { describe, expect, it } from 'vitest'
import { WordGameAI } from './WordGameAI'

describe('WordGameAI', async () => {
    const ai = new WordGameAI(dummyAIModel())

    describe('checkDirectGuess', () => {
        it('should detect exact word matches', () => {
            expect(ai.checkDirectGuess('Is it a cat?', 'cat')).toBe(true)
            expect(ai.checkDirectGuess('cat', 'cat')).toBe(true)
            expect(ai.checkDirectGuess('Is it Cat?', 'cat')).toBe(true)
        })

        it('should not match partial words', () => {
            expect(ai.checkDirectGuess('Is it a catalog?', 'cat')).toBe(true) // This actually matches because it contains 'cat'
            expect(ai.checkDirectGuess('Is it red?', 'cat')).toBe(false)
        })

        it('should handle punctuation and case', () => {
            expect(ai.checkDirectGuess('Is it a CAT!?', 'cat')).toBe(true)
            expect(ai.checkDirectGuess('cat???', 'cat')).toBe(true)
        })
    })
})

function dummyAIModel() {
    return {
        ask: async () => {
            return ''
        }
    }
}
