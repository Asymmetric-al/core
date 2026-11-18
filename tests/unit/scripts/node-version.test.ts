import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { validateNodeVersion } from "../../../scripts/verify/node-version.mjs";
import { parseWorkflowSource } from "../helpers/workflow-yaml";

const approved = "24.22.3";

describe("approved Node runtime", () => {
  it.each(["24.22.3", "v24.22.3", "24.22.4", "24.23.0"])(
    "accepts the tested floor and maintained patches: %s",
    (version) =>
      expect(() => validateNodeVersion(version, approved)).not.toThrow(),
  );

  it.each([
    "20.9.0",
    "22.22.0",
    "24.21.0",
    "24.22.0",
    "24.22.1",
    "24.22.2",
    "25.0.0",
    "26.6.0",
    "24.22.3-rc.1",
    "24.22",
    "invalid",
  ])("rejects unsupported, older or unqualified runtimes: %s", (version) =>
    expect(() => validateNodeVersion(version, approved)).toThrow(/Node.js/),
  );

  it("fails closed on a malformed approved pin", () => {
    expect(() => validateNodeVersion(approved, "24.x")).toThrow(/approved/);
  });

  it("keeps the package engine pinned to the repository's Node version", () => {
    const pin = readFileSync(".node-version", "utf8").trim();
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    expect(manifest.engines.node).toBe(`>=${pin} <25`);
  });

  // Found by scanning the directory, so that a new workflow cannot be missed
  // (council round 2, A1: the release workflow ran on 24.22.1, which Payload
  // refuses, because a fixed list of four workflows left it out). Council
  // round 3 (lens 2 I3): the scan read literal versions only, so a matrix
  // value, a container, a Node image or a workflow that runs node with no
  // setup slipped through. It now reads the parsed workflow.
  it("pins every workflow that sets up Node to the repository's Node version", () => {
    const pin = readFileSync(".node-version", "utf8").trim();
    const workflows = readWorkflows();
    expect(workflows.map(({ file }) => file)).toEqual(
      expect.arrayContaining([
        "ci.yml",
        "ci-integration.yml",
        "qa-smoke-preview-deploy.yml",
        "release.yml",
        "shadscan.yml",
      ]),
    );
    for (const { file, doc } of workflows)
      expect(nodeVersionProblems(doc, pin), file).toEqual([]);
  });

  // The two workflows that run node on the runner's default Node predate this
  // program and run no Payload. They are the whole list, so a third cannot
  // appear unseen; one that sets up Node is checked by the case above.
  it("names the whole list of workflows that run node with no setup", () => {
    expect(
      readWorkflows()
        .filter(({ doc }) => runsNodeWithoutSetup(doc))
        .map(({ file }) => file)
        .sort(),
    ).toEqual([
      "configure-resend-production-webhook.yml",
      "sync-vercel-production-env.yml",
    ]);
  });

  describe("the workflow scan finds each way off the pin", () => {
    const pin = "24.22.3";
    const workflow = (jobs: string, env = `env:\n  NODE_VERSION: "${pin}"\n`) =>
      parseWorkflowSource(`on: push\n${env}jobs:\n${jobs}`);
    const setupNode = (version: string) =>
      `      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1\n        with:\n          node-version: ${version}\n`;
    const job = (steps: string, extra = "") =>
      `  build:\n    runs-on: ubuntu-latest\n${extra}    steps:\n${steps}`;

    it.each<[string, string]>([
      ["the workflow's NODE_VERSION", setupNode("${{ env.NODE_VERSION }}")],
      ["the pin itself", setupNode(`"${pin}"`)],
    ])("passes a setup-node step that reads %s", (_name, steps) => {
      expect(nodeVersionProblems(workflow(job(steps)), pin)).toEqual([]);
    });

    it.each<[string, ReturnType<typeof parseWorkflowSource>]>([
      [
        "a matrix value",
        workflow(
          job(
            setupNode("${{ matrix.node }}"),
            "    strategy:\n      matrix:\n        node: [22, 24]\n",
          ),
        ),
      ],
      ["another literal", workflow(job(setupNode('"24.22.1"')))],
      [
        "a NODE_VERSION that is not the pin",
        workflow(
          job(setupNode("${{ env.NODE_VERSION }}")),
          'env:\n  NODE_VERSION: "24.22.1"\n',
        ),
      ],
      [
        "a job-level NODE_VERSION that is not the pin",
        workflow(
          job(
            setupNode("${{ env.NODE_VERSION }}"),
            '    env:\n      NODE_VERSION: "22.0.0"\n',
          ),
        ),
      ],
      [
        "env.NODE_VERSION with no NODE_VERSION set",
        workflow(job(setupNode("${{ env.NODE_VERSION }}")), ""),
      ],
      [
        "a setup-node step with no version",
        workflow(
          job(
            "      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1\n",
          ),
        ),
      ],
      [
        "a version file",
        workflow(
          job(
            "      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1\n        with:\n          node-version-file: .node-version\n",
          ),
        ),
      ],
      [
        "a container",
        workflow(
          job(
            "      - run: node -v\n",
            "    container: public.ecr.aws/docker/library/node:22\n",
          ),
        ),
      ],
      [
        "a container given as a map",
        workflow(
          job(
            "      - run: echo hi\n",
            "    container:\n      image: ubuntu:24.04\n",
          ),
        ),
      ],
      [
        "a Node service image",
        workflow(
          job(
            setupNode("${{ env.NODE_VERSION }}"),
            "    services:\n      app:\n        image: node:22-alpine\n",
          ),
        ),
      ],
      [
        "a Node image run as a step",
        workflow(job("      - uses: docker://node:22\n")),
      ],
    ])("fails %s", (_name, doc) => {
      expect(nodeVersionProblems(doc, pin)).not.toEqual([]);
    });

    it("counts a workflow that runs node, npx or npm without setting it up", () => {
      for (const command of [
        "node scripts/x.mjs",
        "npx -y tool",
        "npm install --global x",
        "set -e\nnode -e 1",
      ])
        expect(
          runsNodeWithoutSetup(
            workflow(
              job(
                `      - run: |\n          ${command.replaceAll("\n", "\n          ")}\n`,
              ),
              "",
            ),
          ),
          command,
        ).toBe(true);
      expect(
        runsNodeWithoutSetup(
          workflow(
            job(
              `${setupNode("${{ env.NODE_VERSION }}")}      - run: node -v\n`,
            ),
          ),
        ),
      ).toBe(false);
      expect(
        runsNodeWithoutSetup(
          workflow(job("      - run: bun run nodejs-check\n"), ""),
        ),
      ).toBe(false);
    });
  });
});

