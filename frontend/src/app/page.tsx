'use client';
import { useState, useCallback } from 'react';
import { Step } from '@/types';
import { useCSVUpload } from '@/hooks/useCSVUpload';
import { useAIImport } from '@/hooks/useAIImport';
import UploadZone from '@/components/UploadZone';
import CSVPreview from '@/components/CSVPreview';
import ParsedResult from '@/components/ParsedResult';
import ProcessingOverlay from '@/components/ProcessingOverlay';

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload CSV' },
  { key: 'preview', label: 'Preview' },
  { key: 'processing', label: 'AI Processing' },
  { key: 'result', label: 'Results' },
];

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const upload = useCSVUpload();
  const aiImport = useAIImport();

  const handleUpload = useCallback(
    async (file: File) => {
      await upload.upload(file);
      if (!upload.error) {
        setStep('preview');
      }
    },
    [upload]
  );

  const handleConfirmImport = useCallback(async () => {
    if (!upload.data) return;
    setStep('processing');
    await aiImport.start(upload.data.headers, upload.data.rows);
    if (!aiImport.error) {
      setStep('result');
    }
  }, [upload.data, aiImport]);

  const handleReset = useCallback(() => {
    upload.reset();
    aiImport.reset();
    setStep('upload');
  }, [upload, aiImport]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                  i === currentStepIndex
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium'
                    : i < currentStepIndex
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {i < currentStepIndex ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      borderColor: i === currentStepIndex ? 'currentColor' : undefined,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        {step === 'upload' && (
          <UploadZone onUpload={handleUpload} loading={upload.loading} />
        )}

        {step === 'preview' && upload.data && (
          <div className="space-y-6">
            <CSVPreview headers={upload.data.headers} rows={upload.data.rows} />
            <div className="flex justify-center gap-3">
              <button
                onClick={handleConfirmImport}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
              >
                Confirm and Import
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {(step === 'processing' || (step === 'result' && aiImport.loading)) && (
          <ProcessingOverlay
            progress={aiImport.progress}
            error={aiImport.error}
          />
        )}

        {step === 'processing' && aiImport.error && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {step === 'result' && aiImport.data && (
          <ParsedResult
            records={aiImport.data.records}
            imported={aiImport.data.imported}
            skipped={aiImport.data.skipped}
            errors={aiImport.data.errors}
            onReset={handleReset}
          />
        )}

        {upload.error && step === 'upload' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {upload.error}
          </div>
        )}
      </div>
    </div>
  );
}
