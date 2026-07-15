import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Occasion } from '@/types/database';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select an Occasion — FestivePoster',
  description: 'Browse festivals and occasions to create branded greeting posters for your business.',
};

export const revalidate = 0; // Fresh fetch on every load

const MONTHS_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthsRangeString(months: number[]) {
  if (!months || months.length === 0) return '';
  if (months.length === 1) return MONTHS_NAMES[months[0] - 1];
  
  // Sort months
  const sorted = [...months].sort((a, b) => a - b);
  return `${MONTHS_NAMES[sorted[0] - 1]} - ${MONTHS_NAMES[sorted[sorted.length - 1] - 1]}`;
}

export default async function OccasionsPage() {
  let occasions: Occasion[] = [];
  let errorMsg = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('occasions')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      errorMsg = error.message;
    } else {
      occasions = data as Occasion[];
    }
  } catch (err: any) {
    errorMsg = err.message || 'Database error';
  }

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary via-text-secondary to-text-muted bg-clip-text text-transparent">
          Select an Occasion
        </h1>
        <p className="text-text-secondary text-sm">
          Browse upcoming festivals and select one to see available poster layouts.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-900/30 border border-red-500/40 text-red-200 text-sm rounded-lg">
          Error retrieving occasions: {errorMsg}
        </div>
      )}

      {!errorMsg && occasions.length === 0 && (
        <Card glow={true} className="border-accent-amber/30 bg-accent-amber/5">
          <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-amber/15 border border-accent-amber/35 flex items-center justify-center text-accent-gold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Database Seeding Required</h3>
              <p className="text-sm text-text-secondary mt-1.5 max-w-xl">
                The occasions table in your database is currently empty. Please copy the contents of the SQL script in <code className="text-accent-gold bg-white/5 px-1 py-0.5 rounded font-mono text-xs">supabase/seed.sql</code>, paste it in your Supabase SQL editor, and click **Run** to seed default templates and festivals.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {occasions.map((occasion) => {
          // Derive a fallback gradient colors set for cards from their colorPalette field
          const palette: string[] = occasion.color_palette || ['#8B5CF6', '#1A0B2E'];
          const gradientStyle = {
            background: `linear-gradient(135deg, ${palette[0] || '#8B5CF6'} 0%, ${palette[1] || '#1A0B2E'} 100%)`
          };

          return (
            <Link key={occasion.id} href={`/occasions/${occasion.slug}/templates`} className="group">
              <div className="relative h-64 rounded-xl border border-border-subtle hover:border-accent-purple/50 bg-[#120D23]/40 group-hover:bg-[#120D23]/60 flex flex-col justify-between overflow-hidden shadow-card transition-all duration-300 group-hover:-translate-y-1">
                {/* Visual Occasion Theme Mini-Banner */}
                <div style={gradientStyle} className="h-32 w-full relative flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute inset-0 bg-black/20"></div>
                  {/* Styled central text mock */}
                  <span className="font-display font-bold text-xl drop-shadow-md text-white tracking-wide">
                    {occasion.name}
                  </span>

                  {/* Motif Badge indicator overlay */}
                  {occasion.motif_set && occasion.motif_set.length > 0 && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {occasion.motif_set.slice(0, 2).map((motif, i) => (
                        <span key={i} className="text-[10px] font-medium bg-black/40 text-text-primary px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5 capitalize">
                          {motif.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-4 flex flex-col gap-1.5 flex-1 justify-center border-t border-border-subtle bg-black/20">
                  <h3 className="font-bold text-base group-hover:text-accent-gold transition-colors duration-150">
                    {occasion.name} Greeting
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-3.5 h-3.5 text-accent-gold/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                    </svg>
                    <span>{getMonthsRangeString(occasion.active_months)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
