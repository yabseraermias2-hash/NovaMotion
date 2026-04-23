// Cloudflare Pages Function: /api/generate
// Calls Workers AI (Llama 3.3 70B) to produce a complete single-file HTML site
// from a user brief. Requires an "AI" binding configured in the Pages project
// (Pages → Settings → Functions → Bindings → Add → AI, variable name: AI).

const SYSTEM_PROMPT = [
  'You are NovaMotion: an elite web designer. Output ONE complete HTML document and nothing else. Start with <!DOCTYPE html>, end with </html>. No prose, no markdown, no code fences.',
  '',
  'ONLY allowed externals: cdn.tailwindcss.com, fonts.googleapis.com, fonts.gstatic.com, image.pollinations.ai. Inline all CSS/JS.',
  '',
  'QUALITY BAR: rival Emergent.sh / Framer / Awwwards winners. Rich, cinematic, fully interactive. NEVER sparse, NEVER placeholder, NEVER lorem ipsum, NEVER emoji anywhere (not in HTML, not in CSS content).',
  '',
  'MANDATORY HEAD: <head> MUST contain BOTH: <script src="https://cdn.tailwindcss.com"></script> AND a Google Fonts <link> for your 2 chosen fonts. WITHOUT these, the page renders as raw unstyled HTML — CATASTROPHIC FAIL.',
  '',
  'MANDATORY BODY OPENING: <body> MUST start with <nav> (full-width, 72-88px tall, logo left + links center + CTA right) IMMEDIATELY followed by the hero <section>. No content before nav. No spacer divs.',
  '',
  'HERO LOCK-IN (prevents broken layouts):',
  '  - Container: min-height: 85vh (use Tailwind min-h-[85vh] or inline style).',
  '  - Two-column layout: text column MUST be w-full md:w-1/2 (NOT w-1/4, NOT max-w-xs — text needs room to breathe).',
  '  - Headline: font-size clamp(2.5rem, 6vw, 5.5rem), line-height 1.05, max-width ~600px.',
  '  - Subhead: 1-2 sentences, max-width 500px, font-size ~1.125rem.',
  '  - CTA buttons: MUST have px-6 py-3 (or px-8 py-4), white-space: nowrap, min-width: 140px. NEVER squeeze them to icon-size.',
  '  - Hero image: w-full, object-cover, max-height 85vh, rounded-2xl or rounded-3xl.',
  '',
  'SECTIONS — pick 6–8 that fit the brief, fill each DEEPLY (prefer 6 dense sections over 10 empty ones):',
  '  nav (see above — MANDATORY, not optional)',
  '  hero (see above — MANDATORY, not optional)',
  '  trust/stats (4–6 press logos OR 4 count-up stats)',
  '  features (3–6 cards, each: image + title + 2-line desc)',
  '  about/story (3–4 real paragraphs + image + 2–3 stat callouts)',
  '  gallery/showcase/menu (6–9 items, each: OWN image + title + meta + hover state)',
  '  pricing (3 tiers, each: name + price + 5–7 features + CTA)',
  '  testimonials (3 quotes, each: 2–3 sentences + name + role + avatar image)',
  '  faq (5–7 Q&A accordion, each answer 2–4 sentences)',
  '  contact (form + location/hours)',
  '  footer (4 columns of real links)',
  '',
  'ANTI-SKELETON: if you are running out of budget, DROP a section entirely. Never leave <section><h2>Pricing</h2></section> empty. Fill or omit.',
  '',
  'DESIGN: custom 5-color palette tuned to the brief. Pair 2 Google Fonts (try: Fraunces+DM Sans, Space Grotesk+Inter, Bricolage+Geist, Bebas+Manrope, Cormorant+Inter). :root CSS vars for every color/shadow. ONE signature visual treatment applied everywhere (e.g. editorial serif + paper grain, glassmorphism + neon glow, brutalist sharp + scanlines). Modern CSS: gradient text, backdrop-blur, soft-glow shadows, mesh gradients.',
  '',
  'IMAGES — MANDATORY, 6–10 total. Every <img> uses EXACTLY: https://image.pollinations.ai/prompt/{URL_ENCODED_VIVID_DESCRIPTION}?width={W}&height={H}&nologo=true&seed={N}&model=flux',
  '  Sizes: hero 1600x900 · gallery 1200x800 · card 800x600 · menu-item 600x600 · avatar 400x400.',
  '  Seed = unique integer 1–9999 per image. Add loading="lazy" (except hero) and a real alt.',
  '  Menu/product cards MUST each have their own photo. NO emoji icons, NO stock photos, NO placeholders.',
  '',
  'INTERACTIVITY (vanilla JS, inline at end of body):',
  '  - Mobile hamburger toggles slide-out nav.',
  '  - "Reserve"/"Book"/"Order"/"Contact" buttons open a working modal form.',
  '  - Form submit: preventDefault, validate, show inline "Thanks!" message.',
  '  - Gallery cards open a lightbox (Escape + backdrop click to close).',
  '  - Nav anchors smooth-scroll.',
  '  - Keyboard: Escape closes modals, Enter activates focused buttons.',
  '',
  'ANIMATIONS:',
  '  - Hero title word-stagger fade+rise on load (900ms cubic-bezier(.22,1,.36,1)).',
  '  - IntersectionObserver scroll-reveal on every section (0.15, once).',
  '  - Card grids: 100ms stagger.',
  '  - Hover: cards lift -6px + shadow; buttons lift -2px + glow.',
  '  - Count-up numbers on stats when in view.',
  '  - Subtle hero parallax (translate3d).',
  '  - ONE signature animated element (floating shapes / pulsing orb / scan-line / drifting mesh).',
  '  - html { scroll-behavior: smooth; }. Honor prefers-reduced-motion.',
  '',
  'A11Y + RESPONSIVE: semantic landmarks, alt text, ≥44px tap targets, mobile-first at 375px, focus rings visible.',
  '',
  'SEO: <title>, meta description, og:title, og:description, og:image (Pollinations URL), theme-color.',
  '',
  'Aim for 600–1200 lines of dense, portfolio-grade output.',
].join('\n');

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.AI) {
    return jsonError('AI binding not configured. Add it in Pages → Settings → Functions → Bindings.', 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const brief = (body.brief || '').toString().trim();
  if (!brief) return jsonError('brief is required', 400);

  const name = (body.name || 'Untitled').toString();
  const type = (body.type || 'website').toString();
  const referenceUrl = (body.referenceUrl || '').toString().trim();
  // Prefer BYOK key from the request body; fall back to the server-side
  // Cloudflare Pages env var so every user of the deployed site
  // automatically gets Gemini 2.5 Pro quality without pasting their own key.
  const geminiKey = (body.geminiKey || env.GEMINI_API_KEY || '').toString().trim();

  // If a reference URL was provided, scrape it with Firecrawl and extract
  // design cues (colors, fonts, layout patterns, tone of voice) that we
  // inject into the user message as a "Reference:" block.
  let referenceBlock = '';
  if (referenceUrl && env.FIRECRAWL_API_KEY) {
    try {
      const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: referenceUrl,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 1500,
        }),
      });
      if (fcRes.ok) {
        const fcJson = await fcRes.json();
        const md = (fcJson?.data?.markdown || '').slice(0, 3500);
        const html = (fcJson?.data?.html || fcJson?.data?.rawHtml || '').slice(0, 12000);

        // Extract color hex codes and font-family declarations from the raw HTML
        const hexes = [...new Set((html.match(/#[0-9a-fA-F]{6}\b/g) || []))].slice(0, 8);
        const fonts = [...new Set((html.match(/font-family\s*:\s*["']?([A-Za-z][A-Za-z0-9 \-]+)/g) || [])
          .map(s => s.replace(/.*font-family\s*:\s*["']?/, '').trim()))].slice(0, 5);
        const title = (fcJson?.data?.metadata?.title || '').slice(0, 120);
        const description = (fcJson?.data?.metadata?.description || '').slice(0, 200);

        referenceBlock = [
          '\n\n=== REFERENCE SITE (scraped via Firecrawl) ===',
          `URL: ${referenceUrl}`,
          title ? `Title: ${title}` : '',
          description ? `Description: ${description}` : '',
          hexes.length ? `Detected color palette: ${hexes.join(', ')}` : '',
          fonts.length ? `Detected fonts: ${fonts.join(', ')}` : '',
          md ? `\nContent sample:\n${md.slice(0, 1500)}` : '',
          '=== END REFERENCE ===',
          '',
          'Use the reference as LOOSE design inspiration only. Adapt its palette, typography, and tone to the brief — do not copy its copy or layout verbatim. The brief always wins.',
        ].filter(Boolean).join('\n');
      }
    } catch (e) {
      // Firecrawl scrape failed — proceed without reference, don't block the build
      referenceBlock = '\n\n(Note: reference URL scrape failed, proceeding with brief alone.)';
    }
  } else if (referenceUrl && !env.FIRECRAWL_API_KEY) {
    referenceBlock = '\n\n(Note: reference URL was supplied but FIRECRAWL_API_KEY is not configured, so scraping was skipped.)';
  }

  const userMsg = `Brief:\n${brief}\n\nDetected site name: ${name}\nDetected type: ${type}${referenceBlock}\n\nReturn the complete single-file HTML now.`;

  // BYOK path: user supplied a Google Gemini key → use Gemini 2.5 Pro
  // (free tier, far higher quality than Llama 3.3 70B for HTML).
  if (geminiKey && /^AIza[\w-]{20,}$/.test(geminiKey)) {
    try {
      const html = await callGemini(geminiKey, SYSTEM_PROMPT, userMsg);
      if (!html || html.length < 500) {
        // Fall through to Workers AI if Gemini returned nothing useful
      } else {
        return new Response(JSON.stringify({ html, model: 'gemini-2.5-pro', engine: 'google-ai-studio' }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (err) {
      // Gemini errored (bad key, quota, network) — silently fall through
      // to the Workers AI path so the user still gets a site.
    }
  }

  // Default path: Cloudflare Workers AI Llama 3.3 70B
  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 8000,
      temperature: 0.75,
    });

    let html = aiResponse?.response || aiResponse?.result?.response || '';
    html = String(html || '').trim();
    html = html.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const docIdx = html.search(/<!DOCTYPE\s+html/i);
    if (docIdx > 0) html = html.slice(docIdx);

    if (!html || html.length < 500) {
      return jsonError('AI returned empty or too-short output', 502);
    }

    return new Response(JSON.stringify({ html, model: 'llama-3.3-70b-instruct-fp8-fast', engine: 'cloudflare-workers-ai' }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return jsonError('Workers AI error: ' + (err?.message || String(err)), 502);
  }
}

// Call Google AI Studio (Gemini 2.5 Pro) with the same system + user prompts.
// Returns the extracted HTML string, or empty string on no output.
async function callGemini(apiKey, systemPrompt, userMsg) {
  // Try models in order: preferred → safe fallbacks.
  const models = ['gemini-2.5-pro', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];
  let lastErr = null;
  for (const model of models) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(apiKey);
      // Gemini v1beta uses camelCase `systemInstruction`, not snake_case.
      // Safety settings and responseMimeType omitted — they're unnecessary
      // and BLOCK_NONE requires special account perms.
      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 16000,
        },
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const bodyTxt = await res.text().catch(() => '');
        lastErr = new Error('Gemini ' + model + ' ' + res.status + ': ' + bodyTxt.slice(0, 200));
        continue;
      }
      const j = await res.json();
      const parts = j?.candidates?.[0]?.content?.parts || [];
      let text = parts.map(p => p?.text || '').join('').trim();
      text = text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const docIdx = text.search(/<!DOCTYPE\s+html/i);
      if (docIdx > 0) text = text.slice(docIdx);
      if (text && text.length > 500) return text;
      lastErr = new Error('Gemini ' + model + ' returned empty/short output');
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('All Gemini models failed');
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
