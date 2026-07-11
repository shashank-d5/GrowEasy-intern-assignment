'use client';
import { useState } from 'react';
import { UploadResponse } from '@/types';
import { uploadCSV } from '@/lib/api';

interface UseCSVUploadReturn {
  upload: (file: File) => Promise<void>;
  data: UploadResponse | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCSVUpload(): UseCSVUploadReturn {
  const [data, setData] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadCSV(file);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setData(null);
    setError(null);
    setLoading(false);
  }

  return { upload, data, loading, error, reset };
}
