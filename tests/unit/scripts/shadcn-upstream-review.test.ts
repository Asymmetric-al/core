import { spawnSync } from "node:child_process";
import { X509Certificate } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createCliRunner,
  createUpstreamSourceView,
  validateSourceMappings,
  SHADCN_SOURCE_MAPPINGS,
  SHADCN_MAPPED_SUPPORTING_SOURCES,
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
  vi.restoreAllMocks();
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
  it("starts the locked public CLI concurrently without installing dependencies", async () => {
    const runCli = createCliRunner({
      cwd: path.join(process.cwd(), "packages/ui"),
    });
    const versions = await Promise.all([
      runCli(["--version"]),
      runCli(["--version"]),
    ]);
    expect(versions.map((version) => version.trim())).toEqual([
      "4.21.4",
      "4.21.4",
    ]);
  });

  describe("bounded public registry retries", () => {
    const readOnlyArgs = ["add", "button", "--dry-run"];
    const publicFailure = (status: number) =>
      "Failed to fetch from registry (" +
      status +
      "): https://ui.shadcn.com/r/styles/base-maia/button.json\n";

    function failingCli({
      failures = 1,
      message = publicFailure(503),
      exitCode = 1,
      firstDelayMs = 0,
      laterDelayMs = 0,
      paddingBytes = 0,
    } = {}) {
      const input = installedCliFixture();
      const marker = path.join(input.root, "attempts.json");
      writeFileSync(
        path.join(input.packageDirectory, "dist/index.js"),
        [
          "const fs = require('node:fs');",
          "const marker = " + JSON.stringify(marker) + ";",
          "const attempts = fs.existsSync(marker) ? JSON.parse(fs.readFileSync(marker, 'utf8')) : [];",
          "attempts.push(process.argv.slice(2));",
          "fs.writeFileSync(marker, JSON.stringify(attempts));",
          "const failed = attempts.length <= " + failures + ";",
          "setTimeout(() => {",
          "process.stdout.write('x'.repeat(" +
            paddingBytes +
            ") + String.fromCharCode(10));",
          "process.stdout.write(failed ? " +
            JSON.stringify(message) +
            " : " +
            JSON.stringify(preview("button")) +
            ", () => process.exit(failed ? " +
            exitCode +
            " : 0));",
          "}, attempts.length === 1 ? " +
            firstDelayMs +
            " : " +
            laterDelayMs +
            ");",
        ].join("\n"),
      );
      return {
        ...input,
        command: process.execPath,
        attempts: () => JSON.parse(readFileSync(marker, "utf8")) as string[][],
      };
    }

    it.each([502, 503, 504])(
      "retries a public HTTP%s once using identical read-only arguments",
      async (status) => {
        const input = failingCli({
          message: publicFailure(status) + "opaque-test-provider-token\n",
        });
        const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
        const output = await createCliRunner(input)(readOnlyArgs);
        expect(parseDryRun(output, "button", input.root)).toEqual(
          parseDryRun(preview("button"), "button", input.root),
        );
        expect(input.attempts()).toEqual([readOnlyArgs, readOnlyArgs]);
        expect(warning).toHaveBeenCalledTimes(1);
        expect(String(warning.mock.calls)).toContain("HTTP " + status);
        expect(String(warning.mock.calls)).not.toContain(
          "opaque-test-provider-token",
        );
        expect(existsSync(input.installerMarker)).toBe(false);
      },
    );

    it("snapshots the read-only command before a caller can mutate its arguments", async () => {
      const input = failingCli();
      const args = [...readOnlyArgs];
      vi.spyOn(console, "warn").mockImplementation(() => {
        args.pop();
      });
      await createCliRunner(input)(args);
      expect(args).toEqual(["add", "button"]);
      expect(input.attempts()).toEqual([readOnlyArgs, readOnlyArgs]);
    });

    it("fails persistent public 503 after exactly three attempts", async () => {
      const input = failingCli({ failures: 10 });
      const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
      await expect(createCliRunner(input)(readOnlyArgs)).rejects.toThrow(
        "public registry HTTP 503 after 3 attempts",
      );
      expect(input.attempts()).toEqual([
        readOnlyArgs,
        readOnlyArgs,
        readOnlyArgs,
      ]);
      expect(warning).toHaveBeenCalledTimes(2);
    });

    it.each([
      { message: publicFailure(401), exitCode: 1, args: readOnlyArgs },
      { message: publicFailure(429), exitCode: 1, args: readOnlyArgs },
      { message: publicFailure(500), exitCode: 1, args: readOnlyArgs },
      {
        message: publicFailure(503).replace(
          "ui.shadcn.com",
          "registry.npmjs.org",
        ),
        exitCode: 1,
        args: readOnlyArgs,
      },
      {
        message: publicFailure(503).replace(
          "ui.shadcn.com",
          "ui.shadcn.com.evil.invalid",
        ),
        exitCode: 1,
        args: readOnlyArgs,
      },
      {
        message: publicFailure(503).replace(
          ".json",
          ".json?token=opaque-test-token",
        ),
        exitCode: 1,
        args: readOnlyArgs,
      },
      {
        message: publicFailure(503) + "certificate has expired\n",
        exitCode: 1,
        args: readOnlyArgs,
      },
      {
        message: publicFailure(503) + publicFailure(401),
        exitCode: 1,
        args: readOnlyArgs,
      },
      { message: "certificate has expired\n", exitCode: 1, args: readOnlyArgs },
      { message: publicFailure(503), exitCode: 2, args: readOnlyArgs },
      { message: publicFailure(503), exitCode: 1, args: ["add", "button"] },
    ])(
      "does not retry nontransient/nonpublic errors or mutation arguments: %j",
      async ({ message, exitCode, args }) => {
        const input = failingCli({ message, exitCode, failures: 10 });
        const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
        await expect(createCliRunner(input)(args)).rejects.toThrow(
          "shadcn CLI coverage failed (exit " + exitCode + ")",
        );
        expect(input.attempts()).toEqual([args]);
        expect(warning).not.toHaveBeenCalled();
      },
    );

    it("keeps the original total timeout across child attempts and backoff", async () => {
      const input = failingCli({
        failures: 10,
        firstDelayMs: 180,
        laterDelayMs: 1000,
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const started = performance.now();
      await expect(
        createCliRunner({ ...input, timeoutMs: 500 })(readOnlyArgs),
      ).rejects.toThrow("shadcn CLI coverage timed out");
      expect(performance.now() - started).toBeLessThan(750);
      expect(input.attempts()).toEqual([readOnlyArgs, readOnlyArgs]);
    });

    it("keeps the 4MB output cap cumulative across failed and successful attempts", async () => {
      const input = failingCli({ paddingBytes: 2_100_000 });
      vi.spyOn(console, "warn").mockImplementation(() => {});
      await expect(createCliRunner(input)(readOnlyArgs)).rejects.toThrow(
        "shadcn CLI coverage exceeded the output limit",
      );
      expect(input.attempts()).toEqual([readOnlyArgs, readOnlyArgs]);
    });
  });

  it("uses the current Node executable for concurrent read-only CLI processes", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "core-shadcn-runtime-"));
    temporaryDirectories.push(directory);
    const executable = path.join(directory, "cli.mjs");
    writeFileSync(
      executable,
      'console.log(JSON.stringify({runtime:process.versions.bun?"bun":"node",args:process.argv.slice(2)}));\n',
    );
    const runCli = createCliRunner({ cwd: directory, prefix: [executable] });
    const outputs = await Promise.all([
      runCli(["--version"]),
      runCli(["info", "--json"]),
    ]);
    expect(outputs.map((output) => JSON.parse(output))).toEqual([
      { runtime: "node", args: ["--version"] },
      { runtime: "node", args: ["info", "--json"] },
    ]);
  });

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

  it.each([undefined, "^4.21.4", "4.21.1", "4.20.4"])(
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
    const { root, baseline } = fixture();
    const scripts = path.join(root, "scripts/verify");
    const cli = path.join(root, "node_modules/shadcn");
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ devDependencies: { shadcn: SHADCN_CLI_VERSION } }),
    );
    mkdirSync(scripts, { recursive: true });
    mkdirSync(cli, { recursive: true });
    mkdirSync(path.join(root, "tooling/shadcn"), { recursive: true });
    writeFileSync(
      path.join(scripts, "shadcn-diff.mjs"),
      readFileSync("scripts/verify/shadcn-diff.mjs"),
    );
    writeFileSync(
      path.join(cli, "package.json"),
      JSON.stringify({
        name: "shadcn",
        version: SHADCN_CLI_VERSION,
        type: "module",
        bin: { shadcn: "index.mjs" },
      }),
    );
    writeFileSync(
      path.join(cli, "index.mjs"),
      'console.log("No updates found.");\n',
    );
    writeFileSync(
      path.join(root, SHADCN_REVIEW_BASELINE),
      JSON.stringify(baseline),
    );
    const result = spawnSync(
      process.execPath,
      [path.join(scripts, "shadcn-diff.mjs")],
      {
        cwd: root,
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
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

  describe("approved credential-free checker transport", () => {
    const proxy = "http://approved-cloud-proxy.invalid:3128";
    // Public Node.js test CA, not copied from host trust or credential files:
    // https://github.com/nodejs/node/blob/v24.15.0/test/fixtures/keys/ca1-cert.pem
    const publicTestCertificate = `-----BEGIN CERTIFICATE-----
MIIDlDCCAnygAwIBAgIUSrFsjf1qfQ0t/KvfnEsOksatAikwDQYJKoZIhvcNAQEL
BQAwejELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMQswCQYDVQQHDAJTRjEPMA0G
A1UECgwGSm95ZW50MRAwDgYDVQQLDAdOb2RlLmpzMQwwCgYDVQQDDANjYTExIDAe
BgkqhkiG9w0BCQEWEXJ5QHRpbnljbG91ZHMub3JnMCAXDTIyMDkwMzIxNDAzN1oY
DzIyOTYwNjE3MjE0MDM3WjB6MQswCQYDVQQGEwJVUzELMAkGA1UECAwCQ0ExCzAJ
BgNVBAcMAlNGMQ8wDQYDVQQKDAZKb3llbnQxEDAOBgNVBAsMB05vZGUuanMxDDAK
BgNVBAMMA2NhMTEgMB4GCSqGSIb3DQEJARYRcnlAdGlueWNsb3Vkcy5vcmcwggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDNvf4OGGep+ak+4DNjbuNgy0S/
AZPxahEFp4gpbcvsi9YLOPZ31qpilQeQf7d27scIZ02Qx1YBAzljxELB8H/ZxuYS
cQK0s+DNP22xhmgwMWznO7TezkHP5ujN2UkbfbUpfUxGFgncXeZf9wR7yFWppeHi
RWNBOgsvY7sTrS12kXjWGjqntF7xcEDHc7h+KyF6ZjVJZJCnP6pJEQ+rUjd51eCZ
Xt4WjowLnQiCS1VKzXiP83a++Ma1BKKkUitTR112/Uwd5eGoiByhmLzb/BhxnHJN
07GXjhlMItZRm/jfbZsx1mwnNOO3tx4r08l+DaqkinIadvazs+1ugCaKQn8xAgMB
AAGjEDAOMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAFqG0RXURDam
56x5accdg9sY5zEGP5VQhkK3ZDc2NyNNa25rwvrjCpO+e0OSwKAmm4aX6iIf2woY
wF2f9swWYzxn9CG4fDlUA8itwlnHxupeL4fGMTYb72vf31plUXyBySRsTwHwBloc
F7KvAZpYYKN9EMH1S/267By6H2I33BT/Ethv//n8dSfmuCurR1kYRaiOC4PVeyFk
B3sj8TtolrN0y/nToWUhmKiaVFnDx3odQ00yhmxR3t21iB7yDkko6D8Vf2dVC4j/
YYBVprXGlTP/hiYRLDoP20xKOYznx5cvHPJ9p+lVcOZUJsJj/Iy750+2n5UiBmXt
lz88C25ucKA=
-----END CERTIFICATE-----
`;
    // Public leaf fixture from the same pinned Node release; no private key:
    // https://github.com/nodejs/node/blob/v24.15.0/test/fixtures/keys/agent1-cert.pem
    const publicLeafCertificate = `-----BEGIN CERTIFICATE-----
MIID6DCCAtCgAwIBAgIUFH02wcL3Qgben6tfIibXitsApCYwDQYJKoZIhvcNAQEL
BQAwejELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMQswCQYDVQQHDAJTRjEPMA0G
A1UECgwGSm95ZW50MRAwDgYDVQQLDAdOb2RlLmpzMQwwCgYDVQQDDANjYTExIDAe
BgkqhkiG9w0BCQEWEXJ5QHRpbnljbG91ZHMub3JnMCAXDTIyMDkwMzIxNDAzN1oY
DzIyOTYwNjE3MjE0MDM3WjB9MQswCQYDVQQGEwJVUzELMAkGA1UECAwCQ0ExCzAJ
BgNVBAcMAlNGMQ8wDQYDVQQKDAZKb3llbnQxEDAOBgNVBAsMB05vZGUuanMxDzAN
BgNVBAMMBmFnZW50MTEgMB4GCSqGSIb3DQEJARYRcnlAdGlueWNsb3Vkcy5vcmcw
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDUVjIK+yDTgnCT3CxChO0E
37q9VuHdrlKeKLeQzUJW2yczSfNzX/0zfHpjY+zKWie39z3HCJqWxtiG2wxiOI8c
3WqWOvzVmdWADlh6EfkIlg+E7VC6JaKDA+zabmhPvnuu3JzogBMnsWl68lCXzuPx
deQAmEwNtqjrh74DtM+Ud0ulb//Ixjxo1q3rYKu+aaexSramuee6qJta2rjrB4l8
B/bU+j1mDf9XQQfSjo9jRnp4hiTFdBl2k+lZzqE2L/rhu6EMjA2IhAq/7xA2MbLo
9cObVUin6lfoo5+JKRgT9Fp2xEgDOit+2EA/S6oUfPNeLSVUqmXOSWlXlwlb9Nxr
AgMBAAGjYTBfMF0GCCsGAQUFBwEBBFEwTzAjBggrBgEFBQcwAYYXaHR0cDovL29j
c3Aubm9kZWpzLm9yZy8wKAYIKwYBBQUHMAKGHGh0dHA6Ly9jYS5ub2RlanMub3Jn
L2NhLmNlcnQwDQYJKoZIhvcNAQELBQADggEBAMM0mBBjLMt9pYXePtUeNO0VTw9y
FWCM8nAcAO2kRNwkJwcsispNpkcsHZ5o8Xf5mpCotdvziEWG1hyxwU6nAWyNOLcN
G0a0KUfbMO3B6ZYe1GwPDjXaQnv75SkAdxgX5zOzca3xnhITcjUUGjQ0fbDfwFV5
ix8mnzvfXjDONdEznVa7PFcN6QliFUMwR/h8pCRHtE5+a10OSPeJSrGG+FtrGnRW
G1IJUv6oiGF/MvWCr84REVgc1j78xomGANJIu2hN7bnD1nEMON6em8IfnDOUtynV
9wfWTqiQYD5Zifj6WcGa0aAHMuetyFG4lIfMAHmd3gaKpks7j9l26LwRPvI=
-----END CERTIFICATE-----
`;
    const transportKeys = [
      "HTTP_PROXY",
      "HTTPS_PROXY",
      "ALL_PROXY",
      "NO_PROXY",
      "http_proxy",
      "https_proxy",
      "all_proxy",
      "no_proxy",
      "NODE_USE_ENV_PROXY",
      "NODE_EXTRA_CA_CERTS",
      "SSL_CERT_FILE",
    ];

    function clearTransport() {
      for (const key of transportKeys) vi.stubEnv(key, undefined);
    }

    function publicCaFixture() {
      const directory = mkdtempSync(
        path.join(process.cwd(), ".shadcn-public-ca-test-"),
      );
      temporaryDirectories.push(directory);
      const certificate = path.join(directory, "public-test-ca.pem");
      writeFileSync(certificate, publicTestCertificate);
      return { directory, certificate };
    }

    function observeEnvironment(keys: string[]) {
      return createCliRunner({
        cwd: process.cwd(),
        command: process.execPath,
        prefix: [
          "-e",
          `console.log(JSON.stringify(Object.fromEntries(${JSON.stringify(keys)}.map(key => [key, key === 'HTTP_PROXY' || key === 'HTTPS_PROXY' ? (process.env[key.toLowerCase()] ?? process.env[key]) === ${JSON.stringify(proxy)} : process.env[key] !== undefined]))))`,
        ],
      });
    }

    it("passes approved proxy routing without inheriting provider secrets or TLS overrides", async () => {
      clearTransport();
      vi.stubEnv("HTTP_PROXY", proxy);
      vi.stubEnv("HTTPS_PROXY", proxy);
      const excluded = [
        "SHADCN_TEST_PROVIDER_SECRET",
        "GITHUB_TOKEN",
        "GH_TOKEN",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "STRIPE_SECRET_KEY",
        "SHADCNUKIT_API_KEY",
        "PROXY_AUTHORIZATION",
        "ALL_PROXY",
        "all_proxy",
        "NODE_OPTIONS",
        "NODE_TLS_REJECT_UNAUTHORIZED",
      ];
      for (const key of excluded)
        vi.stubEnv(key, "opaque-test-only-excluded-value");
      vi.stubEnv("NODE_TLS_REJECT_UNAUTHORIZED", "0");
      const runCli = observeEnvironment([
        "HTTP_PROXY",
        "HTTPS_PROXY",
        ...excluded,
      ]);
      expect(JSON.parse(await runCli([]))).toEqual({
        HTTP_PROXY: true,
        HTTPS_PROXY: true,
        ...Object.fromEntries(excluded.map((key) => [key, false])),
      });
    });

    it("uses lowercase HTTP(S) proxy precedence consistently", async () => {
      clearTransport();
      vi.stubEnv("HTTP_PROXY", "http://upper-proxy.invalid:3128");
      vi.stubEnv("HTTPS_PROXY", "http://upper-proxy.invalid:3128");
      vi.stubEnv("http_proxy", proxy);
      vi.stubEnv("https_proxy", proxy);
      const runCli = observeEnvironment(["HTTP_PROXY", "HTTPS_PROXY"]);
      expect(JSON.parse(await runCli([]))).toEqual({
        HTTP_PROXY: true,
        HTTPS_PROXY: true,
      });
    });

    it("preserves direct concurrent CLI behavior when no proxy is configured", async () => {
      clearTransport();
      const runCli = createCliRunner({
        cwd: process.cwd(),
        command: process.execPath,
        prefix: [
          "-e",
          `console.log(JSON.stringify({args:process.argv.slice(1),transport:${JSON.stringify(transportKeys)}.filter(key=>process.env[key]!==undefined)}))`,
        ],
      });
      const outputs = await Promise.all([
        runCli(["--", "--version"]),
        runCli(["--", "info", "--json"]),
      ]);
      expect(outputs.map((output) => JSON.parse(output))).toEqual([
        { args: ["--version"], transport: [] },
        { args: ["info", "--json"], transport: [] },
      ]);
    });

    it.each(
      [
        "http://opaque-test-user:opaque-test-password@proxy.invalid:3128",
        "http://opaque-test-user@proxy.invalid:3128",
        "http://opaque%2Dtest%2Duser:opaque%2Dtest%2Dpassword@proxy.invalid:3128",
        "socks5://proxy.invalid:1080",
        "file:///opaque-test-proxy",
        "not-a-proxy-url",
        "http://proxy.invalid:3128/?token=opaque-test-token",
        "http://proxy.invalid:3128/#opaque-test-fragment",
        "http://proxy.invalid:3128/unapproved-path",
      ].flatMap((value, index) =>
        ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"].map(
          (key) => ({ key, value, caseNumber: index + 1 }),
        ),
      ),
    )(
      "rejects unsafe $key transport case $caseNumber without disclosing values",
      async ({ key, value }) => {
        clearTransport();
        vi.stubEnv(key, value);
        const directory = mkdtempSync(
          path.join(process.cwd(), ".shadcn-transport-test-"),
        );
        temporaryDirectories.push(directory);
        const marker = path.join(directory, "child-started");
        const attempt = () =>
          createCliRunner({
            cwd: directory,
            command: process.execPath,
            prefix: [
              "-e",
              `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'started')`,
            ],
          })([]);
        const error = await Promise.resolve()
          .then(attempt)
          .then(
            () => undefined,
            (failure: unknown) => failure,
          );
        expect(error).toBeInstanceOf(Error);
        const message = String(error);
        expect(message).toMatch(/proxy|transport/i);
        expect(message).not.toContain(value);
        expect(message).not.toMatch(/opaque-test-(?:user|password|token)/);
        expect(existsSync(marker)).toBe(false);
      },
    );

    it("does not report transport or provider values when a child fails", async () => {
      clearTransport();
      vi.stubEnv("HTTP_PROXY", proxy);
      vi.stubEnv("HTTPS_PROXY", proxy);
      vi.stubEnv("GH_TOKEN", "opaque-test-provider-token");
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
      const runCli = createCliRunner({
        cwd: process.cwd(),
        command: process.execPath,
        prefix: [
          "-e",
          `console.error(${JSON.stringify(proxy)}); console.log('opaque-test-provider-token'); process.exit(17)`,
        ],
      });
      await expect(runCli([])).rejects.toThrow(
        "shadcn CLI coverage failed (exit 17)",
      );
      expect([log.mock.calls, warn.mock.calls, errorLog.mock.calls]).toEqual([
        [],
        [],
        [],
      ]);
    });

    it("forwards only a bounded public X509 CA path for configured proxy transport", async () => {
      clearTransport();
      const input = publicCaFixture();
      const certificateBytes = ` \n${publicTestCertificate}\t\n`;
      writeFileSync(input.certificate, certificateBytes);
      vi.stubEnv("HTTPS_PROXY", proxy);
      vi.stubEnv("NODE_EXTRA_CA_CERTS", input.certificate);
      const excluded = [
        "SSL_CERT_FILE",
        "NODE_OPTIONS",
        "NODE_TLS_REJECT_UNAUTHORIZED",
        "GH_TOKEN",
        "SUPABASE_SERVICE_ROLE_KEY",
      ];
      for (const key of excluded)
        vi.stubEnv(key, "opaque-test-only-excluded-value");
      vi.stubEnv("SSL_CERT_FILE", input.certificate);
      vi.stubEnv("NODE_TLS_REJECT_UNAUTHORIZED", "0");
      const runCli = createCliRunner({
        cwd: input.directory,
        command: process.execPath,
        prefix: [
          "-e",
          `console.log(JSON.stringify({publicCaMatches:process.env.NODE_EXTRA_CA_CERTS===${JSON.stringify(input.certificate)},excluded:${JSON.stringify(excluded)}.filter(key=>process.env[key]!==undefined)}))`,
        ],
      });
      expect(JSON.parse(await runCli([]))).toEqual({
        publicCaMatches: true,
        excluded: [],
      });
      expect(readFileSync(input.certificate, "utf8")).toBe(certificateBytes);
    });

    it("starts the child with approved proxy routing when optional CA is an empty setting", async () => {
      clearTransport();
      vi.stubEnv("HTTPS_PROXY", proxy);
      vi.stubEnv("NODE_EXTRA_CA_CERTS", "");
      const runCli = observeEnvironment(["HTTPS_PROXY", "NODE_EXTRA_CA_CERTS"]);
      expect(JSON.parse(await runCli([]))).toEqual({
        HTTPS_PROXY: true,
        NODE_EXTRA_CA_CERTS: false,
      });
    });

    it.each(["valid", "absent file"])(
      "ignores optional CA configuration without a proxy: %s",
      async (kind) => {
        clearTransport();
        const input = publicCaFixture();
        vi.stubEnv(
          "NODE_EXTRA_CA_CERTS",
          kind === "valid"
            ? input.certificate
            : path.join(input.directory, "absent.pem"),
        );
        vi.stubEnv("SSL_CERT_FILE", input.certificate);
        expect(
          JSON.parse(
            await observeEnvironment(["NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE"])(
              [],
            ),
          ),
        ).toEqual({
          NODE_EXTRA_CA_CERTS: false,
          SSL_CERT_FILE: false,
        });
      },
    );

    it("passes the validated public CA file when caller and child working directories differ", async () => {
      clearTransport();
      const input = publicCaFixture();
      const childDirectory = path.join(input.directory, "child");
      mkdirSync(childDirectory);
      vi.stubEnv("HTTPS_PROXY", proxy);
      vi.stubEnv(
        "NODE_EXTRA_CA_CERTS",
        path.relative(process.cwd(), input.certificate),
      );
      const runCli = createCliRunner({
        cwd: childDirectory,
        command: process.execPath,
        prefix: [
          "-e",
          `const configured=process.env.NODE_EXTRA_CA_CERTS; const sameCertificate=Boolean(configured)&&require('node:path').resolve(configured)===${JSON.stringify(input.certificate)}; console.log(JSON.stringify({sameCertificate,sameBytes:sameCertificate&&require('node:fs').readFileSync(configured,'utf8')===${JSON.stringify(publicTestCertificate)}}))`,
        ],
      });
      expect(JSON.parse(await runCli([]))).toEqual({
        sameCertificate: true,
        sameBytes: true,
      });
      expect(readFileSync(input.certificate, "utf8")).toBe(
        publicTestCertificate,
      );
    });

    // AL1955-public-ca-acceptance-v1 clarification: every supplied certificate
    // must have CA authority, without adding expiry or key-usage requirements.
    it.each(["leaf only", "mixed CA/leaf"])(
      "rejects a public %s bundle before child startup without disclosing material",
      async (kind) => {
        clearTransport();
        expect(new X509Certificate(publicTestCertificate).ca).toBe(true);
        expect(new X509Certificate(publicLeafCertificate).ca).toBe(false);
        const input = publicCaFixture();
        writeFileSync(
          input.certificate,
          kind === "leaf only"
            ? publicLeafCertificate
            : publicTestCertificate + publicLeafCertificate,
        );
        vi.stubEnv("HTTPS_PROXY", proxy);
        vi.stubEnv("NODE_EXTRA_CA_CERTS", input.certificate);
        const marker = path.join(input.directory, "child-started");
        const failure = await Promise.resolve()
          .then(() =>
            createCliRunner({
              cwd: input.directory,
              command: process.execPath,
              prefix: [
                "-e",
                `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'started')`,
              ],
            })([]),
          )
          .then(
            () => undefined,
            (error: unknown) => error,
          );
        expect(failure).toBeInstanceOf(Error);
        const message = String(failure);
        expect(message).toBe("Error: Invalid public CA certificate transport");
        expect(message).not.toContain(input.certificate);
        expect(message).not.toContain(proxy);
        expect(message).not.toContain(publicLeafCertificate);
        expect(existsSync(marker)).toBe(false);
      },
    );

    it("rejects unsafe CA files before child startup with one constant diagnostic", async () => {
      const failures: string[] = [];
      for (const defect of [
        "absent",
        "directory",
        "empty",
        "private key",
        "invalid X509",
        "mixed material",
        "unsupported PEM",
        "oversize",
      ]) {
        clearTransport();
        const input = publicCaFixture();
        const privateMaterial =
          "-----BEGIN PRIVATE KEY-----\nopaque-test-only-material\n-----END PRIVATE KEY-----\n";
        if (defect === "absent") rmSync(input.certificate);
        else if (defect === "directory") {
          rmSync(input.certificate);
          mkdirSync(input.certificate);
        } else if (defect === "empty") writeFileSync(input.certificate, "");
        else if (defect === "private key")
          writeFileSync(input.certificate, privateMaterial);
        else if (defect === "invalid X509")
          writeFileSync(
            input.certificate,
            "-----BEGIN CERTIFICATE-----\nZm9v\n-----END CERTIFICATE-----\n",
          );
        else if (defect === "mixed material")
          writeFileSync(
            input.certificate,
            publicTestCertificate + privateMaterial,
          );
        else if (defect === "unsupported PEM")
          writeFileSync(
            input.certificate,
            "-----BEGIN PUBLIC KEY-----\nopaque-test-only-material\n-----END PUBLIC KEY-----\n",
          );
        else
          writeFileSync(
            input.certificate,
            publicTestCertificate + " ".repeat(1024 * 1024),
          );
        vi.stubEnv("HTTPS_PROXY", proxy);
        vi.stubEnv("NODE_EXTRA_CA_CERTS", input.certificate);
        const marker = path.join(input.directory, "child-started");
        const failure = await Promise.resolve()
          .then(() =>
            createCliRunner({
              cwd: input.directory,
              command: process.execPath,
              prefix: [
                "-e",
                `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'started')`,
              ],
            })([]),
          )
          .then(
            () => undefined,
            (error: unknown) => error,
          );
        expect(failure).toBeInstanceOf(Error);
        const message = String(failure);
        expect(message).toMatch(/certificate|public.?CA|trust/i);
        expect(message).not.toContain(input.certificate);
        expect(message).not.toContain(proxy);
        expect(message).not.toContain("opaque-test-only-material");
        expect(message).not.toContain("BEGIN");
        expect(existsSync(marker)).toBe(false);
        failures.push(message);
      }
      expect(new Set(failures).size).toBe(1);
    });

    const itNonRootPosix =
      process.platform !== "win32" && process.getuid?.() !== 0 ? it : it.skip;
    // Root can read chmod(000) files. A non-root offline run supplies this
    // required readability evidence; a skip cannot establish acceptance.
    itNonRootPosix(
      "rejects an unreadable public CA before starting a child",
      async () => {
        clearTransport();
        const input = publicCaFixture();
        vi.stubEnv("HTTPS_PROXY", proxy);
        vi.stubEnv("NODE_EXTRA_CA_CERTS", input.certificate);
        chmodSync(input.certificate, 0o000);
        const marker = path.join(input.directory, "child-started");
        try {
          const failure = await Promise.resolve()
            .then(() =>
              createCliRunner({
                cwd: input.directory,
                command: process.execPath,
                prefix: [
                  "-e",
                  `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'started')`,
                ],
              })([]),
            )
            .then(
              () => undefined,
              (error: unknown) => error,
            );
          expect(failure).toBeInstanceOf(Error);
          const message = String(failure);
          expect(message).toMatch(/certificate|public.?CA|trust/i);
          expect(message).not.toContain(input.certificate);
          expect(message).not.toContain(proxy);
          expect(existsSync(marker)).toBe(false);
        } finally {
          chmodSync(input.certificate, 0o600);
        }
      },
    );
  });
});

