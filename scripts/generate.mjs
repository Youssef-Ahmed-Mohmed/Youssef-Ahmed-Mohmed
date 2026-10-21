// Generates all animated SVG cards for the profile README.
// Static cards (hero, stack, experience, projects, divider) come from the data below.
// Live cards (contributions, panels) are pulled untouched from the GitHub API when GH_TOKEN is set.
// Without a token, clearly-labelled SAMPLE data is drawn so the README still renders.
import fs from 'node:fs';

const USER = process.env.GH_USER || 'Youssef-Ahmed-Mohmed';
const TOKEN = process.env.GH_TOKEN || '';

// ============ YOUR DATA (edit here) ============
const ME = {
  name: 'Youssef Ahmed',
  roles: ['Full-Stack Developer · React / Next.js / Node', 'AI & Data Mining · Python / Scikit-learn', 'Media & Brand Lead · IEEE PUA'],
  line1: 'CS & AI student · Pharos University · Class of 2028',
  line2: 'Shipped EventHub: OAuth, RBAC & signed-token QR ticketing.',
  status: 'Alexandria, Egypt  ·  Open to Software Engineering / AI Development roles',
};
const SKILLS = [
  ['LANGUAGES', ['Python', 'JavaScript', 'TypeScript', 'SQL']],
  ['FRONTEND', ['React.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite']],
  ['BACKEND', ['Node.js', 'Express.js', 'REST APIs', 'Prisma']],
  ['AI & DATA', ['Pandas', 'Scikit-learn', 'Data Mining', 'Generative AI', 'Prompt Engineering']],
  ['DATABASES', ['PostgreSQL', 'MySQL', 'Supabase', 'SQLite']],
  ['TOOLS', ['Git', 'GitHub', 'Docker', 'Vercel', 'VS Code']],
];
const EXP = [
  { date: 'JUN 2026 — SEP 2026', title: 'Full-Stack Developer Trainee', org: 'The Connector Consultancy (D&Partners) · Alexandria', desc: ['Built full-stack features with React, Next.js, Node.js, Express and SQL,', 'following Git-based team workflows. Practiced Docker & deployment.'] },
  { date: 'MAR 2025 — SEP 2026', title: 'Publicity & Media Team Lead · HR & Team Manager (Robotics)', org: 'IEEE PUA Student Branch', desc: ['Led publicity, media and campaigns; authored the branch brand identity guidelines.', 'Ran recruitment and team operations for the Robotics Committee (RUV competition).'] },
  { date: 'NOV 2025 — PRESENT', title: 'Brand Ambassador', org: 'Sprints · Hybrid', desc: ['Promoted educational and technology programs through community', 'outreach and digital engagement.'] },
  { date: 'GAIC CERTIFIED', title: 'Generative AI Trainee', org: 'Sprints & IOM Egypt', desc: ['Completed the Generative AI Certification: prompt engineering,', 'generative AI applications and AI-assisted workflows.'] },
];
const PROJECTS = [
  { t: 'EventHub', tech: 'Next.js · React · TypeScript · Supabase · PostgreSQL', d: 'Deployed event platform: discovery, real-time seats, reservations & QR ticketing. OAuth (Google/GitHub), RBAC, signed-token tickets, organizer check-in, moderation.', link: 'eventhub-i5pg.vercel.app', live: true },
  { t: 'Full-Stack To-Do App', tech: 'React · Node.js · Express · MySQL · Prisma', d: 'REST API (Express, Prisma, MySQL) connected to a React frontend for task management.', link: 'github.com/Youssef-Ahmed-Mohmed' },
  { t: 'NBA Shooting Analysis', tech: 'Python · Pandas · Scikit-learn', d: 'EDA and data mining on NBA shot logs by court zone, distance and defender proximity to find shot-success factors.' },
  { t: 'Egyptian Car Plate System', tech: 'Python · OOP · SQLite', d: 'CLI registration system that generates Egyptian-style plates and manages vehicle/owner records.' },
];
// ================================================

