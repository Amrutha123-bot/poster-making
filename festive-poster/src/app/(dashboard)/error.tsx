'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center gap-6 fade-in px-4">
      <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono mt-1">Error ID: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
        <Link href="/occasions">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
