'use client';

import React, { useState } from 'react';
import { Company } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogoUpload } from '@/components/ui/logo-upload';
import { ColorPicker } from '@/components/ui/color-picker';
import { updateCompanyProfile, uploadLogo } from './actions';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  initialProfile: Company | null;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialProfile?.name || '');
  const [tagline, setTagline] = useState(initialProfile?.tagline || '');
  const [description, setDescription] = useState(initialProfile?.short_description || '');
  const [website, setWebsite] = useState(initialProfile?.website || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [colors, setColors] = useState<string[]>(initialProfile?.brand_colors || ['#8B5CF6', '#FFD700']);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialProfile?.logo_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (!file) {
      setLogoUrl(null);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setStatusMessage({ type: 'error', text: 'Company Name is required.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      let finalLogoUrl = logoUrl;

      // Upload logo if a new file is selected
      if (logoFile) {
        // Convert file to base64 for Server Action
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(logoFile);
          reader.onload = () => {
            const result = reader.result as string;
            // Extract the base64 part
            const base64Str = result.split(',')[1];
            resolve(base64Str);
          };
          reader.onerror = reject;
        });

        const uploadResult = await uploadLogo({
          name: logoFile.name,
          type: logoFile.type,
          base64,
        });

        if (!uploadResult.success) {
          setStatusMessage({ 
            type: 'error', 
            text: uploadResult.error || 'Failed to upload logo.' 
          });
          setIsLoading(false);
          return;
        }

        finalLogoUrl = uploadResult.publicUrl || null;
        setLogoUrl(finalLogoUrl);
        setLogoFile(null); // Reset file to prevent double-upload
      }

      // Save company profile
      const saveResult = await updateCompanyProfile({
        name,
        tagline: tagline || undefined,
        short_description: description || undefined,
        website: website || undefined,
        email: email || undefined,
        phone: phone || undefined,
        brand_colors: colors,
        logo_url: finalLogoUrl,
      });

      if (!saveResult.success) {
        setStatusMessage({ 
          type: 'error', 
          text: saveResult.error || 'Failed to save profile.' 
        });
      } else {
        setStatusMessage({ 
          type: 'success', 
          text: 'Company profile saved successfully!' 
        });
        
        // Refresh page and redirect to dashboard
        router.refresh();
        setTimeout(() => {
          router.push('/occasions');
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred during save.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      <Card glow={true}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="border-b border-border-subtle pb-4">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Company Branding Settings
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Set up your profile once. These brand attributes will automatically render on all generated posters.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-4 rounded-lg border text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-900/30 border-red-500/40 text-red-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Form Details */}
            <div className="flex flex-col gap-4">
              <Input
                label="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Studio"
                required
                disabled={isLoading}
              />

              <Input
                label="Company Tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Innovating design for creators"
                disabled={isLoading}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
                  Short Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us briefly what your business does..."
                  disabled={isLoading}
                  rows={3}
                  className="input-field min-h-[100px] resize-none"
                />
              </div>

              <div className="border-t border-border-subtle my-2 pt-4">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Contact Information (For Poster Footer Bar)
                </h3>
                <div className="flex flex-col gap-3">
                  <Input
                    label="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. www.acmestudio.com"
                    disabled={isLoading}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hello@acmestudio.com"
                    disabled={isLoading}
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Logo & Colors */}
            <div className="flex flex-col gap-6">
              <LogoUpload
                value={logoUrl}
                onChange={handleLogoChange}
                onRemove={handleLogoRemove}
              />

              <ColorPicker
                colors={colors}
                onChange={setColors}
                maxColors={5}
              />
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/occasions')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save and Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
