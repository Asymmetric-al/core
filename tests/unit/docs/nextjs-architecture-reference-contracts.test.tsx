// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createElement, type ComponentType } from "react";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

const root = "docs/ai/skills/nextjs-app-architecture/";
const read = (file: string) => readFileSync(root + file, "utf8");
const load = createRequire(import.meta.url);

function recipe<Props extends object>(name: string, pending = false) {
  const source = read("references/ux-patterns.md");
  const block = [...source.matchAll(/```tsx\n([\s\S]*?)```/g)].find((match) =>
    match[1].includes(`export function ${name}(`),
  );
  if (!block) throw new Error(`Missing executable recipe: ${name}`);
  const exports: Record<string, unknown> = {};
  const compiled = ts.transpileModule(block[1], {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
  });
  runInNewContext(compiled.outputText, {
    exports,
    require: (module: string) => {
      if (module === "next/link") return { useLinkStatus: () => ({ pending }) };
      if (module === "react" || module === "react/jsx-runtime")
        return load(module);
      throw new Error(`Unexpected recipe import: ${module}`);
    },
  });
  const component = exports[name];
  if (typeof component !== "function")
    throw new Error(`Missing export: ${name}`);
  return component as ComponentType<Props>;
}

afterEach(cleanup);

describe("Next.js architecture executable reference contracts", () => {
  it("explicitly wires the hook result to a pending attribute", () => {
    const Pending = recipe("PendingHint", true);
    const Idle = recipe("PendingHint", false);
    const view = render(createElement(Pending));
    expect(view.container.querySelector("[data-pending]")).not.toBeNull();
    view.rerender(createElement(Idle));
    expect(view.container.querySelector("[data-pending]")).toBeNull();
  });

  it("retains the canonical optimistic result after the transition completes", async () => {
    const Toggle = recipe<{
      initialLiked: boolean;
      save: (next: boolean) => Promise<boolean>;
    }>("OptimisticToggle");
    render(
      createElement(Toggle, { initialLiked: false, save: async () => true }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Unlike" }).hasAttribute("disabled"),
      ).toBe(false),
    );
  });

  it("uses the server result and rolls back a failed optimistic change", async () => {
    const Toggle = recipe<{
      initialLiked: boolean;
      save: (next: boolean) => Promise<boolean>;
    }>("OptimisticToggle");
    const view = render(
      createElement(Toggle, { initialLiked: false, save: async () => false }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Like" }).hasAttribute("disabled"),
      ).toBe(false),
    );
    view.unmount();
    render(
      createElement(Toggle, {
        initialLiked: false,
        save: async () => {
          throw new Error("unavailable");
        },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    await screen.findByRole("alert");
    expect(
      screen.getByRole("button", { name: "Like" }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("requires a payload for a successful payload-bearing action result", () => {
    const block = [
      ...read("references/queries-actions.md").matchAll(
        /```tsx\n([\s\S]*?)```/g,
      ),
    ].find((match) => match[1].includes("export type ActionResult"));
    if (!block) throw new Error("Missing ActionResult contract");
    const source = `${block[1]}
      const empty: ActionResult = { ok: true };
      const payload: ActionResult<{ id: string }> = { ok: true, data: { id: "one" } };
      const error: ActionResult<{ id: string }> = { ok: false, error: "unavailable" };
      // @ts-expect-error A payload-bearing success cannot silently omit data.
      const missing: ActionResult<{ id: string }> = { ok: true };
    `;
    const filename = "/core-reference-action-result.ts";
    const options: ts.CompilerOptions = {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
    };
    const host = ts.createCompilerHost(options);
    const original = host.getSourceFile;
    host.getSourceFile = (file, version, onError, createNew) =>
      file === filename
        ? ts.createSourceFile(file, source, version)
        : original(file, version, onError, createNew);
    const program = ts.createProgram([filename], options, host);
    expect(
      ts.getPreEmitDiagnostics(program).map((diagnostic) => ({
        code: diagnostic.code,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
      })),
    ).toEqual([]);
  });

  it("does not prescribe the demonstrated layout and snapshot failures", () => {
    expect(read("references/pages-suspense.md")).not.toContain(
      "Move headings **outside** boundaries when their position depends on data above them",
    );
    expect(read("references/ux-patterns.md")).not.toContain(
      "Apply `viewTransitionName: 'none'` to the portal root",
    );
    expect(read("references/ux-patterns.md")).toContain(
      "ancestor/root snapshot",
    );
  });

  it("uses version-matched API guidance and preserves cache prerequisites", () => {
    for (const name of [
      "cache-components",
      "components",
      "pages-suspense",
      "queries-actions",
      "ux-patterns",
      "single-page-applications",
    ]) {
      expect(read(`references/${name}.md`)).not.toMatch(
        /https:\/\/preview\.nextjs\.org/,
      );
    }
    const cache = read("references/cache-components.md");
    expect(cache).toContain("cacheHandlers");
    expect(cache).toContain("in-memory");
    expect(cache).toContain("refactoring request access out");
    expect(cache).toContain("revalidatePath");
    expect(read("references/pages-suspense.md")).toContain(
      "otherwise fully prerenderable",
    );
  });

  it("keeps the refresh pinned, reviewed before copying, and mirror-preserving", () => {
    const source = read("references/upstream.md");
    expect(source).toContain("npx --yes skills@1.5.7");
    expect(source).toContain("f2902b8538b25610da694394ecf88e69adf5f96a");
    expect(source).toContain("rev-parse HEAD");
    expect(source).toContain("before copying");
    expect(source).toContain("raw upstream");
    expect(source).toMatch(/required generated runtime\s+mirror/);
    expect(source).not.toContain("symlink — delete it");
    expect(source).not.toContain("npx skills add");
  });
});