const C = { card: '#0b0f15', border: '#1b2330', text: '#eaf6ee', muted: '#7f8a99', g: '#39ff14', r: '#ff2d55', cell: ['#10161d', '#0c4a1e', '#12922f', '#22d63c', '#39ff14'] };
const PAL = ['#39ff14', '#ff2d55', '#00ffa3', '#ff6b35', '#b6ff00', '#7f8a99'];
const MONO = "'JetBrains Mono','SF Mono',Consolas,'Courier New',monospace";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (t, n) => { const o = []; let l = ''; for (const w of t.split(' ')) { if ((l + ' ' + w).trim().length > n) { o.push(l); l = w; } else l = (l + ' ' + w).trim(); } if (l) o.push(l); return o; };
const glow = (c) => (c === C.r ? 'glowR' : 'glowG');

const STYLE = `<style>
.fu{animation:fu .8s ease-out both}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi 1s ease-out both}
@keyframes fi{from{opacity:0}to{opacity:1}}
.pulse{animation:pulse 2.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
.blink{animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .5s ease-out both}
@keyframes pop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
.run{stroke-dasharray:130 870;animation:run 5s linear infinite}
@keyframes run{to{stroke-dashoffset:-1000}}
.scan{animation:scan 6s linear infinite}
@keyframes scan{from{transform:translateX(0)}to{transform:translateX(1000px)}}
.scan2{animation:scan2 5s ease-in-out infinite alternate}
@keyframes scan2{from{transform:translateX(0)}to{transform:translateX(800px)}}
.grow{animation:grow 1.4s ease-out both}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.draw{transform-box:fill-box;transform-origin:top;animation:draw 1.6s ease-out both}
@keyframes draw{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.rA{animation:roleA 9s linear infinite}
@keyframes roleA{0%,28%{opacity:1}33%,95%{opacity:0}100%{opacity:1}}
.rB{opacity:0;animation:role 9s linear 3s infinite}
.rC{opacity:0;animation:role 9s linear 6s infinite}
@keyframes role{0%{opacity:0}5%,28%{opacity:1}33%,100%{opacity:0}}
</style>`;

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${MONO}">
${STYLE}
<defs>
<filter id="glowG" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowR" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="0"><stop offset="0" stop-color="${C.g}"/><stop offset="1" stop-color="${C.r}"/></linearGradient>
<radialGradient id="bgG" cx="1" cy="1" r="0.8"><stop offset="0" stop-color="${C.g}" stop-opacity=".13"/><stop offset="1" stop-color="${C.g}" stop-opacity="0"/></radialGradient>
<radialGradient id="bgR" cx="0" cy="0" r="0.7"><stop offset="0" stop-color="${C.r}" stop-opacity=".12"/><stop offset="1" stop-color="${C.r}" stop-opacity="0"/></radialGradient>
<linearGradient id="scanG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.g}" stop-opacity="0"/><stop offset="1" stop-color="${C.g}" stop-opacity=".22"/></linearGradient>
<pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#ffffff" stroke-opacity=".035"/></pattern>
</defs>
${body}
</svg>`;
const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${C.card}" stroke="${C.border}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="url(#bgG)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="url(#bgR)"/>`;
const runner = (x, y, w, h, col, delay = 0, rx = 18) => `<rect class="run" pathLength="1000" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" style="animation-delay:${delay}s" filter="url(#${glow(col)})"/>`;
const label = (n, t, x, y, col = C.g) => `<text x="${x}" y="${y}" font-size="11" letter-spacing="2" fill="${col}">${n}</text><text x="${x + 30}" y="${y}" font-size="11" letter-spacing="2" fill="${C.muted}">${esc(t)}</text>`;

