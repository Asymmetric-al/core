import { afterEach, beforeEach, expect, vi } from "vitest";

import { EXPECTED_PROJECTS } from "../../../../../scripts/verify/vercel-build-controls.mjs";

export const RELEASE_SHA = "a".repeat(40);
export const PROJECT_REF = "pnmlrbgjiqzzsthsoikm";
export const noSleep = async () => {};
export const silent = () => {};

export function forbidNetwork() {
  const network = vi.fn((_input: URL | RequestInfo, _init?: RequestInit) => {
    throw new Error("a test reached the network");
  });
  beforeEach(() => {
    network.mockClear();
    vi.stubGlobal("fetch", network);
  });
  afterEach(() => {
    const reached = network.mock.calls.map(([input]) => String(input));
    vi.unstubAllGlobals();
    expect(reached, "a test reached the network").toEqual([]);
  });
  return network;
}

export const BYPASS_ENV = Object.freeze({
  VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET: "bypass-admin",
  VERCEL_DONOR_AUTOMATION_BYPASS_SECRET: "bypass-donor",
  VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET: "bypass-missionary",
});

export interface VercelCreateDeploymentBody {
  name: string;
  project: string;
  target: string;
  gitSource: {
    type: string;
    repoId: string;
    ref: string;
    sha: string;
  };
  build?: {
    env?: Record<string, string>;
  };
  gitMetadata?: {
    commitRef: string;
    commitSha: string;
    remoteUrl: string;
  };
  buildMachine?: string;
}

export interface RecordedVercelCall {
  path: string;
  method: string;
  body?: unknown;
}

export function isCreateDeploymentBody(
  body: unknown,
): body is VercelCreateDeploymentBody {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  const gitSource = candidate.gitSource as Record<string, unknown> | undefined;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.project === "string" &&
    typeof candidate.target === "string" &&
    typeof gitSource === "object" &&
    gitSource !== null &&
    typeof gitSource.repoId === "string" &&
    typeof gitSource.sha === "string" &&
    typeof gitSource.ref === "string"
  );
}

const projectSettings = (app: string, autoAssignCustomDomains = false) => ({
  id: EXPECTED_PROJECTS.find((p) => p.key === app)!.projectId,
  autoAssignCustomDomains,
  link: { productionBranch: "production" },
});

/** A fake Vercel API: every app builds to READY; records what was asked. */
export function fakeVercel({ autoAssign = false, finalState = "READY" } = {}) {
  const calls: RecordedVercelCall[] = [];
  let counter = 0;
  const deployments = new Map<string, Record<string, unknown>>();
  const call = vi.fn(
    async (pathname: string, method = "GET", body?: unknown) => {
      calls.push({ path: pathname, method, body });
      const project = /\/v9\/projects\/(prj_[A-Za-z0-9]+)/.exec(pathname)?.[1];
      if (project && method === "GET") {
        const app = EXPECTED_PROJECTS.find((p) => p.projectId === project)!.key;
        return projectSettings(app, autoAssign);
      }
      if (pathname.startsWith("/v13/deployments?") && method === "POST") {
        if (!isCreateDeploymentBody(body)) {
          throw new Error("invalid deployment creation body");
        }
        const id = `dpl_${++counter}`;
        deployments.set(id, {
          id,
          projectId: body.project,
          target: body.target,
          gitSource: {
            type: "github",
            repoId: body.gitSource.repoId,
            sha: body.gitSource.sha,
            ref: body.gitSource.ref,
          },
          readyState: "QUEUED",
          url: `${body.name}-${counter}.vercel.app`,
        });
        return { id, readyState: "QUEUED" };
      }
      const read = /^\/v13\/deployments\/(dpl_\w+)\?/.exec(pathname)?.[1];
      if (read) {
        const deployment = deployments.get(read)!;
        deployment.readyState = finalState;
        return deployment;
      }
      if (pathname.includes("/promote/") || pathname.includes("/cancel")) {
        return {};
      }
      throw new Error(`unexpected ${method} ${pathname}`);
    },
  );
  return { call, calls };
}

/** A fake fetch for health routes, keyed by host. */
export function fakeHealth(
  bodies: Record<string, { status: number; body: unknown }>,
) {
  return vi.fn(async (input: URL | string) => {
    const host = new URL(String(input)).host;
    const answer = bodies[host] ?? bodies["*"];
    return { status: answer.status, json: async () => answer.body } as Response;
  });
}

export const healthy = (overrides: Record<string, unknown> = {}) => ({
  status: 200,
  body: {
    status: "ok",
    release: { commit: RELEASE_SHA },
    database: { supabaseProjectRef: PROJECT_REF, environment: "disposable" },
    migrations: {},
    ...overrides,
  },
});
