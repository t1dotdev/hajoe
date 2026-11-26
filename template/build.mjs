#!/usr/bin/env node
// Builds one static, SEO-ready shop page from a shop JSON file.
// Usage: node template/build.mjs shops/my-shop.json out/my-shop
// Output: <outDir>/index.html (copy the shop's images next to it).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAY_TH = { mon: 'จันทร์', tue: 'อังคาร', wed: 'พุธ', thu: 'พฤหัสบดี', fri: 'ศุกร์', sat: 'เสาร์', sun: 'อาทิตย์' }
const SCHEMA_DAY = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function validate(shop) {
  const missing = ['name', 'category', 'tagline', 'hero', 'address', 'hours'].filter((k) => !shop[k])
  if (missing.length) throw new Error(`shop JSON missing: ${missing.join(', ')}`)
  for (const [d, ranges] of Object.entries(shop.hours)) {
    if (!DAYS.includes(d)) throw new Error(`hours: unknown day "${d}" (use ${DAYS.join(', ')})`)
    for (const r of ranges) {
      if (!/^\d\d:\d\d$/.test(r[0]) || !/^\d\d:\d\d$/.test(r[1])) throw new Error(`hours.${d}: use "HH:MM"`)
      // shortcut: past-midnight ranges (18:00–02:00) unsupported; split into 18:00–23:59 + next day 00:00–02:00
      if (r[1] <= r[0]) throw new Error(`hours.${d}: close ${r[1]} must be after open ${r[0]} (split past-midnight ranges)`)
    }
  }
  if (!shop.demo && !shop.phone && !shop.line) throw new Error('a real shop needs phone or line')
}

const lineUrl = (id) => (id.startsWith('http') ? id : `https://line.me/R/ti/p/${encodeURIComponent(id.startsWith('@') ? id : '~' + id)}`)
const mapsQuery = (s) => encodeURIComponent(s.mapsQuery || `${s.name} ${s.address}`)

function schema(s) {
  const data = {
    '@context': 'https://schema.org',
    '@type': s.schemaType || 'LocalBusiness',
    name: s.name,
    description: s.about || s.tagline,
    image: s.url ? new URL(s.hero, s.url).href : s.hero,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'TH' },
    openingHoursSpecification: Object.entries(s.hours).flatMap(([d, ranges]) =>
      ranges.map(([opens, closes]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: SCHEMA_DAY[d], opens, closes })),
    ),
  }
  if (s.url) data.url = s.url
  if (s.phone && !s.demo) data.telephone = s.phone
  if (s.priceRange) data.priceRange = s.priceRange
  if (s.geo) data.geo = { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng }
  const sameAs = [s.facebook, s.instagram].filter(Boolean)
  if (sameAs.length) data.sameAs = sameAs
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function hoursTable(hours) {
  return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    .map((d) => {
      const r = hours[d]
      const txt = r && r.length ? r.map(([a, b]) => `${a}–${b}`).join(', ') : 'ปิด'
      return `<tr data-day="${DAYS.indexOf(d)}"><th scope="row">${DAY_TH[d]}</th><td>${txt}</td></tr>`
    })
    .join('')
}

export function render(s) {
  validate(s)
  const t = { brand: '#5b3a29', ink: '#1f1a17', paper: '#fbf7f2', soft: '#efe6dc', display: 'Mitr', body: 'Anuphan', ...s.theme }
  const fonts = [...new Set([t.display, t.body])].map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600`).join('&')
  const act = (href, label, cls = '') =>
    s.demo
      ? `<button type="button" class="act ${cls}" data-demo>${label}</button>`
      : `<a class="act ${cls}" href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`
  const actions = (short) =>
    [
      s.phone && act(`tel:${s.phone.replace(/[^\d+]/g, '')}`, short ? 'โทร' : 'โทรหาร้าน', 'primary'),
      s.line && act(lineUrl(s.line), short ? 'LINE' : 'แชท LINE', s.phone ? '' : 'primary'),
      act(`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery(s)}`, short ? 'นำทาง' : 'นำทางไปร้าน'),
    ].filter(Boolean).join('')

  const menu = (s.menu || [])
    .map(
      (g) => `<div class="menu-group"><h3>${esc(g.group)}</h3><ul>${g.items
        .map((i) => `<li><span class="mi-name">${esc(i.name)}${i.desc ? `<small>${esc(i.desc)}</small>` : ''}</span><span class="mi-price">${esc(i.price)}</span></li>`)
        .join('')}</ul></div>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="${s.lang || 'th'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.name)} · ${esc(s.category)}${s.area ? ' ' + esc(s.area) : ''}</title>
