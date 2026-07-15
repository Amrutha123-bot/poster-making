// generate-illustrations-cloudflare.js
//
// FestivePoster — one-time illustration batch generator
// Run this ONCE on your own PC, per occasion. It is NOT part of the running
// app — it just produces PNG files you review, then upload manually.
//
// Setup:
//   1. npm install node-fetch   (if on Node < 18; Node 18+ has fetch built in)
//   2. Set these two env vars before running:
//        CLOUDFLARE_ACCOUNT_ID=your_account_id
//        CLOUDFLARE_API_TOKEN=your_api_token
//   3. Edit the OCCASIONS array below — one entry per template.
//   4. Run:  node generate-illustrations-cloudflare.js
//
// Output: one PNG per occasion, saved into ./generated-illustrations/

import fs from "fs";
import path from "path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!ACCOUNT_ID || !API_TOKEN) {
    console.error(
        "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN environment variables."
    );
    process.exit(1);
}

// Fixed style anchor — keep byte-for-byte identical across every occasion.
const STYLE_ANCHOR =
    "flat vector illustration, premium festival greeting-poster clip-art style, " +
    "bold clean vector outlines, vibrant saturated flat color palette, no gradients, " +
    "no painterly texture, culturally accurate costumes and festive props as clean " +
    "vector shapes, digital vector art only, not photorealistic, not a 3D render, " +
    "not a product photo, no text, no logos, no watermark.";

// Edit this list to match your real occasions/templates.
const OCCASIONS = [
    {
        slug: "diwali",
        subject:
            "subject: a warm night scene with rows of glowing terracotta diyas, " +
            "strings of fairy lights, and bursts of golden fireworks",
    },
    {
        slug: "christmas",
        subject:
            "subject: a minimalist pine tree with falling snow, gold ornaments, " +
            "and warm string lights",
    },
    {
        slug: "holi",
        subject:
            "subject: people throwing clouds of vibrant colored powder with " +
            "splashes of pink, yellow, and blue in the air",
    },
    {
        slug: "eid",
        subject:
            "subject: a crescent moon and star over a mosque silhouette, with " +
            "lanterns and geometric patterns",
    },
];

const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const OUTPUT_DIR = "./generated-illustrations";

async function generateOne(occasion) {
    const fullPrompt = `${occasion.subject}\n\nstyle: ${STYLE_ANCHOR}`;

    console.log(`\n[${occasion.slug}] Sending prompt:\n${fullPrompt}\n`);

    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(
            `[${occasion.slug}] API call failed: ${response.status} ${errText}`
        );
    }

    const contentType = response.headers.get("content-type") || "";
    let imageBuffer;

    if (contentType.includes("application/json")) {
        // flux-1-schnell returns { result: { image: "<base64 string>" } }
        const json = await response.json();
        if (!json.result || !json.result.image) {
            throw new Error(
                `[${occasion.slug}] No image field in response: ${JSON.stringify(json)}`
            );
        }
        imageBuffer = Buffer.from(json.result.image, "base64");
    } else {
        // Some models return raw binary image bytes directly
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const outPath = path.join(OUTPUT_DIR, `${occasion.slug}.png`);
    fs.writeFileSync(outPath, imageBuffer);
    console.log(`[${occasion.slug}] Saved -> ${outPath}`);
}

async function main() {
    for (const occasion of OCCASIONS) {
        try {
            await generateOne(occasion);
        } catch (err) {
            // No fallback image, ever — a failure here is a visible failure,
            // not a substituted placeholder.
            console.error(err.message);
        }
    }
    console.log(
        "\nDone. Open each PNG in ./generated-illustrations and check it " +
        "matches the occasion, has no text/logo/watermark, and is on-style " +
        "before uploading it anywhere."
    );
}

main();