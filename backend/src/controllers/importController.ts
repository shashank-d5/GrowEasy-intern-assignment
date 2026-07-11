import { Request, Response, NextFunction } from 'express';
import { processBatches } from '../services/batchProcessor';
import { AppError } from '../middleware/errorHandler';

export async function handleImport(req: Request, res: Response, next: NextFunction) {
  try {
    const { headers, rows } = req.body;

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      throw new AppError('Headers are required', 400);
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new AppError('Rows are required', 400);
    }

    if (rows.length > 5000) {
      throw new AppError('Maximum 5000 rows per import', 400);
    }

    const result = await processBatches(headers, rows, (processed, total, batch, totalBatches) => {
      console.log(`Processing: ${processed}/${total} records (batch ${batch}/${totalBatches})`);
    });

    res.json({
      records: result.records,
      imported: result.records.length,
      skipped: result.skippedCount,
      errors: result.errors,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    if (err instanceof Error && err.message.includes('API_KEY')) {
      return next(new AppError('AI service configuration error. Check your API key.', 500));
    }
    next(err);
  }
}
