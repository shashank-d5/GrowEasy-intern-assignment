import { extractRecords } from './aiService';
import { validateAndCleanRecords } from './csvParser';

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processBatches(
  headers: string[],
  rows: Record<string, string>[],
  onProgress?: (processed: number, total: number, currentBatch: number, totalBatches: number) => void
): Promise<{ records: any[]; skippedCount: number; errors: string[] }> {
  const batches: Record<string, string>[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  const totalBatches = batches.length;
  let allParsed: any[] = [];
  let allErrors: string[] = [];
  let overallSkipped = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const parsed = await extractRecords(headers, batch);
        const { records, skipped, errors } = validateAndCleanRecords(parsed);
        allParsed.push(...records);
        overallSkipped += skipped;
        allErrors.push(...errors);
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Batch ${batchIdx + 1}/${totalBatches} attempt ${attempt + 1} failed:`, lastError.message);
        if (attempt < MAX_RETRIES - 1) {
          await delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    if (lastError) {
      allErrors.push(`Batch ${batchIdx + 1} failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
      for (let i = 0; i < batch.length; i++) {
        overallSkipped++;
      }
    }

    if (onProgress) {
      onProgress(allParsed.length, rows.length, batchIdx + 1, totalBatches);
    }

    if (batchIdx < batches.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  return { records: allParsed, skippedCount: overallSkipped, errors: allErrors };
}