// ---------- HERO ----------
function hero() {
  const W = 900, H = 270, nx = 230, tl = 340;
  const body = `${card(0, 0, W, H)}
<clipPath id="cc"><rect width="${W}" height="${H}" rx="18"/></clipPath>
<g clip-path="url(#cc)"><rect width="${W}" height="${H}" fill="url(#grid)"/><rect class="scan" x="-80" y="0" width="80" height="${H}" fill="url(#scanG)"/></g>
${runner(1, 1, W - 2, H - 2, C.g, 0)}${runner(1, 1, W - 2, H - 2, C.r, -2.5)}
<rect x="36" y="56" width="158" height="158" rx="30" fill="#06090d" stroke="${C.border}"/>
${runner(36, 56, 158, 158, C.g, 0, 30)}${runner(36, 56, 158, 158, C.r, -2.5, 30)}
<text x="115" y="146" text-anchor="middle" font-size="62" font-weight="700" fill="${C.g}" filter="url(#glowG)">{${esc(ME.name[0])}}</text>
<text x="115" y="190" text-anchor="middle" font-size="13" letter-spacing="3" fill="${C.r}" class="pulse">&lt;/&gt;</text>
<text x="${nx}" y="68" font-size="12" letter-spacing="2" fill="${C.g}" class="fi">@${esc(USER.toUpperCase())}</text>
<text x="${nx}" y="104" font-size="18" fill="${C.r}" filter="url(#glowR)" class="fu" style="animation-delay:.2s">Hi, I'm</text>
<clipPath id="type"><rect x="${nx}" y="108" width="${tl}" height="60"><animate attributeName="width" from="0" to="${tl}" dur="1.5s" begin="0s" fill="freeze"/></rect></clipPath>
<g clip-path="url(#type)"><text x="${nx}" y="148" font-size="44" font-weight="700" fill="${C.text}" textLength="${tl - 10}" lengthAdjust="spacingAndGlyphs">${esc(ME.name)}</text></g>
<rect class="blink" x="${nx + tl}" y="114" width="4" height="42" fill="${C.r}" filter="url(#glowR)"><animate attributeName="x" from="${nx}" to="${nx + tl}" dur="1.5s" begin="0s" fill="freeze"/></rect>
<text x="${nx}" y="186" font-size="17" font-weight="700" fill="${C.g}" filter="url(#glowG)"><tspan fill="${C.r}">▸ </tspan><tspan class="rA">${esc(ME.roles[0])}</tspan></text>
<text x="${nx + 20}" y="186" font-size="17" font-weight="700" fill="${C.g}" class="rB" filter="url(#glowG)">${esc(ME.roles[1])}</text>
<text x="${nx + 20}" y="186" font-size="17" font-weight="700" fill="${C.g}" class="rC" filter="url(#glowG)">${esc(ME.roles[2])}</text>
<text x="${nx}" y="212" font-size="13" fill="${C.muted}" class="fu" style="animation-delay:1.2s">${esc(ME.line1)}</text>
<text x="${nx}" y="232" font-size="13" fill="${C.muted}" class="fu" style="animation-delay:1.5s">${esc(ME.line2)}</text>
<circle cx="236" cy="251" r="4" fill="${C.g}" class="pulse" filter="url(#glowG)"/>
<text x="250" y="255" font-size="12" fill="${C.text}" class="fi" style="animation-delay:1.8s">${esc(ME.status)}</text>`;
  return svg(W, H, body);
}
// NOTE: role A uses a tspan so the red arrow stays static; fix x alignment below
// (role B/C are drawn at nx+20 which matches the arrow width of 2 chars at 17px).

// ---------- STACK ----------
function stack() {
  const W = 900, chipH = 30, gap = 8, x0 = 176;
  let y = 60, idx = 0, out = '';
  SKILLS.forEach(([cat, items], ci) => {
    const col = ci % 2 ? C.r : C.g;
    let x = x0, ry = y;
    items.forEach((s) => {
      const w = Math.round(s.length * 7.6 + 28);
      if (x + w > W - 36) { x = x0; ry += chipH + gap; }
      out += `<g class="fu" style="animation-delay:${(idx * 0.07).toFixed(2)}s"><rect x="${x}" y="${ry}" width="${w}" height="${chipH}" rx="15" fill="#080c11" stroke="${col}" stroke-opacity=".75"/><text x="${x + w / 2}" y="${ry + 20}" text-anchor="middle" font-size="12.5" fill="${C.text}">${esc(s)}</text></g>`;
      x += w + gap; idx++;
    });
    out += `<text x="36" y="${y + 20}" font-size="11" letter-spacing="2" fill="${col}" filter="url(#${glow(col)})">${esc(cat)}</text>`;
    y = ry + chipH + 16;
    if (ci < SKILLS.length - 1) out += `<rect x="36" y="${y - 8}" width="828" height="1" fill="${C.border}"/>`;
  });
  const H = y + 4;
  return svg(W, H, `${card(0, 0, W, H)}${label('01', 'SKILLS', 36, 38)}${out}`);
}

