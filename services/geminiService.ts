import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    valid: { type: Type.BOOLEAN, description: "Whether the user's word was valid." },
    word: { type: Type.STRING, description: "The word AI plays in response. Null if user word invalid or AI gives up." },
    definition: { type: Type.STRING, description: "A short definition of the AI's word." },
    reason: { type: Type.STRING, description: "Explanation if invalid, or a friendly chat message if valid." },
    win: { type: Type.BOOLEAN, description: "Set to true if the AI cannot find a word and surrenders." },
    dueumLastChar: { type: Type.STRING, description: "The last character of the AI's word, normalized for the next turn (e.g. 륨 -> 윰) if applicable. Otherwise same as last char." }
  },
  required: ["valid", "reason"],
};

const SYSTEM_INSTRUCTION = `
You are an expert Korean Word Chain (끝말잇기) player.
Your goal is to play a fun, educational game with the user.

Rules:
1. Validate User's Word:
   - Must be a valid Korean noun.
   - Must exist in standard Korean dictionaries.
   - Must start with the required character (from the previous turn).
   - Apply strict "Dueum-beopchik" (Example: If previous word ended in '렬', user can start with '열' or '렬').
   - If the user repeats a word already in the history list (provided in prompt), it is INVALID.

2. AI's Turn:
   - If user word is INVALID: Set 'valid' to false and explain why in 'reason'.
   - If user word is VALID:
     - Find a Korean noun starting with the last character of the user's word.
     - Try not to repeat words.
     - Provide a short 'definition' for your word.
     - Set 'dueumLastChar' to help the user. (e.g., if you play '구름', next is '름'->'음' (Dueum-beopchik optional usually, but for this game, provide the sound-changed version if standard, or just the character). Actually, standard rule: provide the raw character, but be lenient on user input next time).
     - If you cannot find a word, set 'win' to true and admit defeat in 'reason'.

Tone: Friendly, encouraging, slightly competitive.
`;

export const playTurn = async (
  userWord: string,
  lastAiWord: string | null,
  history: string[]
): Promise<GeminiResponse> => {
  try {
    const prompt = `
    Current Game Context:
    - Previous Word (ending char): ${lastAiWord ? lastAiWord.slice(-1) : 'None (Start of Game)'}
    - Used Words History: ${JSON.stringify(history)}
    
    User Input: "${userWord}"
    
    Analyze the user's input and play your turn.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7, // Allow some creativity in word choice
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeminiResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      valid: false,
      reason: "AI 연결에 문제가 발생했습니다. 다시 시도해주세요.",
      win: false
    };
  }
};

export const getWelcomeMessage = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Write a short, cheerful 1-sentence welcome message for a Korean Word Chain game user.",
        });
        return response.text || "안녕하세요! 끝말잇기 한 판 어때요?";
    } catch (e) {
        return "안녕하세요! 끝말잇기 시작해볼까요?";
    }
}
