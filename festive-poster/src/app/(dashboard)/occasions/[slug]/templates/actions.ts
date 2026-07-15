'use server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Server action: Upload a PNG illustration to Supabase Storage and
 * persist the resulting public URL in the template's illustration_asset_url column.
 *
 * This is an admin-only, manual upload — no AI image generation happens here.
 */
export async function uploadTemplateIllustration(
  templateId: string,
  formData: FormData
) {
  try {
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' };
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type "${file.type}". Allowed: PNG, JPEG, WebP, SVG.`,
      };
    }

    // Max 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 5 MB.' };
    }

    const adminClient = createAdminClient();

    // 1. Verify the template exists
    const { data: template, error: templateError } = await adminClient
      .from('templates')
      .select('id, name')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return { success: false, error: 'Template not found.' };
    }

    // 2. Ensure the 'illustrations' bucket exists
    try {
      const { data: buckets } = await adminClient.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.id === 'illustrations');
      if (!hasBucket) {
        console.log("Bucket 'illustrations' not found. Creating public bucket...");
        const { error: createError } = await adminClient.storage.createBucket(
          'illustrations',
          { public: true }
        );
        if (createError) {
          console.warn("Failed to create bucket 'illustrations':", createError.message);
        }
      }
    } catch (bucketErr: any) {
      console.warn(
        "Could not verify or create bucket 'illustrations':",
        bucketErr.message
      );
    }

    // 3. Convert File to Buffer & upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${templateId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await adminClient.storage
      .from('illustrations')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError);
      return { success: false, error: `Upload error: ${uploadError.message}` };
    }

    // 4. Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from('illustrations').getPublicUrl(fileName);

    // 5. Write the public URL into the template's illustration_asset_url column
    const { error: updateError } = await adminClient
      .from('templates')
      .update({ illustration_asset_url: publicUrl })
      .eq('id', templateId);

    if (updateError) {
      console.error('Failed to update template:', updateError);
      return {
        success: false,
        error: `Database update failed: ${updateError.message}`,
      };
    }

    console.log(
      `Successfully uploaded illustration for template "${template.name}" → ${publicUrl}`
    );

    return { success: true, imageUrl: publicUrl };
  } catch (err: any) {
    console.error('uploadTemplateIllustration failed:', err);
    return { success: false, error: err.message || 'Server error occurred.' };
  }
}
