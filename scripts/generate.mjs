/**
 * Draws the organisation profile as one continuous "blueprint" sheet, in the
 * style of tech.omni-solutions.co: dashed rails down both sides, sections split
 * by dashed rules with square marks, hairline cells and the logo's yellow as
 * the one accent. Hero → services → process → a dark closing card.
 *
 *   node scripts/generate.mjs
 *
 * Writes profile/assets/profile-{light,dark}.svg. The background is transparent
 * and the greys are GitHub's own, so the sheet sits on the page in either theme;
 * the README shows one or the other with #gh-light-mode-only / #gh-dark-mode-only.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (name) => join(root, 'profile', 'assets', name);

const AMBER = '#f9a427';
const FONT = "'Inter Tight', Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

// GitHub's own canvas greys, so the transparent sheet blends into the page
const THEMES = {
    light: {
        canvas: '#ffffff',
        line: '#d0d7de',
        cell: '#d8dee4',
        dot: 'rgba(31,35,40,0.2)',
        text: '#1f2328',
        sec: '#59636e',
        ter: '#6e7781',
        accent: '#a86400',
        glow: 0.18,
    },
    dark: {
        canvas: '#0d1117',
        line: '#3d444d',
        cell: '#2a3038',
        dot: 'rgba(255,255,255,0.14)',
        text: '#f0f6fc',
        sec: '#b1bac4',
        ter: '#8b949e',
        accent: AMBER,
        glow: 0.14,
    },
};

// The closing card is always dark, like the website's closing band
const CARD = { bg: '#1c1b1b', ring: 'rgba(255,255,255,0.1)', text: '#ece3de', sec: '#bcb2ad', dots: 'rgba(255,255,255,0.12)' };

const W = 960;
const L = 40; // rails
const R = W - 40;
const IN = R - L;

// The logo goes inside the SVG — an SVG shown as an <img> cannot load other files
const logo = `data:image/png;base64,${readFileSync(join(root, 'profile', 'assets', 'logo-96.png')).toString('base64')}`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lucide-style 24×24 line icons
const ICONS = {
    software: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    infrastructure:
        '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    support:
        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
};

const SERVICES = [
    { id: 'software', title: 'Software solutions', lines: ['Web, desktop and mobile apps,', 'websites and online stores.'], tags: 'WEB · DESKTOP · MOBILE' },
    { id: 'infrastructure', title: 'IT infrastructure', lines: ['Networks and Wi-Fi, PCs and', 'video surveillance, on site.'], tags: 'NETWORKS · PCS · CCTV' },
    { id: 'support', title: 'Support and security', lines: ['Monthly maintenance and', 'network security audits.'], tags: 'MAINTENANCE · AUDITS' },
];

const STEPS = [
    { title: 'Consultation', lines: ['A free talk about', 'what you need.'] },
    { title: 'Quote', lines: ['Clear scope and price,', 'in writing.'] },
    { title: 'Delivery', lines: ['We build or install and', 'keep you informed.'] },
    { title: 'Support', lines: ['We stay on call after', 'the handover.'] },
];
const STEP_W = IN / STEPS.length;

const TICKER = ['Reply within 24 h', 'No subcontractors', 'Written quote', 'Support after handover', 'Bulgaria and abroad'];

/** Square mark where frame lines meet; filled with the page colour so it hides the line under it. */
const mark = (x, y, c, cls = '') =>
    `<rect class="${cls}" x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" rx="1.5" fill="${c.canvas}" stroke="${c.line}"/>`;

/** Dashed rule across the sheet with marks on the rails and an amber scan running along it. */
const rule = (y, c, delay) => `
  <line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c.line}" stroke-dasharray="5 4"/>
  <rect class="scan" style="animation-delay:${delay}s" x="0" y="${y - 0.75}" width="360" height="1.5" fill="url(#scan)"/>
  ${mark(L, y, c, 'ping')}
  ${mark(R, y, c, 'ping')}`;

/** Small mono label + section heading, left-aligned inside the rails. */
const heading = (y, c, label, title) => `
  <text x="${L + 32}" y="${y}" font-family="${MONO}" font-size="13" letter-spacing="1.5" fill="${c.accent}">${esc(label)}</text>
  <text x="${L + 32}" y="${y + 40}" font-size="32" font-weight="500" letter-spacing="-0.8" fill="${c.text}">${esc(title)}</text>`;

