import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getCompanyProfile } from '../profile/actions';
import { PosterEditor } from './poster-editor';
import { Template, Poster } from '@/types/database';
import { getSavedPoster } from './actions';
import type { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ templateId?: string; posterId?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { templateId, posterId } = await searchParams;
  const supabase = await createClient();

  let activeTemplateId = templateId;
  if (posterId) {
    const saved = await getSavedPoster(posterId);
    if (saved) activeTemplateId = saved.template_id;
  }

  if (!activeTemplateId) {
    return { title: 'Poster Editor — FestivePoster' };
  }

  const { data: template } = await supabase
    .from('templates')
    .select('name, occasion:occasions(name)')
    .eq('id', activeTemplateId)
    .maybeSingle();

  const titleName = template
    ? `${(template as any).occasion?.name || ''} Template Editor`
    : 'Poster Editor';

  return {
    title: `${titleName} — FestivePoster`,
    description: 'Customize layout text, sizes, logo scaling, branding fields, and download.',
  };
}

export default async function EditorPage({ searchParams }: PageProps) {
  const { templateId, posterId } = await searchParams;

  const supabase = await createClient();

  let savedPoster: Poster | null = null;
  let activeTemplateId = templateId;

  // 1. If posterId is present, fetch the saved poster and use its templateId
  if (posterId) {
    savedPoster = await getSavedPoster(posterId);
    if (savedPoster) {
      activeTemplateId = savedPoster.template_id;
    }
  }

  if (!activeTemplateId) {
    redirect('/occasions');
  }

  // 2. Fetch the template details along with its occasion metadata
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*, occasion:occasions(*)')
    .eq('id', activeTemplateId)
    .maybeSingle();

  if (templateError || !template) {
    notFound();
  }

  // 3. Fetch the user's company profile
  const company = await getCompanyProfile();
  
  if (!company || !company.name || !company.logo_url) {
    redirect('/profile');
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <PosterEditor 
        template={template as any} 
        company={company} 
        savedPoster={savedPoster || undefined}
      />
    </div>
  );
}
