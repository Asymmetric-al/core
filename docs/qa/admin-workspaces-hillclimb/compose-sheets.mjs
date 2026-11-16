// Side-by-side comparison sheets (A | B) for every captured state and width.
// Usage: node docs/qa/admin-workspaces-hillclimb/compose-sheets.mjs <dirA> <labelA> <dirB> <labelB> <outDir> [statePrefix]
// Local-only: inlines saved PNGs as data URIs in headless Chrome.
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright-core";

const [dirA, labelA, dirB, labelB, outDir, prefix = ""] = process.argv.slice(2);
if (!outDir) throw new Error("usage: dirA labelA dirB labelB outDir [prefix]");
mkdirSync(outDir, { recursive: true });

const SCALE = {
  desktop: 0.5,
  intermediate: 0.55,
  "small-tablet": 0.7,
  mobile: 0.9,
};
const names = readdirSync(dirB)
  .filter(
    (f) =>
      f.endsWith(".png") && !f.endsWith("-full.png") && f.startsWith(prefix),
  )
  .filter((f) => existsSync(join(dirA, f)));

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const name of names) {
    const width = name.replace(/\.png$/, "").split("--")[1] ?? "desktop";
    const scale = SCALE[width] ?? 0.5;
    const pane = (label, dir) => `
      <figure>
        <figcaption>${label} · ${name.replace(/\.png$/, "")}</figcaption>
        <img src="data:image/png;base64,${readFileSync(join(dir, name)).toString("base64")}" style="zoom:${scale}" />
      </figure>`;
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:#e4e4e7;font:600 13px system-ui,sans-serif">
        <div id="sheet" style="display:inline-flex;gap:16px;padding:16px;align-items:flex-start">${pane(labelA, dirA)}${pane(labelB, dirB)}</div>
        <style>figure{margin:0;display:flex;flex-direction:column;gap:8px}figcaption{color:#18181b}img{display:block;border:1px solid #a1a1aa;background:#fff}</style>
      </body></html>`,
      { waitUntil: "load" },
    );
    await page.locator("#sheet").screenshot({ path: join(outDir, name) });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`wrote ${names.length} sheets to ${outDir}`);
