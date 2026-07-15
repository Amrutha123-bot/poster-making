'use server';

import { createClient } from '@/lib/supabase/server';
import { Company } from '@/types/database';
import { revalidatePath } from 'next/cache';

// Fetch the current user's company profile
export async function getCompanyProfile(): Promise<Company | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting company profile:', error);
      return null;
    }

    return data as Company | null;
  } catch (e) {
    console.error('getCompanyProfile failed:', e);
    return null;
  }
}

// Update or create the company profile
export async function updateCompanyProfile(formData: {
  name: string;
  tagline?: string;
  short_description?: string;
  website?: string;
  email?: string;
  phone?: string;
  brand_colors: string[];
  logo_url?: string | null;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if profile exists
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let result;

    if (existing) {
      // Update
      result = await supabase
        .from('companies')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      // Insert
      result = await supabase.from('companies').insert({
        ...formData,
        user_id: user.id,
      });
    }

    if (result.error) {
      console.error('Error saving company profile:', result.error);
      return { success: false, error: result.error.message };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (e: any) {
    console.error('updateCompanyProfile failed:', e);
    return { success: false, error: e.message || 'Server error' };
  }
}

// Upload company logo to Supabase Storage
export async function uploadLogo(fileData: { name: string; type: string; base64: string }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Convert base64 back to Buffer for Supabase Upload
    const buffer = Buffer.from(fileData.base64, 'base64');
    const fileExtension = fileData.name.split('.').pop() || 'png';
    const filePath = `${user.id}/logo_${Date.now()}.${fileExtension}`;

    // Ensure the 'logos' bucket exists using admin client
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminClient = createAdminClient();
      const { data: buckets } = await adminClient.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.id === 'logos');
      if (!hasBucket) {
        console.log("Bucket 'logos' not found. Creating public bucket...");
        const { error: createError } = await adminClient.storage.createBucket('logos', {
          public: true,
        });
        if (createError) {
          console.warn("Failed to create bucket 'logos':", createError.message);
        }
      }
    } catch (bucketErr: any) {
      console.warn("Could not verify or create bucket 'logos':", bucketErr.message);
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(filePath, buffer, {
        contentType: fileData.type,
        upsert: true,
      });

    if (error) {
      console.error('Upload failed:', error);
      
      // Handle missing bucket case
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        return { 
          success: false, 
          error: "Storage bucket 'logos' not found. Please create a public bucket named 'logos' in your Supabase Dashboard." 
        };
      }
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    return { success: true, publicUrl };
  } catch (e: any) {
    console.error('uploadLogo failed:', e);
    return { success: false, error: e.message || 'Server error' };
  }
}
