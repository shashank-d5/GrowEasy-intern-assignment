import OpenAI from 'openai';
import { buildPrompt } from '../prompts/crmPrompt';
import { mapRecord } from './fieldMapper';

const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';
const hasApiKey = apiKey.length > 0;

let openai: OpenAI | null = null;
if (hasApiKey) {
  openai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });
}

const MODEL = 'llama-3.3-70b-versatile';

export async function extractRecords(
  headers: string[],
  batch: Record<string, string>[]
): Promise<any[]> {
  if (!openai) {
    return batch.map((row) => mapRecord(headers, row));
  }

  const prompt = buildPrompt(headers, batch);

  const result = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 8192,
  });

  let text = result.choices[0]?.message?.content?.trim() || '';

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

  if (parsed.length !== batch.length) {
    console.warn(
      `AI returned ${parsed.length} records for batch of ${batch.length}. Padding with nulls.`
    );
    while (parsed.length < batch.length) {
      parsed.push(null);
    }
  }

  return parsed;
}
