/**
 * Draws the profile README graphics in the website's "blueprint" style: dashed
 * rails, a fading dot grid, hairline cells with square corner marks and the
 * logo's yellow as the one accent. Each graphic comes in a light and a dark
 * version; the README picks one with <picture> from the viewer's GitHub theme.
 *
 *   node scripts/generate.mjs
 *
 * Writes profile/assets/{banner,process}-{light,dark}.svg. Colours and copy
 * follow tech.omni-solutions.co (app/globals.css, app/locales/en).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (name) => join(root, 'profile', 'assets', name);

const AMBER = '#f9a427';
const FONT = "'Inter Tight', Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

const THEMES = {
    light: {
        page: '#ffffff',
        line: '#d4d4d8',
        cell: '#e4e4e7',
        dot: 'rgba(24,24,27,0.22)',
        text: '#111827',
        sec: '#374151',
        ter: '#4b5563',
        accent: '#a86400',
        glow: 0.16,
    },
    dark: {
        page: '#151414',
        line: '#3d3a3a',
        cell: '#2e2c2c',
        dot: 'rgba(255,255,255,0.16)',
        text: '#ece3de',
        sec: '#bcb2ad',
        ter: '#9c938f',
        accent: AMBER,
        glow: 0.12,
    },
};

// The logo goes inside the SVG — an SVG shown as an <img> cannot load other files
const logo = `data:image/png;base64,${readFileSync(join(root, 'profile', 'assets', 'logo-96.png')).toString('base64')}`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Small square mark where two frame lines meet, like on the website. */
const mark = (x, y, c, cls = '') =>
    `<rect class="${cls}" x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" rx="1.5" fill="${c.page}" stroke="${c.line}"/>`;

/** Shared <style>: the amber scan along a rule and the pulsing step dots, off with reduced motion. */
const motion = (c) => `
  <style>
    .scan { animation: scan 6s cubic-bezier(.16,1,.3,1) infinite; }
    @keyframes scan { 0% { transform: translateX(-420px); } 45%, 100% { transform: translateX(1700px); } }
    .ping { animation: ping 6s ease infinite; }
    .ping-late { animation-delay: 1.6s; }
    @keyframes ping { 0%, 40%, 100% { stroke: ${c.line}; } 12% { stroke: ${AMBER}; } }
    .pulse { transform-box: fill-box; transform-origin: center; animation: pulse 2.4s ease-out infinite; }
    @keyframes pulse { 0% { transform: scale(1); opacity: .55; } 70%, 100% { transform: scale(2.6); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .scan, .ping, .pulse { animation: none; } .scan { display: none; } }
  </style>`;

/** Dot grid that fades out from (cx, cy), plus the shared gradients. */
const defs = (c, id, cx, cy) => `
  <defs>
    <pattern id="${id}-dots" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="1.1" fill="${c.dot}"/>
    </pattern>
    <radialGradient id="${id}-fade" cx="${cx}" cy="${cy}" r="0.6">
      <stop offset="0.1" stop-color="#fff"/>
      <stop offset="0.75" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="${id}-mask"><rect width="100%" height="100%" fill="url(#${id}-fade)"/></mask>
    <radialGradient id="${id}-glow">
      <stop offset="0" stop-color="${AMBER}"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-scan" x1="0" x2="1">
      <stop offset="0" stop-color="${AMBER}" stop-opacity="0"/>
      <stop offset="0.6" stop-color="${AMBER}"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </linearGradient>
  </defs>`;

// Pillar icons, 24×24 line drawings in the spirit of lucide (code, network, shield)
const ICONS = {
    software: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    infrastructure:
        '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    support:
        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
};

const PILLARS = [
    { id: 'software', title: 'Software solutions', desc: 'Web, desktop & mobile apps, websites' },
    { id: 'infrastructure', title: 'IT infrastructure', desc: 'Networks, PCs & video surveillance' },
    { id: 'support', title: 'Support and security', desc: 'Maintenance plans & security audits' },
];