// ---------- EXPERIENCE ----------
function experience() {
  const W = 900, step = 96, y0 = 76;
  const H = y0 + EXP.length * step + 6;
  let out = `${card(0, 0, W, H)}${label('02', 'EXPERIENCE', 36, 38, C.r)}`;
  out += `<rect class="draw" x="199" y="${y0 - 6}" width="2" height="${(EXP.length - 1) * step + 12}" fill="url(#lg)" style="animation-delay:.3s"/>`;
  EXP.forEach((e, i) => {
    const y = y0 + i * step, col = i % 2 ? C.r : C.g, d = (0.4 + i * 0.4).toFixed(2);
    out += `<g class="fu" style="animation-delay:${d}s"><text x="36" y="${y + 4}" font-size="10.5" letter-spacing=".5" fill="${col}">${esc(e.date)}</text>
<circle cx="200" cy="${y}" r="6" fill="#06090d" stroke="${col}" stroke-width="2" filter="url(#${glow(col)})"/><circle cx="200" cy="${y}" r="2.5" fill="${col}" class="pulse"/>
<text x="224" y="${y + 4}" font-size="15" font-weight="700" fill="${C.text}">${esc(e.title)}</text>
<text x="224" y="${y + 24}" font-size="12" fill="${col}">${esc(e.org)}</text>
<text x="224" y="${y + 44}" font-size="12" fill="${C.muted}">${esc(e.desc[0])}</text>
<text x="224" y="${y + 61}" font-size="12" fill="${C.muted}">${esc(e.desc[1])}</text></g>`;
  });
  return svg(W, H, out);
}

// ---------- PROJECTS ----------
function projects() {
  const W = 900, cw = 440, ch = 196, gx = 20, top = 44;
  const H = top + ch * 2 + gx;
  let out = label('03', 'PROJECTS', 8, 24);
  PROJECTS.forEach((p, i) => {
    const x = (i % 2) * (cw + gx), y = top + Math.floor(i / 2) * (ch + gx), col = i % 2 ? C.r : C.g;
    out += `<g class="fu" style="animation-delay:${(0.2 + i * 0.25).toFixed(2)}s">${card(x, y, cw, ch)}${runner(x + 1, y + 1, cw - 2, ch - 2, col, -i * 1.2)}
<text x="${x + 24}" y="${y + 40}" font-size="17" font-weight="700" fill="${C.text}">${esc(p.t)}</text>`;
    if (p.live) out += `<circle cx="${x + cw - 70}" cy="${y + 35}" r="4" fill="${C.g}" class="pulse" filter="url(#glowG)"/><text x="${x + cw - 58}" y="${y + 39}" font-size="11" letter-spacing="2" fill="${C.g}">LIVE</text>`;
    out += `<text x="${x + 24}" y="${y + 62}" font-size="11" fill="${col}">${esc(p.tech)}</text>`;
    wrap(p.d, 50).forEach((l, k) => { out += `<text x="${x + 24}" y="${y + 94 + k * 18}" font-size="12" fill="${C.muted}">${esc(l)}</text>`; });
    if (p.link) out += `<text x="${x + 24}" y="${y + ch - 18}" font-size="12" fill="${C.text}">↗ ${esc(p.link)}</text>`;
    out += `</g>`;
  });
  return svg(W, H, out);
}

// ---------- DIVIDER ----------
function divider() {
  return svg(900, 8, `<rect x="0" y="3" width="900" height="2" rx="1" fill="url(#lg)" opacity=".55"/><rect class="scan" x="-120" y="2" width="120" height="4" rx="2" fill="url(#lg)" filter="url(#glowG)"/>`);
}

