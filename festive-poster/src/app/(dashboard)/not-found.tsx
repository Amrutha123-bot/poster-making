import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 fade-in px-4">
      {/* Animated gradient number */}
      <div className="relative">
        <span className="text-[120px] sm:text-[160px] font-extrabold font-display leading-none bg-gradient-to-b from-accent-purple/40 to-transparent bg-clip-text text-transparent select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-2xl font-bold text-text-primary">Page Not Found</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back to the dashboard to continue creating stunning posters.
        </p>
      </div>

      <div className="flex gap-3 mt-2">
        <Link href="/occasions">
          <Button variant="primary">Browse Occasions</Button>
        </Link>
        <Link href="/profile">
          <Button variant="secondary">Company Profile</Button>
        </Link>
      </div>
    </div>
  );
}
