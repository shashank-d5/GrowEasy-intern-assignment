import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from '../prompts/crmPrompt';
import { mapRecord } from './fieldMapper';

const groqKey = process.env.GROQ_API_KEY || '';
const geminiKey = process.env.GEMINI_API_KEY || '';
const hasAnyKey = groqKey.length > 0 || geminiKey.length > 0;

let groqClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

if (groqKey) {
  groqClient = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: groqKey,
  });
}

if (geminiKey) {
  geminiClient = new GoogleGenerativeAI(geminiKey);
}

async function extractWithGroq(prompt: string): Promise<string> {
  if (!groqClient) throw new Error('Groq key not configured');
  const result = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 8192,
  });
  return result.choices[0]?.message?.content?.trim() || '';
}

async function extractWithGemini(prompt: string): Promise<string> {
  if (!geminiClient) throw new Error('Gemini key not configured');
  const model = geminiClient.getGenerativeModel({ model: 'gemini-3.5-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
  });
  return result.response.text().trim();
}

function parseAiResponse(text: string, batchSize: number): any[] {
  text = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) {
    throw new Error('AI response did not contain a valid JSON array');
  }
  text = text.substring(start, end + 1);
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('AI response is not an array');
  }
  if (parsed.length !== batchSize) {
    console.warn(`AI returned ${parsed.length} records for batch of ${batchSize}. Padding with nulls.`);
    while (parsed.length < batchSize) {
      parsed.push(null);
    }
  }
  return parsed;
}

export async function extractRecords(
  headers: string[],
  batch: Record<string, string>[]
): Promise<any[]> {
  if (!hasAnyKey) {
    return batch.map((row) => mapRecord(headers, row));
  }

  const prompt = buildPrompt(headers, batch);
  let text: string;

  if (groqClient) {
    try {
      text = await extractWithGroq(prompt);
    } catch {
      if (geminiClient) {
        text = await extractWithGemini(prompt);
      } else {
        throw new Error('Groq API call failed and no fallback available');
      }
    }
  } else if (geminiClient) {
    text = await extractWithGemini(prompt);
  } else {
    return batch.map((row) => mapRecord(headers, row));
  }

  return parseAiResponse(text, batch.length);
}
