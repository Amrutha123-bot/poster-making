'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Poster } from '@/types/database';

// Save the generated poster record
export async function saveGeneratedPoster({
  templateId,
  occasionId,
  title,
  message,
  customizations,
  base64Image,
}: {
  templateId: string;
  occasionId: string;
  title: string;
  message: string;
  customizations: any;
  base64Image: string; // Base64 data of the generated PNG
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // 1. Fetch user's company ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return { success: false, error: 'Company profile not found' };
    }

    // 2. Upload the poster PNG to the 'generated-posters' storage bucket
    const buffer = Buffer.from(base64Image, 'base64');
    const filePath = `${user.id}/poster_${Date.now()}.png`;

    // Ensure the 'generated-posters' bucket exists using admin client
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminClient = createAdminClient();
      const { data: buckets } = await adminClient.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.id === 'generated-posters');
      if (!hasBucket) {
        console.log("Bucket 'generated-posters' not found. Creating public bucket...");
        const { error: createError } = await adminClient.storage.createBucket('generated-posters', {
          public: true,
        });
        if (createError) {
          console.warn("Failed to create bucket 'generated-posters':", createError.message);
        }
      }
    } catch (bucketErr: any) {
      console.warn("Could not verify or create bucket 'generated-posters':", bucketErr.message);
    }

    const { error: uploadError } = await supabase.storage
      .from('generated-posters')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Poster image upload failed:', uploadError);
      return { 
        success: false, 
        error: `Failed to upload poster: ${uploadError.message}. Make sure you created a public bucket named 'generated-posters' in your Supabase dashboard.` 
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-posters')
      .getPublicUrl(filePath);

    // 3. Insert record into posters table
    const { data: poster, error: insertError } = await supabase
      .from('posters')
      .insert({
        company_id: company.id,
        template_id: templateId,
        occasion_id: occasionId,
        title,
        message,
        customizations,
        generated_image_url: publicUrl,
        size_variants: [], // Size presets can be saved if needed
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert failed:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/history');
    return { success: true, poster: poster as Poster };
  } catch (e: any) {
    console.error('saveGeneratedPoster failed:', e);
    return { success: false, error: e.message || 'Server error' };
  }
}

// Fetch a saved poster by ID (for re-editing)
export async function getSavedPoster(posterId: string): Promise<Poster | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('posters')
      .select('*')
      .eq('id', posterId)
      .single();

    if (error || !data) {
      console.error('Error fetching saved poster:', error);
      return null;
    }

    return data as Poster;
  } catch (e) {
    console.error('getSavedPoster failed:', e);
    return null;
  }
}
