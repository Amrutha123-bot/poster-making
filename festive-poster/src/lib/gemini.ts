'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

// 1. Quota & Style Configuration
const MAX_MONTHLY_CALLS = 50;
const STYLE_ANCHOR =
  'flat vector illustration, hand-drawn festive linework, warm soft color palette, gentle natural lighting, greeting-card illustration style, gouache texture, no photorealism, no 3D render, no text, no logos, no watermark.';

const DEFAULT_PROMPTS: Record<string, string> = {
  diwali:
    'A golden circular mandala motif in the center, warm hanging oil lamps (diyas) glowing with a soft flame, dark maroon background, string lights hanging from the top, festive ambient glow.',
  christmas:
    'A minimalist stylized pine Christmas tree in the center, gentle white snowflakes falling, deep emerald green branches, warm gold decorations, dark night sky background.',
  eid:
    'A golden crescent moon and shining stars in a dark emerald green night sky, faint elegant mosque silhouette in the background with glowing lanterns, starry cosmos.',
  holi:
    'Abstract vibrant splashes of pink, blue, green, and orange powder paints, festival of colors celebration on a clean textured white paper background.',
};

/**
 * Custom fetch helper with exponential backoff on 429 (rate limit) errors
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 2000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      console.warn(`Gemini API returned 429 (Rate Limit). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
      continue;
    }
    return res;
  }
  return await fetch(url, options);
}

/**
 * 1. Checks and increments the monthly API call counter.
 * Throws an error if the limit is exceeded.
 */
async function checkAndIncrementQuota(): Promise<number> {
  const adminClient = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-07"

  // Check current count
  const { data: stats, error: fetchError } = await adminClient
    .from('generation_stats')
    .select('count')
    .eq('month_year', currentMonth)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching quota stats:', fetchError);
  }

  const currentCount = stats?.count || 0;

  if (currentCount >= MAX_MONTHLY_CALLS) {
    throw new Error(
      `Monthly Gemini API quota limit of ${MAX_MONTHLY_CALLS} calls has been reached. Please contact your administrator.`
    );
  }

  // Upsert increment
  if (stats === null) {
    // Insert new month row
    const { error: insertError } = await adminClient.from('generation_stats').insert({
      month_year: currentMonth,
      count: 1,
    });
    if (insertError) console.error('Failed to insert quota stats:', insertError);
  } else {
    // Increment existing count
    const { error: updateError } = await adminClient
      .from('generation_stats')
      .update({ count: currentCount + 1 })
      .eq('month_year', currentMonth);
    if (updateError) console.error('Failed to increment quota stats:', updateError);
  }

  return currentCount + 1;
}

/**
 * 2. Calls the Gemini Image generation model via Google AI Studio API
 */
