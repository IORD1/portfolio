// Headless screenshot of the homepage for visual checks. See docs/desk-scene.md.
//   npm i --no-save puppeteer-core && timeout 170 node scripts/shot.mjs
// Env: OUT, OUT2/HOLD2 (second shot for motion diff), HOLD, DARK=1, TWEAK='<js>', TUNE=1 (show the dev panel)
//   PROBE='<js returning a value>' is evaluated after the shot and logged, e.g. PROBE='return __lamp.state()'
//   e.g. TWEAK='window.__lamp.set(false)' for the lamp off, or '__lamp.toggle()' + HOLD=120 to catch the squish
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
page.on('console', m => { const t = m.text(); if (/error|fail|webgl|draco|plant|lamp/i.test(t)) console.log('CONSOLE:', t.slice(0,300)); });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('requestfailed', r => console.log('REQFAIL:', r.url()));
page.on('response', r => { if (/draco/.test(r.url())) console.log('DRACO:', r.status(), r.url()); });
// domcontentloaded, not networkidle: with two software-GL canvases the main thread blocks for ~1 min and idle never fires
// TUNE=1 shows the dev tuning panel (app/desk-tuner.tsx, opt-in via ?tune=1)
await page.goto(process.env.TUNE ? 'http://localhost:3000/?tune=1' : 'http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
if (process.env.DARK) await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
const info = await page.evaluate(() => new Promise(res => {
  const el = document.querySelector('.desk-plant');
  const lamp = document.querySelector('.desk-lamp');
  if (!el) return res({ found: false });
  const t0 = performance.now();
  const tick = () => {
    if (el.dataset.loaded && (!lamp || lamp.dataset.loaded)) { const r = el.getBoundingClientRect(); return res({ found: true, ms: Math.round(performance.now()-t0), rect: [r.left, r.top, r.width, r.height], canvas: !!el.querySelector('canvas') }); }
    if (performance.now() - t0 > 150000) return res({ found: true, timeout: true, canvas: !!el.querySelector('canvas') });
    setTimeout(tick, 100);
  };
  tick();
}));
console.log('INFO:', JSON.stringify(info));
if (process.env.TWEAK) await page.evaluate((code) => { new Function(code)(); }, process.env.TWEAK);
await new Promise(r => setTimeout(r, Number(process.env.HOLD || 1500)));
await page.screenshot({ path: process.env.OUT || 'scripts/out/home.png' });
if (process.env.PROBE) console.log('PROBE:', JSON.stringify(await page.evaluate((code) => new Function(code)(), process.env.PROBE)));
if (process.env.OUT2) { await new Promise(r => setTimeout(r, Number(process.env.HOLD2 || 2000))); await page.screenshot({ path: process.env.OUT2 }); }
await browser.close();
