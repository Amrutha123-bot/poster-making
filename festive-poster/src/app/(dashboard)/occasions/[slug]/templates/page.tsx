import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Template, Occasion } from '@/types/database';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AdminGenerator } from './admin-generator';


export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: occasion } = await supabase
    .from('occasions')
    .select('name')
    .eq('slug', slug)
    .maybeSingle();

  const occasionName = occasion?.name || 'Occasion';

  return {
    title: `${occasionName} Layout Templates — FestivePoster`,
    description: `Pick a custom layout template for ${occasionName} greetings featuring your business branding.`,
  };
}



export default async function TemplatesPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Occasion by slug
  const { data: occasion, error: occasionError } = await supabase
    .from('occasions')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (occasionError || !occasion) {
    notFound();
  }

  // 2. Fetch Templates for this occasion
  const { data: templates, error: templatesError } = await supabase
    .from('templates')
    .select('*')
    .eq('occasion_id', occasion.id);

  const templateList = (templates as Template[]) || [];


  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* Header and Back Link */}
      <div className="flex flex-col gap-3">
        <Link
          href="/occasions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-accent-gold transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Occasions
        </Link>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {occasion.name} Layouts
          </h1>
          <p className="text-text-secondary text-sm">
            Choose a design skeleton for your {occasion.name} greeting card.
          </p>
        </div>
      </div>

      {templatesError && (
        <div className="p-4 bg-red-900/30 border border-red-500/40 text-red-200 text-sm rounded-lg">
          Error retrieving templates: {templatesError.message}
        </div>
      )}

      {templateList.length === 0 && (
        <Card>
          <div className="text-center py-8 text-text-secondary text-sm">
            No templates configured for {occasion.name} yet.
          </div>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templateList.map((template) => {
          const layout = template.layout_json;
          const bg = layout.background;
          
          // CSS background derivation from layoutJson configuration
          let previewBgStyle: React.CSSProperties = {};
          if (bg.type === 'solid' && bg.color) {
            previewBgStyle = { backgroundColor: bg.color };
          } else if (bg.type === 'gradient' && bg.gradient) {
            previewBgStyle = {
              background: `linear-gradient(${bg.gradient.angle || 135}deg, ${bg.gradient.from}, ${bg.gradient.to})`
            };
          } else {
            previewBgStyle = {
              background: 'linear-gradient(135deg, #1A0C2E 0%, #0F0A1E 100%)'
            };
          }

          // Gather text parameters
          const titleEl = layout.elements.find(el => el.type === 'title');
          const titleColor = titleEl?.fill || '#FFCC00';
          const titleFont = titleEl?.fontFamily || 'serif';

          // illustration_asset_url is always a full URL from the database
          const illustrationSrc = template.illustration_asset_url || null;

          return (
            <div key={template.id} className="relative rounded-xl border border-border-subtle hover:border-accent-purple/50 bg-[#120D23]/40 flex flex-col overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1.5 group">
              
              {/* ─── CSS Visual Card Preview (Link to Editor) ─── */}
              <Link href={`/editor?templateId=${template.id}`}>
                <div className="w-full aspect-square relative border-b border-border-subtle overflow-hidden flex items-center justify-center p-6 cursor-pointer" style={previewBgStyle}>
                  {/* Decorative Overlay Mask */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  
                  {/* Background Illustration Overlay (Phase 3/9) */}
                  {illustrationSrc && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none p-10">
                      <img
                        src={illustrationSrc}
                        alt=""
                        className="w-full h-full object-contain select-none"
                      />
                    </div>
                  )}
                  
                  {/* Mock elements mapping template skeleton placement */}
                  <div className="w-full h-full flex flex-col justify-between items-center relative text-center z-10">
                    {/* Mock Logo Block */}
                    <div className="w-12 h-6 rounded bg-white/10 border border-white/10 flex items-center justify-center text-[8px] text-white/50 uppercase tracking-widest">
                      LOGO
                    </div>

                    {/* Central Greeting Title & Message */}
                    <div className="flex flex-col gap-1 items-center max-w-[85%]">
                      <span 
                        style={{ color: titleColor, fontFamily: titleFont === 'Playfair Display' ? 'var(--font-display)' : 'var(--font-sans)' }} 
                        className="text-lg md:text-xl font-bold tracking-wide"
                      >
                        {occasion.name} Title
                      </span>
                      <div className="w-20 h-1 bg-white/20 rounded"></div>
                      <p className="text-[9px] text-white/60 leading-normal line-clamp-3 mt-1.5">
                        &ldquo;Sending you warm greetings on this festive occasion. May happiness, good health, and abundance fill your home.&rdquo;
                      </p>
                    </div>

                    {/* Mock Footer contacts bar */}
                    <div className="w-full border-t border-white/10 pt-2 flex justify-center gap-2 text-[7px] text-white/40 tracking-wider">
                      <span>www.website.com</span>
                      <span>•</span>
                      <span>info@email.com</span>
                    </div>
                  </div>

                  {/* Hover Button overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="px-4 py-2 rounded-lg bg-accent-gold text-[#0F0A1E] font-semibold text-xs transition-transform duration-200 scale-90 group-hover:scale-100">
                      Customize Design
                    </span>
                  </div>
                </div>
              </Link>

              {/* Body Details & Admin Art Generation Controls */}
              <div className="p-4 bg-black/20 flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-gold transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      Ready configuration with {layout.elements.length} customizable overlays
                    </p>
                  </div>
                </div>

                {/* Admin Generation Options Panel */}
                <AdminGenerator
                  templateId={template.id}
                  templateName={template.name}
                  currentIllustrationUrl={illustrationSrc}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