function banner(theme) {
    const c = THEMES[theme];
    const W = 1280;
    const H = 560;
    const L = 64; // rails
    const R = W - 64;
    const ruleY = 96;
    const cellsY = 420;
    const cellW = (R - L) / 3;

    const pillars = PILLARS.map((p, i) => {
        const x = L + i * cellW;
        return `
    <g transform="translate(${x + 32} ${cellsY + 30})">
      <g fill="none" stroke="${c.accent}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.id]}</g>
      <text y="60" font-size="19" font-weight="600" fill="${c.text}">${esc(p.title)}</text>
      <text y="86" font-size="15" fill="${c.ter}">${esc(p.desc)}</text>
    </g>${i > 0 ? `\n    <line x1="${x}" y1="${cellsY}" x2="${x}" y2="${H}" stroke="${c.cell}"/>` : ''}`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" role="img" aria-labelledby="t d">
  <title id="t">OMNI Tech Solutions</title>
  <desc id="d">Software solutions and IT infrastructure for business. We build software for clients in Bulgaria and abroad, and the IT infrastructure that runs it.</desc>
${motion(c)}
${defs(c, 'b', 0.5, 0.42)}
  <rect width="${W}" height="${H}" rx="14" fill="${c.page}"/>

  <!-- Dot grid fading out from behind the headline, and a faint warm glow -->
  <rect x="${L}" y="${ruleY}" width="${R - L}" height="${cellsY - ruleY}" fill="url(#b-dots)" mask="url(#b-mask)"/>
  <ellipse cx="${W / 2}" cy="240" rx="360" ry="130" fill="url(#b-glow)" opacity="${c.glow}"/>

  <!-- Frame: dashed rails and the rule under the top bar -->
  <g stroke="${c.line}" stroke-dasharray="5 4">
    <line x1="${L}" y1="0" x2="${L}" y2="${H}"/>
    <line x1="${R}" y1="0" x2="${R}" y2="${H}"/>
    <line x1="0" y1="${ruleY}" x2="${W}" y2="${ruleY}"/>
  </g>
  <rect class="scan" x="0" y="${ruleY - 0.75}" width="420" height="1.5" fill="url(#b-scan)"/>
  ${mark(L, ruleY, c, 'ping')}
  ${mark(R, ruleY, c, 'ping ping-late')}

  <!-- Top bar: logo, name, site -->
  <image href="${logo}" x="${L + 32}" y="28" width="40" height="40"/>
  <text x="${L + 86}" y="55" font-size="20" font-weight="700" letter-spacing="0.6" fill="${c.text}">OMNI Tech Solutions</text>
  <text x="${R - 32}" y="55" font-size="16" font-weight="500" text-anchor="end" fill="${c.ter}">tech.omni-solutions.co</text>

  <!-- Tag, headline, one line under it -->
  <rect x="${W / 2 - 132}" y="140" width="264" height="34" rx="7" fill="none" stroke="${AMBER}" stroke-dasharray="4 3"/>
  <text x="${W / 2}" y="163" font-size="15" font-weight="500" text-anchor="middle" fill="${c.accent}">Software &amp; IT infrastructure</text>
  <text x="${W / 2}" y="246" font-size="58" font-weight="500" letter-spacing="-1.4" text-anchor="middle" fill="${c.text}">Software solutions and</text>
  <text x="${W / 2}" y="310" font-size="58" font-weight="500" letter-spacing="-1.4" text-anchor="middle" fill="${c.text}">IT infrastructure for business</text>
  <text x="${W / 2}" y="362" font-size="19" text-anchor="middle" fill="${c.sec}">We build software for clients in Bulgaria and abroad, and the IT infrastructure that runs it.</text>

  <!-- The three pillars as a strip of hairline cells on the rails -->
  <line x1="${L}" y1="${cellsY}" x2="${R}" y2="${cellsY}" stroke="${c.cell}"/>${pillars}
  ${mark(L, cellsY, c)}
  ${mark(R, cellsY, c)}

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${c.cell}"/>
</svg>
`;
}

const STEPS = [
    { title: 'Consultation', lines: ['We talk through what you need,', 'free and with no commitment.'] },
    { title: 'Quote', lines: ['A written quote with a clear', 'scope and price.'] },
    { title: 'Delivery', lines: ['We build or install, and keep', 'you informed throughout.'] },
    { title: 'Support', lines: ['We stay on call after the', 'project is handed over.'] },
];

function processSvg(theme) {
    const c = THEMES[theme];
    const W = 1280;
    const H = 230;
    const L = 64;
    const R = W - 64;
    const top = 30;
    const cellW = (R - L) / STEPS.length;

    const steps = STEPS.map((s, i) => {
        const x = L + i * cellW;
        return `
    <g transform="translate(${x + 28} ${top + 40})">
      <circle class="pulse" cx="6" cy="0" r="6" fill="${AMBER}" opacity=".3" style="animation-delay:${i * 0.4}s"/>
      <circle cx="6" cy="0" r="3" fill="${AMBER}"/>
      <text x="22" y="5" font-family="${MONO}" font-size="15" fill="${c.accent}">${String(i + 1).padStart(2, '0')}</text>
      <line x1="52" y1="0" x2="${cellW - 56}" y2="0" stroke="${c.line}" stroke-dasharray="5 4"/>
      <line x1="52" y1="0" x2="${cellW - 56}" y2="0" stroke="url(#p-fill)"/>
      <text y="48" font-size="19" font-weight="600" fill="${c.text}">${esc(s.title)}</text>
      ${s.lines.map((l, j) => `<text y="${76 + j * 22}" font-size="15" fill="${c.ter}">${esc(l)}</text>`).join('\n      ')}
    </g>${i > 0 ? `\n    <line x1="${x}" y1="${top}" x2="${x}" y2="${H - top}" stroke="${c.cell}"/>` : ''}`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" role="img" aria-labelledby="t">
  <title id="t">How we work: consultation, quote, delivery, support</title>
${motion(c)}
${defs(c, 'p', 0.5, 0.5)}
  <defs>
    <linearGradient id="p-fill" gradientUnits="userSpaceOnUse" x1="52" y1="0" x2="${cellW - 56}" y2="0">
      <stop offset="0" stop-color="${AMBER}"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="14" fill="${c.page}"/>
  <g stroke="${c.line}" stroke-dasharray="5 4">
    <line x1="${L}" y1="0" x2="${L}" y2="${H}"/>
    <line x1="${R}" y1="0" x2="${R}" y2="${H}"/>
  </g>
  <rect x="${L}" y="${top}" width="${R - L}" height="${H - 2 * top}" fill="${c.page}" stroke="${c.cell}"/>${steps}
  ${mark(L, top, c)}
  ${mark(R, top, c)}
  ${mark(L, H - top, c)}
  ${mark(R, H - top, c)}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${c.cell}"/>
</svg>
`;
}

for (const theme of Object.keys(THEMES)) {
    writeFileSync(out(`banner-${theme}.svg`), banner(theme));
    writeFileSync(out(`process-${theme}.svg`), processSvg(theme));
}
console.log('Wrote banner and process graphics (light + dark) to profile/assets/');
