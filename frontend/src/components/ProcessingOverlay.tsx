'use client';

interface ProcessingOverlayProps {
  progress: { processed: number; total: number } | null;
  error: string | null;
}

export default function ProcessingOverlay({ progress, error }: ProcessingOverlayProps) {
  const pct = progress && progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-400 font-medium mb-1">Processing Failed</p>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <>
          <div className="relative w-16 h-16">
            <svg className="animate-spin w-16 h-16 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Processing your CSV with AI
          </p>
          {progress && (
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{progress.processed} of {progress.total} records</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Sending records to AI for field mapping
          </p>
        </>
      )}
    </div>
  );
}
