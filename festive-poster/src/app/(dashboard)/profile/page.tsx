import React from 'react';
import { getCompanyProfile } from './actions';
import { ProfileForm } from './profile-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Settings — FestivePoster',
  description: 'Manage your organization branding, colors, tagline and logo settings.',
};

export const revalidate = 0; // Disable caching to fetch fresh profile data

export default async function ProfilePage() {
  const profile = await getCompanyProfile();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary via-text-secondary to-text-muted bg-clip-text text-transparent">
          Company Settings
        </h1>
        <p className="text-text-secondary text-sm">
          Set up your organization identity and brand markers.
        </p>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}