// ---------- DATA ----------
async function gql(query) {
  const r = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-gen' }, body: JSON.stringify({ query }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}
function sampleData() {
  let seed = 7;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const start = new Date(); start.setUTCDate(start.getUTCDate() - 52 * 7 - start.getUTCDay());
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start); dt.setUTCDate(start.getUTCDate() + w * 7 + d);
      if (dt > new Date()) continue;
      const r = rnd();
      days.push({ date: dt.toISOString().slice(0, 10), count: r < 0.45 ? 0 : Math.floor(rnd() * 9) + 1, weekday: d });
    }
    weeks.push(days);
  }
  const now = new Date().toISOString();
  return { weeks, repos: [{ name: 'eventhub', lang: 'TypeScript', date: now }, { name: 'todo-app', lang: 'JavaScript', date: now }, { name: 'nba-shooting-analysis', lang: 'Python', date: now }, { name: 'car-plate-system', lang: 'Python', date: now }], langs: [['TypeScript', 46], ['JavaScript', 28], ['Python', 14], ['CSS', 9], ['Other', 3]] };
}
async function liveData() {
  const d = await gql(`query { user(login:"${USER}") {
    contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount weekday } } } }
    repositories(first:100, ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC, orderBy:{field:PUSHED_AT, direction:DESC}) {
      nodes { name pushedAt primaryLanguage { name } languages(first:8, orderBy:{field:SIZE, direction:DESC}) { edges { size node { name } } } }
    } } }`);
  const u = d.user;
  const weeks = u.contributionsCollection.contributionCalendar.weeks.map((w) => w.contributionDays.map((x) => ({ date: x.date, count: x.contributionCount, weekday: x.weekday })));
  const nodes = u.repositories.nodes;
  const repos = nodes.filter((r) => r.name.toLowerCase() !== USER.toLowerCase()).slice(0, 4).map((r) => ({ name: r.name, lang: r.primaryLanguage?.name || '—', date: r.pushedAt }));
  const map = {};
  for (const r of nodes) for (const e of r.languages.edges) map[e.node.name] = (map[e.node.name] || 0) + e.size;
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  const langs = sorted.slice(0, 5).map(([n, v]) => [n, (v / total) * 100]);
  const rest = 100 - langs.reduce((s, x) => s + x[1], 0);
  if (rest > 0.5) langs.push(['Other', rest]);
  return { weeks, repos, langs };
}

// ---------- CONTRIBUTIONS (real data, never modified) ----------
function contributions(weeks, sample) {
  const days = weeks.flat();
  const total = days.reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...days.map((d) => d.count));
  const active = days.filter((d) => d.count > 0).length;
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1; if (days[i] && days[i].count === 0) i--;
  let cur = 0; while (i >= 0 && days[i].count > 0) { cur++; i--; }
  const peak = days.find((d) => d.count === max && max > 0);

  const W = 900, gx = 36, gy = 176, cs = 12, gp = 3;
  const stats = [['CURRENT\nSTREAK', cur], ['LONGEST\nSTREAK', longest], ['ACTIVE\nDAYS', active], ['BUSIEST\nDAY', max]];
  let out = `${card(0, 0, W, 320)}${label('04', 'CONTRIBUTIONS', 36, 40)}
<text x="36" y="112" font-size="52" font-weight="700" fill="${C.g}" filter="url(#glowG)">${total.toLocaleString('en-US')}</text>
<text x="36" y="136" font-size="12" fill="${C.muted}">contributions in the last year</text>`;
  stats.forEach(([t, v], k) => {
    const x = 430 + k * 112, [l1, l2] = t.split('\n'), col = k === 3 ? C.r : C.text;
    out += `<rect x="${x - 16}" y="76" width="1" height="60" fill="${C.border}"/><text x="${x}" y="104" font-size="26" font-weight="700" fill="${col}">${v}</text><text x="${x}" y="120" font-size="10" fill="${C.muted}">${l1}</text><text x="${x}" y="133" font-size="10" fill="${C.muted}">${l2}</text>`;
  });
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    if (!w.length) return;
    const m = new Date(w[0].date).getUTCMonth();
    if (m !== lastMonth && wi < 51) {
      out += `<text x="${gx + wi * (cs + gp)}" y="${gy - 8}" font-size="10" fill="${C.muted}">${new Date(w[0].date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()}</text>`;
      lastMonth = m;
    }
    w.forEach((d) => {
      const lvl = d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4));
      const isPeak = peak && d.date === peak.date;
      out += `<rect class="pop" style="animation-delay:${(wi * 0.03).toFixed(2)}s" x="${gx + wi * (cs + gp)}" y="${gy + d.weekday * (cs + gp)}" width="${cs}" height="${cs}" rx="3" fill="${isPeak ? C.r : C.cell[lvl]}"${isPeak ? ' filter="url(#glowR)"' : ''}/>`;
    });
  });
  out += `<rect class="scan2" x="${gx - 4}" y="${gy - 4}" width="3" height="112" rx="1.5" fill="${C.g}" opacity=".8" filter="url(#glowG)"/>`;
  const lx = 700;
  out += `<text x="${lx}" y="301" font-size="10" fill="${C.muted}">LESS</text>`;
  C.cell.forEach((c, k) => { out += `<rect x="${lx + 40 + k * 17}" y="291" width="12" height="12" rx="3" fill="${c}"/>`; });
  out += `<text x="${lx + 40 + 5 * 17 + 4}" y="301" font-size="10" fill="${C.muted}">MORE</text>`;
  if (sample) out += `<text x="36" y="301" font-size="10" fill="${C.r}" class="pulse">SAMPLE DATA · run the "Update profile cards" workflow to load your real contributions</text>`;
  return svg(W, 320, out);
}

