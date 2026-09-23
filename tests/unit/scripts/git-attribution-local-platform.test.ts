import {
  chmodSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { objectFixture } from "./git-attribution-object-fixture";

const roots: string[] = [];
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
function fixture() {
  const f = objectFixture();
  roots.push(f.root);
  const sha = f.commit(
    "forged or provider-proven platform envelope",
    [f.base],
    { GIT_COMMITTER_NAME: "GitHub", GIT_COMMITTER_EMAIL: "noreply@github.com" },
  );
  f.git(["update-ref", "refs/remotes/origin/develop", sha]);
  const bin = path.join(f.root, "bin");
  mkdirSync(bin);
  const dataPath = path.join(f.root, "provider.json");
  const callsPath = path.join(f.root, "provider-calls.jsonl");
  const script = path.join(bin, "fake-gh.cjs");
  writeFileSync(
    script,
    `const fs = require("node:fs");
const data = JSON.parse(fs.readFileSync(process.env.ATTRIBUTION_PROVIDER_FIXTURE, "utf8"));
const args = process.argv.slice(2);
fs.appendFileSync(process.env.ATTRIBUTION_PROVIDER_CALLS, JSON.stringify(args) + "\\n");
if(data.unavailable) process.exit(1);
const branch = args.find(a => a.startsWith("repos/Asymmetric-al/core/branches/"));
if(branch) { const name = branch.split("/").at(-1); process.stdout.write(JSON.stringify({name, protected:data.protected, commit:{sha:data.tip}})); }
else if(args.includes("graphql")) process.stdout.write(JSON.stringify({data:{repository:{object:{oid:data.sha,signature:data.signature}}}}));
else if(args.some(a => a.startsWith("repos/Asymmetric-al/core/commits/"))) process.stdout.write(JSON.stringify(data.commit));
else process.exit(2);
`,
  );
  if (process.platform === "win32")
    writeFileSync(
      path.join(bin, "gh.cmd"),
      `@"${process.execPath}" "%~dp0fake-gh.cjs" %*\r\n`,
    );
  else {
    const launcher = path.join(bin, "gh");
    writeFileSync(
      launcher,
      `#!${process.execPath}\nimport(${JSON.stringify(script)});\n`,
    );
    chmodSync(launcher, 0o755);
  }
  const data = {
    sha,
    tip: sha,
    protected: true,
    unavailable: false,
    signature: {
      email: "noreply@github.com",
      isValid: true,
      state: "VALID",
      wasSignedByGitHub: true,
      signer: { login: "web-flow", databaseId: 19864447 },
    },
    commit: {
      sha,
      commit: {
        author: {
          name: "Conrad O",
          email: "79217644+cobmojo@users.noreply.github.com",
        },
        committer: { name: "GitHub", email: "noreply@github.com" },
      },
      author: { login: "cobmojo", id: 79217644 },
      committer: { login: "web-flow", id: 19864447 },
      parents: [{ sha: f.base }],
    },
  };
  const verify = (overrides: Record<string, unknown> = {}, head = sha) => {
    writeFileSync(dataPath, JSON.stringify({ ...data, ...overrides }));
    return f.verify(head, {
      PATH: `${bin}${path.delimiter}${f.env.PATH ?? ""}`,
      ATTRIBUTION_PROVIDER_FIXTURE: dataPath,
      ATTRIBUTION_PROVIDER_CALLS: callsPath,
    });
  };
  return {
    ...f,
    sha,
    data,
    verify,
    calls: () => readFileSync(callsPath, "utf8"),
  };
}

describe("local platform envelopes require authenticated canonical proof", () => {
  it("accepts authenticated proof without tracking refs and scopes every provider call to GitHub", () => {
    const f = fixture();
    f.git(["update-ref", "-d", "refs/remotes/origin/develop"]);
    const result = f.verify();
    expect(result.status, result.stderr).toBe(0);
    const calls: string[][] = f
      .calls()
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(calls).toHaveLength(3);
    expect(
      calls.every(
        (args) => args.includes("--hostname") && args.includes("github.com"),
      ),
    ).toBe(true);
  });
  it.each(["commit", "signature"])(
    "rejects replayed %s proof for another SHA",
    (proof) => {
      const f = fixture();
      const wrongSha = "f".repeat(40);
      const result = f.verify(
        proof === "commit"
          ? { commit: { ...f.data.commit, sha: wrongSha } }
          : { sha: wrongSha },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/metadata|signature/);
    },
  );

  it("rejects a forged envelope when only the mutable tracking ref contains it", () => {
    const f = fixture();
    const result = f.verify({ tip: f.base });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/platform.*(canonical|protected)/i);
  });
  it.each(["missing", "invalid", "wrong-signer", "not-github"])(
    "rejects %s signature proof even when protected reachability succeeds",
    (mode) => {
      const f = fixture();
      const signature =
        mode === "missing"
          ? null
          : {
              ...f.data.signature,
              ...(mode === "invalid"
                ? { isValid: false, state: "INVALID" }
                : mode === "wrong-signer"
                  ? { signer: { login: "cobmojo", databaseId: 79217644 } }
                  : { wasSignedByGitHub: false }),
            };
      const result = f.verify({ signature });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/signature/i);
    },
  );
  it.each(["author", "committer"])(
    "rejects a mismatched immutable %s account",
    (role) => {
      const f = fixture();
      const result = f.verify({
        commit: { ...f.data.commit, [role]: { ...f.data.commit[role], id: 7 } },
      });
      expect(result.status).toBe(1);
    },
  );
  it("accepts the authenticated protected object with valid platform account/signature proof", () => {
    const f = fixture();
    const result = f.verify();
    expect(result.status).toBe(0);
    expect(f.calls()).toContain("graphql");
    expect(f.calls()).toContain("--hostname");
    expect(f.calls()).toContain("github.com");
  });
  it.each([{ protected: false }, { unavailable: true }, { tip: "not-a-sha" }])(
    "fails closed on unavailable or invalid protected history: %j",
    (overrides) => {
      const f = fixture();
      expect(f.verify(overrides).status).toBe(1);
    },
  );
  it("does not accept a forged external committer through the same tracking-ref shortcut", () => {
    const f = fixture();
    const external = f.commit("novel external committer", [f.base], {
      GIT_COMMITTER_NAME: "External Contributor",
      GIT_COMMITTER_EMAIL: "external@example.invalid",
    });
    f.git(["update-ref", "refs/remotes/origin/develop", external]);
    const result = f.verify({ tip: f.base }, external);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("External Contributor");
  });
  it("still admits an ordinary external committer already proved in canonical protected history", () => {
    const f = fixture();
    const external = f.commit("inherited external committer", [f.base], {
      GIT_COMMITTER_NAME: "External Contributor",
      GIT_COMMITTER_EMAIL: "external@example.invalid",
    });
    const result = f.verify({ tip: external }, external);
    expect(result.status, result.stderr).toBe(0);
  });
  it("does not add provider calls for an ordinary valid novel commit", () => {
    const f = fixture();
    const good = f.commit("ordinary valid local commit", [f.base]);
    expect(f.verify({ unavailable: true }, good).status).toBe(0);
  });
});
