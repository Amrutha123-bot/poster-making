import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch company profile
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!company || !company.name || !company.logo_url) {
    redirect('/profile');
  }

  // Fetch recent posters (last 4)
  const { data: recentPosters } = await supabase
    .from('posters')
    .select('*, occasion:occasions(name)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(4);

  // Fetch occasion count
  const { count: occasionCount } = await supabase
    .from('occasions')
    .select('*', { count: 'exact', head: true });

  const posterList = (recentPosters as any[]) || [];
  const posterCount = posterList.length;

  return (
    <div className="flex flex-col gap-8 fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-accent-gold uppercase tracking-wider">
            Welcome back
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {company.name}
          </h1>
          <p className="text-text-secondary text-sm">
            Your branded poster studio is ready. Create, customize, and export festive greetings.
          </p>
        </div>
        {company.logo_url && (
          <div className="w-14 h-14 rounded-xl border border-border-subtle bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1.5" />
          </div>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Occasions Available', value: occasionCount ?? 0, color: 'text-accent-gold' },
          { label: 'Posters Generated', value: posterCount, color: 'text-accent-purple' },
          { label: 'Brand Colors', value: company.brand_colors?.length || 0, color: 'text-accent-pink' },
          { label: 'Export Formats', value: 3, color: 'text-accent-amber' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border-subtle bg-white/[0.03] backdrop-blur-sm">
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-text-secondary font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/occasions" className="group">
          <Card className="h-full transition-all duration-200 group-hover:border-accent-purple/40 group-hover:-translate-y-0.5">
            <div className="flex items-start gap-4 p-2">
              <div className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-gold transition-colors">Create New Poster</h3>
                <p className="text-xs text-text-secondary mt-0.5">Pick an occasion and template to start designing</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/history" className="group">
          <Card className="h-full transition-all duration-200 group-hover:border-accent-gold/40 group-hover:-translate-y-0.5">
            <div className="flex items-start gap-4 p-2">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-gold transition-colors">View History</h3>
                <p className="text-xs text-text-secondary mt-0.5">Download or re-edit previously saved posters</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/profile" className="group">
          <Card className="h-full transition-all duration-200 group-hover:border-accent-pink/40 group-hover:-translate-y-0.5">
            <div className="flex items-start gap-4 p-2">
              <div className="w-10 h-10 rounded-lg bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-gold transition-colors">Update Branding</h3>
                <p className="text-xs text-text-secondary mt-0.5">Edit logo, tagline, colors, and contact info</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Posters Preview */}
      {posterList.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Recent Creations</h2>
            <Link href="/history" className="text-xs font-semibold text-accent-gold hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {posterList.map((poster: any) => (
              <Link key={poster.id} href={`/editor?posterId=${poster.id}`} className="group">
                <div className="rounded-lg border border-border-subtle bg-black/20 overflow-hidden transition-all duration-200 group-hover:border-accent-purple/40 group-hover:-translate-y-0.5">
                  <div className="aspect-square w-full bg-black/40 overflow-hidden">
                    {poster.generated_image_url ? (
                      <img
                        src={poster.generated_image_url}
                        alt={poster.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                        No preview
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-text-primary truncate group-hover:text-accent-gold transition-colors">
                      {poster.title}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {poster.occasion?.name || 'Poster'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no posters yet */}
      {posterList.length === 0 && (
        <Card glow={true}>
          <div className="flex flex-col items-center text-center p-8 gap-4">
            <div className="w-14 h-14 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Ready to create your first poster?</h3>
              <p className="text-sm text-text-secondary mt-1.5 max-w-sm mx-auto">
                Your branding is set up. Browse occasions to pick a template and generate your first festive greeting.
              </p>
            </div>
            <Link href="/occasions" className="mt-2">
              <Button variant="primary">Browse Occasions</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
