// ═══════════════════════════════════════════════════════════
//  NOVAMOTION BUILDER ENGINE — script.js
// ═══════════════════════════════════════════════════════════

class SiteGenerator {
  constructor(brief) {
    this.brief = brief;
    this.p = this.parseBrief(brief);
  }

  parseBrief(brief) {
    const t = brief.toLowerCase();

    // Name — try standard brief fields first, then quoted, then "called X", then bare first word
    let name = 'MySite';
    const nm = brief.match(/(?:^|\n)\s*(?:site\s*name|name|brand|business|company|project|title)\s*[:\-]\s*([A-Za-z][A-Za-z0-9\s&'\-\.]{1,40})/i) ||
               brief.match(/["']([^"']{2,40})["']/) ||
               brief.match(/(?:called|named)\s+([A-Za-z][A-Za-z0-9\s&'\-]{1,30})/i) ||
               brief.match(/^([A-Za-z][A-Za-z0-9\s&\-]{1,20})[\s,\.]/);
    if (nm) {
      let raw = nm[1].trim().replace(/[,\.;\s]+$/, '');
      // Strip stray field words if user wrote "Site name: X Purpose: Y" all on one line
      raw = raw.split(/\s+(?:purpose|style|color|sections?|reference|hero|image)\s*[:\-]/i)[0].trim();
      name = raw.replace(/\b\w/g, c => c.toUpperCase());
    }

    // Type detection
    let type = 'saas';
    if (/pizza|restaurant|cafe|bakery|food|diner|bistro|sushi|burger|taco|italian|french\s+cuisine/.test(t)) type = 'restaurant';
    else if (/portfolio|designer|photographer|artist|freelanc|illustrat/.test(t)) type = 'portfolio';
    else if (/saas|software|app\b|tool\b|platform|dashboard|productivity/.test(t)) type = 'saas';
    else if (/agency|studio|creative\s+agency|branding\s+agency/.test(t)) type = 'agency';
    else if (/shop|store|ecommerce|e-commerce|product|boutique|marketplace/.test(t)) type = 'ecommerce';
    else if (/startup|launch|venture|mvp/.test(t)) type = 'startup';
    else if (/blog|news|magazine|journal|editorial/.test(t)) type = 'blog';
    else if (/gym|fitness|yoga|health|wellness|spa/.test(t)) type = 'fitness';
    else if (/law|legal|attorney|firm|consult/.test(t)) type = 'professional';

    // Theme — type-aware defaults first, overridden by keywords
    const typeThemes = {
      restaurant: 'warm', portfolio: 'minimal', agency: 'dark',
      ecommerce: 'light', fitness: 'dark', professional: 'light',
      saas: 'light', startup: 'dark', blog: 'light',
    };
    let theme = typeThemes[type] || 'dark';
    if (/\blight\b|\bwhite\b|\bclean\b|\bminimal\b|\bairy\b/.test(t)) theme = 'light';
    if (/\bwarm\b|\bcozy\b|\brushtic\b|\bearthy\b/.test(t)) theme = 'warm';
    if (/\bluxury\b|\belegant\b|\bpremium\b|\bgold\b/.test(t)) theme = 'luxury';
    if (/\bdark\b|\bblack\b|\bnight\b|\bbold\b|\bbrutalist\b/.test(t)) theme = 'dark';

    // Color — type-aware defaults, keyword override
    const typeColors = {
      restaurant: ['#d97706','#92400e'], portfolio: ['#111111','#374151'],
      saas:       ['#6366f1','#4338ca'], agency:    ['#ef4444','#b91c1c'],
      ecommerce:  ['#0d9488','#0f766e'], startup:   ['#8b5cf6','#6d28d9'],
      blog:       ['#2563eb','#1d4ed8'], fitness:   ['#f97316','#c2410c'],
      professional:['#1e40af','#1e3a8a'],
    };
    let [primary, secondary] = typeColors[type] || ['#6366f1','#4338ca'];

    const colorMap = {
      red:['#ef4444','#b91c1c'], orange:['#f97316','#c2410c'], amber:['#f59e0b','#b45309'],
      yellow:['#eab308','#a16207'], green:['#22c55e','#15803d'], teal:['#14b8a6','#0f766e'],
      cyan:['#06b6d4','#0e7490'], blue:['#3b82f6','#1d4ed8'], indigo:['#6366f1','#4338ca'],
      violet:['#8b5cf6','#6d28d9'], purple:['#a855f7','#7e22ce'], pink:['#ec4899','#be185d'],
      rose:['#f43f5e','#be123c'], gold:['#d4a853','#92722a'],
    };
    for (const [col,[p,s]] of Object.entries(colorMap)) {
      if (t.includes(col)) { primary = p; secondary = s; break; }
    }

    // Surface colors per theme
    const surfaces = {
      dark:    { bg:'#050505', s1:'#0f0f0f', s2:'#1a1a1a', text:'#f1f5f9', muted:'#94a3b8', border:'rgba(255,255,255,0.07)', navBg:'rgba(5,5,5,0.92)' },
      light:   { bg:'#ffffff', s1:'#f8fafc', s2:'#f1f5f9', text:'#0f172a', muted:'#64748b', border:'rgba(0,0,0,0.08)',        navBg:'rgba(255,255,255,0.95)' },
      warm:    { bg:'#fdf6ec', s1:'#fef3e2', s2:'#fff8ee', text:'#1c0a00', muted:'#92400e', border:'rgba(146,64,14,0.15)',    navBg:'rgba(253,246,236,0.95)' },
      luxury:  { bg:'#080808', s1:'#111111', s2:'#1c1c1c', text:'#f5f0e8', muted:'#a89060', border:'rgba(212,168,83,0.18)', navBg:'rgba(8,8,8,0.95)' },
      minimal: { bg:'#fafafa', s1:'#ffffff', s2:'#f4f4f5', text:'#18181b', muted:'#71717a', border:'rgba(0,0,0,0.06)',        navBg:'rgba(250,250,250,0.97)' },
    };
    const surf = surfaces[theme] || surfaces.dark;

    // Fonts per type/theme
    const fontSets = {
      restaurant: { url:'family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700', h:'Playfair Display', b:'Lato' },
      portfolio:  { url:'family=DM+Sans:wght@300;400;500;700&family=DM+Serif+Display', h:'DM Serif Display', b:'DM Sans' },
      luxury:     { url:'family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400', h:'Cormorant Garamond', b:'Inter' },
      blog:       { url:'family=Merriweather:wght@300;400;700&family=Inter:wght@400;500', h:'Merriweather', b:'Inter' },
      professional:{ url:'family=Source+Serif+4:wght@400;600&family=Inter:wght@400;500', h:'Source Serif 4', b:'Inter' },
      default:    { url:'family=Inter:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@700;900', h:'Space Grotesk', b:'Inter' },
    };
    const fonts = fontSets[type] || fontSets.default;

    // Tagline
    const taglines = {
      restaurant: ['Where flavor meets memory.','Crafted fresh. Served with love.','Come hungry. Leave inspired.'],
      portfolio:  ['Great design is invisible.','Ideas turned into impact.','Crafted with purpose, built to last.'],
      saas:       ['Ship faster. Scale smarter.','The platform your team was waiting for.','Built for the way teams actually work.'],
      agency:     ['We make brands unforgettable.','Strategy. Design. Results.','Big ideas. Real outcomes.'],
      ecommerce:  ['Quality you can feel.','Shop the difference.','Discover something remarkable.'],
      startup:    ['The future starts here.','Build different.','Zero to launch, your way.'],
      fitness:    ['Push past your limits.','Strong starts here.','Your best self, engineered.'],
      professional:['Trusted. Proven. Precise.','Experience you can count on.','Excellence in every engagement.'],
    };
    const tl = taglines[type] || ['Built different.','Excellence by design.','The next level.'];
    const tagline = tl[Math.floor(Math.random() * tl.length)];

    // Layout variant drives hero structure
    const layoutMap = {
      restaurant:'centered-hero', portfolio:'split-hero', saas:'feature-hero',
      agency:'full-hero', ecommerce:'shop-hero', startup:'gradient-hero',
      fitness:'bold-hero', professional:'clean-hero', blog:'editorial-hero',
    };
    const layout = layoutMap[type] || 'centered-hero';

    return { name, type, theme, primary, secondary, fonts, tagline, layout, ...surf };
  }

  // ── Main generate ──────────────────────────────────────
  generate() {
    const p = this.p;
    const bodyClass = p.theme === 'dark' || p.theme === 'luxury' ? 'dark-mode' : '';

    return `<!DOCTYPE html>
<html lang="en" class="${bodyClass}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${p.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?${p.fonts.url}&display=swap" rel="stylesheet"/>
<style>
${this._css()}
</style>
</head>
<body>
${this._nav()}
${this._hero()}
${this._mainSections()}
${this._contact()}
${this._footer()}
<script>
(function(){
  var nav=document.getElementById('sitenav');
  window.addEventListener('scroll',function(){nav.classList.toggle('stuck',window.scrollY>50);},{passive:true});
  var els=document.querySelectorAll('[data-reveal]');
  if(!els.length)return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='none';io.unobserve(e.target);}});
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el,i){
    el.style.opacity='0';
    el.style.transform='translateY(28px)';
    el.style.transition='opacity 0.7s ease '+(i%4*0.12)+'s, transform 0.7s ease '+(i%4*0.12)+'s';
    io.observe(el);
  });
  document.querySelectorAll('.hero-item').forEach(function(el,i){
    setTimeout(function(){el.style.opacity='1';el.style.transform='none';},200+i*130);
  });
})();
<\/script>
</body>
</html>`;
  }

  // ── CSS ────────────────────────────────────────────────
  _css() {
    const p = this.p;
    const rad = p.theme === 'luxury' ? '0px' : p.type === 'restaurant' ? '8px' : '6px';
    return `
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;font-size:16px}
body{background:${p.bg};color:${p.text};font-family:'${p.fonts.b}',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}
h1,h2,h3,h4,h5{font-family:'${p.fonts.h}',system-ui,sans-serif;line-height:1.15;font-weight:700}
a{text-decoration:none;color:inherit}
img{max-width:100%;height:auto;display:block}
section{padding:88px 24px}
.wrap{max-width:1160px;margin:0 auto;width:100%}
/* Nav */
#sitenav{position:fixed;inset:0 0 auto;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:68px;transition:background .3s,backdrop-filter .3s,box-shadow .3s}
#sitenav.stuck{background:${p.navBg};backdrop-filter:blur(16px);box-shadow:0 1px 0 ${p.border}}
.nav-logo{font-family:'${p.fonts.h}',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.02em}
.nav-links{display:flex;gap:32px;list-style:none;align-items:center}
.nav-links a{font-size:14px;font-weight:500;color:${p.muted};transition:color .2s}
.nav-links a:hover{color:${p.primary}}
.nav-cta{background:${p.primary};color:#fff;padding:10px 22px;border-radius:${rad};font-size:13px;font-weight:600;letter-spacing:0.02em;transition:all .2s;white-space:nowrap}
.nav-cta:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 8px 24px ${p.primary}44}
/* Buttons */
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;cursor:pointer;border:none;transition:all .22s;border-radius:${rad};font-family:inherit;text-decoration:none;white-space:nowrap}
.btn-primary{background:${p.primary};color:#fff;padding:15px 32px;box-shadow:0 4px 20px ${p.primary}33}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 12px 32px ${p.primary}44}
.btn-outline{background:transparent;color:${p.text};border:1.5px solid ${p.border};padding:14px 30px}
.btn-outline:hover{border-color:${p.primary};color:${p.primary}}
/* Cards */
.card{background:${p.s2};border:1px solid ${p.border};border-radius:${rad};padding:32px;transition:all .3s}
.card:hover{border-color:${p.primary}44;transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.12)}
/* Grids */
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
/* Labels */
.label{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${p.primary};margin-bottom:14px;display:block}
/* Hero base */
.hero-item{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
/* Sections alt bg */
.alt-bg{background:${p.s1}}
/* Divider accent */
.accent-line{width:48px;height:3px;background:${p.primary};border-radius:2px;margin-bottom:20px}
/* Stat */
.stat-num{font-family:'${p.fonts.h}',sans-serif;font-size:48px;font-weight:700;color:${p.primary};line-height:1}
.stat-lbl{font-size:13px;font-weight:600;color:${p.muted};text-transform:uppercase;letter-spacing:.08em;margin-top:6px}
/* Badge */
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:${p.primary}12;border:1px solid ${p.primary}28;border-radius:99px;font-size:13px;font-weight:600;color:${p.primary};margin-bottom:28px}
/* Testimonial */
.testi-stars{color:${p.primary};font-size:18px;margin-bottom:14px}
/* Icon circle */
.icon-wrap{width:52px;height:52px;border-radius:${rad === '0px' ? '0' : '12px'};background:${p.primary}14;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px}
/* Tag pill */
.pill{display:inline-block;padding:4px 12px;border-radius:4px;background:${p.s2};border:1px solid ${p.border};font-size:12px;font-weight:600;color:${p.muted};margin:3px}
/* Form */
input,textarea{background:${p.s2};border:1.5px solid ${p.border};color:${p.text};padding:13px 16px;border-radius:${rad};font-family:inherit;font-size:15px;width:100%;outline:none;transition:border-color .2s}
input:focus,textarea:focus{border-color:${p.primary}}
/* Footer */
.site-footer{background:${p.s1};border-top:1px solid ${p.border};padding:48px 24px}
/* Responsive */
@media(max-width:768px){
  section{padding:64px 20px}.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
  #sitenav{padding:0 20px}.nav-links{display:none}
  h1{font-size:clamp(36px,10vw,64px)!important}
}
@media(prefers-reduced-motion:reduce){
  .hero-item,[data-reveal]{opacity:1!important;transform:none!important;transition:none!important}
}
${this._typeCSS()}`;
  }

  _typeCSS() {
    const p = this.p;
    if (p.type === 'restaurant') return `
.menu-card{background:${p.s2};border:1px solid ${p.border};border-radius:8px;overflow:hidden}
.menu-img{height:180px;display:flex;align-items:center;justify-content:center;font-size:56px;background:linear-gradient(135deg,${p.primary}18,${p.secondary}12)}
.menu-body{padding:20px}
.price{font-size:22px;font-weight:700;color:${p.primary};float:right}`;
    if (p.type === 'portfolio') return `
.work-item{position:relative;overflow:hidden;border-radius:8px;cursor:pointer;background:${p.s2};aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;font-size:48px}
.work-item:hover .work-overlay{opacity:1}
.work-overlay{position:absolute;inset:0;background:${p.primary}e0;opacity:0;transition:opacity .3s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff}`;
    if (p.type === 'saas') return `
.feature-hero-img{background:linear-gradient(135deg,${p.primary}18 0%,${p.secondary}08 100%);border:1px solid ${p.border};border-radius:12px;height:360px;display:flex;align-items:center;justify-content:center;font-size:64px;position:relative;overflow:hidden}
.pricing-card{background:${p.s2};border:2px solid ${p.border};border-radius:12px;padding:36px;text-align:center;transition:all .3s}
.pricing-card.featured{border-color:${p.primary};box-shadow:0 0 0 4px ${p.primary}12}`;
    if (p.type === 'agency') return `
.project-num{font-size:80px;font-weight:900;color:${p.primary}20;position:absolute;top:16px;right:20px;line-height:1;font-family:'${p.fonts.h}',sans-serif}
.service-row{padding:24px 0;border-bottom:1px solid ${p.border};display:flex;justify-content:space-between;align-items:center;transition:color .2s;cursor:default}
.service-row:hover{color:${p.primary}}`;
    return '';
  }

  // ── Nav ────────────────────────────────────────────────
  _nav() {
    const p = this.p;
    const links = { restaurant:['Menu','About','Reservations'], saas:['Features','Pricing','About'], agency:['Work','Services','About'], portfolio:['Work','About','Contact'], default:['About','Services','Contact'] };
    const navLinks = (links[p.type] || links.default).map(l => `<li><a href="#${l.toLowerCase()}">${l}</a></li>`).join('');
    return `<nav id="sitenav">
  <div class="nav-logo">${p.name}</div>
  <ul class="nav-links">${navLinks}</ul>
  <a href="#contact" class="nav-cta">${p.type === 'restaurant' ? 'Reserve a Table' : p.type === 'portfolio' ? 'Hire Me' : 'Get Started'}</a>
</nav>`;
  }

  // ── Hero (type-specific) ───────────────────────────────
  _hero() {
    const p = this.p;
    switch (p.layout) {
      case 'centered-hero': return this._heroCentered();
      case 'split-hero':    return this._heroSplit();
      case 'feature-hero':  return this._heroFeature();
      case 'full-hero':     return this._heroFull();
      case 'shop-hero':     return this._heroShop();
      case 'gradient-hero': return this._heroGradient();
      case 'bold-hero':     return this._heroBold();
      case 'clean-hero':    return this._heroClean();
      case 'editorial-hero':return this._heroEditorial();
      default:              return this._heroCentered();
    }
  }

  _heroCentered() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;padding:120px 24px;background:${p.bg}">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,${p.primary}18 0%,transparent 65%);pointer-events:none"></div>
  <div style="position:absolute;inset:0;background-image:radial-gradient(${p.border} 1px,transparent 1px);background-size:32px 32px;pointer-events:none"></div>
  <div class="wrap" style="position:relative;z-index:1">
    <div class="badge hero-item">✦ Now Open &nbsp;·&nbsp; Est. ${new Date().getFullYear()}</div>
    <h1 class="hero-item" style="font-size:clamp(52px,8vw,96px);font-weight:700;letter-spacing:-0.03em;margin-bottom:24px;max-width:820px;margin-left:auto;margin-right:auto">${p.name}<br/><span style="color:${p.primary}">${p.tagline}</span></h1>
    <p class="hero-item" style="font-size:19px;color:${p.muted};max-width:520px;margin:0 auto 40px;line-height:1.7">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <a href="#contact" class="btn btn-primary">${p.type === 'restaurant' ? '📅 Reserve a Table' : 'Get Started →'}</a>
      <a href="#about" class="btn btn-outline">${p.type === 'restaurant' ? '🍽️ View Menu' : 'Learn More'}</a>
    </div>
    <div class="hero-item" style="margin-top:64px;display:flex;gap:40px;justify-content:center;flex-wrap:wrap">
      ${this._heroStats().map(([n,l]) => `<div style="text-align:center"><div class="stat-num" style="font-size:32px">${n}</div><div class="stat-lbl" style="font-size:12px">${l}</div></div>`).join('')}
    </div>
  </div>
</section>`;
  }

  _heroSplit() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:${p.bg};padding-top:68px">
  <div style="display:flex;flex-direction:column;justify-content:center;padding:80px 48px 80px 8vw">
    <span class="label hero-item">${p.type} portfolio</span>
    <h1 class="hero-item" style="font-size:clamp(40px,5vw,72px);font-weight:700;margin-bottom:24px;letter-spacing:-0.02em">Hi, I'm <span style="color:${p.primary}">${p.name}.</span><br/>I build things that matter.</h1>
    <p class="hero-item" style="font-size:17px;color:${p.muted};max-width:420px;line-height:1.75;margin-bottom:36px">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="#work" class="btn btn-primary">View My Work</a>
      <a href="#contact" class="btn btn-outline">Let's Talk</a>
    </div>
    <div class="hero-item" style="margin-top:48px;display:flex;gap:32px">
      ${this._heroStats().map(([n,l]) => `<div><div class="stat-num" style="font-size:36px">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
    </div>
  </div>
  <div style="background:${p.s1};display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
    <div style="width:320px;height:320px;border-radius:50%;background:linear-gradient(135deg,${p.primary}30,${p.secondary}20);display:flex;align-items:center;justify-content:center;font-size:120px;position:relative;z-index:1">🎨</div>
    <div style="position:absolute;top:20%;right:10%;width:80px;height:80px;border-radius:50%;background:${p.primary}18;border:1px solid ${p.primary}30"></div>
    <div style="position:absolute;bottom:25%;left:10%;width:48px;height:48px;border-radius:50%;background:${p.secondary}18;border:1px solid ${p.secondary}30"></div>
  </div>
</section>`;
  }

  _heroFeature() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;background:${p.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 48px">
  <div class="wrap">
    <div class="badge hero-item">🚀 ${p.name} is now live</div>
    <h1 class="hero-item" style="font-size:clamp(44px,7vw,88px);font-weight:900;letter-spacing:-0.04em;max-width:900px;margin:0 auto 24px;line-height:1.05">The smarter way to<br/><span style="background:linear-gradient(135deg,${p.primary},${p.secondary});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">get things done.</span></h1>
    <p class="hero-item" style="font-size:19px;color:${p.muted};max-width:560px;margin:0 auto 40px;line-height:1.65">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:64px">
      <a href="#contact" class="btn btn-primary" style="font-size:16px;padding:17px 36px">Start Free Trial →</a>
      <a href="#features" class="btn btn-outline">See how it works</a>
    </div>
    <div class="hero-item feature-hero-img" style="max-width:800px;margin:0 auto">
      <div style="text-align:center">
        <div style="font-size:64px;margin-bottom:16px">⚡</div>
        <div style="font-weight:600;font-size:18px;color:${p.primary}">${p.name} Dashboard</div>
        <div style="font-size:14px;color:${p.muted};margin-top:8px">Your workspace, reimagined</div>
      </div>
      <div style="position:absolute;top:16px;left:16px;display:flex;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:#ff5f57"></span><span style="width:10px;height:10px;border-radius:50%;background:#febc2e"></span><span style="width:10px;height:10px;border-radius:50%;background:#28c840"></span></div>
    </div>
  </div>
</section>`;
  }

  _heroFull() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;background:${p.bg};position:relative;overflow:hidden;display:flex;align-items:center;padding:0 8vw">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,${p.primary}22 0%,transparent 50%,${p.secondary}12 100%)"></div>
  <div style="position:relative;z-index:1;max-width:720px">
    <div class="hero-item" style="display:inline-block;padding:6px 14px;border:1px solid ${p.primary}44;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${p.primary};margin-bottom:28px">${p.name} Agency</div>
    <h1 class="hero-item" style="font-size:clamp(52px,8vw,96px);font-weight:900;letter-spacing:-0.04em;margin-bottom:28px;line-height:1.02">We Build<br/>Brands That<br/><span style="color:${p.primary}">Move People.</span></h1>
    <p class="hero-item" style="font-size:18px;color:${p.muted};max-width:480px;line-height:1.7;margin-bottom:40px">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:16px;flex-wrap:wrap">
      <a href="#work" class="btn btn-primary">See Our Work</a>
      <a href="#contact" class="btn btn-outline">Start a Project</a>
    </div>
  </div>
  <div style="position:absolute;right:-80px;bottom:-80px;width:560px;height:560px;border-radius:50%;background:${p.primary}08;border:1px solid ${p.primary}15"></div>
  <div style="position:absolute;right:80px;bottom:80px;width:240px;height:240px;border-radius:50%;background:${p.secondary}10;border:1px solid ${p.secondary}20"></div>
</section>`;
  }

  _heroShop() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:${p.bg};padding-top:68px">
  <div style="display:flex;flex-direction:column;justify-content:center;padding:80px 48px 80px 8vw">
    <span class="label hero-item">New Collection ${new Date().getFullYear()}</span>
    <h1 class="hero-item" style="font-size:clamp(40px,5.5vw,76px);font-weight:700;letter-spacing:-0.03em;margin-bottom:20px">${p.tagline}</h1>
    <p class="hero-item" style="font-size:17px;color:${p.muted};max-width:400px;line-height:1.75;margin-bottom:36px">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="#products" class="btn btn-primary">Shop Now</a>
      <a href="#about" class="btn btn-outline">Our Story</a>
    </div>
  </div>
  <div style="background:linear-gradient(135deg,${p.primary}18,${p.secondary}10);display:flex;align-items:center;justify-content:center;font-size:96px">🛍️</div>
</section>`;
  }

  _heroGradient() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;background:linear-gradient(135deg,${p.bg} 0%,${p.primary}18 50%,${p.secondary}22 100%);display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px;position:relative;overflow:hidden">
  <div class="wrap" style="position:relative;z-index:1">
    <div class="badge hero-item" style="border-radius:6px">⚡ ${p.name} — Now in Beta</div>
    <h1 class="hero-item" style="font-size:clamp(48px,8vw,96px);font-weight:900;letter-spacing:-0.04em;margin-bottom:20px;line-height:1.05">${p.name}<br/><span style="color:${p.primary}">${p.tagline}</span></h1>
    <p class="hero-item" style="font-size:19px;color:${p.muted};max-width:540px;margin:0 auto 40px;line-height:1.65">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <a href="#contact" class="btn btn-primary" style="padding:16px 36px;font-size:16px">Join the waitlist →</a>
      <a href="#about" class="btn btn-outline">Learn more</a>
    </div>
  </div>
  <div style="position:absolute;top:-200px;left:-200px;width:600px;height:600px;border-radius:50%;background:${p.primary}10;pointer-events:none"></div>
  <div style="position:absolute;bottom:-150px;right:-150px;width:400px;height:400px;border-radius:50%;background:${p.secondary}12;pointer-events:none"></div>
</section>`;
  }

  _heroBold() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;background:${p.bg};display:flex;align-items:center;padding:0 8vw;position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,${p.bg} 60%,${p.primary}18)"></div>
  <div style="position:relative;z-index:1">
    <h1 class="hero-item" style="font-size:clamp(60px,9vw,112px);font-weight:900;letter-spacing:-0.04em;line-height:1;margin-bottom:24px;text-transform:uppercase">${p.tagline.toUpperCase()}</h1>
    <p class="hero-item" style="font-size:18px;color:${p.muted};max-width:480px;line-height:1.7;margin-bottom:36px">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="#contact" class="btn btn-primary">Start Today</a>
      <a href="#about" class="btn btn-outline">Learn More</a>
    </div>
  </div>
  <div style="position:absolute;right:8vw;font-size:200px;opacity:0.06;font-weight:900;font-family:'${p.fonts.h}',sans-serif;user-select:none">💪</div>
</section>`;
  }

  _heroClean() {
    const p = this.p;
    return `<section id="hero" style="min-height:100vh;background:${p.bg};display:flex;align-items:center;padding:0 8vw;border-bottom:1px solid ${p.border}">
  <div style="max-width:680px">
    <div class="accent-line hero-item"></div>
    <h1 class="hero-item" style="font-size:clamp(40px,5vw,72px);font-weight:600;letter-spacing:-0.02em;margin-bottom:24px;line-height:1.15">${p.name}</h1>
    <p class="hero-item" style="font-size:20px;color:${p.muted};line-height:1.7;margin-bottom:40px;max-width:520px">${this._heroDesc()}</p>
    <div class="hero-item" style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:56px">
      <a href="#contact" class="btn btn-primary">Schedule a Consultation</a>
      <a href="#about" class="btn btn-outline">About Our Firm</a>
    </div>
    <div class="hero-item" style="display:flex;gap:40px;padding-top:32px;border-top:1px solid ${p.border}">
      ${this._heroStats().map(([n,l]) => `<div><div class="stat-num" style="font-size:36px">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
    </div>
  </div>
</section>`;
  }

  _heroEditorial() {
    const p = this.p;
    return `<section id="hero" style="min-height:60vh;background:${p.bg};border-bottom:1px solid ${p.border};display:flex;align-items:flex-end;padding:120px 8vw 48px">
  <div class="wrap">
    <span class="label hero-item">${p.name}</span>
    <h1 class="hero-item" style="font-size:clamp(44px,6vw,80px);font-weight:700;letter-spacing:-0.03em;max-width:800px;margin-bottom:20px">${p.tagline}</h1>
    <p class="hero-item" style="font-size:18px;color:${p.muted};max-width:560px;line-height:1.7">${this._heroDesc()}</p>
  </div>
</section>`;
  }

  _heroDesc() {
    const p = this.p, n = p.name;
    const d = {
      restaurant:`${n} is a ${p.brief && p.brief.match(/\w+\s+restaurant|\w+\s+cafe|\w+\s+bistro/i) ? p.brief.match(/\w+\s+(?:restaurant|cafe|bistro)/i)[0] : 'restaurant'} where every dish is prepared with the finest locally sourced ingredients and served with genuine warmth.`,
      portfolio:`I'm a creative professional who turns complex problems into beautiful, functional solutions. ${n} represents my commitment to craft, clarity, and impact.`,
      saas:`${n} gives your team a single place to collaborate, automate, and deliver — without the complexity that slows you down.`,
      agency:`${n} is a full-service creative agency helping brands find their voice, own their market, and connect with audiences that matter.`,
      ecommerce:`${n} brings you a carefully curated collection of products designed to elevate everyday life. Quality you can feel in every detail.`,
      startup:`${n} is reimagining the way things work. We're building the tools and experiences that the next generation relies on.`,
      fitness:`${n} is where your transformation begins. Expert coaching, world-class facilities, and a community that pushes you further every day.`,
      professional:`${n} provides expert counsel with a track record of results. When the stakes are high, experience makes the difference.`,
    };
    return d[p.type] || `${n} delivers excellence in every interaction. Built on expertise, driven by results, trusted by those who demand the best.`;
  }

  _heroStats() {
    const st = {
      restaurant:[['12+','Years Open'],['4.9★','Avg Rating'],['200+','Weekly Guests']],
      portfolio:[['60+','Projects'],['12','Years Exp'],['98%','Satisfaction']],
      saas:[['10K+','Teams'],['99.9%','Uptime'],['2min','Avg Setup']],
      agency:[['200+','Brands'],['15','Countries'],['12yr','Experience']],
      ecommerce:[['50K+','Customers'],['4.8★','Reviews'],['Free','Shipping']],
      startup:[['500+','Beta Users'],['$2M','Raised'],['4mo','To Launch']],
      fitness:[['1,200+','Members'],['50+','Classes/wk'],['15','Trainers']],
      professional:[['30yr','Experience'],['98%','Success Rate'],['500+','Cases']],
    };
    return st[this.p.type] || [['10K+','Clients'],['99%','Satisfaction'],['24/7','Support']];
  }

  // ── Main sections ──────────────────────────────────────
  _mainSections() {
    const p = this.p;
    switch (p.type) {
      case 'restaurant':   return this._sectionsRestaurant();
      case 'portfolio':    return this._sectionsPortfolio();
      case 'saas':         return this._sectionsSaas();
      case 'agency':       return this._sectionsAgency();
      case 'ecommerce':    return this._sectionsEcommerce();
      case 'startup':      return this._sectionsStartup();
      case 'fitness':      return this._sectionsFitness();
      case 'professional': return this._sectionsProfessional();
      default:             return this._sectionsSaas();
    }
  }

  _sectionsRestaurant() {
    const p = this.p;
    const emoji = ['🍕','🍝','🥗','🥩','🍜','🥘','🍣','🍷'];
    const items = [
      {e:'🍕', name:'Margherita Classica', desc:'San Marzano tomatoes, fior di latte, fresh basil, EVOO', price:'$18'},
      {e:'🥗', name:'Garden Burrata',       desc:'Heirloom tomatoes, fresh burrata, aged balsamic reduction', price:'$16'},
      {e:'🥩', name:'Bistecca Fiorentina', desc:'28-day dry-aged T-bone, rosemary, garlic confit', price:'$48'},
      {e:'🍝', name:'Tagliatelle al Ragù', desc:'Fresh egg pasta, slow-braised beef, Parmigiano Reggiano', price:'$26'},
      {e:'🍷', name:'Tiramisu della Casa', desc:'Mascarpone, espresso-soaked ladyfingers, cacao', price:'$12'},
      {e:'🥘', name:"Chef's Risotto",      desc:'Seasonal ingredients, Arborio rice, white wine, herbs', price:'$28'},
    ];
    return `
<section id="about" class="alt-bg">
  <div class="wrap">
    <div class="grid-2" style="gap:64px;align-items:center">
      <div>
        <span class="label" data-reveal>Our Story</span>
        <h2 data-reveal style="font-size:clamp(32px,4vw,52px);margin-bottom:20px;font-weight:700">A Passion for<br/>Authentic Flavor</h2>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:16px">Founded by Chef ${p.name.split(' ')[0]} in ${new Date().getFullYear() - 12}, ${p.name} was born from a simple belief: great food starts with honest ingredients, traditional techniques, and respect for the guest.</p>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:32px">Every morning we source from local farms and markets. Every dish is made from scratch. No shortcuts, no compromises.</p>
        <a href="#contact" class="btn btn-primary" data-reveal>Reserve Your Table</a>
      </div>
      <div data-reveal style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${emoji.slice(0,4).map((e,i) => `<div style="background:${p.s2};border:1px solid ${p.border};border-radius:8px;height:120px;display:flex;align-items:center;justify-content:center;font-size:40px">${e}</div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section id="menu">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:56px">
      <span class="label" data-reveal>Our Menu</span>
      <h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:700">Crafted with Love</h2>
    </div>
    <div class="grid-3">
      ${items.map(it => `<div class="menu-card" data-reveal>
        <div class="menu-img">${it.e}</div>
        <div class="menu-body">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <h3 style="font-size:17px;font-weight:700">${it.name}</h3>
            <span class="price">${it.price}</span>
          </div>
          <p style="font-size:14px;color:${p.muted};line-height:1.6">${it.desc}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section style="background:${p.primary};color:#fff;text-align:center;padding:72px 24px">
  <div class="wrap">
    <h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:700;margin-bottom:16px;color:#fff">Join Us This Weekend</h2>
    <p data-reveal style="font-size:18px;opacity:0.85;margin-bottom:32px">Mon–Fri 12–3pm · 6–11pm &nbsp;|&nbsp; Sat–Sun 11am–11pm</p>
    <a href="#contact" class="btn" data-reveal style="background:#fff;color:${p.primary};padding:16px 36px;font-size:15px;border-radius:6px">Book a Table</a>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsPortfolio() {
    const p = this.p;
    const works = [
      {e:'🎨',t:'Brand Identity',d:'Visual system for a fintech startup',y:'2024'},
      {e:'💻',t:'Web Platform',d:'E-commerce redesign with 40% lift in conversion',y:'2024'},
      {e:'📱',t:'Mobile App',d:'iOS/Android app for 100K+ daily active users',y:'2023'},
      {e:'🎬',t:'Motion Design',d:'Brand film and UI animation library',y:'2023'},
      {e:'✏️',t:'Editorial Design',d:'Annual report and publication design',y:'2022'},
      {e:'🖼️',t:'Art Direction',d:'Campaign creative for global fashion brand',y:'2022'},
    ];
    const skills = ['UI Design','UX Research','Brand Identity','Web Design','Motion','Illustration','Figma','React'];
    return `
<section id="work">
  <div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;flex-wrap:wrap;gap:16px">
      <div>
        <span class="label" data-reveal>Selected Work</span>
        <h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:700">Recent Projects</h2>
      </div>
      <a href="#contact" class="btn btn-outline" data-reveal>All Work</a>
    </div>
    <div class="grid-3">
      ${works.map(w => `<div class="work-item" data-reveal>
        <div style="font-size:56px">${w.e}</div>
        <div class="work-overlay">
          <div style="font-weight:700;font-size:16px">${w.t}</div>
          <div style="font-size:13px;opacity:0.8">${w.d}</div>
          <div style="font-size:12px;opacity:0.6;margin-top:4px">${w.y}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section id="about" class="alt-bg">
  <div class="wrap">
    <div class="grid-2" style="gap:64px;align-items:center">
      <div>
        <span class="label" data-reveal>About</span>
        <h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:700;margin-bottom:20px">I design for people,<br/>not pixels.</h2>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:16px">With ${12 + Math.floor(Math.random()*8)} years of experience across product, brand, and digital, I bring a holistic perspective to every project.</p>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:32px">I've partnered with startups, Fortune 500s, and nonprofits to create design that drives real outcomes.</p>
        <div data-reveal style="display:flex;flex-wrap:wrap;margin-bottom:32px">${skills.map(s => `<span class="pill">${s}</span>`).join('')}</div>
        <a href="#contact" class="btn btn-primary" data-reveal>Let's Work Together</a>
      </div>
      <div data-reveal style="background:${p.s2};border:1px solid ${p.border};border-radius:12px;padding:40px;text-align:center">
        <div style="font-size:80px;margin-bottom:20px">👤</div>
        <div style="font-weight:700;font-size:20px;margin-bottom:8px">${p.name}</div>
        <div style="color:${p.primary};font-size:14px;font-weight:600;margin-bottom:20px">Senior Designer & Creative Director</div>
        <div style="display:flex;justify-content:center;gap:24px">
          ${this._heroStats().map(([n,l]) => `<div><div class="stat-num" style="font-size:28px">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsSaas() {
    const p = this.p;
    const features = [
      {e:'⚡',t:'Blazing Fast',d:'Sub-100ms response times. Built on edge infrastructure for global speed.'},
      {e:'🔒',t:'Secure by Default',d:'SOC 2 Type II, end-to-end encryption, SSO, and audit logs included.'},
      {e:'🤖',t:'AI-Powered',d:'Smart automation that learns from your workflow and eliminates busywork.'},
      {e:'📊',t:'Real-time Analytics',d:'Live dashboards and reporting that surface insights when you need them.'},
      {e:'🔗',t:'200+ Integrations',d:'Works with every tool your team already uses. Zero migration headaches.'},
      {e:'🌍',t:'Built to Scale',d:'From 5 to 50,000 users without re-architecting anything.'},
    ];
    const plans = [
      {n:'Starter',p:'$0',f:['Up to 5 users','5 projects','Basic analytics','Email support'],featured:false},
      {n:'Pro',p:'$29',f:['Unlimited users','Unlimited projects','Advanced analytics','Priority support','AI features'],featured:true},
      {n:'Enterprise',p:'Custom',f:['Everything in Pro','Custom integrations','SLA guarantee','Dedicated CSM','On-prem option'],featured:false},
    ];
    return `
<section id="features" class="alt-bg">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:64px">
      <span class="label" data-reveal>Features</span>
      <h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:700;max-width:600px;margin:0 auto 16px">Everything your team needs in one place</h2>
      <p data-reveal style="color:${p.muted};font-size:18px;max-width:500px;margin:0 auto">No more context-switching. No more tool sprawl. Just work that flows.</p>
    </div>
    <div class="grid-3">
      ${features.map(f => `<div class="card" data-reveal>
        <div class="icon-wrap">${f.e}</div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:10px">${f.t}</h3>
        <p style="font-size:14px;color:${p.muted};line-height:1.7">${f.d}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="grid-2" style="gap:64px;align-items:center">
      <div>
        <span class="label" data-reveal>How it works</span>
        <h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:700;margin-bottom:20px">Up and running in under 2 minutes</h2>
        ${[['1','Connect your tools','Link your existing stack in one click. We support 200+ integrations out of the box.'],['2','Invite your team','Add teammates and assign roles. Granular permissions keep everyone on track.'],['3','Start shipping','Use our pre-built templates or build from scratch. Either way, you\'re in control.']].map(([n,t,d]) => `<div data-reveal style="display:flex;gap:20px;margin-bottom:28px;align-items:start">
          <div style="min-width:36px;height:36px;border-radius:50%;background:${p.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${n}</div>
          <div><div style="font-weight:700;margin-bottom:6px">${t}</div><div style="color:${p.muted};font-size:14px;line-height:1.6">${d}</div></div>
        </div>`).join('')}
      </div>
      <div data-reveal style="background:linear-gradient(135deg,${p.primary}12,${p.secondary}08);border:1px solid ${p.border};border-radius:16px;padding:48px;text-align:center">
        <div style="font-size:64px;margin-bottom:20px">📊</div>
        <div style="font-weight:700;font-size:18px;margin-bottom:8px">Live Dashboard</div>
        <div style="color:${p.muted};font-size:14px;margin-bottom:24px">All your metrics in one view</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${[['↑ 47%','Productivity'],['↓ 60%','Meetings'],['3×','Output'],['4.9★','Team NPS']].map(([v,l]) => `<div style="background:${p.bg};border:1px solid ${p.border};border-radius:8px;padding:16px"><div style="color:${p.primary};font-weight:700;font-size:20px">${v}</div><div style="color:${p.muted};font-size:12px;margin-top:4px">${l}</div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section id="pricing" class="alt-bg">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:56px">
      <span class="label" data-reveal>Pricing</span>
      <h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:700">Simple, transparent pricing</h2>
    </div>
    <div class="grid-3">
      ${plans.map(pl => `<div class="pricing-card${pl.featured?' featured':''}" data-reveal>
        ${pl.featured ? `<div style="text-align:center;margin-bottom:4px"><span style="background:${p.primary};color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 12px;border-radius:4px">Most Popular</span></div>` : ''}
        <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;text-align:center">${pl.n}</h3>
        <div style="text-align:center;margin-bottom:24px"><span style="font-size:40px;font-weight:900;color:${pl.featured?p.primary:p.text}">${pl.p}</span>${pl.p!=='Custom'?'<span style="color:'+p.muted+';font-size:14px">/mo</span>':''}</div>
        <ul style="list-style:none;margin-bottom:28px">${pl.f.map(f=>`<li style="padding:8px 0;border-bottom:1px solid ${p.border};font-size:14px;color:${p.muted};display:flex;gap:8px"><span style="color:${p.primary}">✓</span>${f}</li>`).join('')}</ul>
        <a href="#contact" class="btn ${pl.featured?'btn-primary':'btn-outline'}" style="width:100%;justify-content:center">${pl.p==='Custom'?'Contact Sales':'Start Free'}</a>
      </div>`).join('')}
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsAgency() {
    const p = this.p;
    const projects = [
      {e:'🎯',n:'Apex Fintech',t:'Brand + Web',r:'180% increase in qualified leads'},
      {e:'🛍️',n:'Maison Collective',t:'E-commerce Redesign',r:'3.2× conversion rate improvement'},
      {e:'📱',n:'Flare Mobile',t:'Product Design',r:'4.8★ App Store rating at launch'},
      {e:'🏗️',n:'Nova Properties',t:'Digital Strategy',r:'$40M in deals attributed to digital'},
    ];
    const services = ['Brand Strategy','Visual Identity','Web Design & Dev','Campaign Creative','UX/Product Design','Motion & Video'];
    return `
<section id="work">
  <div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;flex-wrap:wrap;gap:16px">
      <div><span class="label" data-reveal>Our Work</span><h2 data-reveal style="font-size:clamp(32px,5vw,56px);font-weight:900">Selected Projects</h2></div>
    </div>
    ${projects.map((pr,i) => `<div data-reveal style="display:flex;justify-content:space-between;align-items:center;padding:28px 0;border-bottom:1px solid ${p.border};gap:20px;flex-wrap:wrap;position:relative">
      <div class="project-num">${String(i+1).padStart(2,'0')}</div>
      <div style="font-size:32px">${pr.e}</div>
      <div style="flex:1;min-width:200px"><div style="font-size:20px;font-weight:700;margin-bottom:4px">${pr.n}</div><div style="color:${p.muted};font-size:14px">${pr.t}</div></div>
      <div style="color:${p.primary};font-size:14px;font-weight:600;max-width:240px">${pr.r}</div>
      <span style="font-size:24px;color:${p.muted}">→</span>
    </div>`).join('')}
  </div>
</section>

<section id="services" class="alt-bg">
  <div class="wrap">
    <div class="grid-2" style="gap:64px;align-items:center">
      <div>
        <span class="label" data-reveal>Services</span>
        <h2 data-reveal style="font-size:clamp(28px,4vw,52px);font-weight:900;margin-bottom:20px">What We Do</h2>
        <p data-reveal style="color:${p.muted};font-size:17px;line-height:1.75;margin-bottom:32px">We're not a production house — we're a strategic partner. From positioning to pixels, we own the outcome alongside you.</p>
        <a href="#contact" class="btn btn-primary" data-reveal>Start a Project</a>
      </div>
      <div>
        ${services.map(s => `<div class="service-row" data-reveal>
          <span style="font-size:17px;font-weight:600">${s}</span>
          <span style="color:${p.primary}">→</span>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsEcommerce() {
    const p = this.p;
    const products = [
      {e:'👜',n:'Classic Tote',price:'$89',badge:'Bestseller'},
      {e:'🕶️',n:'Sun Frame',price:'$129',badge:'New'},
      {e:'🧴',n:'Serum Set',price:'$64',badge:''},
      {e:'🪴',n:'Ceramic Planter',price:'$48',badge:'Sale'},
      {e:'📚',n:'Linen Journal',price:'$34',badge:''},
      {e:'🕯️',n:'Hand-poured Candle',price:'$42',badge:'New'},
    ];
    return `
<section id="products">
  <div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;flex-wrap:wrap;gap:16px">
      <div><span class="label" data-reveal>Collection</span><h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:700">Featured Products</h2></div>
      <a href="#" class="btn btn-outline" data-reveal>View All</a>
    </div>
    <div class="grid-3">
      ${products.map(pr => `<div class="card" data-reveal style="padding:0;overflow:hidden">
        <div style="height:200px;background:linear-gradient(135deg,${p.primary}14,${p.secondary}10);display:flex;align-items:center;justify-content:center;font-size:64px;position:relative">
          ${pr.e}
          ${pr.badge ? `<span style="position:absolute;top:12px;left:12px;background:${p.primary};color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;text-transform:uppercase">${pr.badge}</span>` : ''}
        </div>
        <div style="padding:20px">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:6px">${pr.n}</h3>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="color:${p.primary};font-size:18px;font-weight:700">${pr.price}</span>
            <button style="background:${p.primary};color:#fff;border:none;padding:8px 16px;border-radius:4px;font-size:13px;font-weight:600;cursor:pointer">Add to Cart</button>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="alt-bg" style="text-align:center">
  <div class="wrap">
    <span class="label" data-reveal>Why ${p.name}</span>
    <h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:700;margin-bottom:48px">The difference is in the details</h2>
    <div class="grid-4">
      ${[['🚚','Free Shipping','On all orders over $50'],['♻️','Sustainable','100% eco-friendly packaging'],['↩️','Easy Returns','30-day no-questions policy'],['🔒','Secure Pay','256-bit SSL encryption']].map(([e,t,d]) => `<div data-reveal style="text-align:center">
        <div style="font-size:40px;margin-bottom:16px">${e}</div>
        <h3 style="font-weight:700;margin-bottom:8px">${t}</h3>
        <p style="color:${p.muted};font-size:14px">${d}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsStartup() {
    const p = this.p;
    return `
<section id="about" class="alt-bg">
  <div class="wrap">
    <div style="text-align:center;max-width:700px;margin:0 auto">
      <span class="label" data-reveal>The Mission</span>
      <h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:900;margin-bottom:20px">We're building the future of ${this.brief.match(/\w+\s+(?:for|of)\s+(\w+)/i)?.[1] || 'work'}.</h2>
      <p data-reveal style="color:${p.muted};font-size:18px;line-height:1.7;margin-bottom:40px">${p.name} was founded on the belief that the tools shaping tomorrow shouldn't be locked behind complexity, gatekeeping, or legacy thinking.</p>
    </div>
    <div class="grid-4" style="margin-top:48px">
      ${this._heroStats().map(([n,l]) => `<div data-reveal style="text-align:center;padding:32px;background:${p.s2};border:1px solid ${p.border};border-radius:8px"><div class="stat-num">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
    </div>
  </div>
</section>

<section id="features">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:56px"><span class="label" data-reveal>Product</span><h2 data-reveal style="font-size:clamp(28px,4vw,52px);font-weight:900">Built different, from day one.</h2></div>
    <div class="grid-3">
      ${[['🔮','Future-proof Architecture','Built on modern infrastructure that scales to millions without re-architecting.'],['⚡','10× Faster','What takes hours with legacy tools takes minutes here.'],['🧠','Smart by default','AI assistance built into every workflow, not bolted on.'],['🎯','Opinionated','We made the hard choices so you don\'t have to. Best practices, baked in.'],['🔓','Open & extensible','Full API access. Build on top of us or connect your entire stack.'],['🌱','Grows with you','Start solo. Scale to enterprise. Same platform, no migration.']].map(([e,t,d]) => `<div class="card" data-reveal><div class="icon-wrap">${e}</div><h3 style="font-weight:700;font-size:17px;margin-bottom:10px">${t}</h3><p style="color:${p.muted};font-size:14px;line-height:1.7">${d}</p></div>`).join('')}
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsFitness() {
    const p = this.p;
    const classes = [
      {e:'🏋️',n:'Strength Training',t:'Mon/Wed/Fri · 6am, 12pm, 6pm'},
      {e:'🧘',n:'Yoga Flow',t:'Daily · 7am, 6pm'},
      {e:'🥊',n:'Boxing & HIIT',t:'Tue/Thu/Sat · 7am, 5pm'},
      {e:'🚴',n:'Spin Class',t:'Mon–Sat · 6:30am, 7pm'},
      {e:'🏊',n:'Swim Training',t:'Mon–Fri · 5:30am, 7pm'},
      {e:'🤸',n:'Functional Fitness',t:'Daily · Various times'},
    ];
    return `
<section id="about" class="alt-bg">
  <div class="wrap">
    <div class="grid-2" style="gap:64px;align-items:center">
      <div>
        <span class="label" data-reveal>About ${p.name}</span>
        <h2 data-reveal style="font-size:clamp(28px,4vw,52px);font-weight:900;margin-bottom:20px">More than a gym.<br/>A movement.</h2>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:16px">${p.name} is where elite athletes and everyday heroes train side by side. Our world-class coaches and state-of-the-art facilities push you to levels you didn't think possible.</p>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:32px">No judgment. No shortcuts. Just results.</p>
        <a href="#contact" class="btn btn-primary" data-reveal>Start Your Journey</a>
      </div>
      <div data-reveal style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${this._heroStats().concat([['24/7','Access'],['15','Trainers']]).slice(0,4).map(([n,l]) => `<div style="background:${p.s2};border:1px solid ${p.border};border-radius:8px;padding:24px;text-align:center"><div class="stat-num" style="font-size:36px">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section id="classes">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:56px"><span class="label" data-reveal>Classes</span><h2 data-reveal style="font-size:clamp(28px,4vw,52px);font-weight:900">Find your workout</h2></div>
    <div class="grid-3">
      ${classes.map(c => `<div class="card" data-reveal style="display:flex;gap:16px;align-items:start">
        <div style="font-size:32px">${c.e}</div>
        <div><h3 style="font-weight:700;margin-bottom:6px">${c.n}</h3><p style="color:${p.muted};font-size:13px">${c.t}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _sectionsProfessional() {
    const p = this.p;
    const services = [
      {e:'⚖️',t:'Litigation',d:'Aggressive representation in complex commercial, civil, and regulatory disputes.'},
      {e:'🏢',t:'Corporate Law',d:'M&A, contracts, governance, and compliance for businesses at every stage.'},
      {e:'🏠',t:'Real Estate',d:'Transaction counsel for residential, commercial, and development matters.'},
      {e:'👔',t:'Employment',d:'Workplace policy, disputes, executive agreements, and HR compliance.'},
    ];
    return `
<section id="about" class="alt-bg">
  <div class="wrap">
    <div class="grid-2" style="gap:64px;align-items:center">
      <div>
        <span class="label" data-reveal>About the Firm</span>
        <h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:600;margin-bottom:20px">Trusted counsel when it matters most.</h2>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:16px">${p.name} has built a reputation for rigorous analysis, strategic thinking, and results-driven advocacy. Our attorneys bring decades of combined experience across industries and jurisdictions.</p>
        <p data-reveal style="color:${p.muted};font-size:16px;line-height:1.8;margin-bottom:32px">We listen first. Then we act — with precision and purpose.</p>
        <a href="#contact" class="btn btn-primary" data-reveal>Request a Consultation</a>
      </div>
      <div data-reveal>
        <div style="padding:32px;background:${p.s2};border-left:4px solid ${p.primary};border-radius:0 8px 8px 0;margin-bottom:16px">
          <p style="font-size:18px;font-style:italic;color:${p.muted};margin-bottom:12px">"The difference between winning and losing is often the quality of your counsel."</p>
          <div style="font-weight:700;font-size:14px">— Managing Partner, ${p.name}</div>
        </div>
        <div style="display:flex;gap:24px">
          ${this._heroStats().slice(0,3).map(([n,l]) => `<div style="text-align:center;flex:1;padding:20px;background:${p.s2};border-radius:8px"><div class="stat-num" style="font-size:32px">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section id="services">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:56px"><span class="label" data-reveal>Practice Areas</span><h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:600">Our Expertise</h2></div>
    <div class="grid-2">
      ${services.map(s => `<div class="card" data-reveal style="display:flex;gap:20px;align-items:start">
        <div style="font-size:36px">${s.e}</div>
        <div><h3 style="font-weight:700;font-size:18px;margin-bottom:8px">${s.t}</h3><p style="color:${p.muted};font-size:14px;line-height:1.7">${s.d}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>

${this._testimonials()}`;
  }

  _testimonials() {
    const p = this.p;
    const tList = {
      restaurant:[{q:'The food here is genuinely extraordinary. We come every month and it never disappoints.',n:'Isabella M.',r:'Regular Guest'},{q:'The atmosphere, service, and food were all perfect. Best meal I have had in years.',n:'Marco T.',r:'Food Critic'},{q:'Our anniversary dinner was unforgettable. The team made us feel like royalty.',n:'James & Sarah K.',r:'Longtime Customers'}],
      portfolio:[{q:'Working together was a game-changer. They understood our brand better than we did and the results proved it.',n:'Lena Fischer',r:'CEO, Apex Digital'},{q:'Incredible attention to detail. Every decision was intentional and every pixel was considered.',n:'David Kim',r:'Founder, Prism Labs'},{q:'Delivered beyond scope and ahead of schedule. Will absolutely work together again.',n:'Priya Nair',r:'CMO, Luminary'}],
      default:[{q:'This completely changed how we operate. We saw results within the first week.',n:'Alex Chen',r:'CEO, Horizon Labs'},{q:'I was skeptical at first, but the ROI was undeniable. Three months in, we doubled our output.',n:'Maria Santos',r:'Head of Design, Apex Studio'},{q:'The team actually listens. That alone sets them apart from everything else we have tried.',n:'James Wright',r:'Founder, Meridian Co.'}],
    };
    const tests = tList[p.type] || tList.default;
    return `<section style="background:${p.s1}">
  <div class="wrap">
    <div style="text-align:center;margin-bottom:56px"><span class="label" data-reveal>Testimonials</span><h2 data-reveal style="font-size:clamp(28px,4vw,48px);font-weight:700">What people say</h2></div>
    <div class="grid-3">
      ${tests.map(t => `<div class="card" data-reveal>
        <div class="testi-stars">★★★★★</div>
        <p style="font-size:15px;color:${p.muted};line-height:1.75;margin-bottom:20px;flex:1">"${t.q}"</p>
        <div style="border-top:1px solid ${p.border};padding-top:16px"><div style="font-weight:700;font-size:14px">${t.n}</div><div style="color:${p.primary};font-size:12px;font-weight:600;margin-top:2px">${t.r}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
  }

  // ── Contact ────────────────────────────────────────────
  _contact() {
    const p = this.p;
    const cta = { restaurant:'Book Your Table', portfolio:'Start a Project', saas:'Start Free Trial', agency:'Let\'s Talk', default:'Get in Touch' };
    return `<section id="contact" style="background:${p.bg}">
  <div class="wrap" style="max-width:680px;text-align:center">
    <span class="label" data-reveal>${p.type === 'restaurant' ? 'Reservations' : 'Contact'}</span>
    <h2 data-reveal style="font-size:clamp(32px,4vw,52px);font-weight:700;margin-bottom:16px">${p.type === 'restaurant' ? 'Reserve Your Table' : p.type === 'portfolio' ? "Let's work together" : 'Ready to get started?'}</h2>
    <p data-reveal style="color:${p.muted};font-size:17px;margin-bottom:40px;line-height:1.65">${p.type === 'restaurant' ? 'Call us or fill out the form and we\'ll confirm within 24 hours.' : p.type === 'saas' ? 'Start your 14-day free trial. No credit card required.' : 'Drop us a line and we\'ll get back to you within one business day.'}</p>
    <form data-reveal onsubmit="(function(e){e.preventDefault();var m=document.getElementById('cmsg');m.textContent='✓ Message received! We\'ll be in touch soon.';m.style.color='${p.primary}';e.target.reset();return false;})(event)" style="display:flex;flex-direction:column;gap:16px;text-align:left">
      <div class="grid-2" style="gap:16px"><input type="text" placeholder="Your name" required/><input type="email" placeholder="Email address" required/></div>
      ${p.type === 'restaurant' ? '<input type="text" placeholder="Preferred date & time · Party size"/>' : '<input type="text" placeholder="Subject"/>'}
      <textarea placeholder="${p.type === 'restaurant' ? 'Any special requests or dietary requirements?' : 'Tell us about your project...'}" rows="4"></textarea>
      <button type="submit" class="btn btn-primary" style="align-self:center;padding:16px 40px;font-size:16px">${cta[p.type] || cta.default} →</button>
    </form>
    <p id="cmsg" style="margin-top:16px;min-height:20px;font-size:14px;font-weight:600"></p>
  </div>
</section>`;
  }

  // ── Footer ─────────────────────────────────────────────
  _footer() {
    const p = this.p;
    return `<footer class="site-footer">
  <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px">
    <div>
      <div style="font-family:'${p.fonts.h}',sans-serif;font-weight:700;font-size:18px;margin-bottom:6px">${p.name}</div>
      <p style="color:${p.muted};font-size:13px;max-width:280px">© ${new Date().getFullYear()} ${p.name}. All rights reserved.</p>
    </div>
    <div style="display:flex;gap:24px;flex-wrap:wrap">
      ${['About','Contact','Privacy'].map(l => `<a href="#" style="color:${p.muted};font-size:13px;font-weight:500;transition:color .2s" onmouseover="this.style.color='${p.primary}'" onmouseout="this.style.color='${p.muted}'">${l}</a>`).join('')}
    </div>
    <div style="display:flex;gap:12px">
      ${['𝕏','in','📷'].map(i => `<a href="#" style="width:36px;height:36px;border:1px solid ${p.border};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:${p.muted};transition:all .2s" onmouseover="this.style.borderColor='${p.primary}';this.style.color='${p.primary}'" onmouseout="this.style.borderColor='${p.border}';this.style.color='${p.muted}'">${i}</a>`).join('')}
    </div>
  </div>
</footer>`;
  }
}

// ── AUTH ──────────────────────────────────────────────────
class NovaAuth {
  static KEY = 'nova_user';
  static login(email, password) {
    if (!email || password.length < 4) return { ok: false, err: 'Invalid credentials.' };
    const user = { email, name: email.split('@')[0], id: Date.now() };
    localStorage.setItem(this.KEY, JSON.stringify(user));
    return { ok: true, user };
  }
  static logout() { localStorage.removeItem(this.KEY); }
  static getUser() { try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; } }
  static isLoggedIn() { return !!this.getUser(); }
}

// ── PROJECTS ─────────────────────────────────────────────
class NovaProjects {
  static KEY = 'nova_projects';
  static list() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } }
  static save(project) {
    const all = this.list(); const idx = all.findIndex(p => p.id === project.id);
    if (idx >= 0) all[idx] = project; else all.unshift(project);
    localStorage.setItem(this.KEY, JSON.stringify(all.slice(0, 20))); return project;
  }
  static delete(id) { localStorage.setItem(this.KEY, JSON.stringify(this.list().filter(p => p.id !== id))); }
  static get(id) { return this.list().find(p => p.id === id) || null; }
}

// ── BUILDER ───────────────────────────────────────────────
class NovaBuilder {
  constructor() { this.generatedHTML = null; this.generatedName = null; this.building = false; }

  init() { this._bindUI(); this._updateAuthUI(); this._renderProjectsList(); }

  async launch() {
    if (this.building) return;
    const brief = document.getElementById('nb-brief')?.value?.trim();
    if (!brief || brief.length < 8) { this._flashError('Please describe your website (at least 8 characters).'); return; }
    this.building = true; this._setBtn(true); this._resetProgress(); this._clearLog(); this._showTerminal();

    const previewSeed = new SiteGenerator(brief);
    this._appendLog('▶ Parsing brief & extracting intent...');
    this._setProgress(10);
    await this._wait(400);
    this._updateLastLog('✓ Parsed: "' + (previewSeed.p.name || 'Untitled') + '" — type: ' + previewSeed.p.type);

    this._appendLog('▶ Calling AI engine (Pollinations · GPT-class)...');
    this._setProgress(22);

    let aiHTML = null;
    let aiError = null;
    try {
      aiHTML = await this._aiGenerate(brief, previewSeed.p, (pct, msg) => {
        this._setProgress(Math.min(88, 22 + Math.floor(pct * 0.66)));
        if (msg) this._updateLastLog('▶ ' + msg);
      });
    } catch (e) {
      aiError = e?.message || String(e);
    }

    let gen, source;
    if (aiHTML && aiHTML.length > 1500 && /<\s*html/i.test(aiHTML)) {
      this._updateLastLog('✓ AI generated ' + (aiHTML.length / 1024).toFixed(1) + 'KB of custom HTML');
      this.generatedHTML = aiHTML;
      this.generatedName = previewSeed.p.name;
      gen = previewSeed;
      source = 'ai';
    } else {
      this._updateLastLog('✘ AI engine unavailable' + (aiError ? ' (' + aiError + ')' : '') + ' — using template engine');
      gen = new SiteGenerator(brief);
      this.generatedHTML = gen.generate();
      this.generatedName = gen.p.name;
      source = 'template';
    }

    this._appendLog('▶ Applying animations & responsiveness...');
    this._setProgress(94);
    await this._wait(280);
    this._updateLastLog('✓ Applied animations & responsiveness');

    this._appendLog('▶ Finalizing output HTML...');
    this._setProgress(100);
    await this._wait(180);
    this._updateLastLog('✓ Finalized output HTML');

    await this._wait(120);
    this._appendLog('');
    this._appendLog('✓ BUILD COMPLETE');
    this._appendLog('  Site: ' + this.generatedName + '  |  Type: ' + gen.p.type + '  |  Source: ' + (source === 'ai' ? 'AI engine (live)' : 'template engine'));
    this._appendLog('  Size: ' + (this.generatedHTML.length / 1024).toFixed(1) + 'KB  |  Ready to download');

    if (NovaAuth.isLoggedIn()) {
      NovaProjects.save({ id: Date.now().toString(), name: this.generatedName, brief, html: this.generatedHTML, type: gen.p.type, createdAt: new Date().toISOString() });
      this._renderProjectsList();
    }

    await this._wait(300);
    this._showPreview(this.generatedHTML, gen);
    this._showActions();
    this.building = false; this._setBtn(false);
  }

  async _aiGenerate(brief, seed, onProgress) {
    // TIER 1: Cloudflare Workers AI (Llama 3.3 70B) via our Pages Function
    try {
      if (onProgress) onProgress(5, 'Calling NovaMotion AI engine (Llama 3.3 70B)...');
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 120000);
      let cfRes;
      try {
        cfRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief, name: seed.name || 'Untitled', type: seed.type || 'website' }),
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(tid);
      }
      if (cfRes.ok) {
        const j = await cfRes.json();
        let html = String(j.html || '').trim();
        if (html.length > 500) {
          if (onProgress) onProgress(70, 'Parsing 70B response...');
          html = html.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const docIdx = html.search(/<!DOCTYPE\s+html/i);
          if (docIdx > 0) html = html.slice(docIdx);
          if (onProgress) onProgress(90, 'Forcing AI imagery...');
          html = this._forcePollinationsImages(html, brief, seed);
          if (onProgress) onProgress(95, 'Validating output...');
          return html;
        }
      }
      if (onProgress) onProgress(15, 'Falling back to Pollinations...');
    } catch (e) {
      if (onProgress) onProgress(15, 'Primary engine unavailable, using fallback...');
    }

    // TIER 2: Pollinations.ai fallback
    const sys = [
      'You are NovaMotion, an elite web design AI. You produce production-grade, design-award-quality, fully interactive single-file websites that rival Emergent.sh, Framer, and Webflow output. Every site you create is rich, deep, and feels handcrafted.',
      '',
      'OUTPUT CONTRACT:',
      '- Return ONE complete HTML document and NOTHING else. No prose, no explanation, no markdown fences.',
      '- Start with <!DOCTYPE html> and end with </html>.',
      '- Self-contained: inline <style>, inline <script>. External allowed only for: cdn.tailwindcss.com, fonts.googleapis.com, fonts.gstatic.com, image.pollinations.ai (images), cdnjs.cloudflare.com/ajax/libs/three.js (only when the brief calls for 3D).',
      '',
      'STRUCTURE — ALWAYS INCLUDE 8–11 SECTIONS (be ambitious, do not skimp):',
      '1. Sticky navbar with logo wordmark, 4–6 nav links, 1 primary CTA, mobile hamburger. Backdrop-blur fades in after 60px scroll.',
      '2. Hero — kinetic headline (5–9 words, italic or gradient accent on key word), eyebrow tag, subhead (1–2 sentences), 2 CTAs (primary + ghost), supporting visual or 3D scene, scroll cue.',
      '3. Trust strip — 4–6 client/partner wordmarks (use small AI-generated brand-mark images) OR a stat strip with 4 big numbers that count up on scroll into view.',
      '4. Features / Capabilities — 3–6 deep cards with image, icon (real <img>, never emoji), bold title, 2-line description, "Learn more" link with arrow.',
      '5. About / Story / How-it-works — split layout: rich copy (3–4 paragraphs) + large image OR 3-step process visual.',
      '6. Showcase / Gallery / Menu / Services / Portfolio — 6–9 items in a masonry or bento grid; each card has its own AI image, title, and meta. Make it browsable: hover effects, click-to-expand lightbox.',
      '7. Pricing OR Comparison table OR Process timeline — pick what fits the brief.',
      '8. Testimonials — 3 cards with AI portrait avatars, quote, name, role/company.',
      '9. FAQ — accordion with 5–7 questions, click to expand, smooth height transition.',
      '10. Contact / CTA — large headline, supporting copy, working form OR booking widget OR newsletter signup.',
      '11. Footer — 4-column: brand+blurb, links, contact, social. Bottom bar with copyright + status indicator.',
      '',
      'DESIGN SYSTEM (create one custom to the brief, do not default to generic):',
      '- Use Tailwind via <script src="https://cdn.tailwindcss.com"></script> with a tailwind.config defining: a 5-color custom palette (primary, secondary, accent, dark, light), display + body + mono fonts, and custom shadow ramps.',
      '- Pull a CINEMATIC font pairing from Google Fonts (Space Grotesk + Inter for tech, Fraunces + DM Sans for editorial, Bricolage + Geist for modern, Bebas + Manrope for bold).',
      '- Define CSS custom properties in :root for every color, gradient, and shadow.',
      '- Apply ONE signature visual treatment that runs through the whole site (e.g. brutalist sharp edges + scan lines, glassmorphism + neon glows, editorial serif + paper textures, swiss minimalism + thin rules).',
      '- Use real, original copy that reflects the brief — NEVER lorem ipsum, NEVER "Lorem", NEVER placeholder text. Every headline, paragraph, and label is brief-specific.',
      '- Modern CSS effects encouraged: gradient text, glassmorphism backdrop-blur, soft glow box-shadows, mesh gradient backgrounds, subtle grain/noise overlays.',
      '',
      'IMAGES — STRICTLY REQUIRED (use AI-generated Pollinations images, NEVER use emoji as icons, NEVER placeholders, NEVER Unsplash):',
      '- ABSOLUTELY NO EMOJI characters anywhere in the document — not in cards, not in menu items, not as icons. Use real <img> tags instead.',
      '- Every image MUST use this exact URL pattern: https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?width={W}&height={H}&nologo=true&seed={N}&model=flux',
      '- {URL_ENCODED_DESCRIPTION} = a vivid 8–20 word description tailored to the brief and the section. Example for a pizza shop hero: "cinematic%20wood%20fired%20pizza%20on%20rustic%20wooden%20board%20warm%20golden%20lighting%20photographic"',
      '- {W}x{H}: hero 1600x900, gallery 1200x800, card 800x600, menu-item 600x600, avatar 400x400.',
      '- {N} (seed): a different integer per image (1–9999) so every image is unique.',
      '- Always include loading="lazy" on non-hero images and descriptive alt text.',
      '- Use AT LEAST 6–10 images across the page (hero + every gallery/menu/showcase card + about + testimonial avatars). Make the site visual and rich.',
      '- For menu/product cards: each item MUST have its own <img> photo (e.g. one for margherita pizza, one for tiramisu) — never use emoji or text-only icons.',
      '- Example tag: <img src="https://image.pollinations.ai/prompt/wood%20fired%20margherita%20pizza%20fresh%20basil?width=600&height=600&nologo=true&seed=42&model=flux" alt="Margherita pizza" loading="lazy" class="w-full h-full object-cover"/>',
      '',
      'INTERACTIVITY — REQUIRED (the site must feel alive, not static):',
      '- Mobile nav: hamburger button on small screens that toggles a slide-out menu.',
      '- Any "Reserve", "Book", "Order", "Contact" button must open a working modal with a form.',
      '- Form submission: prevent default, validate inputs, show a "Thanks!" success message inline.',
      '- Smooth scroll on nav anchor clicks (event.preventDefault + scrollIntoView).',
      '- Image gallery: clicking a card opens a lightbox modal with the larger image (close on Escape or backdrop click).',
      '- Use vanilla JS, wrapped in <script> at the end of <body>. No frameworks, no jQuery.',
      '- Include keyboard support: Escape closes any open modal; Enter on a focused button activates it.',
      '',
      'ANIMATIONS (REQUIRED — make the site feel cinematic, not static):',
      '- Hero title fade + rise on load (900ms cubic-bezier(0.22,1,0.36,1)), word-level stagger 100–140ms.',
      '- IntersectionObserver scroll-reveal on every section (threshold 0.15, once).',
      '- Card grids: 100ms stagger between siblings via CSS transition-delay or JS setTimeout.',
      '- Hover: cards lift -6px to -8px and gain shadow; buttons lift -2px and glow.',
      '- Stat strip numbers count up from 0 to target on scroll into view (1200ms).',
      '- Subtle parallax on hero backdrop (translateY based on scroll position, GPU-accelerated translate3d).',
      '- One signature animated element: floating shapes, rotating ring, pulsing glow orb, drifting gradient mesh, animated SVG line, or scan-line sweep.',
      '- Smooth scroll: html { scroll-behavior: smooth; }.',
      '- Honor @media (prefers-reduced-motion: reduce) — disable transforms/animations.',
      '',
      'ACCESSIBILITY & RESPONSIVE:',
      '- Landmarks: header, nav, main, footer. Alt text everywhere. Tap targets ≥ 44px.',
      '- Mobile-first. Breakpoints sm 640, lg 1024, xl 1280. EVERY section must look correct on a 375px viewport.',
      '- Dark mode optional based on brief vibe — if dark, do it fully (deep base, surface ramps, glow accents).',
      '- Focus rings visible on all interactive elements.',
      '',
      'SEO: <title>, meta description, og:title, og:description, og:image (use a Pollinations URL), theme-color.',
      '',
      'TARGET: 700–1500 lines, 50–110KB. Density and richness MATTER — a sparse site is a failed site. The user typed a brief and you turned it into a portfolio-worthy product page they will brag about. Build it like Emergent.sh, Framer, or a top Awwwards entry would. NO shortcuts, NO empty sections, NO placeholder content.',
    ].join('\n');

    if (onProgress) onProgress(5, 'Sending brief to AI engine...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    let res;
    try {
      res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          model: 'openai-fast',
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: 'Brief:\n' + brief + '\n\nDetected site name: ' + (seed.name || 'Untitled') + '\nDetected type: ' + seed.type + '\n\nReturn the complete single-file HTML now.' },
          ],
          temperature: 0.7,
          stream: false,
          private: true,
          referrer: 'novamotion',
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (onProgress) onProgress(70, 'Parsing AI response...');

    const text = await res.text();
    let html = '';
    try {
      const j = JSON.parse(text);
      html = j?.choices?.[0]?.message?.content || j?.content || j?.text || '';
    } catch {
      html = text;
    }

    html = String(html || '').trim();
    html = html.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const docIdx = html.search(/<!DOCTYPE\s+html/i);
    if (docIdx > 0) html = html.slice(docIdx);

    if (onProgress) onProgress(90, 'Forcing AI imagery...');
    html = this._forcePollinationsImages(html, brief, seed);

    if (onProgress) onProgress(95, 'Validating output...');
    return html;
  }

  // Post-process: rewrite every <img src=...> to use Pollinations Flux,
  // strip emoji-only "icon" placeholders the model often emits, and inject
  // a fallback hero image if the document has none.
  _forcePollinationsImages(html, brief, seed) {
    const briefHint = (brief || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const vibe = (seed && seed.type) ? seed.type : 'website';
    let imgIndex = 0;
    const polUrl = (prompt, w, h) => {
      const p = encodeURIComponent((prompt || (vibe + ' ' + briefHint)).slice(0, 200));
      const s = 1000 + (imgIndex++ * 137) % 8999;
      return 'https://image.pollinations.ai/prompt/' + p + '?width=' + w + '&height=' + h + '&nologo=true&seed=' + s + '&model=flux';
    };

    // Rewrite every <img> that isn't already a Pollinations URL
    html = html.replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
      const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
      const altMatch = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i);
      const widthMatch = attrs.match(/\bwidth\s*=\s*["']?(\d+)/i);
      const heightMatch = attrs.match(/\bheight\s*=\s*["']?(\d+)/i);
      const src = srcMatch ? srcMatch[1] : '';
      if (src && /image\.pollinations\.ai/i.test(src)) return full;
      const alt = altMatch ? altMatch[1] : '';
      const w = widthMatch ? Math.min(2000, parseInt(widthMatch[1])) : 1200;
      const h = heightMatch ? Math.min(2000, parseInt(heightMatch[1])) : 800;
      const newSrc = polUrl(alt || briefHint, w, h);
      const newAttrs = srcMatch
        ? attrs.replace(/\bsrc\s*=\s*["'][^"']+["']/i, 'src="' + newSrc + '"')
        : attrs + ' src="' + newSrc + '"';
      return '<img' + newAttrs + (newAttrs.includes('loading=') ? '' : ' loading="lazy"') + '>';
    });

    // Map common emojis the model loves to use as icons -> real photo prompts
    const emojiMap = {
      '🍕':'wood fired pizza closeup','🍔':'gourmet cheeseburger closeup','🍝':'fresh pasta plate',
      '🥗':'fresh garden salad bowl','🍖':'grilled meat closeup','🍗':'roasted chicken leg',
      '🍞':'rustic bread loaf','🥖':'french baguette','🥩':'grilled steak',
      '🍳':'sunny side up eggs','🥚':'farm fresh egg','🍷':'glass of red wine',
      '☕':'latte art coffee cup','🍰':'tiramisu cake slice','🌮':'gourmet taco',
      '🍜':'ramen bowl steaming','🍣':'sushi platter','🍱':'bento box',
      '🍦':'gelato cone','🍫':'artisan chocolate','🍇':'fresh grapes',
      '🍎':'red apple closeup','🍊':'orange fruit','🍓':'fresh strawberry',
      '⭐':'gold star icon dark background','💡':'glowing lightbulb','🚀':'rocket launching',
      '❤️':'red heart symbol','🔥':'fire flame','💎':'crystal diamond',
      '🎨':'paint palette artist','📱':'modern smartphone','💻':'sleek laptop',
      '⚡':'lightning bolt energy','🌟':'shining star','🏆':'gold trophy',
      '🎯':'dartboard bullseye','📷':'professional camera','🎵':'music note',
      '🏠':'modern house exterior','🌲':'pine tree forest','🌊':'ocean wave',
      '🍃':'green leaf nature','🌸':'cherry blossom','🌹':'red rose',
      '👨‍🍳':'professional chef portrait','👩‍🍳':'female chef portrait',
      '🧑‍💻':'developer at laptop','💼':'leather briefcase',
    };
    const fallbackDesc = (emoji) => emojiMap[emoji] || (briefHint + ' ' + emoji + ' photographic');

    // Emoji unicode ranges combined into one class
    const emojiClass = '[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{1F900}-\\u{1F9FF}\\u{1F600}-\\u{1F64F}\\u{1F680}-\\u{1F6FF}\\u{2300}-\\u{23FF}\\u{2B00}-\\u{2BFF}\\u{1F000}-\\u{1F2FF}]';
    const emojiSeq = '(?:' + emojiClass + '\\uFE0F?(?:\\u200D' + emojiClass + '\\uFE0F?)*)';

    // PASS A: emoji wrapped in any single inline/block tag like <span>🍕</span> or <div class=...>🍕</div>
    html = html.replace(
      new RegExp('<(span|div|p|i|h[1-6]|li|td|button|a|figure|article|section)([^>]*?)>\\s*' + emojiSeq + '\\s*</\\1>', 'gu'),
      (_full, tag, attrs) => {
        const m = _full.match(new RegExp(emojiSeq, 'u'));
        const emoji = m ? m[0] : '';
        const imgUrl = polUrl(fallbackDesc(emoji), 600, 600);
        return '<' + tag + attrs + '><img src="' + imgUrl + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"/></' + tag + '>';
      }
    );

    // PASS B: emoji sandwiched between any two tags (handles multi-emoji and surrounding whitespace)
    html = html.replace(
      new RegExp('>(\\s*)(' + emojiSeq + '(?:\\s*' + emojiSeq + ')*)(\\s*)<', 'gu'),
      (_full, sp1, emojis, sp2) => {
        const first = emojis.match(new RegExp(emojiSeq, 'u'));
        const e = first ? first[0] : '';
        const imgUrl = polUrl(fallbackDesc(e), 400, 400);
        return '>' + sp1 + '<img src="' + imgUrl + '" alt="" loading="lazy" style="display:inline-block;width:64px;height:64px;object-fit:cover;vertical-align:middle;"/>' + sp2 + '<';
      }
    );

    // PASS C (NUCLEAR): walk the body and replace every remaining emoji character outside <script>/<style>
    // with an inline image. Catches emoji embedded in text like "Margherita 🍕 Classica".
    const stripRanges = [];
    const skipRe = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
    let mm;
    while ((mm = skipRe.exec(html)) !== null) {
      stripRanges.push([mm.index, mm.index + mm[0].length]);
    }
    const inSkip = (idx) => stripRanges.some(([a, b]) => idx >= a && idx < b);
    const emojiSeqRe = new RegExp(emojiSeq, 'gu');
    let out = '';
    let last = 0;
    let m2;
    while ((m2 = emojiSeqRe.exec(html)) !== null) {
      if (inSkip(m2.index)) continue;
      const e = m2[0];
      const imgUrl = polUrl(fallbackDesc(e.split(/‍/)[0]), 200, 200);
      out += html.slice(last, m2.index);
      out += '<img src="' + imgUrl + '" alt="" loading="lazy" style="display:inline-block;width:1.4em;height:1.4em;object-fit:cover;vertical-align:-0.25em;border-radius:4px;"/>';
      last = m2.index + e.length;
    }
    out += html.slice(last);
    html = out;

    // PASS D: scrub emoji out of CSS. Models love writing `content: '🍕'` in ::before
    // pseudo-elements, and those get rendered by the browser but never appear in HTML
    // text — so passes A/B/C miss them entirely. Strip them from <style> blocks and
    // inline style="" attributes. Also kill any bare emoji that lingers anywhere.
    const emojiGlobalRe = new RegExp(emojiSeq, 'gu');
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (styleBlock) => {
      // Remove any CSS rule whose content property is just emoji
      let s = styleBlock.replace(
        new RegExp('content\\s*:\\s*["\']\\s*' + emojiSeq + '(?:\\s*' + emojiSeq + ')*\\s*["\']\\s*;?', 'gu'),
        'content: "";'
      );
      // Remove any remaining emoji characters inside the style block as a safety net
      s = s.replace(emojiGlobalRe, '');
      return s;
    });
    // Also scrub inline style="" attributes
    html = html.replace(/style\s*=\s*"([^"]*)"/gi, (full, css) => {
      emojiGlobalRe.lastIndex = 0;
      if (!emojiGlobalRe.test(css)) return full;
      emojiGlobalRe.lastIndex = 0;
      const cleaned = css.replace(emojiGlobalRe, '');
      return 'style="' + cleaned + '"';
    });

    // If the document has fewer than 3 <img> tags, inject a hero fallback
    const imgCount = (html.match(/<img\b/gi) || []).length;
    if (imgCount < 3) {
      const heroUrl = polUrl(briefHint + ' cinematic hero photograph', 1600, 900);
      const heroTag = '<img src="' + heroUrl + '" alt="" style="width:100%;max-height:70vh;object-fit:cover;display:block;" loading="eager"/>';
      html = html.replace(/<body([^>]*)>/i, '<body$1>' + heroTag);
    }

    return html;
  }

  _showPreview(html, gen) {
    const zone = document.getElementById('nb-preview-zone');
    const frame = document.getElementById('nb-iframe');
    if (!zone || !frame) return;
    zone.style.display = 'block';
    requestAnimationFrame(() => zone.classList.add('visible'));
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      frame.src = url;
      const lbl = document.getElementById('nb-preview-label');
      if (lbl && gen) lbl.textContent = gen.p.name + ' — ' + gen.p.type + ' — ' + (html.length/1024).toFixed(1) + 'KB';
    } catch(e) {
      frame.srcdoc = html;
    }
    zone.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  download() {
    if (!this.generatedHTML) return;
    const fn = (this.generatedName || 'novamotion-site').toLowerCase().replace(/[^a-z0-9]+/g,'-') + '.html';
    const blob = new Blob([this.generatedHTML], { type: 'text/html' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: fn });
    a.click();
  }

  openNew() {
    if (!this.generatedHTML) return;
    const blob = new Blob([this.generatedHTML], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  }

  loadProject(id) {
    const pr = NovaProjects.get(id); if (!pr) return;
    const el = document.getElementById('nb-brief'); if (el) el.value = pr.brief;
    this.generatedHTML = pr.html; this.generatedName = pr.name;
    this._showTerminal(); this._clearLog(); this._setProgress(100);
    this._appendLog('✓ Loaded: ' + pr.name + ' (' + pr.type + ')');
    this._appendLog('  Created: ' + new Date(pr.createdAt).toLocaleDateString());
    const fakeGen = { p: { name: pr.name, type: pr.type, theme: '' } };
    this._showPreview(pr.html, fakeGen);
    this._showActions();
    this._closeProjectsPanel();
    document.getElementById('nb-panel')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteProject(id) { NovaProjects.delete(id); this._renderProjectsList(); }
  useExample(t) { const el = document.getElementById('nb-brief'); if (el) { el.value = t; el.focus(); } }
  switchTab(tab) {
    document.querySelectorAll('.nb-tab').forEach(b => { b.dataset.active = (b.dataset.tab === tab).toString(); b.style.color = b.dataset.tab === tab ? '#ff4500' : ''; b.style.borderBottomColor = b.dataset.tab === tab ? '#ff4500' : 'transparent'; });
    document.querySelectorAll('.nb-panel').forEach(p => { p.style.display = p.dataset.panel === tab ? 'block' : 'none'; });
  }

  _showTerminal() { const t = document.getElementById('nb-terminal'); if (t) t.style.display = 'block'; }
  _clearLog() { const l = document.getElementById('nb-log'); if (l) l.innerHTML = ''; }
  _appendLog(msg) {
    const log = document.getElementById('nb-log'); if (!log) return;
    const d = document.createElement('div'); d.className = 'log-line';
    d.style.cssText = 'opacity:0;transform:translateY(4px);transition:all .25s'; d.textContent = msg;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    requestAnimationFrame(() => { d.style.opacity = '1'; d.style.transform = 'none'; });
  }
  _updateLastLog(msg) { const l = document.getElementById('nb-log'); if (!l) return; const lines = l.querySelectorAll('.log-line'); if (lines.length) lines[lines.length-1].textContent = msg; }
  _setProgress(pct) { const b = document.getElementById('nb-progress-bar'), lbl = document.getElementById('nb-progress-label'); if (b) b.style.width = pct + '%'; if (lbl) lbl.textContent = pct + '%'; }
  _resetProgress() { this._setProgress(0); }
  _setBtn(loading) { const b = document.getElementById('nb-launch-btn'); if (!b) return; b.disabled = loading; b.textContent = loading ? 'BUILDING...' : 'LAUNCH ENGINE ⚡'; b.style.opacity = loading ? '0.7' : '1'; }
  _showActions() { const a = document.getElementById('nb-actions'); if (a) a.style.display = 'flex'; }
  _flashError(msg) { const e = document.getElementById('nb-error'); if (!e) return; e.textContent = msg; e.style.opacity = '1'; setTimeout(() => e.style.opacity = '0', 3500); }
  _wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  _updateAuthUI() {
    const user = NovaAuth.getUser();
    const show = (id, vis) => { const el = document.getElementById(id); if (el) el.style.display = vis; };
    if (user) {
      show('nav-login-btn', 'none'); show('nav-logout-btn', 'inline-flex'); show('nav-projects-link', 'inline-flex');
      const lbl = document.getElementById('nav-user-label'); if (lbl) lbl.textContent = user.name;
    } else {
      show('nav-login-btn', 'inline-flex'); show('nav-logout-btn', 'none'); show('nav-projects-link', 'none');
      const lbl = document.getElementById('nav-user-label'); if (lbl) lbl.textContent = '';
    }
  }

  login(email, password) {
    const r = NovaAuth.login(email, password);
    if (r.ok) { this._closeLoginModal(); this._updateAuthUI(); this._renderProjectsList(); this._showToast('Welcome back, ' + r.user.name + '!'); }
    else { const e = document.getElementById('login-error'); if (e) e.textContent = r.err; }
  }

  logout() { NovaAuth.logout(); this._updateAuthUI(); this._renderProjectsList(); this._showToast('Signed out.'); }

  _renderProjectsList() {
    const list = document.getElementById('projects-list'); if (!list) return;
    const projects = NovaProjects.list(); const user = NovaAuth.getUser();
    if (!user) { list.innerHTML = '<div style="color:#9ca3af;font-size:13px;padding:20px 0">Sign in to save and access your projects.</div>'; return; }
    if (!projects.length) { list.innerHTML = '<div style="color:#9ca3af;font-size:13px;padding:20px 0">No saved projects yet. Build something!</div>'; return; }
    list.innerHTML = projects.map(pr => `<div style="background:#181818;border:1px solid rgba(255,255,255,0.08);padding:16px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">${pr.name}</div>
          <div style="color:#ff4500;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">${pr.type||'website'}</div>
          <div style="color:#6b7280;font-size:12px;margin-top:4px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pr.brief}</div>
        </div>
        <button onclick="window.novaBuilder.deleteProject('${pr.id}')" style="background:none;border:none;color:#4b5563;cursor:pointer;font-size:16px;padding:2px 4px" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#4b5563'">✕</button>
      </div>
      <button onclick="window.novaBuilder.loadProject('${pr.id}')" style="margin-top:12px;background:#ff4500;color:#000;border:none;padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;width:100%">Load Project →</button>
    </div>`).join('');
  }

  openLoginModal() { const m = document.getElementById('login-modal'); if (m) m.classList.add('open'); setTimeout(() => document.getElementById('login-email')?.focus(), 100); }
  _closeLoginModal() { const m = document.getElementById('login-modal'); if (m) m.classList.remove('open'); }
  _closeProjectsPanel() { const p = document.getElementById('projects-panel'); if (p) p.classList.remove('open'); }
  _showToast(msg) { const t = document.getElementById('nova-toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }

  _bindUI() {
    document.getElementById('nb-launch-btn')?.addEventListener('click', () => this.launch());
    document.getElementById('nb-brief')?.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey) && e.key==='Enter') this.launch(); });
    document.getElementById('nb-download-btn')?.addEventListener('click', () => this.download());
    document.getElementById('nb-open-btn')?.addEventListener('click', () => this.openNew());
    document.querySelectorAll('.nb-tab').forEach(b => b.addEventListener('click', () => this.switchTab(b.dataset.tab)));
    document.getElementById('nav-logout-btn')?.addEventListener('click', () => this.logout());
    document.getElementById('login-form')?.addEventListener('submit', e => { e.preventDefault(); this.login(document.getElementById('login-email').value, document.getElementById('login-password').value); });
    document.getElementById('login-modal')?.addEventListener('click', e => { if (e.target===e.currentTarget) this._closeLoginModal(); });
    document.getElementById('nav-projects-link')?.addEventListener('click', e => { e.preventDefault(); document.getElementById('projects-panel')?.classList.toggle('open'); });
    document.getElementById('close-projects-btn')?.addEventListener('click', () => this._closeProjectsPanel());
    document.getElementById('nav-login-btn')?.addEventListener('click', () => this.openLoginModal());
    document.getElementById('close-login-btn')?.addEventListener('click', () => this._closeLoginModal());
  }
}

window.novaBuilder = new NovaBuilder();
document.addEventListener('DOMContentLoaded', () => window.novaBuilder.init());