function splitFixture() {
  const input = fixture();
  const write = (file: string, content: string) => {
    const target = path.join(input.root, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  const hash = (file: string) =>
    sourceHash(readFileSync(path.join(input.root, file), "utf8"));
  const sourceMappings = structuredClone(SHADCN_SOURCE_MAPPINGS);
  const exports: Record<string, string> = {};
  for (const mapping of sourceMappings) {
    rmSync(path.join(input.root, "packages/ui", mapping.registryPath), {
      force: true,
    });
    write(
      `packages/ui/${mapping.entrypoint}`,
      `export { Split } from "./${mapping.name}-component";\n`,
    );
    write(
      `packages/ui/${mapping.implementation}`,
      "export const Split = 'Core';\n",
    );
    write(`packages/ui/${mapping.support}`, "export const style = 'Core';\n");
    exports[`./components/shadcn/${mapping.name}`] = `./${mapping.entrypoint}`;
  }
  write("packages/ui/package.json", JSON.stringify({ exports }));
  const names = [
    ...new Set([
      ...input.baseline.components.map((x) => x.name),
      ...sourceMappings.map((x) => x.name),
    ]),
  ].sort();
  const review = {
    reason: input.baseline.files[0].reason,
    proofs: input.baseline.files[0].proofs,
  };
  const previews = Object.fromEntries(
    names.map((name) => [
      name,
      preview(
        name,
        name === "dialog"
          ? ["components/shadcn/button.tsx", "components/shadcn/dialog.tsx"]
          : undefined,
      ),
    ]),
  );
  const files = names.map((name) => {
    const registryPath = `components/shadcn/${name}.tsx`;
    const mapping = sourceMappings.find((x) => x.name === name);
    const localPath = mapping?.implementation ?? registryPath;
    return {
      path: registryPath,
      localPath,
      diffComponent: name,
      owners: name === "button" ? ["button", "dialog"] : [name],
      localSha256: hash(`packages/ui/${localPath}`),
      diffSha256: parseFileDiff(diff(name), name, registryPath, input.root),
      ...review,
    };
  });
  const baseline = {
    ...input.baseline,
    schemaVersion: 3,
    sourceMappings,
    components: names.map((name) =>
      parseDryRun(previews[name], name, input.root),
    ),
    files,
    localOnly: [
      "components/shadcn/toolbar.tsx",
      ...sourceMappings.flatMap((x) => [x.entrypoint, x.support]),
    ]
      .sort()
      .map((file) => ({
        path: file,
        localSha256: hash(`packages/ui/${file}`),
        ...review,
      })),
    protectedSources: [
      ...SHADCN_REQUIRED_SUPPORTING_SOURCES,
      ...SHADCN_MAPPED_SUPPORTING_SOURCES,
    ]
      .sort()
      .map((file) => ({ path: file, localSha256: hash(file), ...review })),
  };
  const runCli = vi.fn(async (args: string[]) => {
    if (args[0] === "--version") return SHADCN_CLI_VERSION;
    if (args[0] === "info")
      return JSON.stringify({
        config: { base: "base", style: "base-maia" },
        components: names,
      });
    if (args[2] === "--dry-run") return previews[args[1]];
    if (args[2] === "--diff") return diff(args[1], args[3]);
    throw new Error("Unexpected CLI mutation");
  });
  return { ...input, baseline, runCli, sourceMappings };
}

function sourceViewNames() {
  return readdirSync(tmpdir())
    .filter((name) => name.startsWith("core-shadcn-source-"))
    .sort();
}

describe("split TypeScript public component review", () => {
  it("reviews the complete canonical inventory and all facade/variant modules", async () => {
    const input = splitFixture();
    await expect(runUpstreamReview(input)).resolves.toEqual({
      components: 8,
      files: 8,
      localAdapters: 15,
      toolkitDirectories: 1,
    });
  });
  it.each(["entrypoint", "implementation", "support"] as const)(
    "rejects a missing mapped %s",
    async (kind) => {
      const input = splitFixture();
      rmSync(
        path.join(input.root, "packages/ui", input.sourceMappings[0][kind]),
      );
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /Missing split component source/,
      );
    },
  );
  it.each(["entrypoint", "implementation", "support"] as const)(
    "rejects independently changed %s bytes",
    async (kind) => {
      const input = splitFixture();
      writeFileSync(
        path.join(input.root, "packages/ui", input.sourceMappings[0][kind]),
        "unreviewed source\n",
      );
      await expect(runUpstreamReview(input)).rejects.toThrow(/changed/);
    },
  );
  it.each(["missing", "duplicate", "unknown", "redirected"])(
    "rejects %s mapping coverage",
    async (kind) => {
      const input = splitFixture();
      if (kind === "missing") input.baseline.sourceMappings.pop();
      if (kind === "duplicate")
        input.baseline.sourceMappings[0] = input.baseline.sourceMappings[1];
      if (kind === "unknown") input.baseline.sourceMappings[0].name = "unknown";
      if (kind === "redirected")
        input.baseline.sourceMappings[0].implementation = "../other.tsx";
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /mapping coverage/,
      );
    },
  );
  it("rejects package export redirection", async () => {
    const input = splitFixture();
    const manifest = path.join(input.root, "packages/ui/package.json");
    const value = JSON.parse(readFileSync(manifest, "utf8"));
    value.exports["./components/shadcn/button"] =
      "./components/shadcn/button-component.tsx";
    writeFileSync(manifest, JSON.stringify(value));
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Public component export button/,
    );
  });
  it("rejects a competing canonical .tsx beside the public .ts entrypoint", async () => {
    const input = splitFixture();
    writeFileSync(
      path.join(
        input.root,
        "packages/ui",
        input.sourceMappings[0].registryPath,
      ),
      "ambiguous\n",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Ambiguous canonical/,
    );
  });
  it.each(["ts", "tsx"])(
    "rejects an unreviewed extra direct .%s source",
    async (ext) => {
      const input = splitFixture();
      writeFileSync(
        path.join(input.root, `packages/ui/components/shadcn/extra.${ext}`),
        "extra\n",
      );
      await expect(runUpstreamReview(input)).rejects.toThrow(
        /Local adapter coverage/,
      );
    },
  );
  it("rejects omitting a mapped component from canonical inventory", async () => {
    const input = splitFixture();
    input.baseline.components = input.baseline.components.filter(
      (x) => x.name !== "button",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Mapped component omitted: button/,
    );
  });
  it("keeps projected canonical bytes exact and leaves source/index untouched", () => {
    const input = splitFixture();
    mkdirSync(path.join(input.root, ".git"));
    writeFileSync(path.join(input.root, ".git/index"), "owned index\n");
    const before = input.sourceMappings.map((m) =>
      readFileSync(
        path.join(input.root, "packages/ui", m.implementation),
        "utf8",
      ),
    );
    const view = createUpstreamSourceView(
      input.root,
      validateSourceMappings(input.root, input.baseline),
    );
    try {
      for (const [i, m] of input.sourceMappings.entries())
        expect(readFileSync(path.join(view.cwd, m.registryPath), "utf8")).toBe(
          before[i],
        );
      expect(existsSync(path.join(view.root, ".git"))).toBe(false);
      expect(readFileSync(path.join(input.root, ".git/index"), "utf8")).toBe(
        "owned index\n",
      );
      for (const [i, m] of input.sourceMappings.entries()) {
        expect(
          readFileSync(
            path.join(input.root, "packages/ui", m.implementation),
            "utf8",
          ),
        ).toBe(before[i]);
        expect(
          existsSync(path.join(input.root, "packages/ui", m.registryPath)),
        ).toBe(false);
      }
    } finally {
      view.dispose();
    }
    expect(existsSync(view.root)).toBe(false);
  });
  it("cleans a failed source view only after both in-flight preview reads finish", async () => {
    const input = splitFixture(),
      original = input.runCli.getMockImplementation()!,
      before = sourceViewNames();
    let active = 0;
    input.runCli.mockImplementation(async (args) => {
      if (args[2] !== "--dry-run") return original(args);
      active++;
      await new Promise((resolve) =>
        setTimeout(resolve, args[1] === "badge" ? 2 : 8),
      );
      active--;
      if (args[1] === "badge") throw new Error("preview failed");
      return original(args);
    });
    await expect(runUpstreamReview(input)).rejects.toThrow(/preview failed/);
    expect(active).toBe(0);
    expect(sourceViewNames()).toEqual(before);
  });
  it("does not permit legacy baselines to redirect source hashes", async () => {
    const input = fixture();
    Reflect.set(
      input.baseline.files[0],
      "localPath",
      "components/shadcn/toolbar.tsx",
    );
    await expect(runUpstreamReview(input)).rejects.toThrow(
      /Legacy baseline cannot redirect/,
    );
  });
});

