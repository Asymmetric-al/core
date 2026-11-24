import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  PINNED_SERVICE_CREDENTIALS,
  parseWorkflowSource,
} from "../helpers/workflow-yaml";

type Entry = { source: string; digest: string; mirror: string };
type Step = {
  name?: string;
  if?: unknown;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  "continue-on-error"?: unknown;
};
type Job = {
  permissions?: unknown;
  container?: unknown;
  services?: Record<string, { image?: string; credentials?: unknown }>;
  steps?: Step[];
};
type Doc = {
  on?: unknown;
  permissions?: Record<string, string>;
  jobs?: Record<string, Job>;
};

const list = JSON.parse(readFileSync(".github/ci-images.json", "utf8")) as {
  images: Entry[];
};
const pullReferences = list.images.map(
  (image) => `${image.mirror}@${image.digest}`,
);
const sourceRepositories = list.images.map((image) =>
  image.source.slice(0, image.source.lastIndexOf(":")),
);

const SCRIPT = "scripts/api-contract/stack.mjs";
const read = (file: string) => readFileSync(file, "utf8");
const workflowTexts: Record<string, string> = Object.fromEntries(
  readdirSync(".github/workflows")
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => [file, read(`.github/workflows/${file}`)]),
);
const parse = (text: string) => parseWorkflowSource(text) as unknown as Doc;
const scriptText = read(SCRIPT);
const clone = <T>(value: T): T => structuredClone(value);

function workflowImages(file: string, text: string) {
  const found: { at: string; image: string }[] = [];
  text.split("\n").forEach((line, index) => {
    const image = /^\s*image:\s*["']?([^"'\s#]+)/.exec(line)?.[1];
    if (image) found.push({ at: `${file}:${index + 1}`, image });
  });
  for (const [id, job] of Object.entries(parse(text).jobs ?? {})) {
    const at = `${file} ${id}`;
    for (const service of Object.values(job.services ?? {}))
      found.push({ at, image: String(service?.image) });
    if (job.container !== undefined)
      found.push({
        at,
        image: String(
          typeof job.container === "object" && job.container
            ? (job.container as { image?: unknown }).image
            : job.container,
        ),
      });
    for (const step of job.steps ?? [])
      if (step.uses?.startsWith("docker://"))
        found.push({ at, image: step.uses.slice("docker://".length) });
  }
  return found;
}

function workflowImageProblems(texts: Record<string, string>): string[] {
  return Object.entries(texts).flatMap(([file, text]) => [
    ...workflowImages(file, text)
      .filter(({ image }) => !pullReferences.includes(image))
      .map(
        ({ at, image }) =>
          `${at} pulls ${image}, which the list does not mirror`,
      ),
    ...sourceRepositories
      .filter((repository) => text.includes(repository))
      .map((repository) => `${file} names ${repository}`),
  ]);
}

const IMAGE_LITERAL =
  /"((?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?\/[^"\s]+|[^"\s]*postgrest?[^"\s:@]*[:@][A-Za-z0-9][^"\s]*)"/gi;

function scriptImageProblems(text: string): string[] {
  return [
    ...[...text.matchAll(IMAGE_LITERAL)]
      .map((match) => match[1]!)
      .filter((image) => !pullReferences.includes(image))
      .map((image) => `${SCRIPT} names ${image}`),
    ...sourceRepositories
      .filter((repository) => text.includes(repository))
      .map((repository) => `${SCRIPT} names ${repository}`),
  ];
}

function scriptPullProblems(text: string): string[] {
  const runs = [...text.matchAll(/\[\s*"run",\s*"-d",/g)];
  const problems: string[] = [];
  if (runs.length < 2) problems.push("fewer than two docker run calls found");
  for (const match of runs) {
    const after = text.slice(match.index! + match[0].length);
    if (!/^\s*"--pull",\s*"never",/.test(after))
      problems.push(`docker run at offset ${match.index} may pull`);
  }
  if (/\[\s*"pull"|"--pull",\s*"(?!never")/.test(text))
    problems.push("the script asks Docker to pull");
  return problems;
}

const FORK_REJECT = parse(workflowTexts["ci-integration.yml"]!).jobs!.migrate!
  .steps![0]!;
const TOKEN = /github\.token|secrets\./;
const REPOSITORY_CODE = /scripts\/|\.\/|\bnode\b|\bbun\b|\bbash\b|\bnpx\b/;

function registryLoginProblems(job: Job, script: string): string[] {
  const steps = job.steps ?? [];
  const problems: string[] = [];
  if (JSON.stringify(steps[0]) !== JSON.stringify(FORK_REJECT))
    problems.push("step 0 is not the fork-reject step of ci-integration.yml");
  const holders = steps
    .map((step, index) => ({ step, index }))
    .filter(
      ({ step }) =>
        TOKEN.test(JSON.stringify(step)) || /login/.test(step.run ?? ""),
    );
  if (holders.length !== 1 || holders[0]!.index !== 1) {
    problems.push(
      `the token must be held by step 1 alone, not steps ${holders.map(({ index }) => index).join(",")}`,
    );
    return problems;
  }
  const step = holders[0]!.step;
  const run = step.run ?? "";
  if (step.if !== undefined || step["continue-on-error"] !== undefined)
    problems.push("the login step is conditional");
  if (step.uses !== undefined) problems.push("the login step uses an action");
  if (REPOSITORY_CODE.test(run))
    problems.push("the login step runs repository code");
  if (
    /(^|[^/])\b(docker|mktemp|rm)\b(?= )/m.test(
      run.replace(/\/usr\/bin\/(docker|mktemp|rm)/g, ""),
    )
  )
    problems.push("the login step calls a tool by a relative name");
  const lines = run.split("\n").map((line) => line.trim());
  const config = lines.findIndex((line) =>
    /^export DOCKER_CONFIG="\$\(\/usr\/bin\/mktemp -d\)"$/.test(line),
  );
  const trap = lines.findIndex((line) =>
    /^trap '.*\/usr\/bin\/docker logout ghcr\.io.*\/usr\/bin\/rm -rf "\$DOCKER_CONFIG".*' EXIT$/.test(
      line,
    ),
  );
  const login = lines.findIndex((line) =>
    /\| \/usr\/bin\/docker login ghcr\.io --username "\$REGISTRY_USER" --password-stdin$/.test(
      line,
    ),
  );
  if (config < 0) problems.push("no throwaway DOCKER_CONFIG");
  if (trap < 0) problems.push("no logout on every exit");
  if (login < 0) problems.push("no login with the token on standard input");
  if (!(config < trap && trap < login))
    problems.push("the logout trap is not set before the login");
  const pulled = String(step.env?.POSTGREST_IMAGE);
  if (!pullReferences.includes(pulled))
    problems.push(`it pulls ${pulled}, which the list does not mirror`);
  const scripted = /export const POSTGREST_IMAGE =\s*"([^"]+)"/.exec(
    script,
  )?.[1];
  if (pulled !== scripted)
    problems.push(`it pulls ${pulled}, not stack.mjs's ${scripted}`);
  if (step.env?.REGISTRY_TOKEN !== "${{ github.token }}")
    problems.push("the token is not the workflow's own");
  return problems;
}

