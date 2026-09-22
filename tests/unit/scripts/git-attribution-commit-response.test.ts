import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { objectFixture } from "./git-attribution-object-fixture";

const roots: string[] = [];
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);

function fixture(mode: string) {
  const f = objectFixture();
  roots.push(f.root);
  const sha = f.commit("ordinary commit with a large provider diff", [f.base]);
  const bin = path.join(f.root, "bin");
  mkdirSync(bin);
  const script = path.join(bin, "fake-gh.cjs");
  writeFileSync(
    script,
    `const fs = require("node:fs");
const data = JSON.parse(fs.readFileSync(process.env.ATTRIBUTION_RESPONSE_FIXTURE, "utf8"));
const args = process.argv.slice(2);
if (!args.includes("--hostname") || !args.includes("github.com")) process.exit(3);
if (args.includes("graphql")) {
  process.stdout.write(JSON.stringify({data:{repository:{object:{oid:data.sha,signature:data.signature}}}}));
} else if (args.includes("repos/Asymmetric-al/core/commits/" + data.sha)) {
  const projection = "{sha, commit: (.commit | {author, committer}), author: (.author | {id, login}), committer: (.committer | {id, login}), parents}";
  const p = data.payload;
  const projected = args[args.indexOf("--jq") + 1] === projection;
  // Model gh's output boundary: the real child writes the full provider shape
  // unless the caller asks gh to project it before Node buffers stdout.
  const pick = (value, keys) => value == null ? null : Object.fromEntries(keys.map(key => [key, value[key] ?? null]));
  process.stdout.write(JSON.stringify(projected ? {
    sha: p.sha, commit: pick(p.commit, ["author", "committer"]),
    author: pick(p.author, ["id", "login"]), committer: pick(p.committer, ["id", "login"]), parents: p.parents ?? null,
  } : p));
} else process.exit(2);
`,
  );
  if (process.platform === "win32") {
    writeFileSync(
      path.join(bin, "gh.cmd"),
      `@"${process.execPath}" "%~dp0fake-gh.cjs" %*\r\n`,
    );
  } else {
    const launcher = path.join(bin, "gh");
    writeFileSync(
      launcher,
      `#!${process.execPath}\nimport(${JSON.stringify(script)});\n`,
    );
    chmodSync(launcher, 0o755);
  }
  const identity = {
    name: "Conrad O",
    email: "79217644+cobmojo@users.noreply.github.com",
  };
  const payload = {
    sha,
    commit: { author: identity, committer: identity },
    author: { login: "cobmojo", id: 79217644 },
    committer: { login: "cobmojo", id: 79217644 },
    parents: [{ sha: f.base }],
    // Actual Core REST responses exceed 1 MiB even before file pagination.
    files: Array.from({ length: 40 }, (_, i) => ({
      filename: `docs/fixture-${i}.md`,
      patch: "+" + "documentation line\n".repeat(1800),
    })),
  };
  expect(Buffer.byteLength(JSON.stringify(payload))).toBeGreaterThan(
    1024 * 1024,
  );
  if (mode === "missing parents") Reflect.deleteProperty(payload, "parents");
  if (mode === "missing Git author")
    Reflect.deleteProperty(payload.commit, "author");
  if (mode === "missing Git committer")
    Reflect.deleteProperty(payload.commit, "committer");
  if (mode === "missing author ID")
    Reflect.deleteProperty(payload.author, "id");
  if (mode === "wrong parent") payload.parents[0]!.sha = "invalid-parent";
  if (mode === "replayed commit") payload.sha = "f".repeat(40);
  const dataPath = path.join(f.root, "provider.json");
  writeFileSync(
    dataPath,
    JSON.stringify({
      sha,
      payload,
      signature:
        mode === "invalid signature"
          ? {
              email: identity.email,
              isValid: false,
              state: "INVALID",
              wasSignedByGitHub: false,
              signer: { login: "cobmojo", databaseId: 79217644 },
            }
          : null,
    }),
  );
  return spawnSync(
    process.execPath,
    [path.join(f.root, "tooling/scripts/verify/git-attribution.mjs"), "--ci"],
    {
      cwd: f.root,
      env: {
        ...f.env,
        PATH: `${bin}${path.delimiter}${f.env.PATH ?? ""}`,
        ATTRIBUTION_RESPONSE_FIXTURE: dataPath,
        ASYM_GITHUB_BASE_SHA: f.base,
        ASYM_GITHUB_EVENT_ACTOR_ID: "79217644",
        ASYM_GITHUB_EVENT_ACTOR_LOGIN: "cobmojo",
        ASYM_GITHUB_EVENT_NAME: "pull_request",
        ASYM_GITHUB_HEAD_REPOSITORY: "Asymmetric-al/core",
        ASYM_GITHUB_HEAD_SHA: sha,
        ASYM_GITHUB_REF_NAME: "fixture-response-size",
        ASYM_GITHUB_REF_TYPE: "branch",
        ASYM_GITHUB_REPOSITORY: "Asymmetric-al/core",
        ASYM_GITHUB_TRIGGERING_ACTOR_LOGIN: "cobmojo",
      },
      encoding: "utf8",
    },
  );
}

describe("GitHub commit metadata projection", () => {
  it("verifies a large commit through the production CLI without buffering its diff", () => {
    const result = fixture("complete");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Commits checked: 1");
  });

  it.each([
    ["missing parents", /metadata was incomplete/],
    ["missing Git author", /metadata was incomplete/],
    ["missing Git committer", /metadata was incomplete/],
    ["missing author ID", /immutable account id/],
    ["wrong parent", /full 40-character Git SHA/],
    ["replayed commit", /metadata was incomplete/],
    ["invalid signature", /signature is not valid/],
  ] as const)("still rejects %s after projection", (mode, expected) => {
    const result = fixture(mode);
    expect(result.status).toBe(1);
    expect(result.stderr).not.toContain("ENOBUFS");
    expect(result.stderr).toMatch(expected);
  });
});
