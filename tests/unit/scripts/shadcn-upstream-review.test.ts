import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createCliRunner,
  normalizePreview,
  parseDryRun,
  parseFileDiff,
  runUpstreamReview,
  SHADCN_CLI_VERSION,
  SHADCN_REVIEW_BASELINE,
  SHADCN_REQUIRED_SUPPORTING_SOURCES,
  sourceHash,
} from "../../../scripts/verify/shadcn-diff.mjs";

const temporaryDirectories: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function preview(
  component: string,
  files = [`components/shadcn/${component}.tsx`],
) {
  return [
    `┌ shadcn add ${component} (dry run)`,
    `├ Files (${files.length}) ~${files.length} overwrite`,
    ...files.map((file) => `│ ~ ${file}  overwrite`),
    "├ Dependencies (1)",
    "│ + cn",
    "└ Run without --dry-run to apply.",
  ].join("\n");
}

function diff(component: string, file = `components/shadcn/${component}.tsx`) {
  return [
    `┌ shadcn add ${component} (dry run)`,
    `├ ${file} (overwrite)`,
    "│ ┌──────────────",
    `│ │ --- a/${file}`,
    `│ │ +++ b/${file}`,
    "│ │ @@ -1,1 +1,1 @@",
    "│ │ -export const value = 'Core';",
    "│ │ +export const value = 'upstream';",
    "│ └──────────────",
    "└ Run without --dry-run to apply.",
  ].join("\n");
}

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-shadcn-review-"));
  temporaryDirectories.push(root);
  const config = {
    style: "base-maia",
    rsc: false,
    tsx: true,
    iconLibrary: "lucide",
    tailwind: {
      css: "styles/globals.css",
      baseColor: "zinc",
      cssVariables: true,
    },
    aliases: { ui: "@/components/shadcn", utils: "@/lib/utils" },
  };
  const sources: Record<string, string> = {
    "packages/ui/components.json": JSON.stringify(config),
    "packages/ui/components/shadcn/button.tsx":
      "export const value = 'Core';\n",
    "packages/ui/components/shadcn/dialog.tsx":
      "export const value = 'Core';\n",
    "packages/ui/components/shadcn/toolbar.tsx":
      "export const Toolbar = 'owned';\n",
    "packages/ui/styles/globals.css": ":root { --radius: 1rem; }\n",
    "packages/ui/lib/base-ui.ts": "export const callbackClassName = 'owned';\n",
    "docs/ui-contract.md":
      "Reviewed native form, styling and portal contracts.\n",
    "docs/keyboard-contract.md":
      "Reviewed keyboard activation and focus contracts.\n",
  };
  for (const file of SHADCN_REQUIRED_SUPPORTING_SOURCES) {
    sources[file] ??= "export const reviewedSupport = 'owned';\n";
  }
  for (const [file, source] of Object.entries(sources)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), source);
  }
  mkdirSync(path.join(root, "packages/ui/components/shadcn/custom-kit"));
  const previews = {
    button: preview("button"),
    dialog: preview("dialog", [
      "components/shadcn/button.tsx",
      "components/shadcn/dialog.tsx",
    ]),
  };
  const diffs = { button: diff("button"), dialog: diff("dialog") };
  const review = {
    reason: "Preserve the reviewed Core interaction and visual contract.",
    proofs: ["docs/ui-contract.md", "docs/keyboard-contract.md"],
  };
  const baseline = {
    schemaVersion: 2,
    cliVersion: SHADCN_CLI_VERSION,
    config,
    components: ["button", "dialog"].map((name) =>
      parseDryRun(previews[name as keyof typeof previews], name, root),
    ),
    files: ["button", "dialog"].map((name) => ({
      path: `components/shadcn/${name}.tsx`,
      diffComponent: name,
      owners: name === "button" ? ["button", "dialog"] : ["dialog"],
      localSha256: sourceHash(
        sources[`packages/ui/components/shadcn/${name}.tsx`],
      ),
      diffSha256: parseFileDiff(
        diffs[name as keyof typeof diffs],
        name,
        `components/shadcn/${name}.tsx`,
        root,
      ),
      ...review,
    })),
    localOnly: [
      {
        path: "components/shadcn/toolbar.tsx",
        localSha256: sourceHash(
          sources["packages/ui/components/shadcn/toolbar.tsx"],
        ),
        ...review,
      },
    ],
    excludedDirectories: [{ path: "custom-kit", ...review }],
    protectedSources: SHADCN_REQUIRED_SUPPORTING_SOURCES.map((file) => ({
      path: file,
      localSha256: sourceHash(sources[file]),
      ...review,
    })),
    proofSources: [...review.proofs].sort().map((file) => ({
      path: file,
      sha256: sourceHash(sources[file]),
    })),
  };
  const runCli = vi.fn(async (args: string[]) => {
    if (args[0] === "--version") return SHADCN_CLI_VERSION;
    if (args[0] === "info")
      return JSON.stringify({
        config: { base: "base", style: "base-maia" },
        components: ["dialog", "button"],
      });
    if (args[2] === "--dry-run")
      return previews[args[1] as keyof typeof previews];
    if (args[2] === "--diff") return diffs[args[1] as keyof typeof diffs];
    throw new Error("Unreviewed CLI mutation");
  });
  return { root, baseline, runCli, previews, diffs };
}

function installedCliFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-shadcn-installed-"));
  temporaryDirectories.push(root);
  const cwd = path.join(root, "packages/ui");
  const packageDirectory = path.join(root, "node_modules/shadcn");
  mkdirSync(cwd, { recursive: true });
  mkdirSync(path.join(packageDirectory, "dist"), { recursive: true });
  writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ devDependencies: { shadcn: SHADCN_CLI_VERSION } }),
  );
  writeFileSync(
    path.join(packageDirectory, "package.json"),
    JSON.stringify({
      name: "shadcn",
      version: SHADCN_CLI_VERSION,
      bin: { shadcn: "dist/index.js" },
    }),
  );
  writeFileSync(
    path.join(packageDirectory, "dist/index.js"),
    "console.log(JSON.stringify(process.argv.slice(2)));\n",
  );
  const command = path.join(root, "runtime");
  const installerMarker = path.join(root, "installer-invoked");
  writeFileSync(
    command,
    [
      "#!/usr/bin/env node",
      'const { spawnSync } = require("node:child_process");',
      'const { writeFileSync } = require("node:fs");',
      'if (process.argv[2] === "x") {',
      `  writeFileSync(${JSON.stringify(installerMarker)}, "invoked");`,
      "  process.exit(86);",
      "}",
      "const result = spawnSync(process.execPath, process.argv.slice(2), { encoding: 'utf8', env: process.env });",
      "process.stdout.write(result.stdout ?? '');",
      "process.stderr.write(result.stderr ?? '');",
      "process.exit(result.status ?? 1);",
    ].join("\n"),
  );
  chmodSync(command, 0o755);
  return { root, cwd, command, packageDirectory, installerMarker };
}

