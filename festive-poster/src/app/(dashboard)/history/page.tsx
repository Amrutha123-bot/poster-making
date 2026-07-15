import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCompanyProfile } from '../profile/actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Poster History — FestivePoster',
  description: 'Browse, download, and re-edit your previously generated branded festival posters.',
};

export const revalidate = 0; // Dynamic rendering on every request

export default async function HistoryPage() {
  const company = await getCompanyProfile();
  
  if (!company) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Saved Greetings History</h1>
        </div>
        <Card>
          <div className="text-center py-8 text-text-secondary text-sm">
            Please configure your <Link href="/profile" className="text-accent-gold underline">Company Profile</Link> first.
          </div>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  
  // Fetch generated posters linked to the company, joining occasion and template meta
  const { data: posters, error } = await supabase
    .from('posters')
    .select('*, occasion:occasions(name), template:templates(name)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  const posterList = (posters as any[]) || [];

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary via-text-secondary to-text-muted bg-clip-text text-transparent">
            Saved Poster History
          </h1>
          <p className="text-text-secondary text-sm">
            Browse, re-download, or modify previously customized posters.
          </p>
        </div>
        <Link href="/occasions">
          <Button variant="primary">Create New Poster</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/40 text-red-200 text-sm rounded-lg">
          Error retrieving history: {error.message}
        </div>
      )}

      {!error && posterList.length === 0 && (
        <Card glow={true}>
          <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-border-subtle flex items-center justify-center text-text-secondary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">No posters saved yet</h3>
              <p className="text-sm text-text-secondary mt-1.5 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t generated any poster history. Go to the gallery to create your first design!
              </p>
            </div>
            <Link href="/occasions" className="mt-2">
              <Button variant="primary">Browse Templates</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* History Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posterList.map((poster) => {
          const dateStr = new Date(poster.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div key={poster.id} className="relative rounded-xl border border-border-subtle hover:border-accent-purple/40 bg-[#120D23]/40 flex flex-col overflow-hidden shadow-card transition-all duration-200">
              
              {/* Renders the static thumbnail image stored in Supabase */}
              <div className="relative aspect-square w-full bg-black/40 overflow-hidden flex items-center justify-center">
                {poster.generated_image_url ? (
                  <img
                    src={poster.generated_image_url}
                    alt={poster.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-text-muted text-xs">No preview image</div>
                )}
              </div>

              {/* Poster info body */}
              <div className="p-4 flex flex-col gap-3 flex-1 justify-between bg-black/20">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold bg-accent-purple/10 text-accent-gold border border-accent-purple/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {poster.occasion?.name || 'Occasion'}
                    </span>
                    <span className="text-xs text-text-muted">{dateStr}</span>
                  </div>
                  <h3 className="font-bold text-sm text-text-primary truncate mt-1">
                    {poster.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {poster.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-subtle/50">
                  <Link href={`/editor?posterId=${poster.id}`}>
                    <Button variant="secondary" className="w-full text-xs py-2 h-auto">
                      Modify / Edit
                    </Button>
                  </Link>

                  {poster.generated_image_url ? (
                    <a href={poster.generated_image_url} download target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" className="w-full text-xs py-2 h-auto">
                        Download
                      </Button>
                    </a>
                  ) : (
                    <Button variant="primary" disabled className="w-full text-xs py-2 h-auto">
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
