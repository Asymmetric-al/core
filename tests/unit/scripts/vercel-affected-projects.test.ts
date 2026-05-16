import { describe, expect, it } from "vitest";

import {
  DEFAULT_SCOPE,
  TEAM_ID,
  VERCEL_PROJECTS,
  buildProjectEndpoint,
  buildReport,
  createAffectedProjectsPatch,
  createSnapshotPayload,
  normalizeProjectStatus,
  publicProjectStatus,
  setAffectedProjectDeployments,
  validateProjectStatus,
} from "../../../scripts/vercel/affected-projects.mjs";

function projectJson(
  project: (typeof VERCEL_PROJECTS)[number],
  enabled = true,
) {
  return JSON.stringify({
    id: project.id,
    name: project.project,
    rootDirectory: project.rootDirectory,
    enableAffectedProjectsDeployments: enabled,
    sourceFilesOutsideRootDirectory: true,
    previewDeploymentsDisabled: true,
  });
}

describe("Vercel affected-project deployment controls", () => {
  it("maps the three live Vercel projects by id and root directory", () => {
    expect(VERCEL_PROJECTS).toEqual([
      {
        key: "admin",
        project: "admin",
        id: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
        rootDirectory: "apps/admin",
      },
      {
        key: "donor",
        project: "donor",
        id: "prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL",
        rootDirectory: "apps/donor",
      },
      {
        key: "missionary",
        project: "missionary",
        id: "prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN",
        rootDirectory: "apps/missionary",
      },
    ]);
  });

  it("builds the exact Vercel API endpoints and PATCH payload", () => {
    const [project] = VERCEL_PROJECTS;

    expect(buildProjectEndpoint(project, "v10")).toBe(
      `/v10/projects/${project.id}?teamId=${TEAM_ID}`,
    );
    expect(buildProjectEndpoint(project, "v9")).toBe(
      `/v9/projects/${project.id}?teamId=${TEAM_ID}`,
    );
    expect(createAffectedProjectsPatch(true)).toEqual({
      enableAffectedProjectsDeployments: true,
    });
    expect(createAffectedProjectsPatch(false)).toEqual({
      enableAffectedProjectsDeployments: false,
    });
  });

  it("normalizes and validates project status without exposing extra settings", () => {
    const [project] = VERCEL_PROJECTS;
    const status = normalizeProjectStatus(project, projectJson(project, true));

    expect(publicProjectStatus(status)).toEqual({
      ok: true,
      project: "admin",
      id: project.id,
      rootDirectory: "apps/admin",
      enableAffectedProjectsDeployments: true,
      problems: [],
    });
  });

  it("reports disabled affected-project deployments as a failed check", () => {
    const [project] = VERCEL_PROJECTS;
    const status = normalizeProjectStatus(project, projectJson(project, false));

    expect(validateProjectStatus(status)).toContain(
      "affected-project deployments expected true",
    );
    expect(buildReport({ action: "check", statuses: [status] })).toMatchObject({
      ok: false,
      action: "check",
      scope: DEFAULT_SCOPE,
    });
  });

  it("captures a sanitized snapshot before enabling and patches every project", () => {
    const calls: Array<{
      command: string;
      args: string[];
      options: { input?: string };
    }> = [];
    const patchedProjectIds = new Set<string>();

    const runCommand = (
      command: string,
      args: string[],
      options: { input?: string } = {},
    ) => {
      calls.push({ command, args, options });

      const endpoint = args[1] ?? "";
      const project = VERCEL_PROJECTS.find((item) =>
        endpoint.includes(item.id),
      );
      if (!project) {
        throw new Error(`unexpected endpoint: ${endpoint}`);
      }

      if (args.includes("PATCH")) {
        patchedProjectIds.add(project.id);
        expect(options.input).toBe(
          `${JSON.stringify(createAffectedProjectsPatch(true))}\n`,
        );
        return projectJson(project, true);
      }

      return projectJson(project, patchedProjectIds.has(project.id));
    };

    const snapshots: unknown[] = [];
    const result = setAffectedProjectDeployments({
      enabled: true,
      runCommand,
      writeSnapshot: (statuses, options) => {
        snapshots.push(createSnapshotPayload(statuses, options));
        return "/tmp/asym-vercel-affected-projects-test.json";
      },
    });

    expect(result.snapshotPath).toBe(
      "/tmp/asym-vercel-affected-projects-test.json",
    );
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      action: "before-enable",
      scope: DEFAULT_SCOPE,
      teamId: TEAM_ID,
    });
    expect((snapshots[0] as { projects: unknown[] }).projects).toHaveLength(3);
    expect((snapshots[0] as { projects: unknown[] }).projects[0]).toMatchObject(
      {
        project: "admin",
        id: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
        rootDirectory: "apps/admin",
        enableAffectedProjectsDeployments: false,
      },
    );
    expect(
      calls
        .filter((call) => call.args.includes("PATCH"))
        .map((call) => call.args[1]),
    ).toEqual(
      VERCEL_PROJECTS.map((project) => buildProjectEndpoint(project, "v9")),
    );
    expect(
      result.after.map((status) => status.enableAffectedProjectsDeployments),
    ).toEqual([true, true, true]);
  });
});
