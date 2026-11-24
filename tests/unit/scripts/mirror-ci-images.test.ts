import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/github/mirror-ci-images.mjs");
const TOKEN = "stub-token-4f1d9c2e";

const STUB_SKOPEO = `#!/usr/bin/env node
const fs = require("node:fs");
const file = process.env.STUB_STATE;
const state = JSON.parse(fs.readFileSync(file, "utf8"));
const args = process.argv.slice(2);
let stdin = "";
try { stdin = fs.readFileSync(0, "utf8"); } catch {}
state.calls.push({ args, stdin });
const save = () => fs.writeFileSync(file, JSON.stringify(state));
const strip = (ref) => ref.replace(/^docker:\\/\\//, "");
const repoOf = (ref) => ref.includes("@") ? ref.slice(0, ref.indexOf("@")) : ref.slice(0, ref.lastIndexOf(":"));
if (args[0] === "login" || args[0] === "logout") { save(); process.exit(0); }
if (args[0] === "inspect") {
  const bytes = state.manifests[strip(args[args.length - 1])];
  save();
  if (bytes === undefined) { process.stderr.write("manifest unknown"); process.exit(1); }
  process.stdout.write(Buffer.from(bytes, "base64"));
  process.exit(0);
}
if (args[0] === "copy") {
  const [source, target] = args.slice(-2).map(strip);
  const bytes = state.sources[source];
  if (bytes === undefined) { save(); process.stderr.write("Rate exceeded"); process.exit(1); }
  const digest = source.slice(source.indexOf("@") + 1);
  state.manifests[repoOf(target) + "@" + digest] = state.corrupt ? Buffer.from("other bytes").toString("base64") : bytes;
  state.manifests[target] = bytes;
  save();
  process.exit(0);
}
save();
process.exit(2);
`;

type Call = { args: string[]; stdin: string };
type State = {
  calls: Call[];
  manifests: Record<string, string>;
  sources: Record<string, string>;
  corrupt: boolean;
};

const manifest = (text: string) => {
  const bytes = Buffer.from(text);
  return {
    base64: bytes.toString("base64"),
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
  };
};

const POSTGRES = manifest('{"schemaVersion":2,"manifests":["postgres"]}');
const POSTGREST = manifest('{"schemaVersion":2,"manifests":["postgrest"]}');
const LIST = {
  images: [
    {
      source: "public.ecr.aws/docker/library/postgres:17.11-alpine",
      digest: POSTGRES.digest,
      mirror: "ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine",
    },
    {
      source: "public.ecr.aws/supabase/postgrest:v16.4",
      digest: POSTGREST.digest,
      mirror: "ghcr.io/asymmetric-al/core-ci-postgrest:v16.4",
    },
  ],
};
const PUBLIC_SOURCES = {
  [`public.ecr.aws/docker/library/postgres@${POSTGRES.digest}`]:
    POSTGRES.base64,
  [`public.ecr.aws/supabase/postgrest@${POSTGREST.digest}`]: POSTGREST.base64,
};

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

function sandbox(state: Partial<State> = {}, list: unknown = LIST) {
  const root = mkdtempSync(path.join(os.tmpdir(), "mirror-ci-images-"));
  roots.push(root);
  const bin = path.join(root, "bin");
  mkdirSync(bin);
  writeFileSync(path.join(bin, "skopeo"), STUB_SKOPEO);
  chmodSync(path.join(bin, "skopeo"), 0o755);
  const stateFile = path.join(root, "state.json");
  writeFileSync(
    stateFile,
    JSON.stringify({
      calls: [],
      manifests: {},
      sources: PUBLIC_SOURCES,
      corrupt: false,
      ...state,
    }),
  );
  const listFile = path.join(root, "ci-images.json");
  writeFileSync(listFile, JSON.stringify(list));
  const run = (env: Record<string, string> = {}) => {
    const result = spawnSync("node", [SCRIPT, listFile], {
      encoding: "utf8",
      env: {
        PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
        HOME: root,
        STUB_STATE: stateFile,
        REGISTRY_USER: "github-actions",
        REGISTRY_TOKEN: TOKEN,
        ...env,
      },
    });
    return { ...result, output: `${result.stdout}\n${result.stderr}` };
  };
  const read = () => JSON.parse(readFileSync(stateFile, "utf8")) as State;
  return { run, read };
}

const verbs = (calls: Call[]) => calls.map((call) => call.args[0]);
const copies = (calls: Call[]) =>
  calls.filter((call) => call.args[0] === "copy").map((call) => call.args);

