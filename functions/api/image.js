// Cloudflare Pages Function: /api/image
// Reliable backup image generator when Pollinations rate-limits.
// Calls Workers AI Flux-1-Schnell via the "AI" binding and streams back JPEG bytes.
// Requires an "AI" binding in the Pages project (same one /api/generate uses).
//
// Usage:
//   GET /api/image?prompt=A%20wood%20fired%20pizza&w=1200&h=800&seed=42
// Returns:
//   Content-Type: image/jpeg with the raw image body

const MAX_PROMPT = 500;
const ALLOWED_SIZES = [256, 384, 512, 640, 768, 896, 1024, 1152, 1280, 1536, 1600];

function clampSize(v, fallback) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  // Flux schnell wants multiples of 64 in a reasonable range — snap to nearest allowed size.
  let best = ALLOWED_SIZES[0];
  let bestDiff = Math.abs(n - best);
  for (const s of ALLOWED_SIZES) {
    const d = Math.abs(n - s);
    if (d < bestDiff) { best = s; bestDiff = d; }
  }
  return best;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.AI) {
    return errorImage('AI binding not configured', 500);
  }

  const url = new URL(request.url);
  const rawPrompt = (url.searchParams.get('prompt') || '').trim();
  if (!rawPrompt) return errorImage('prompt is required', 400);

  const prompt = rawPrompt.slice(0, MAX_PROMPT);
  const width = clampSize(url.searchParams.get('w') || url.searchParams.get('width'), 1024);
  const height = clampSize(url.searchParams.get('h') || url.searchParams.get('height'), 1024);
  const seed = parseInt(url.searchParams.get('seed') || '', 10);

  try {
    const input = {
      prompt: `${prompt}, professional photograph, cinematic lighting, highly detailed, sharp focus`,
      width,
      height,
      num_steps: 4, // schnell = fast, 4 steps is the sweet spot
    };
    if (Number.isFinite(seed)) input.seed = seed;

    const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', input);

    // Workers AI Flux returns either a ReadableStream of JPEG bytes,
    // or { image: base64String }. Handle both.
    let body;
    let contentType = 'image/jpeg';

    if (result && typeof result === 'object' && result.image) {
      // base64 payload
      const b64 = result.image;
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      body = bytes;
    } else if (result instanceof ReadableStream) {
      body = result;
    } else if (result instanceof Uint8Array || result instanceof ArrayBuffer) {
      body = result;
    } else {
      return errorImage('Unexpected AI response shape', 502);
    }

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-NovaMotion-Image': 'workers-ai-flux-schnell',
      },
    });
  } catch (err) {
    return errorImage('Workers AI error: ' + (err?.message || String(err)), 502);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function errorImage(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
