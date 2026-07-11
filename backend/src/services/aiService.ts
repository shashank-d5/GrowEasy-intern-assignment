import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from '../prompts/crmPrompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

export async function extractRecords(
  headers: string[],
  batch: Record<string, string>[]
): Promise<any[]> {
  const prompt = buildPrompt(headers, batch);
  const model = getModel();

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  });

  const response = result.response;
  let text = response.text().trim();

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
