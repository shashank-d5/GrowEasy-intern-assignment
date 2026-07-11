'use client';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              GrowEasy CSV Importer
            </h1>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/shashank-d5/GrowEasy-intern-assignment"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                GitHub
              </a>
              <ThemeToggle dark={dark} onToggle={toggle} />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </div>
    </ErrorBoundary>
  );
}