type Doc = ReturnType<typeof parseWorkflowSource>;
type Step = {
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, unknown>;
};

/** Every workflow in .github/workflows, parsed. */
function readWorkflows() {
  const dir = ".github/workflows";
  return readdirSync(dir)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => ({
      file,
      doc: parseWorkflowSource(readFileSync(`${dir}/${file}`, "utf8")),
    }));
}

const jobsOf = (doc: Doc) =>
  Object.entries(doc.jobs ?? {}) as [string, Record<string, unknown>][];
const stepsOf = (job: Record<string, unknown>) =>
  (Array.isArray(job.steps) ? job.steps : []) as Step[];
const isSetupNode = (step: Step) =>
  /^actions\/setup-node@/.test(step.uses ?? "");
/** An image reference that names Node: `node:22`, `library/node@sha256:...`. */
const isNodeImage = (image: unknown) =>
  typeof image === "string" &&
  /(^|\/)node(:|@|$)/i.test(image.replace(/^docker:\/\//, ""));
const NODE_COMMAND = /(^|[\s;&|(`])(node|npx|npm)(\s|$)/m;

/**
 * Why a parsed workflow could run another Node than the pin, or nothing: every
 * setup-node step reads the pin or the workflow's NODE_VERSION, every
 * NODE_VERSION is the pin, and no job runs in a container or a Node image.
 */
function nodeVersionProblems(doc: Doc, pin: string): string[] {
  const problems: string[] = [];
  const envVersion = (env: unknown, where: string) => {
    const value = (env as Record<string, unknown> | undefined)?.NODE_VERSION;
    if (value === undefined) return undefined;
    if (String(value) !== pin)
      problems.push(`${where} NODE_VERSION is ${String(value)}`);
    return String(value);
  };
  const workflowVersion = envVersion(doc.env, "the workflow's");
  for (const [id, job] of jobsOf(doc)) {
    const jobVersion = envVersion(job.env, `job ${id}'s`) ?? workflowVersion;
    if (job.container !== undefined)
      problems.push(`job ${id} runs in a container`);
    for (const service of Object.values(
      (job.services ?? {}) as Record<string, { image?: unknown }>,
    ))
      if (isNodeImage(service?.image))
        problems.push(
          `job ${id} starts the Node image ${String(service.image)}`,
        );
    for (const step of stepsOf(job)) {
      if (isNodeImage(step.uses))
        problems.push(`job ${id} runs the Node image ${step.uses}`);
      const stepVersion =
        envVersion(step.env, `a step of job ${id}'s`) ?? jobVersion;
      if (step.with && "node-version-file" in step.with)
        problems.push(`job ${id} reads node-version-file`);
      const version = step.with?.["node-version"];
      if (isSetupNode(step) && version === undefined)
        problems.push(`job ${id} sets up Node with no node-version`);
      if (version === undefined) continue;
      const text = String(version).trim();
      if (/^\$\{\{\s*env\.NODE_VERSION\s*\}\}$/.test(text)) {
        if (stepVersion === undefined)
          problems.push(`job ${id} reads env.NODE_VERSION, which nothing sets`);
      } else if (text !== pin) problems.push(`job ${id} sets up Node ${text}`);
    }
  }
  return problems;
}

/** Whether a parsed workflow runs node, npx or npm in a job that does not set up Node. */
function runsNodeWithoutSetup(doc: Doc): boolean {
  return jobsOf(doc).some(([, job]) => {
    const steps = stepsOf(job);
    return (
      !steps.some(isSetupNode) &&
      steps.some((step) => NODE_COMMAND.test(step.run ?? ""))
    );
  });
}