const pulls = Object.entries(workflowTexts).flatMap(([file, text]) => {
  const doc = parse(text);
  return Object.entries(doc.jobs ?? {}).flatMap(([id, job]) =>
    Object.values(job.services ?? {}).map((service) => ({
      where: `${file} ${id}`,
      doc,
      job,
      service,
    })),
  );
});
const apiContract = parse(workflowTexts["api-contract.yml"]!).jobs![
  "api-contract"
]!;

describe("CI pulls its pinned images only from the organization's mirror (ruling D-16)", () => {
  it("every image a workflow runs, service, container or docker:// step, is a digest the list mirrors", () => {
    expect(workflowImageProblems(workflowTexts)).toEqual([]);
  });

  it("stack.mjs names only mirrored digests, and no other image or registry", () => {
    expect(scriptImageProblems(scriptText)).toEqual([]);
    expect(
      [...scriptText.matchAll(IMAGE_LITERAL)].map((match) => match[1]),
    ).toEqual(pullReferences.slice().reverse());
  });

  it("the eight service containers that pull an image are the eight known jobs", () => {
    expect(pulls.map(({ where }) => where).sort()).toEqual([
      "api-contract.yml api-contract",
      "ci-integration.yml migrate",
      "ci-integration.yml smoke",
      "ci-integration.yml test-e2e",
      "ci-integration.yml test-e2e-smoke",
      "local-supabase.yml local-supabase",
      "qa-smoke-preview-deploy.yml preview-database",
      "release.yml database",
    ]);
  });

  it("each pulls with the workflow's own token, under packages: read and never write, with no fallback image", () => {
    for (const { where, doc, job, service } of pulls) {
      expect(pullReferences, where).toContain(service.image);
      expect(service.credentials, where).toStrictEqual(
        PINNED_SERVICE_CREDENTIALS,
      );
      expect(doc.permissions?.packages, where).toBe("read");
      expect(job.permissions, where).toBeUndefined();
    }
  });

  it("no other job of a pull-request workflow logs in to a registry in a step", () => {
    const holders = Object.entries(workflowTexts).flatMap(([file, text]) => {
      const doc = parse(text);
      if (!/pull_request/.test(JSON.stringify(doc.on))) return [];
      return Object.entries(doc.jobs ?? {})
        .filter(([, job]) =>
          (job.steps ?? []).some(
            (step) =>
              /\b(docker|skopeo|podman|buildah|crane|oras) (auth )?login\b/.test(
                step.run ?? "",
              ) || /login-action|login@/.test(step.uses ?? ""),
          ),
        )
        .map(([id]) => `${file} ${id}`);
    });
    expect(holders).toEqual(["api-contract.yml api-contract"]);
  });
});

