#!/usr/bin/env node
// tasteskill / scenes — photograph every scroll scene on a page at exact points of its progress.
//
//   node scenes.mjs <http(s)://url> [--out DIR] [--steps 10] [--scene "#id"] [--wait 900]
//
// For each <section class="scene"> (references/scenes.md): the screen before it, 0, 10, … 100% of its
// hold, and the screen after it, on desktop (1440x900) and on a phone (390x844), as labelled contact
// sheets; then the reduced-motion page screen by screen. Prints each scene's height in screens, frame
// timing while the page is wheeled through its scenes, and console errors. Read every sheet it writes.
//
// Exit code 0 = every scene ran; 1 = a scene never started, fell back to rest on desktop, or the page
// logged errors. Zero dependencies: drives an installed Chrome/Edge/Chromium. Node 22+.
import { mkdirSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import {
  requirePreviewUrl,
  sceneScreenshotName,
  renderSceneContactSheet,
} from "./lib/preview-boundary.mjs";
import { Browser, sleep } from "./lib/cdp.mjs";

const args = process.argv.slice(2);
const flag = (k, d) => {
  const i = args.indexOf("--" + k);
  if (i === -1) return d;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const outDir = resolve(flag("out", ".taste-skill/scenes"));
const STEPS = Math.max(2, +flag("steps", 10)),
  WAIT = +flag("wait", 900);
const only = flag("scene", "");
const target = args[0];
if (!target || target.startsWith("--")) {
  console.error(
    'usage: node scenes.mjs <http(s)://url> [--out DIR] [--steps 10] [--scene "#id"] [--wait 900]',
  );
  process.exit(2);
}
// Core uses the project's explicit dev-server boundary for local work.
let url;
try {
  url = requirePreviewUrl(target);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const browser = await Browser.launch();
const helper = await browser.newPage({ width: 1600, height: 1000 });
const problems = [];

async function sheet(frames, labels, cellW, cellH, cols, path) {
  const rows = Math.ceil(frames.length / cols);
  await helper.setViewport({
    width: cols * cellW,
    height: rows * (cellH + 22),
    dsf: 1,
  });
  await helper.eval(renderSceneContactSheet, {
    frames,
    labels,
    cellW,
    cellH,
    cols,
  });
  await helper.screenshot({ path, quality: 78 });
}

const SCENES = `[...document.querySelectorAll(${JSON.stringify(only || "section.scene, .scene[data-scene]")})].map((el, i) => { const r = el.getBoundingClientRect(); return { id: el.id || el.dataset.scene || ('scene-' + (i + 1)), top: Math.round(r.top + scrollY), height: Math.round(r.height), live: el.classList.contains('is-live'), rest: el.classList.contains('is-rest') }; })`;
const go = (y) =>
  `(() => { const y = ${y}; if (window.Stage && Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); })()`;
const rel = (p) => relative(process.cwd(), p).split("\\").join("/");

async function run(label, vp) {
  const page = await browser.newPage(vp);
  await page.goto(url, { timeoutMs: 40000, settleMs: 1200 });
  await page.eval("document.fonts.ready.then(() => true)").catch(() => {});
  await sleep(500);
  const scenes = await page.eval(SCENES);
  if (!scenes.length)
    console.log(`${label}: no <section class="scene"> on the page`);
  const H = vp.height;
  for (const [sceneIndex, sc] of scenes.entries()) {
    if (!sc.live && !sc.rest)
      problems.push(
        `${label} ${sc.id}: never started (stage.js, the scene file or Stage.init() missing)`,
      );
    if (label === "desktop" && sc.rest)
      problems.push(
        `${label} ${sc.id}: shows its finished composition instead of running (GSAP not loaded, or the scene threw)`,
      );
    const frames = [],
      labels = [];
    const span = Math.max(0, sc.height - H);
    const points = [
      { y: Math.max(0, sc.top - H * 0.5), l: "before" },
      ...Array.from({ length: STEPS + 1 }, (_, k) => ({
        y: sc.top + (span * k) / STEPS,
        l: `${Math.round((k / STEPS) * 100)}%`,
      })),
      { y: sc.top + span + H * 0.6, l: "after" },
    ];
    for (const p of points) {
      await page.eval(go(Math.round(p.y))).catch(() => {});
      await sleep(WAIT);
      frames.push(await page.screenshot({ quality: 72 }));
      labels.push(`${sc.id} ${p.l}`);
    }
    const cw = vp.width >= 1000 ? 480 : 240,
      ch = Math.round((cw * H) / vp.width);
    const path = join(outDir, sceneScreenshotName(sceneIndex, label));
    await sheet(frames, labels, cw, ch, vp.width >= 1000 ? 4 : 7, path);
    console.log(
      `${label.padEnd(8)} ${sc.id}: ${(sc.height / H).toFixed(1)} screens tall, ${sc.live ? "running" : sc.rest ? "finished composition" : "not started"} → ${rel(path)}`,
    );
  }
  if (label === "desktop" && scenes.length) {
    // frame timing while the page is wheeled through its scenes
    await page.eval(go(Math.max(0, scenes[0].top - H))).catch(() => {});
    await sleep(400);
    await page.eval(
      `(() => { window.__f = []; let last = performance.now(); const tick = (t) => { window.__f.push(t - last); last = t; if (window.__f.length < 600) requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()`,
    );
    await page.wheel(
      Math.min(
        scenes.reduce((a, s) => a + s.height, 0),
        9000,
      ),
      { step: 120, pauseMs: 16 },
    );
    await sleep(600);
    const f = await page.eval("window.__f.slice(2)");
    const sorted = f.slice().sort((a, b) => a - b);
    console.log(
      `smoothness: ${f.length} frames, median ${(sorted[Math.floor(f.length / 2)] || 0).toFixed(1)} ms, ${f.filter((d) => d > 34).length} over 34 ms (headless timing is rough; a handful is normal)`,
    );
  }
  if (page.consoleErrors?.length) {
    problems.push(
      `${label} console: ${page.consoleErrors.slice(0, 3).join(" | ")}`,
    );
  }
  await page.close();
}

try {
  await run("desktop", { width: 1440, height: 900, dsf: 1 });
  await run("phone", { width: 390, height: 844, dsf: 1, mobile: true });
  const rp = await browser.newPage({
    width: 1440,
    height: 900,
    dsf: 1,
    reducedMotion: true,
  });
  await rp.goto(url, { timeoutMs: 40000, settleMs: 1200 });
  const h = await rp.eval("document.documentElement.scrollHeight");
  const frames = [],
    labels = [];
  for (let y = 0, k = 0; y < h && k < 16; y += 900, k++) {
    await rp.eval(`window.scrollTo(0, ${y})`);
    await sleep(350);
    frames.push(await rp.screenshot({ quality: 70 }));
    labels.push(`reduced motion, screen ${k + 1}`);
  }
  await sheet(frames, labels, 360, 225, 4, join(outDir, "reduced-desktop.jpg"));
  console.log(
    `reduced  ${frames.length} screens → ${rel(join(outDir, "reduced-desktop.jpg"))}`,
  );
  await rp.close();
} finally {
  await browser.close();
}
if (problems.length) {
  console.log("\nPROBLEMS");
  for (const p of problems) console.log("  " + p);
}
console.log(
  problems.length
    ? `\nRESULT: ${problems.length} problem(s). Fix them, then look at every sheet.`
    : "\nRESULT: every scene ran. Now look at every sheet: does each frame read, and is the scene as bold as it should be?",
);
process.exit(problems.length ? 1 : 0);