it.skipIf(process.platform === "win32")(
  "waits for delayed CLI process close before source-view cleanup",
  async () => {
    const input = splitFixture(),
      view = createUpstreamSourceView(input.root, input.sourceMappings);
    const marker = path.join(input.root, "exited.json"),
      script = path.join(input.root, "delayed-cli.cjs");
    const canonical = path.join(view.cwd, input.sourceMappings[0].registryPath);
    writeFileSync(
      script,
      `const fs=require('node:fs');process.on('SIGTERM',()=>setTimeout(()=>{fs.writeFileSync(process.argv[3],JSON.stringify({readable:fs.existsSync(process.argv[2])}));process.exit(0)},50));setInterval(()=>{},1000);`,
    );
    const run = createCliRunner({
      cwd: view.cwd,
      root: input.root,
      prefix: [script, canonical, marker],
      timeoutMs: 1000,
    });
    try {
      await expect(run([])).rejects.toThrow("shadcn CLI coverage timed out");
    } finally {
      view.dispose();
    }
    expect(JSON.parse(readFileSync(marker, "utf8"))).toEqual({
      readable: true,
    });
    expect(existsSync(view.root)).toBe(false);
  },
);

it("rejects downgrading a split source tree to a reduced legacy registry inventory", async () => {
  const input = splitFixture();
  const baseline = { ...input.baseline, schemaVersion: 2 };
  Reflect.deleteProperty(baseline, "sourceMappings");
  for (const file of baseline.files) Reflect.deleteProperty(file, "localPath");
  baseline.components = baseline.components.filter(
    (x) => !SHADCN_SOURCE_MAPPINGS.some((m) => m.name === x.name),
  );
  await expect(runUpstreamReview({ ...input, baseline })).rejects.toThrow(
    /Legacy baseline cannot omit split component upstream coverage/,
  );
});
