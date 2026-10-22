import { spawnSync } from "node:child_process";
import { JSDOM } from "jsdom";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  requirePreviewUrl,
  sceneScreenshotName,
  renderSceneContactSheet,
} from "../../../scripts/refresh-overlays/taste-preview-boundary.mjs";
import { applyTastePreviewCompatibility } from "../../../scripts/lib/taste-preview-adapter.mjs";
const repo = process.cwd(),
  roots: string[] = [];
const source = path.join(repo, "docs/ai/skills/design-taste-frontend");
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "taste-preview-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts/lib"), { recursive: true });
  for (const name of ["inspect", "scenes"])
    await cp(
      path.join(
        repo,
        "tests/fixtures/managed-skill-refresh/design-taste-frontend/scripts",
        name + ".mjs.raw",
      ),
      path.join(root, "scripts", name + ".mjs"),
    );
  for (const relative of ["SKILL.md", "references/scenes.md"]) {
    const from = path.join(
      repo,
      "tests/fixtures/managed-skill-refresh/design-taste-frontend",
      relative + ".raw",
    );
    const to = path.join(root, relative);
    await mkdir(path.dirname(to), { recursive: true });
    await cp(from, to);
  }
  return root;
}
afterEach(async () => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
  vi.unstubAllGlobals();
});
describe("Core taste browser boundaries", () => {
  it.each([
    "index.html",
    "../index.html",
    "/tmp/index.html",
    "file:///tmp/index.html",
    "data:text/html,test",
    "javascript:alert(1)",
  ])("refuses non-HTTP(S) input %s", (input) =>
    expect(() => requirePreviewUrl(input)).toThrow("HTTP(S)"),
  );
  it.each(["http://localhost:3000/page", "https://example.invalid/page"])(
    "preserves explicit URL input %s",
    (input) => expect(requirePreviewUrl(input)).toBe(input),
  );
  it("uses bounded, distinct filenames independent of scene IDs", () => {
    expect(sceneScreenshotName(0, "desktop")).toBe("scene-1-desktop.jpg");
    expect(sceneScreenshotName(1, "desktop")).toBe("scene-2-desktop.jpg");
    expect(sceneScreenshotName(0, "phone")).toBe("scene-1-phone.jpg");
    for (const [index, label] of [
      [-1, "desktop"],
      [Infinity, "desktop"],
      [0, "../../outside"],
      [0, "/outside"],
    ])
      expect(() => sceneScreenshotName(index, label)).toThrow();
  });
  it("renders contact-sheet labels as literal text", async () => {
    const dom = new JSDOM("<!doctype html><body></body>");
    vi.stubGlobal("document", dom.window.document);
    Object.defineProperty(dom.window.HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: async () => {},
    });
    const labels = [
      '<img src=x onerror="alert(1)">',
      "../../scene",
      "<svg onload=alert(1)>",
    ];
    await renderSceneContactSheet({
      frames: ["AA==", "AA==", "AA=="],
      labels,
      cellW: 100,
      cellH: 100,
      cols: 2,
    });
    expect(
      [...document.querySelectorAll("figcaption")].map((x) => x.textContent),
    ).toEqual(labels);
    expect(
      document.querySelectorAll(
        "figcaption img,figcaption svg,[onerror],[onload]",
      ),
    ).toHaveLength(0);
    expect(document.querySelectorAll("figure > img")).toHaveLength(3);
  });
  it.each(["inspect", "scenes"])(
    "rejects local paths before browser or output creation in %s",
    async (name) => {
      const root = await fixture();
      await applyTastePreviewCompatibility(root);
      await writeFile(
        path.join(root, "scripts/lib/cdp.mjs"),
        'export const sleep=async()=>{};export class Browser{static async launch(){throw new Error("BROWSER_STUB_STARTED")}}',
      );
      await writeFile(
        path.join(root, "scripts/lib/probe.mjs"),
        "export const probe=()=>({}),frame=probe,layout=probe,app=probe,colourShare=probe;",
      );
      await writeFile(
        path.join(root, "scripts/lib/rules.mjs"),
        "export const judge=()=>[],judgeLayout=judge,judgeApp=judge,APP_SKIP=new Set();",
      );
      const run = (input: string) =>
        spawnSync(process.execPath, ["scripts/" + name + ".mjs", input], {
          cwd: root,
          encoding: "utf8",
        });
      const local = run("index.html");
      expect(local.status, local.stderr).toBe(2);
      expect(local.stderr).toContain("HTTP(S)");
      expect(local.stderr).not.toContain("BROWSER_STUB_STARTED");
      await expect(
        readFile(path.join(root, ".taste-skill")),
      ).rejects.toMatchObject({ code: "ENOENT" });
      const url = run("https://example.invalid");
      expect(url.stderr).toContain("BROWSER_STUB_STARTED");
    },
  );
  it("restores reviewed raw tools without execution and is idempotent", async () => {
    const root = await fixture();
    await applyTastePreviewCompatibility(root);
    for (const file of [
      "scripts/inspect.mjs",
      "scripts/scenes.mjs",
      "scripts/lib/preview-boundary.mjs",
    ])
      expect(await readFile(path.join(root, file), "utf8")).toBe(
        await readFile(path.join(source, file), "utf8"),
      );
    for (const relative of ["SKILL.md", "references/scenes.md"]) {
      const document = await readFile(path.join(root, relative), "utf8");
      expect(document).toContain("<existing-dev-server-url>");
      expect(document).not.toContain("--public-root");
      expect(document).not.toContain("The inspector serves local files");
    }
    await applyTastePreviewCompatibility(root);
    const scenes = await readFile(
      path.join(root, "scripts/scenes.mjs"),
      "utf8",
    );
    expect(scenes).toContain("sceneScreenshotName(sceneIndex, label)");
    expect(scenes).toContain("renderSceneContactSheet");
    expect(scenes).not.toContain("createServer");
  });
  it("rejects source drift before publishing either tool or helper", async () => {
    const root = await fixture();
    const first = await readFile(path.join(root, "scripts/inspect.mjs"));
    await writeFile(
      path.join(root, "scripts/scenes.mjs"),
      "const unexpected = true;",
    );
    await expect(applyTastePreviewCompatibility(root)).rejects.toThrow(
      "source drifted",
    );
    expect(await readFile(path.join(root, "scripts/inspect.mjs"))).toEqual(
      first,
    );
    await expect(
      readFile(path.join(root, "scripts/lib/preview-boundary.mjs")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects a linked helper destination without changing its target", async () => {
    const root = await fixture();
    const outside = path.join(root, "outside.mjs");
    await writeFile(outside, "unchanged");
    await symlink(outside, path.join(root, "scripts/lib/preview-boundary.mjs"));
    await expect(applyTastePreviewCompatibility(root)).rejects.toThrow(
      "Unsafe",
    );
    expect(await readFile(outside, "utf8")).toBe("unchanged");
  });
});