/** Hairline box with corner marks around a row of cells, split by vertical lines. */
const cellRow = (top, h, count, c) => {
    const w = IN / count;
    const splits = Array.from({ length: count - 1 }, (_, i) => `<line x1="${L + (i + 1) * w}" y1="${top}" x2="${L + (i + 1) * w}" y2="${top + h}" stroke="${c.cell}"/>`).join('');
    return `
  <line x1="${L}" y1="${top}" x2="${R}" y2="${top}" stroke="${c.cell}"/>
  <line x1="${L}" y1="${top + h}" x2="${R}" y2="${top + h}" stroke="${c.cell}"/>
  ${splits}
  ${mark(L, top, c)}${mark(R, top, c)}${mark(L, top + h, c)}${mark(R, top + h, c)}`;
};

function sheet(theme) {
    const c = THEMES[theme];
    const parts = [];

    // ── Top bar ────────────────────────────────────────────────────────────
    parts.push(`
  <image href="${logo}" x="${L + 28}" y="22" width="36" height="36"/>
  <text x="${L + 76}" y="47" font-size="19" font-weight="700" letter-spacing="0.6" fill="${c.text}">OMNI Tech Solutions</text>
  <g transform="translate(${R - 214} 25)">
    <rect width="186" height="30" rx="15" fill="none" stroke="${c.cell}"/>
    <circle class="live" cx="20" cy="15" r="7" fill="#3fb950" opacity=".35"/>
    <circle cx="20" cy="15" r="3.5" fill="#3fb950"/>
    <text x="34" y="20" font-size="13.5" font-weight="500" fill="${c.sec}">Open for new projects</text>
  </g>`);
    let y = 80;
    parts.push(rule(y, c, 0));

    // ── Hero ───────────────────────────────────────────────────────────────
    const heroTop = y;
    const heroH = 300;
    parts.push(`
  <rect x="${L}" y="${heroTop}" width="${IN}" height="${heroH}" fill="url(#dots)" mask="url(#fade)"/>
  <ellipse cx="${W / 2}" cy="${heroTop + 140}" rx="300" ry="110" fill="url(#glow)" opacity="${c.glow}"/>
  <rect x="${W / 2 - 125}" y="${heroTop + 40}" width="250" height="32" rx="7" fill="none" stroke="${AMBER}" stroke-dasharray="4 3"/>
  <text x="${W / 2}" y="${heroTop + 61}" font-size="15" font-weight="500" text-anchor="middle" fill="${c.accent}">Software &amp; IT infrastructure</text>
  <text x="${W / 2}" y="${heroTop + 140}" font-size="52" font-weight="500" letter-spacing="-1.3" text-anchor="middle" fill="${c.text}">Software solutions and</text>
  <text x="${W / 2}" y="${heroTop + 200}" font-size="52" font-weight="500" letter-spacing="-1.3" text-anchor="middle" fill="${c.text}">IT infrastructure for business</text>
  <text x="${W / 2}" y="${heroTop + 250}" font-size="18" text-anchor="middle" fill="${c.sec}">We build software for clients in Bulgaria and abroad, and the IT that runs it.</text>`);
    y = heroTop + heroH;
    parts.push(rule(y, c, 1.2));

    // ── Services ───────────────────────────────────────────────────────────
    parts.push(heading(y + 50, c, '01 / WHAT WE DO', 'Software and the IT that runs it'));
    const cellsTop = y + 120;
    const cellH = 212;
    const cellW = IN / SERVICES.length;
    SERVICES.forEach((s, i) => {
        parts.push(`
  <g transform="translate(${L + i * cellW + 32} ${cellsTop + 32})">
    <rect x="-6" y="-6" width="40" height="40" rx="8" fill="${AMBER}" fill-opacity=".1" stroke="${AMBER}" stroke-opacity=".35"/>
    <g transform="translate(2 2)" fill="none" stroke="${c.accent}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[s.id]}</g>
    <text y="72" font-size="20" font-weight="600" fill="${c.text}">${esc(s.title)}</text>
    ${s.lines.map((l, j) => `<text y="${100 + j * 22}" font-size="15" fill="${c.ter}">${esc(l)}</text>`).join('\n    ')}
    <text y="156" font-family="${MONO}" font-size="11" letter-spacing="1" fill="${c.accent}">${esc(s.tags)}</text>
  </g>`);
    });
    parts.push(cellRow(cellsTop, cellH, SERVICES.length, c));
    y = cellsTop + cellH + 48;
    parts.push(rule(y, c, 2.4));

    // ── Process ────────────────────────────────────────────────────────────
    parts.push(heading(y + 50, c, '02 / HOW WE WORK', 'From idea to a running system'));
    const stepsTop = y + 120;
    const stepH = 150;
    STEPS.forEach((s, i) => {
        parts.push(`
  <g transform="translate(${L + i * STEP_W + 24} ${stepsTop + 38})">
    <circle class="pulse" style="animation-delay:${i * 0.6}s" cx="6" cy="0" r="6" fill="${AMBER}" opacity="0"/>
    <circle cx="6" cy="0" r="3" fill="${AMBER}"/>
    <text x="22" y="5" font-family="${MONO}" font-size="15" fill="${c.accent}">${String(i + 1).padStart(2, '0')}</text>
    <line x1="52" y1="0" x2="${STEP_W - 48}" y2="0" stroke="${c.line}" stroke-dasharray="5 4"/>
    <line x1="52" y1="0" x2="${STEP_W - 48}" y2="0" stroke="url(#fill)"/>
    <text y="46" font-size="19" font-weight="600" fill="${c.text}">${esc(s.title)}</text>
    ${s.lines.map((l, j) => `<text y="${74 + j * 22}" font-size="15" fill="${c.ter}">${esc(l)}</text>`).join('\n    ')}
  </g>`);
    });
    parts.push(cellRow(stepsTop, stepH, STEPS.length, c));
    y = stepsTop + stepH + 48;
    parts.push(rule(y, c, 3.6));

    // ── Closing card: always dark, warm glow rising from the bottom, ticker ─
    const cardX = L + 12;
    const cardY = y + 12;
    const cardW = IN - 24;
    const cardH = 300;
    const tickerY = cardY + cardH - 30;

    // Ticker items laid out by estimated text width; three copies slide left together
    let tx = 0;
    const items = TICKER.map((t) => {
        const g = `<g transform="translate(${tx} 0)"><path d="m0 0 4 4 8-8" transform="translate(0 0)" fill="none" stroke="${AMBER}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><text x="20" y="5" font-size="14" fill="${CARD.sec}">${esc(t)}</text></g>`;
        tx += 20 + t.length * 7.4 + 48;
        return g;
    }).join('');
    const groupW = Math.ceil(tx);
    const tickerX = cardX + 24;

    parts.push(`
  <g clip-path="url(#card)">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${CARD.bg}"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="url(#cardDots)"/>
    <ellipse class="breathe" cx="${W / 2}" cy="${cardY + cardH}" rx="420" ry="140" fill="url(#glow)" opacity=".4"/>
    <text x="${W / 2}" y="${cardY + 84}" font-size="42" font-weight="500" letter-spacing="-1" text-anchor="middle" fill="${CARD.text}">Have a project in mind?</text>
    <text x="${W / 2}" y="${cardY + 122}" font-size="17" text-anchor="middle" fill="${CARD.sec}">We reply to every enquiry within 24 hours, in Bulgarian, English or Turkish.</text>
    <g transform="translate(${W / 2 - 172} ${cardY + 152})">
      <rect width="160" height="44" rx="8" fill="${AMBER}"/>
      <text x="68" y="28" font-size="16" font-weight="600" text-anchor="middle" fill="#18181b">Get in touch</text>
      <path d="M128 22h14m-5-5 5 5-5 5" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="172" width="172" height="44" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)"/>
      <text x="258" y="28" font-size="16" font-weight="600" text-anchor="middle" fill="${CARD.text}">Visit the website</text>
    </g>
    <line x1="${cardX}" y1="${tickerY - 28}" x2="${cardX + cardW}" y2="${tickerY - 28}" stroke="${CARD.ring}"/>
    <g mask="url(#tickerFade)">
      <g transform="translate(${tickerX} ${tickerY})">
        <g class="ticker">
          <g>${items}</g>
          <g transform="translate(${groupW} 0)">${items}</g>
          <g transform="translate(${groupW * 2} 0)">${items}</g>
        </g>
      </g>
    </g>
  </g>
  <rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardW - 1}" height="${cardH - 1}" rx="10" fill="none" stroke="${CARD.ring}"/>`);
    const H = cardY + cardH + 12;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" role="img" aria-labelledby="t d">
  <title id="t">OMNI Tech Solutions</title>
  <desc id="d">Software solutions and IT infrastructure for business. We build software for clients in Bulgaria and abroad, and the IT that runs it. What we do: software solutions, IT infrastructure, support and security. How we work: consultation, quote, delivery, support. We reply within 24 hours.</desc>
  <style>
    .scan { opacity: 0; animation: scan 6s cubic-bezier(.16,1,.3,1) infinite; }
    @keyframes scan { 0% { opacity: 1; transform: translateX(-360px); } 40% { opacity: 1; transform: translateX(${W}px); } 41%, 100% { opacity: 0; } }
    .ping { animation: ping 6s ease infinite; }
    @keyframes ping { 0%, 30%, 100% { stroke: ${c.line}; } 8% { stroke: ${AMBER}; } }
    .live, .pulse { transform-box: fill-box; transform-origin: center; }
    .live { animation: live 2s ease-out infinite; }
    @keyframes live { 0% { transform: scale(.6); opacity: .5; } 100% { transform: scale(1.8); opacity: 0; } }
    .pulse { animation: pulse 2.4s ease-out infinite; }
    @keyframes pulse { 0% { transform: scale(1); opacity: .5; } 70%, 100% { transform: scale(2.6); opacity: 0; } }
    .breathe { animation: breathe 6s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { opacity: .4; } 50% { opacity: .55; } }
    .ticker { animation: ticker ${Math.round(groupW / 28)}s linear infinite; }
    @keyframes ticker { to { transform: translateX(-${groupW}px); } }
    @media (prefers-reduced-motion: reduce) { .scan, .ping, .live, .pulse, .breathe, .ticker { animation: none; } .scan { display: none; } }
  </style>
  <defs>
    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1.1" fill="${c.dot}"/></pattern>
    <pattern id="cardDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1" fill="${CARD.dots}"/></pattern>
    <radialGradient id="fadeG" cx="0.5" cy="0.45" r="0.6"><stop offset="0.1" stop-color="#fff"/><stop offset="0.75" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="fade"><rect x="${L}" y="80" width="${IN}" height="300" fill="url(#fadeG)"/></mask>
    <linearGradient id="tickerG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="tickerFade"><rect x="${cardX}" y="${tickerY - 28}" width="${cardW}" height="40" fill="url(#tickerG)"/></mask>
    <clipPath id="card"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10"/></clipPath>
    <radialGradient id="glow"><stop offset="0" stop-color="${AMBER}"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient>
    <linearGradient id="scan" x1="0" x2="1"><stop offset="0" stop-color="${AMBER}" stop-opacity="0"/><stop offset=".6" stop-color="${AMBER}"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></linearGradient>
    <linearGradient id="fill" gradientUnits="userSpaceOnUse" x1="52" y1="0" x2="${STEP_W - 48}" y2="0"><stop offset="0" stop-color="${AMBER}"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></linearGradient>
  </defs>

  <!-- Rails down the whole sheet -->
  <g stroke="${c.line}" stroke-dasharray="5 4">
    <line x1="${L}" y1="0" x2="${L}" y2="${H}"/>
    <line x1="${R}" y1="0" x2="${R}" y2="${H}"/>
  </g>
${parts.join('')}
</svg>
`;
}

for (const theme of Object.keys(THEMES)) {
    writeFileSync(out(`profile-${theme}.svg`), sheet(theme));
}
console.log('Wrote profile-light.svg and profile-dark.svg to profile/assets/');