describe("shadcn upstream review gate", () => {
  it("runs concurrent public previews using the declared installed CLI without package installation", async () => {
    const input = installedCliFixture();
    const runCli = createCliRunner(input);
    await expect(
      Promise.all([
        runCli(["add", "accordion", "--dry-run"]),
        runCli(["add", "alert", "--dry-run"]),
      ]),
    ).resolves.toEqual([
      '["add","accordion","--dry-run"]\n',
      '["add","alert","--dry-run"]\n',
    ]);
    expect(existsSync(input.installerMarker)).toBe(false);
  });

  it.each([undefined, "^4.21.1", "4.20.4"])(
    "rejects an absent or nonexact project CLI pin: %s",
    (version) => {
      const input = installedCliFixture();
      writeFileSync(
        path.join(input.root, "package.json"),
        JSON.stringify({ devDependencies: { shadcn: version } }),
      );
      expect(() => createCliRunner(input)).toThrow(
        "Project must declare the exact pinned shadcn CLI version",
      );
      expect(existsSync(input.installerMarker)).toBe(false);
    },
  );

  it("rejects an absent installation instead of downloading a CLI", () => {
    const input = installedCliFixture();
    rmSync(input.packageDirectory, { recursive: true });
    expect(() => createCliRunner(input)).toThrow(
      "Missing declared project-installed shadcn CLI",
    );
    expect(existsSync(input.installerMarker)).toBe(false);
  });

  it("rejects a differently installed CLI version before invoking it", () => {
    const input = installedCliFixture();
    writeFileSync(
      path.join(input.packageDirectory, "package.json"),
      JSON.stringify({
        name: "shadcn",
        version: "4.20.4",
        bin: "dist/index.js",
      }),
    );
    expect(() => createCliRunner(input)).toThrow(
      "Project-installed shadcn CLI version mismatch",
    );
    expect(existsSync(input.installerMarker)).toBe(false);
  });

  it("rejects a CLI bin outside its installed package", () => {
    const input = installedCliFixture();
    writeFileSync(
      path.join(input.packageDirectory, "package.json"),
      JSON.stringify({
        name: "shadcn",
        version: SHADCN_CLI_VERSION,
        bin: "../../runtime",
      }),
    );
    expect(() => createCliRunner(input)).toThrow(
      "Invalid project-installed shadcn CLI entry",
    );
    expect(existsSync(input.installerMarker)).toBe(false);
  });

  it("rejects the deprecated CLI's false no-updates result at the real entry point", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "core-shadcn-cli-"));
    temporaryDirectories.push(directory);
    const executable = path.join(directory, "bunx");
    writeFileSync(
      executable,
      '#!/usr/bin/env node\nconsole.log("No updates found.");\n',
    );
    chmodSync(executable, 0o755);
    writeFileSync(
      path.join(directory, "bun"),
      '#!/usr/bin/env node\nconsole.log("No updates found.");\n',
    );
    chmodSync(path.join(directory, "bun"), 0o755);
    const result = spawnSync(
      process.execPath,
      ["scripts/verify/shadcn-diff.mjs"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          PATH: `${directory}${path.delimiter}${process.env.PATH ?? ""}`,
          HOME: process.env.HOME,
        },
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(
      /version|deprecated|coverage/i,
    );
  });

  it("covers every installed component and dependency with explicit read-only diffs", async () => {
    const input = fixture();
    await expect(runUpstreamReview(input)).resolves.toEqual({
      components: 2,
      files: 2,
      localAdapters: 1,
      toolkitDirectories: 1,
    });
    expect(input.runCli.mock.calls.map(([args]) => args)).toEqual([
      ["--version"],
      ["info", "--json"],
      ["add", "button", "--dry-run"],
      ["add", "dialog", "--dry-run"],
      ["add", "button", "--diff", "components/shadcn/button.tsx"],
      ["add", "dialog", "--diff", "components/shadcn/dialog.tsx"],
    ]);
  });

  it.each([
    [],
    ["button"],
    ["button", "dialog", "sheet"],
    ["button", "button", "dialog"],
  ])(
    "rejects empty, missing, unknown or duplicate inventory: %j",
    async (components) => {
      const input = fixture();
      const original = input.runCli.getMockImplementation()!;
      input.runCli.mockImplementation(async (args) =>
        args[0] === "info"
          ? JSON.stringify({
              config: { base: "base", style: "base-maia" },
              components,
            })
          : original(args),
      );
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /component.*coverage/i,
      );
    },
  );

  it.each([
    "No updates found.",
    preview("button").replace("Files (1)", "Files (2)"),
    preview("button").replace("└ Run without --dry-run to apply.", ""),
    preview("button", [
      "components/shadcn/button.tsx",
      "components/shadcn/button.tsx",
    ]),
  ])(
    "rejects deprecated, incomplete or duplicate preview output",
    async (output) => {
      const input = fixture();
      const original = input.runCli.getMockImplementation()!;
      input.runCli.mockImplementation(async (args) =>
        args[0] === "add" && args[1] === "button" && args[2] === "--dry-run"
          ? output
          : original(args),
      );
      await expect(runUpstreamReview(input)).rejects.toThrow(/coverage/i);
    },
  );

  it.each([
    diff("button").replace("│ │ +export const value = 'upstream';\n", ""),
    diff("button").replace(
      "components/shadcn/button.tsx (overwrite)",
      "components/shadcn/dialog.tsx (overwrite)",
    ),
    diff("button").replace("│ └──────────────\n", ""),
    diff("button").replace("└ Run without --dry-run to apply.", ""),
    "No updates found for button.",
  ])("rejects partial or mismatched explicit diffs", (output) => {
    expect(() =>
      parseFileDiff(output, "button", "components/shadcn/button.tsx"),
    ).toThrow(/coverage|hunk|box/i);
  });

  it.each(["button.tsx", "toolbar.tsx"])(
    "fails a changed reviewed local source: %s",
    async (file) => {
      const input = fixture();
      writeFileSync(
        path.join(input.root, "packages/ui/components/shadcn", file),
        "changed public behavior",
      );
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /Local (source|adapter).*changed/i,
      );
    },
  );

  it("fails changed upstream content and dependency previews", async () => {
    const input = fixture();
    input.diffs.button = input.diffs.button.replace(
      "'upstream'",
      "'new contract'",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Upstream diff.*changed/i,
    );
    input.previews.button = input.previews.button.replace(
      "│ + cn",
      "│ + new-package",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /preview coverage.*changed/i,
    );
  });

  it("fails unreviewed local additions, config drift and protected token changes", async () => {
    const input = fixture();
    writeFileSync(
      path.join(input.root, "packages/ui/components/shadcn/new-control.tsx"),
      "new control",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Local adapter coverage/,
    );
    rmSync(
      path.join(input.root, "packages/ui/components/shadcn/new-control.tsx"),
    );
    writeFileSync(
      path.join(input.root, "packages/ui/styles/globals.css"),
      "different tokens",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Protected source.*changed/,
    );
    input.baseline.config.style = "radix-luma";
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /configuration.*changed/i,
    );
  });

  it("requires documented customization proof and propagates CLI errors", async () => {
    const input = fixture();
    input.baseline.files[0].reason = "";
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Missing customization review/,
    );
    input.runCli.mockRejectedValue(new Error("CLI transport failure"));
    await expect(runUpstreamReview(input)).rejects.toThrow(
      "CLI transport failure",
    );
  });

  it("rejects changed review proof content even when runtime sources and CLI previews are unchanged", async () => {
    const input = fixture();
    writeFileSync(
      path.join(input.root, "docs/ui-contract.md"),
      "The prior native submit, label and portal validation is withdrawn.\n",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Review proof.*changed/,
    );
  });

  it.each(["empty", "partial", "omitted"])(
    "rejects %s review proof inventory",
    async (omission) => {
      const input = fixture();
      if (omission === "empty") input.baseline.proofSources = [];
      else if (omission === "partial") input.baseline.proofSources.pop();
      else Reflect.deleteProperty(input.baseline, "proofSources");
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /proof.*coverage/i,
      );
    },
  );

  it("rejects substituting an unrelated proof with a valid content hash", async () => {
    const input = fixture();
    const unrelated = "This file did not substantiate the recorded review.\n";
    writeFileSync(path.join(input.root, "docs/unrelated.md"), unrelated);
    input.baseline.proofSources = [
      { path: "docs/unrelated.md", sha256: sourceHash(unrelated) },
    ];
    await expect(runUpstreamReview(input)).rejects.toThrow(/proof.*coverage/i);
  });

  it("rejects a missing cited proof file", async () => {
    const input = fixture();
    rmSync(path.join(input.root, "docs/ui-contract.md"));
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Missing review proof/,
    );
  });

  it.each(["duplicate", "reordered", "invalid hash"])(
    "rejects a %s review proof inventory",
    async (change) => {
      const input = fixture();
      if (change === "duplicate")
        input.baseline.proofSources.push(input.baseline.proofSources[0]);
      else if (change === "reordered") input.baseline.proofSources.reverse();
      else input.baseline.proofSources[0].sha256 = "unreviewed";
      await expect(runUpstreamReview(input)).rejects.toThrow(/review proof/i);
    },
  );

  it("accepts a source file cited as its own proof without recursive hashing", async () => {
    const input = fixture();
    const sourcePath = "packages/ui/components/shadcn/button.tsx";
    input.baseline.files[0].proofs.push(sourcePath);
    input.baseline.proofSources.push({
      path: sourcePath,
      sha256: input.baseline.files[0].localSha256,
    });
    await expect(runUpstreamReview(input)).resolves.toMatchObject({
      components: 2,
      files: 2,
    });
  });

  it("rejects hashing the baseline as its own review proof", async () => {
    const input = fixture();
    const baselineFile = path.join(input.root, SHADCN_REVIEW_BASELINE);
    mkdirSync(path.dirname(baselineFile), { recursive: true });
    writeFileSync(baselineFile, "{}\n");
    for (const entry of [
      ...input.baseline.files,
      ...input.baseline.localOnly,
      ...input.baseline.protectedSources,
      ...input.baseline.excludedDirectories,
    ]) {
      entry.proofs = [SHADCN_REVIEW_BASELINE];
    }
    input.baseline.proofSources = [
      { path: SHADCN_REVIEW_BASELINE, sha256: sourceHash("{}\n") },
    ];
    await expect(runUpstreamReview(input)).rejects.toThrow(/baseline.*itself/i);
  });

  it.each(["empty", "partial"])(
    "rejects %s supporting-source coverage",
    async (omission) => {
      const input = fixture();
      input.baseline.protectedSources =
        omission === "empty"
          ? []
          : input.baseline.protectedSources.filter(
              (entry) => entry.path !== "packages/ui/lib/base-ui.ts",
            );
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /supporting.*coverage/i,
      );
    },
  );

  it("bounds simultaneous registry reads to two and stops before diffs after preview failure", async () => {
    const input = fixture();
    const original = input.runCli.getMockImplementation()!;
    let active = 0;
    let maximum = 0;
    input.runCli.mockImplementation(async (args) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active -= 1;
      return original(args);
    });
    await expect(runUpstreamReview(input)).resolves.toMatchObject({ files: 2 });
    expect(maximum).toBe(2);
    input.runCli.mockClear();
    input.previews.button = "truncated";
    await expect(runUpstreamReview(input)).rejects.toThrow(/coverage/);
    expect(
      input.runCli.mock.calls.every(([args]) => !args.includes("--diff")),
    ).toBe(true);
  });

  it("normalizes ANSI, checkout roots and CRLF without hiding source changes", () => {
    expect(
      normalizePreview(
        "\u001b[31mC:\\checkout/file\u001b[0m\r\n",
        "C:\\checkout",
      ),
    ).toBe("<repo-root>/file\n");
    expect(sourceHash("value\r\n")).toBe(sourceHash("value\n"));
    expect(sourceHash("value \n")).not.toBe(sourceHash("value\n"));
    const output = diff("button");
    expect(
      parseFileDiff(
        output.replaceAll("\n", "\r\n"),
        "button",
        "components/shadcn/button.tsx",
      ),
    ).toBe(parseFileDiff(output, "button", "components/shadcn/button.tsx"));
  });

  it("does not confuse source text with CLI deprecation warnings or expose invalid JSON", async () => {
    expect(() =>
      parseFileDiff(
        diff("button").replace("'upstream'", "'deprecated API'"),
        "button",
        "components/shadcn/button.tsx",
      ),
    ).not.toThrow();
    const input = fixture();
    const original = input.runCli.getMockImplementation()!;
    input.runCli.mockImplementation(async (args) =>
      args[0] === "info" ? "opaque-test-only-invalid-json" : original(args),
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      "Invalid CLI info JSON coverage",
    );
  });

  it("does not pass provider credentials to the public CLI process", async () => {
    vi.stubEnv("SHADCN_TEST_PROVIDER_SECRET", "opaque-test-only-value");
    const runCli = createCliRunner({
      cwd: process.cwd(),
      command: process.execPath,
      prefix: [
        "-e",
        "console.log(Boolean(process.env.SHADCN_TEST_PROVIDER_SECRET))",
      ],
    });
    await expect(runCli([])).resolves.toBe("false\n");
  });
});