describe("mirror-ci-images: copies each listed image by digest into the organization's registry", () => {
  it("copies every image with skopeo --all --preserve-digests from its digest, never a tag", () => {
    const box = sandbox();
    const result = box.run();
    expect(result.status, result.output).toBe(0);
    expect(copies(box.read().calls)).toEqual([
      [
        "copy",
        "--all",
        "--preserve-digests",
        "--retry-times",
        "3",
        `docker://public.ecr.aws/docker/library/postgres@${POSTGRES.digest}`,
        "docker://ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine",
      ],
      [
        "copy",
        "--all",
        "--preserve-digests",
        "--retry-times",
        "3",
        `docker://public.ecr.aws/supabase/postgrest@${POSTGREST.digest}`,
        "docker://ghcr.io/asymmetric-al/core-ci-postgrest:v16.4",
      ],
    ]);
  });

  it("reads each digest back from the organization's registry after its copy", () => {
    const box = sandbox();
    expect(box.run().status).toBe(0);
    const calls = box.read().calls.map((call) => call.args.join(" "));
    const pairs: [string, string][] = [
      ["ghcr.io/asymmetric-al/core-ci-postgres", POSTGRES.digest],
      ["ghcr.io/asymmetric-al/core-ci-postgrest", POSTGREST.digest],
    ];
    for (const [repository, digest] of pairs) {
      const copy = calls.findIndex(
        (call) => call.startsWith("copy") && call.includes(repository),
      );
      const readBack = calls.lastIndexOf(
        `inspect --raw --retry-times 3 docker://${repository}@${digest}`,
      );
      expect(copy).toBeGreaterThanOrEqual(0);
      expect(readBack).toBeGreaterThan(copy);
    }
  });

  it("changes nothing when it runs a second time: no copy, the public registry is not asked", () => {
    const box = sandbox();
    expect(box.run().status).toBe(0);
    const before = box.read();
    const second = box.run();
    expect(second.status, second.output).toBe(0);
    const after = box.read();
    expect(after.manifests).toEqual(before.manifests);
    const secondCalls = after.calls.slice(before.calls.length);
    expect(verbs(secondCalls)).not.toContain("copy");
    expect(JSON.stringify(secondCalls)).not.toContain("public.ecr.aws");
  });

  it("fails when the digest read back from the organization's registry differs", () => {
    const box = sandbox({ corrupt: true });
    const result = box.run();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain(
      `ghcr.io/asymmetric-al/core-ci-postgres@${POSTGRES.digest} reads back as sha256:`,
    );
  });

  it("fails when the public registry refuses the copy, and names no other source", () => {
    const box = sandbox({ sources: {} });
    const result = box.run();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("Rate exceeded");
    const sources = copies(box.read().calls).map((args) => args.at(-2));
    expect(sources).toEqual([
      `docker://public.ecr.aws/docker/library/postgres@${POSTGRES.digest}`,
    ]);
  });

  it("re-copies an image whose stored bytes do not match its digest", () => {
    const box = sandbox({
      manifests: {
        [`ghcr.io/asymmetric-al/core-ci-postgres@${POSTGRES.digest}`]:
          Buffer.from("stale").toString("base64"),
        [`ghcr.io/asymmetric-al/core-ci-postgrest@${POSTGREST.digest}`]:
          POSTGREST.base64,
        "ghcr.io/asymmetric-al/core-ci-postgrest:v16.4": POSTGREST.base64,
      },
    });
    const result = box.run();
    expect(result.status, result.output).toBe(0);
    expect(copies(box.read().calls).map((args) => args.at(-1))).toEqual([
      "docker://ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine",
    ]);
  });

  it("copies again, to restore the tag, a digest that is present but untagged", () => {
    const box = sandbox({
      manifests: {
        [`ghcr.io/asymmetric-al/core-ci-postgres@${POSTGRES.digest}`]:
          POSTGRES.base64,
        [`ghcr.io/asymmetric-al/core-ci-postgrest@${POSTGREST.digest}`]:
          POSTGREST.base64,
        "ghcr.io/asymmetric-al/core-ci-postgrest:v16.4": POSTGREST.base64,
      },
    });
    const result = box.run();
    expect(result.status, result.output).toBe(0);
    const state = box.read();
    expect(copies(state.calls).map((args) => args.at(-1))).toEqual([
      "docker://ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine",
    ]);
    expect(
      state.manifests["ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine"],
    ).toBe(POSTGRES.base64);
  });

  it("asks every registry with retries", () => {
    const box = sandbox();
    expect(box.run().status).toBe(0);
    for (const call of box.read().calls)
      if (call.args[0] === "inspect" || call.args[0] === "copy")
        expect(call.args.join(" ")).toContain("--retry-times 3");
  });
});

describe("mirror-ci-images: the token", () => {
  it("logs in to ghcr.io with the token on standard input only, and logs out", () => {
    const box = sandbox();
    const result = box.run();
    expect(result.status, result.output).toBe(0);
    const calls = box.read().calls;
    expect(calls[0]).toEqual({
      args: [
        "login",
        "ghcr.io",
        "--username",
        "github-actions",
        "--password-stdin",
      ],
      stdin: TOKEN,
    });
    expect(calls.at(-1)?.args).toEqual(["logout", "ghcr.io"]);
    for (const call of calls) expect(call.args.join(" ")).not.toContain(TOKEN);
    expect(result.output).not.toContain(TOKEN);
  });

  it("refuses to start without a user or a token", () => {
    const blanks: Record<string, string>[] = [
      { REGISTRY_TOKEN: "" },
      { REGISTRY_USER: "" },
    ];
    for (const env of blanks) {
      const box = sandbox();
      const result = box.run(env);
      expect(result.status).not.toBe(0);
      expect(result.output).toContain("REGISTRY_USER and REGISTRY_TOKEN");
      expect(box.read().calls).toEqual([]);
    }
  });
});

describe("mirror-ci-images: the list is checked before anything is copied", () => {
  const entry = LIST.images[0]!;
  it.each([
    ["an empty list", { images: [] }, "lists no images"],
    [
      "a mirror outside the organization's registry",
      { images: [{ ...entry, mirror: "docker.io/someone/postgres:17" }] },
      "mirror must be ghcr.io/asymmetric-al/",
    ],
    [
      "a digest that is not sha256",
      { images: [{ ...entry, digest: "sha256:abc" }] },
      "digest must be sha256:",
    ],
    [
      "a source pinned by digest instead of a tag",
      { images: [{ ...entry, source: `${entry.source}@${entry.digest}` }] },
      "source must be",
    ],
    [
      "an unknown key",
      { images: [{ ...entry, fallback: "public.ecr.aws" }] },
      "has keys",
    ],
  ])("refuses %s", (_, list, message) => {
    const box = sandbox({}, list);
    const result = box.run();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain(message);
    expect(box.read().calls).toEqual([]);
  });
});
