import { Ollama } from 'ollama';
import { capitalize } from "../utils";
import { GameSessionState } from 'shared';
import * as fs from 'fs';
import * as path from 'path';
import {BackendGameSessionState} from "../types";

const ollama = new Ollama({ host: 'http://localhost:11434' });

// Load word list from file
let wordList: string[] = [];
try {
  const wordListPath = path.join(__dirname, '../../data/word-list.txt');
  const wordListContent = fs.readFileSync(wordListPath, 'utf8');
  wordList = wordListContent.split(/\s+/).filter(word => word.length > 0);
  console.log(`Loaded ${wordList.length} words from word list`);
} catch (error) {
  console.error('Failed to load word list, using fallback words:', error);
  wordList = [
    'apple', 'car', 'book', 'tree', 'phone', 'cat', 'house', 'guitar',
    'ocean', 'mountain', 'flower', 'pizza', 'bicycle', 'cloud', 'rainbow'
  ];
}


export class AIService {
  private sessions: Map<string, BackendGameSessionState> = new Map();

  async startNewGame(roomId: string): Promise<{ word: string; category: string; roundNumber: number }> {
    const word = await this.pickRandomWord();
    const category = await this.categorizeWord(word);

    const currentSession = this.sessions.get(roomId);
    const roundNumber = currentSession ? currentSession.roundNumber + 1 : 1;

    this.sessions.set(roomId, {
      secretWord: word,
      category: category,
      roundNumber: roundNumber,
      questions: []
    });

    return { word, category, roundNumber };
  }

  async answerQuestion(roomId: string, question: string, playerId: string): Promise<{
    answer: string;
    isCorrectGuess: boolean;
    explanation?: string;
  }> {
    const session = this.sessions.get(roomId);
    if (!session) {
      throw new Error('No active game session');
    }

    const { secretWord } = session;

    // Check if this is a direct guess (contains the word)
    const isDirectGuess = this.checkDirectGuess(question, secretWord);
    if (isDirectGuess) {
      return {
        answer: 'yes',
        isCorrectGuess: true,
        explanation: `Correct! The word was "${secretWord}"`
      };
    }

    // Use AI to answer the question
    const answer = await this.askAI(question, secretWord);

    // Store the Q&A in session
    const questionData = {
      id: Date.now().toString(),
      question: question,
      answer: answer,
      userId: playerId,
      timestamp: new Date(),
      isCorrectGuess: false
    };

    session.questions.push(questionData);

    return {
      answer: answer,
      isCorrectGuess: false
    };
  }

  private async pickRandomWord(): Promise<string> {
    // Pick a random word from the loaded word list
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const selectedWord = wordList[randomIndex];
    console.log(`Selected word: ${selectedWord} (${randomIndex + 1}/${wordList.length})`);
    return selectedWord;
  }

  private async categorizeWord(word: string): Promise<string> {
    const prompt = `What category does the word "${word}" belong to? 
    Choose from: living thing, object, place, food, vehicle, nature, technology, other.
    Return only the category name.`;

    try {
      const response = await ollama.generate({
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false
      });

      return response.response.trim().toLowerCase();
    } catch (error) {
      return 'unknown';
    }
  }

  private checkDirectGuess(question: string, targetWord: string): boolean {
    const cleanQuestion = question.toLowerCase().replace(/[^a-z\s]/g, '');
    const cleanTarget = targetWord.toLowerCase();

    // Check if the question contains the exact word
    return cleanQuestion.includes(cleanTarget);
  }

  private async askAI(question: string, targetWord: string): Promise<string> {
    const prompt = `I'm thinking of the word "${targetWord}". 
    Someone said: "${question}"
    
    Answer with just one word: "Yes", "No", "Maybe" or "Unclear".
    
    Rules:
    - Answer "Unclear" if the messages isn't a yes/no question, it is too vague or you're not sure how to answer without being misleading
    - Answer "Yes" if the question is clearly true about ${targetWord}
    - Answer "No" if the question is clearly false about ${targetWord}  
    - Answer "Maybe" only if it's genuinely ambiguous or depends on context
    - Be helpful but not too obvious
    
    Answer:`;

    try {
      console.log('Q: ', question, `(thinking of:${targetWord})`);
      const response = await ollama.generate({
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false
      });

      const answer = capitalize(response.response.trim());
      console.log('A: ', answer);

      return answer;
    } catch (error) {
      console.log('AI service error:', error);
      return 'oops, something went wrong trying to answer that question';
    }
  }

  getGameSession(roomId: string): GameSessionState | undefined {
    return this.sessions.get(roomId);
  }

  endGame(roomId: string): void {
    this.sessions.delete(roomId);
  }
}

export const aiService = new AIService();
