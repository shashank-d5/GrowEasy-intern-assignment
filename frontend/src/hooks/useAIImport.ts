'use client';
import { useState } from 'react';
import { ImportResponse, CSVRow } from '@/types';
import { importRows } from '@/lib/api';

interface UseAIImportReturn {
  start: (headers: string[], rows: CSVRow[]) => Promise<void>;
  data: ImportResponse | null;
  loading: boolean;
  error: string | null;
  progress: { processed: number; total: number } | null;
  reset: () => void;
}

export function useAIImport(): UseAIImportReturn {
  const [data, setData] = useState<ImportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);

  async function start(headers: string[], rows: CSVRow[]) {
    setLoading(true);
    setError(null);
    setProgress({ processed: 0, total: rows.length });
    try {
      const result = await importRows(headers, rows);
      setData(result);
      setProgress({ processed: rows.length, total: rows.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setData(null);
    setError(null);
    setLoading(false);
    setProgress(null);
  }

  return { start, data, loading, error, progress, reset };
}