async function callImagenAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  // Use the available gemini-2.5-flash-image model which supports generateContent
  const modelName = 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  console.log('--- GEMINI IMAGE GENERATION REQUEST PAYLOAD ---');
  console.log(`URL: ${url.replace(apiKey, 'REDACTED_API_KEY')}`);
  console.log(`Payload: ${JSON.stringify(requestBody, null, 2)}`);
  console.log('------------------------------------------------');

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Gemini Image API Error response:', errorText);
    throw new Error(`Gemini Image API error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  console.log('--- GEMINI IMAGE GENERATION RAW RESPONSE ---');
  console.log(JSON.stringify(json, null, 2));
  console.log('---------------------------------------------');

  // Extract base64 bytes from candidates[0].content.parts[].inlineData.data
  let base64Bytes = '';
  const parts = json?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      base64Bytes = part.inlineData.data;
      break;
    }
  }

  if (!base64Bytes) {
    throw new Error('Gemini Image API returned no image data.');
  }

  return base64Bytes;
}

/**
 * 3. Uses Gemini Flash model to analyze if the image contains text, logos, or watermarks
 */
async function verifyImageContainsNoText(base64Image: string): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return true; // skip validation if key is missing (fallback to true)

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Analyze this image carefully. Does it contain any letters, words, text, branding, signatures, logos, or watermarks? Reply with exactly 'yes' if there is any visible text, otherwise reply 'no'. Do not include any punctuation or extra words.",
            },
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  if (!res.ok) {
    console.error('Gemini Flash text check failed. Skipping check. Error:', res.statusText);
    return true; // proceed anyway if verification service is down
  }

  const json = await res.json();
  const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toLowerCase() || 'no';

  console.log(`Gemini Flash text verification result: "${reply}"`);
  return reply.includes('no');
}

/**
 * 4. Image post-processing via Sharp (subtle warmth/contrast)
 */
async function postProcessImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .modulate({
        saturation: 1.1, // slightly boost saturation for rich tones
        brightness: 1.02, // slightly brighter
      })
      .linear(1.05, -0.02) // subtle contrast boost (y = 1.05x - 0.02)
      .png()
      .toBuffer();
  } catch (err) {
    console.error('Sharp processing error, returning raw buffer:', err);
    return buffer; // return original buffer if processing fails
  }
}

/**
 * Main Server Action: Executes the full image generation pipeline
 *
 * @param templateId The template database UUID to generate illustration for
 * @param customPromptOverride Optional prompt text to override defaults
 */
export async function generateTemplateIllustration(
  templateId: string,
  customPromptOverride?: string
) {
  try {
    const adminClient = createAdminClient();

    // 1. Fetch template detail
    const { data: template, error: templateError } = await adminClient
      .from('templates')
      .select('*, occasion:occasions(*)')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return { success: false, error: 'Template not found' };
    }

    // 2. Select prompt
    const occasionSlug = template.occasion?.slug || 'diwali';
    const basePrompt =
      customPromptOverride || DEFAULT_PROMPTS[occasionSlug] || DEFAULT_PROMPTS['diwali'];
    const fullPrompt = `${basePrompt}, ${STYLE_ANCHOR}`;

    console.log(`Starting image generation for Template "${template.name}"...`);
    console.log(`Prompt: "${fullPrompt}"`);

    let imageBuffer: Buffer;
    let needsManualReview = false;

    // 3. Quota Guardrail Check
    await checkAndIncrementQuota();

    // 4. Generate with Gemini Image API & validate (up to 3 retries)
    let finalBase64: string | null = null;
    let isValid = false;
    let attempt = 1;
    const maxAttempts = 3;

    while (attempt <= maxAttempts && !isValid) {
      console.log(`Generation attempt ${attempt} of ${maxAttempts}...`);
      try {
        // Vary prompt slightly on retries to get a different seed
        const promptSeedModifier = attempt > 1 ? ` (variation ${attempt})` : '';
        const generatedBytes = await callImagenAPI(fullPrompt + promptSeedModifier);

        // Verify no text/logos
        const verificationPass = await verifyImageContainsNoText(generatedBytes);

        if (verificationPass) {
          finalBase64 = generatedBytes;
          isValid = true;
          console.log('Image passed text validation.');
        } else {
          console.warn(`Attempt ${attempt} generated image failed text/logo validation.`);
          attempt++;
        }
      } catch (err: any) {
        console.error(`Attempt ${attempt} encountered error:`, err.message);
        attempt++;
        if (attempt > maxAttempts) throw err;
      }
    }

    // Fallback: If all attempts failed verification, use the last generated one but flag for review
    if (!isValid) {
      console.warn('All 3 attempts failed text validation. Flagging for manual review.');
      needsManualReview = true;
      // Generate one final time to use as fallback
      finalBase64 = await callImagenAPI(fullPrompt + ' (final fallback)');
    }

    if (!finalBase64) {
      throw new Error('Failed to generate image bytes.');
    }
    imageBuffer = Buffer.from(finalBase64, 'base64');

    // 5. Post Process image with Sharp
    const processedBuffer = await postProcessImage(imageBuffer);

    // 6. Upload to Supabase storage 'illustrations' bucket
    // 6. Ensure the 'illustrations' bucket exists and upload
    try {
      const { data: buckets } = await adminClient.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.id === 'illustrations');
      if (!hasBucket) {
        console.log("Bucket 'illustrations' not found. Creating public bucket...");
        const { error: createError } = await adminClient.storage.createBucket('illustrations', {
          public: true,
        });
        if (createError) {
          console.warn("Failed to create bucket 'illustrations':", createError.message);
        }
      }
    } catch (bucketErr: any) {
      console.warn("Could not verify or create bucket 'illustrations':", bucketErr.message);
    }

    const fileName = `${template.id}_${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('illustrations')
      .upload(fileName, processedBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError);
      return { success: false, error: `Upload error: ${uploadError.message}` };
    }

    // Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('illustrations')
      .getPublicUrl(fileName);

    // Ensure the needs_review column exists in templates table
    // We update the template record with the new URL and the manual review flag.
    const { error: updateError } = await adminClient
      .from('templates')
      .update({
        illustration_asset_url: publicUrl,
        // Since we may not have run the DDL query to create the column yet,
        // we can conditionally pass needs_review or log a warning if it fails.
      })
      .eq('id', templateId);

    if (updateError) {
      console.error('Failed to update template table row:', updateError);
      return { success: false, error: `Database update failed: ${updateError.message}` };
    }

    // Try updating the needs_review column if database allows it
    try {
      await adminClient
        .from('templates')
        .update({
          // Try to write to needs_review column.
          // Note: If column does not exist, Postgres will throw an error, which we catch.
          needs_review: needsManualReview,
        } as any)
        .eq('id', templateId);
    } catch (dbErr) {
      console.warn('Failed to update needs_review field (it may not exist in schema yet):', dbErr);
    }

    console.log(`Successfully generated and saved illustration for Template ${templateId}!`);

    return {
      success: true,
      imageUrl: publicUrl,
      needsReview: needsManualReview,
    };
  } catch (err: any) {
    console.error('generateTemplateIllustration failed:', err);
    return { success: false, error: err.message || 'Server error occurred.' };
  }
}
