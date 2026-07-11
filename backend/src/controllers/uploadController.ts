import { Request, Response, NextFunction } from 'express';
import { parseCSV } from '../services/csvParser';
import { AppError } from '../middleware/errorHandler';

export function handleUpload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const content = req.file.buffer.toString('utf-8');
    const { headers, rows } = parseCSV(content);

    if (headers.length === 0) {
      throw new AppError('CSV file is empty or has no valid headers', 400);
    }

    res.json({
      headers,
      rows,
      totalRows: rows.length,
    });
  } catch (err) {
    if (err instanceof SyntaxError || (err instanceof Error && err.message.includes('parse'))) {
      return next(new AppError('Invalid CSV format', 400));
    }
    next(err);
  }
}