// ---------- LANGUAGES + RECENT ----------
function panels(langs, repos, sample) {
  const H = 260, lw = 440, rx0 = 460, bw = lw - 64;
  let out = `${card(0, 0, lw, H)}${label('05', 'LANGUAGES', 32, 40)}`;
  out += `<clipPath id="bar"><rect x="32" y="62" width="${bw}" height="8" rx="4"/></clipPath><g clip-path="url(#bar)"><g class="grow" style="transform-origin:32px 66px">`;
  let bx = 32;
  langs.forEach(([, p], k) => { const w = (p / 100) * bw; out += `<rect x="${bx.toFixed(1)}" y="62" width="${w.toFixed(1)}" height="8" fill="${PAL[k % PAL.length]}"/>`; bx += w; });
  out += `</g></g>`;
  langs.forEach(([n, p], k) => {
    const cx = 32 + (k % 2) * 190, cy = 104 + Math.floor(k / 2) * 34, col = PAL[k % PAL.length];
    out += `<g class="fu" style="animation-delay:${(0.3 + k * 0.12).toFixed(2)}s"><circle cx="${cx + 5}" cy="${cy - 4}" r="5" fill="${col}" filter="url(#${glow(col)})"/><text x="${cx + 18}" y="${cy}" font-size="13" fill="${C.text}">${esc(n)}</text><text x="${cx + 150}" y="${cy}" text-anchor="end" font-size="13" fill="${C.muted}">${p.toFixed(0)}%</text></g>`;
  });
  out += card(rx0, 0, lw, H) + label('06', 'RECENTLY PUSHED', rx0 + 32, 40, C.r);
  repos.forEach((r, k) => {
    const y = 80 + k * 44, col = k % 2 ? C.r : C.g;
    const date = new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
    out += `<g class="fu" style="animation-delay:${(0.3 + k * 0.2).toFixed(2)}s"><text x="${rx0 + 32}" y="${y}" font-size="14" font-weight="700" fill="${C.text}">${esc(r.name.length > 24 ? r.name.slice(0, 23) + '…' : r.name)}</text>
<text x="${rx0 + 32}" y="${y + 17}" font-size="11" fill="${col}">${esc(r.lang)}</text>
<text x="${rx0 + lw - 32}" y="${y}" text-anchor="end" font-size="11" fill="${C.muted}">${date}</text>
<rect x="${rx0 + 32}" y="${y + 28}" width="${lw - 64}" height="1" fill="${C.border}"/></g>`;
  });
  if (sample) out += `<text x="32" y="${H - 18}" font-size="10" fill="${C.r}" class="pulse">SAMPLE DATA</text>`;
  return svg(900, H, out);
}

// ---------- MAIN ----------
fs.mkdirSync('assets', { recursive: true });
let data, sample = false;
if (TOKEN) {
  try { data = await liveData(); console.log('Using live GitHub data for', USER); }
  catch (e) { console.error('API failed, using sample data:', e.message); data = sampleData(); sample = true; }
} else { console.log('No token: using sample data'); data = sampleData(); sample = true; }

const files = { hero: hero(), stack: stack(), experience: experience(), projects: projects(), divider: divider(), contributions: contributions(data.weeks, sample), panels: panels(data.langs, data.repos, sample) };
for (const [n, s] of Object.entries(files)) fs.writeFileSync(`assets/${n}.svg`, s);
console.log('Done:', Object.keys(files).map((n) => `assets/${n}.svg`).join(', '));