describe("API contract: the registry token is gone before any code of the pull request runs", () => {
  it("rejects forks first, then logs in, pulls and logs out in one step that runs no repository code", () => {
    expect(registryLoginProblems(apiContract, scriptText)).toEqual([]);
  });

  it("stack.mjs never pulls: every docker run says --pull never", () => {
    expect(scriptPullProblems(scriptText)).toEqual([]);
  });

  const editStep = (edit: (steps: Step[]) => void) => () => {
    const job = clone(apiContract);
    edit(job.steps!);
    return job;
  };
  const editRun = (from: string | RegExp, to: string) =>
    editStep((steps) => {
      const before = steps[1]!.run!;
      steps[1]!.run = before.replace(from, to);
      expect(steps[1]!.run).not.toBe(before);
    });

  it.each([
    [
      "the login after a step that runs repository code",
      editStep((steps) => {
        const [login] = steps.splice(1, 1);
        const canvas = steps.findIndex((step) =>
          /install-canvas-deps/.test(step.run ?? ""),
        );
        steps.splice(canvas + 1, 0, login!);
      }),
    ],
    ["no fork-reject step", editStep((steps) => void steps.shift())],
    [
      "a logout only on success",
      editStep((steps) => void (steps[1]!.if = "success()")),
    ],
    ["no logout trap", editRun(/^trap .*\n/m, "")],
    [
      "the logout trap set after the login",
      editRun(/^(trap .*\n)(printf .*\n)/m, "$2$1"),
    ],
    [
      "docker by a relative name",
      editRun("| /usr/bin/docker login", "| docker login"),
    ],
    [
      "repository code in the login step",
      editRun(/$/, "\nnode scripts/api-contract/stack.mjs prepare"),
    ],
    [
      "a token in a later step",
      editStep(
        (steps) =>
          void (steps.at(-1)!.env = { GHCR_TOKEN: "${{ github.token }}" }),
      ),
    ],
  ])("fails with %s", (_, mutated) => {
    expect(registryLoginProblems(mutated(), scriptText)).not.toEqual([]);
  });

  it.each([
    [
      "a docker run without --pull never",
      scriptText.replace(/"--pull", "never", /, ""),
    ],
    [
      "an explicit docker pull",
      scriptText.replace(
        "requireLocalImage(POSTGREST_IMAGE);\n  claimContainer",
        'docker(["pull", POSTGREST_IMAGE]);\n  claimContainer',
      ),
    ],
  ])("fails when stack.mjs has %s", (_, text) => {
    expect(text).not.toBe(scriptText);
    expect(scriptPullProblems(text)).not.toEqual([]);
  });
});

describe("the image pins fail when an image comes from anywhere else", () => {
  const ci = workflowTexts["ci-integration.yml"]!;
  it.each([
    [
      "a service line put back to the public registry",
      ci.replace(
        "image: ghcr.io/asymmetric-al/core-ci-postgres:",
        "image: public.ecr.aws/docker/library/postgres:",
      ),
    ],
    [
      "an unpinned job container",
      ci.replace(
        "  migrate:\n    runs-on: ubuntu-latest\n",
        "  migrate:\n    runs-on: ubuntu-latest\n    container: node:24\n",
      ),
    ],
    [
      "a docker:// step",
      ci.replace(
        "      - name: Install system dependencies (canvas)\n",
        "      - uses: docker://alpine:3.20\n      - name: Install system dependencies (canvas)\n",
      ),
    ],
  ])("a workflow with %s", (_, text) => {
    expect(text).not.toBe(ci);
    expect(
      workflowImageProblems({ ...workflowTexts, "ci-integration.yml": text }),
    ).not.toEqual([]);
  });

  it.each([
    [
      "a public PostgREST image",
      "ghcr.io/asymmetric-al/core-ci-postgrest:",
      "public.ecr.aws/supabase/postgrest:",
    ],
    [
      "an unpinned fallback",
      '  "ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine@sha256:',
      '  "postgres:17.11-alpine" ?? "ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine@sha256:',
    ],
    [
      "another registry",
      '  "ghcr.io/asymmetric-al/core-ci-postgrest:',
      '  "quay.io/someone/postgrest:',
    ],
  ])("stack.mjs with %s", (_, from, to) => {
    const text = scriptText.replace(from, to);
    expect(text).not.toBe(scriptText);
    expect(scriptImageProblems(text)).not.toEqual([]);
  });
});
