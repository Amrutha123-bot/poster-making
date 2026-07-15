// lib/rate-limit.ts
//
// FestivePoster — guardrails utility (Phase 6).
// Two responsibilities:
//   1. A stored monthly counter per company, so you can see (and cap) how
//      many parsing + image-generation calls are happening.
//   2. A simple in-memory debounce so the same company can't fire off
//      several generations within a few seconds of each other.
//
// Both are intentionally simple — this is a small business tool, not a
// high-traffic SaaS, so no external rate-limit service is needed.

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Adjust these caps to whatever feels safe for your Cloudflare free-tier
// daily limits. These are MONTHLY caps per company, not global.
const MONTHLY_PARSE_CALL_CAP = 500;
const MONTHLY_IMAGE_CALL_CAP = 200;

// In-memory debounce map: companyId -> timestamp of last generation request.
// Resets on server restart — fine for this use case, no need for Redis here.
const lastRequestAt = new Map<string, number>();
const DEBOUNCE_MS = 4000; // block a second submit within 4 seconds

export function isDebounced(companyId: string): boolean {
    const last = lastRequestAt.get(companyId);
    const now = Date.now();
    if (last && now - last < DEBOUNCE_MS) {
        return true;
    }
    lastRequestAt.set(companyId, now);
    return false;
}

function currentMonthKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface UsageCheckResult {
    allowed: boolean;
    reason?: string;
    parseCalls: number;
    imageCalls: number;
}

/**
 * Checks whether this company is under its monthly caps, WITHOUT
 * incrementing yet. Call this before doing any API work.
 */
export async function checkUsage(companyId: string): Promise<UsageCheckResult> {
    const month = currentMonthKey();

    const { data, error } = await supabaseAdmin
        .from("usage_counters")
        .select("parse_calls, image_calls")
        .eq("company_id", companyId)
        .eq("month", month)
        .maybeSingle();

    if (error) {
        // Fail closed: if we can't verify usage, don't allow the call.
        console.error("[rate-limit] Failed to read usage counter:", error);
        return { allowed: false, reason: "Usage check failed", parseCalls: 0, imageCalls: 0 };
    }

    const parseCalls = data?.parse_calls ?? 0;
    const imageCalls = data?.image_calls ?? 0;

    if (parseCalls >= MONTHLY_PARSE_CALL_CAP) {
        return {
            allowed: false,
            reason: `Monthly text-parsing limit reached (${MONTHLY_PARSE_CALL_CAP}). Resets next month.`,
            parseCalls,
            imageCalls,
        };
    }
    if (imageCalls >= MONTHLY_IMAGE_CALL_CAP) {
        return {
            allowed: false,
            reason: `Monthly image-generation limit reached (${MONTHLY_IMAGE_CALL_CAP}). Resets next month.`,
            parseCalls,
            imageCalls,
        };
    }

    return { allowed: true, parseCalls, imageCalls };
}

/**
 * Increments the counters after a successful call. Call this once per
 * actual API call made (one increment for parsing, one for image gen).
 */
export async function incrementUsage(
    companyId: string,
    field: "parse_calls" | "image_calls"
): Promise<void> {
    const month = currentMonthKey();

    const { data: existing } = await supabaseAdmin
        .from("usage_counters")
        .select("id, parse_calls, image_calls")
        .eq("company_id", companyId)
        .eq("month", month)
        .maybeSingle();

    if (!existing) {
        await supabaseAdmin.from("usage_counters").insert({
            company_id: companyId,
            month,
            parse_calls: field === "parse_calls" ? 1 : 0,
            image_calls: field === "image_calls" ? 1 : 0,
        });
        return;
    }

    const newValue = (field === "parse_calls" ? existing.parse_calls : existing.image_calls) + 1;

    await supabaseAdmin
        .from("usage_counters")
        .update({ [field]: newValue, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
}

/**
 * Retry with exponential backoff for 429 (rate-limited) responses from
 * Cloudflare. Wraps any async call that returns a Response-like object
 * with a `.status`.
 */
export async function withBackoff<T>(
    fn: () => Promise<T>,
    isRateLimitError: (err: any) => boolean,
    maxAttempts = 3
): Promise<T> {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err) {
            attempt++;
            if (attempt >= maxAttempts || !isRateLimitError(err)) {
                throw err;
            }
            const delayMs = 500 * 2 ** attempt; // 1s, 2s, 4s...
            console.warn(`[rate-limit] Retry ${attempt}/${maxAttempts} after ${delayMs}ms`);
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
}