<meta name="description" content="${esc(s.tagline)}">
<meta property="og:title" content="${esc(s.name)}">
<meta property="og:description" content="${esc(s.tagline)}">
<meta property="og:image" content="${esc(s.url ? new URL(s.hero, s.url).href : s.hero)}">
<meta property="og:type" content="website">
${s.demo ? '<meta name="robots" content="noindex">' : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet">
<script type="application/ld+json">${schema(s)}</script>
<style>
:root{--brand:${t.brand};--ink:${t.ink};--paper:${t.paper};--soft:${t.soft};--display:'${t.display}',system-ui,sans-serif;--body:'${t.body}',system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:400 17px/1.7 var(--body)}
img{max-width:100%;display:block}
a{color:var(--brand)}
:focus-visible{outline:3px solid var(--brand);outline-offset:3px}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
.demo-bar{background:var(--ink);color:var(--paper);font-size:14px;text-align:center;padding:8px 16px}
.demo-bar a{color:inherit}
header.hero{position:relative}
.hero-img{width:100%;height:min(62vh,520px);object-fit:cover}
.hero-card{background:var(--paper);margin:-72px 12px 0;position:relative;border-radius:20px;padding:24px 20px 20px;box-shadow:0 10px 40px -12px rgba(0,0,0,.35)}
@media(min-width:760px){.hero-card{max-width:680px;margin:-96px auto 0;padding:32px}}
.cat{margin:0;color:var(--brand);font-weight:500;font-size:15px}
h1{font:600 clamp(32px,8vw,48px)/1.2 var(--display);margin:4px 0 8px}
.tagline{margin:0 0 16px;font-size:18px}
.status{display:flex;align-items:center;gap:8px;font-weight:500;margin:0 0 18px}
.dot{width:10px;height:10px;border-radius:50%;background:#9a9a9a}
.status.open .dot{background:#1f9d55;box-shadow:0 0 0 4px rgba(31,157,85,.18)}
.status.closed .dot{background:#c0392b}
.actions{display:grid;gap:10px;grid-template-columns:1fr 1fr}
.act{font:500 17px/1 var(--body);display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:14px;text-decoration:none;border:2px solid var(--brand);color:var(--brand);background:transparent;cursor:pointer;padding:0 12px}
.act.primary{background:var(--brand);color:var(--paper);grid-column:1/-1}
section{padding:44px 0 8px}
h2{font:600 26px/1.3 var(--display);margin:0 0 16px}
.about p{margin:0 0 12px;max-width:60ch}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:16px 0 0;list-style:none}
.chips li{background:var(--soft);border-radius:999px;padding:6px 14px;font-size:15px}
.menu-group h3{font:500 19px/1.4 var(--display);margin:24px 0 6px;color:var(--brand)}
.menu-group ul{list-style:none;margin:0;padding:0}
.menu-group li{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px dashed color-mix(in srgb,var(--ink) 22%,transparent)}
.mi-name small{display:block;font-size:14px;opacity:.72}
.mi-price{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:500}
.gallery{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gallery img{aspect-ratio:1;object-fit:cover;border-radius:12px;width:100%}
.gallery img:first-child{grid-column:1/-1;aspect-ratio:16/9}
table{border-collapse:collapse;width:100%;max-width:420px}
th,td{text-align:left;padding:8px 0;border-bottom:1px solid var(--soft);font-weight:400}
tr.today{font-weight:600}tr.today th{font-weight:600}
.map{width:100%;height:300px;border:0;border-radius:16px;margin-top:16px;background:var(--soft)}
footer{padding:48px 0 120px;font-size:14px;opacity:.75}
.sticky{position:fixed;left:0;right:0;bottom:0;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(8px);border-top:1px solid var(--soft);display:flex;gap:8px;z-index:5}
.sticky .act{flex:1;min-height:48px}
.sticky .act.primary{grid-column:auto}
@media(min-width:760px){.sticky{display:none}footer{padding-bottom:48px}}
.toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:12px 18px;border-radius:12px;font-size:15px;max-width:90vw;z-index:9}
</style>
</head>
<body>
${s.demo ? `<div class="demo-bar">${esc(s.demoNote || 'เว็บตัวอย่างของร้านสมมติ')} — ${s.demoBackUrl ? `<a href="${esc(s.demoBackUrl)}">อยากได้แบบนี้ให้ร้านคุณ</a>` : 'ยังไม่ใช่เว็บจริง'}</div>` : ''}
<header class="hero">
  <img class="hero-img" src="${esc(s.hero)}" alt="${esc(s.heroAlt || s.name)}" fetchpriority="high">
  <div class="hero-card">
    <p class="cat">${esc(s.category)}${s.area ? ' · ' + esc(s.area) : ''}</p>
    <h1>${esc(s.name)}</h1>
    <p class="tagline">${esc(s.tagline)}</p>
    <p class="status" id="status" aria-live="polite"><span class="dot"></span><span id="status-text">ดูเวลาเปิด–ปิดด้านล่าง</span></p>
    <div class="actions">${actions(false)}</div>
  </div>
</header>
<main class="wrap">
  ${s.about ? `<section class="about"><h2>เกี่ยวกับร้าน</h2>${s.about.split('\n').map((p) => `<p>${esc(p)}</p>`).join('')}${s.highlights?.length ? `<ul class="chips">${s.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}</section>` : ''}
  ${menu ? `<section><h2>${esc(s.menuTitle || 'เมนูและราคา')}</h2>${menu}</section>` : ''}
  ${s.gallery?.length ? `<section><h2>บรรยากาศร้าน</h2><div class="gallery">${s.gallery.map((g) => `<img src="${esc(g.src)}" alt="${esc(g.alt || '')}" loading="lazy">`).join('')}</div></section>` : ''}
  <section><h2>เวลาเปิด–ปิด</h2><table><tbody>${hoursTable(s.hours)}</tbody></table></section>
  <section><h2>ที่ตั้งร้าน</h2><p>${esc(s.address)}</p>
    <iframe class="map" loading="lazy" title="แผนที่ ${esc(s.name)}" src="https://www.google.com/maps?q=${mapsQuery(s)}&output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </section>
</main>
<footer class="wrap">© ${new Date().getFullYear()} ${esc(s.name)}${s.facebook ? ` · <a href="${esc(s.facebook)}" rel="noopener">Facebook</a>` : ''}${s.instagram ? ` · <a href="${esc(s.instagram)}" rel="noopener">Instagram</a>` : ''}${s.credit ? `<br>${s.credit}` : ''}</footer>
<div class="sticky">${actions(true)}</div>
<script>
(()=>{const H=${JSON.stringify(s.hours)},D=${JSON.stringify(DAYS)};
const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
const g=t=>p.find(x=>x.type===t).value,wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),now=g('hour')%24*60+ +g('minute');
const m=s=>{const[a,b]=s.split(':');return a*60+ +b};
document.querySelector('tr[data-day="'+wd+'"]')?.classList.add('today');
const today=H[D[wd]]||[],open=today.find(([a,b])=>now>=m(a)&&now<m(b));
const el=document.getElementById('status'),tx=document.getElementById('status-text');
if(open){el.classList.add('open');tx.textContent='เปิดอยู่ · ปิด '+open[1]+' น.'}
else{el.classList.add('closed');const next=today.find(([a])=>m(a)>now);
let msg='ปิดอยู่';if(next)msg+=' · เปิดวันนี้ '+next[0]+' น.';else{for(let i=1;i<=7;i++){const r=H[D[(wd+i)%7]];if(r&&r.length){msg+=' · เปิด'+(i===1?'พรุ่งนี้':'อีกครั้งใน '+i+' วัน')+' '+r[0][0]+' น.';break}}}tx.textContent=msg}
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent='นี่คือเว็บตัวอย่าง — ในเว็บจริง ปุ่มนี้โทร/แชท/นำทางได้ทันที';clearTimeout(t._h);t._h=setTimeout(()=>t.remove(),3200)}));
})();
</script>
</body>
</html>
`
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [src, outDir] = process.argv.slice(2)
  if (!src || !outDir) {
    console.error('usage: node template/build.mjs <shop.json> <outDir>')
    process.exit(1)
  }
  const shop = JSON.parse(readFileSync(src, 'utf8'))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), render(shop))
  console.log(`built ${join(outDir, 'index.html')}`)
}
