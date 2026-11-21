import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  SHADCN_CLI_VERSION,
  SHADCN_REVIEW_BASELINE,
  SHADCN_SOURCE_MAPPINGS,
} from "../../../scripts/verify/shadcn-diff.mjs";

export const proof = "docs/contract.md";
export const adapter = "components/shadcn/toolbar.tsx";
export const support = "packages/ui/lib/base-ui.ts";
export const registry = "components/shadcn/button.tsx";
export const implementation =
  "packages/ui/components/shadcn/button-component.tsx";
const oldHash = "a".repeat(64);

export function refreshFixture(root: string) {
  function write(file: string, source: string) {
    const target = path.join(root, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
  const config = { style: "base-maia" };
  const review = {
    reason: `Keep reviewed behavior (${oldHash}).`,
    proofs: [proof],
  };
  const names = [
    ...SHADCN_SOURCE_MAPPINGS.map(({ name }) => name),
    "dialog",
  ].sort();
  const components = names.map((name) => ({
    name,
    previewSha256: oldHash,
    files: (name === "dialog"
      ? [registry, "components/shadcn/dialog.tsx"]
      : [`components/shadcn/${name}.tsx`]
    ).map((file) => ({ path: file, status: "overwrite" })),
  }));
  const baseline = {
    schemaVersion: 3,
    cliVersion: SHADCN_CLI_VERSION,
    config,
    components,
    sourceMappings: SHADCN_SOURCE_MAPPINGS,
    files: names.map((name) => ({
      path: `components/shadcn/${name}.tsx`,
      localPath:
        SHADCN_SOURCE_MAPPINGS.find((entry) => entry.name === name)
          ?.implementation ?? `components/shadcn/${name}.tsx`,
      diffComponent: name,
      owners: name === "button" ? ["button", "dialog"] : [name],
      localSha256: oldHash,
      diffSha256: oldHash,
      ...review,
    })),
    localOnly: [{ path: adapter, localSha256: oldHash, ...review }],
    protectedSources: [{ path: support, localSha256: oldHash, ...review }],
    proofSources: [proof, support].map((file) => ({
      path: file,
      sha256: oldHash,
    })),
  };
  function serialize() {
    return (
      JSON.stringify(baseline, null, 2)
        .replace(
          '[\n        "button",\n        "dialog"\n      ]',
          '["button", "dialog"]',
        )
        .replaceAll("\n", "\r\n") + "\r\n"
    );
  }
  const read = () =>
    readFileSync(path.join(root, SHADCN_REVIEW_BASELINE), "utf8");
  const reset = () => write(SHADCN_REVIEW_BASELINE, serialize());
  reset();
  for (const file of [
    proof,
    support,
    `packages/ui/${adapter}`,
    ...baseline.files.map((entry) => `packages/ui/${entry.localPath}`),
  ])
    write(file, `${file}\r\n`);
  for (const mapping of SHADCN_SOURCE_MAPPINGS) {
    write(`packages/ui/${mapping.entrypoint}`, "facade");
    write(`packages/ui/${mapping.support}`, "variants");
  }
  write(
    "packages/ui/package.json",
    JSON.stringify({
      exports: Object.fromEntries(
        SHADCN_SOURCE_MAPPINGS.map((entry) => [
          `./components/shadcn/${entry.name}`,
          `./${entry.entrypoint}`,
        ]),
      ),
    }),
  );
  write("packages/ui/components.json", JSON.stringify(config));
  write(
    "package.json",
    JSON.stringify({ devDependencies: { shadcn: SHADCN_CLI_VERSION } }),
  );
  const cli = "node_modules/shadcn/";
  write(
    `${cli}package.json`,
    JSON.stringify({
      name: "shadcn",
      version: SHADCN_CLI_VERSION,
      bin: "index.cjs",
    }),
  );
  write(
    `${cli}index.cjs`,
    `const fs = require('node:fs');
const request = process.argv.slice(2).join(' ');
fs.appendFileSync(__dirname + '/calls', request + '\\n');
const output = JSON.parse(fs.readFileSync(__dirname + '/responses.json'))[request];
if (output === undefined || fs.readFileSync('${registry}', 'utf8') !== ${JSON.stringify(implementation + "\r\n")}) process.exit(1);
console.log(output);`,
  );
  const responses: Record<string, string> = {
    "--version": SHADCN_CLI_VERSION,
    "info --json": JSON.stringify({
      config: { base: "base", ...config },
      components: names,
    }),
  };
  for (const { name, files } of components) {
    const start = `┌ shadcn add ${name} (dry run)`;
    const end = "└ Run without --dry-run to apply.";
    responses[`add ${name} --dry-run`] = [
      start,
      `├ Files (${files.length})`,
      ...files.map((file) => `│ ~ ${file.path}  overwrite`),
      end,
    ].join("\n");
    const file = `components/shadcn/${name}.tsx`;
    responses[`add ${name} --diff ${file}`] = [
      start,
      `├ ${file} (overwrite)`,
      "│ │ @@ -1 +1 @@",
      "│ │ -local",
      "│ │ +upstream",
      "│ └",
      end,
    ].join("\n");
  }
  const setResponses = () =>
    write(`${cli}responses.json`, JSON.stringify(responses));
  setResponses();
  const script = "scripts/verify/shadcn-diff.mjs";
  mkdirSync(path.join(root, path.dirname(script)), { recursive: true });
  copyFileSync(script, path.join(root, script));
  const temp = path.join(root, "temp");
  mkdirSync(temp);
  const run = (args: string[], env: NodeJS.ProcessEnv = {}) => {
    const result = spawnSync(process.execPath, [script, ...args], {
      cwd: root,
      shell: false,
      encoding: "utf8",
      timeout: 15_000,
      env: {
        PATH: process.env.PATH,
        SystemRoot: process.env.SystemRoot,
        TEMP: temp,
        TMP: temp,
        TMPDIR: temp,
        ...env,
      },
    });
    if (result.error) throw result.error;
    return result;
  };
  return {
    baseline,
    read,
    reset,
    serialize,
    run,
    responses,
    setResponses,
    calls: path.join(root, cli, "calls"),
  };
}
