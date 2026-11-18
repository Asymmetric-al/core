import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  main,
  resolveScanner,
  scannerEnvironment,
  validateInstalledVersion,
} from "../../../scripts/shadscan-audit.mjs";
import {
  EXPECTED_APPLICATIONS,
  categoryScores,
  renderSummary,
} from "../../../scripts/shadscan-summary.mjs";

type Summary = {
  score: number | null;
  applications: Array<{
    packageDir: string;
    discovered: boolean;
    score?: number | null;
    categories?: Array<{
      id: string;
      applicable: boolean;
      percentage: number | null;
    }>;
    failingRules?: string[];
  }>;
};

type Finding = {
  id: string;
  packageDir: string;
  category: string;
  status: string;
  score: number;
  maxScore: number;
};

let root: string;
let workspace: string;
const scanner = () => resolveScanner();

function fakeScanner(name: string, source: string) {
  const file = path.join(root, `${name}.mjs`);
  writeFileSync(file, source);
  return { ...scanner(), binary: file };
}

function capture() {
  const lines: string[] = [];
  return {
    lines,
    log: (line: string) => lines.push(line),
    error: (line: string) => lines.push(line),
  };
}

beforeAll(() => {
  root = mkdtempSync(path.join(os.tmpdir(), "core-shadscan-audit-"));
  // A one-application workspace with known accessibility gaps: the scanner
  // reports a valid, low-scoring audit for it in about a second.
  workspace = path.join(root, "workspace");
  mkdirSync(path.join(workspace, "apps/admin/app"), { recursive: true });
  writeFileSync(
    path.join(workspace, "package.json"),
    JSON.stringify({ name: "fixture", private: true, workspaces: ["apps/*"] }),
  );
  writeFileSync(
    path.join(workspace, "apps/admin/package.json"),
    JSON.stringify({
      name: "@fixture/admin",
      private: true,
      dependencies: { next: "16.4.5", react: "19.2.0", "react-dom": "19.2.0" },
    }),
  );
  writeFileSync(
    path.join(workspace, "apps/admin/app/page.tsx"),
    'export default function Page() {\n  return <main><img src="/x.png" /><button></button></main>;\n}\n',
  );
  writeFileSync(
    path.join(workspace, "apps/admin/app/layout.tsx"),
    'export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body>{children}</body></html>;\n}\n',
  );
});

afterAll(() => {
  vi.unstubAllEnvs();
  rmSync(root, { recursive: true, force: true });
});

describe("Shadscan advisory audit", () => {
  // The pinned scanner runs once per file, on the fixture workspace. Its raw
  // report is the recording that the summary cases replay through a stand-in
  // scanner, so they still go through the whole audit without rescanning.
  describe("against the pinned scanner's report for the fixture", () => {
    const scanned = { code: -1, lines: [] as string[], output: "" };
    const recording = () => path.join(scanned.output, "shadscan.raw.json");

    // Replays the recorded report, so `main` validates and summarizes the
    // real scanner's output for the fixture.
    function recordedScanner() {
      expect(
        existsSync(recording()),
        `The fixture scan wrote no report:\n${scanned.lines.join("\n")}`,
      ).toBe(true);
      return fakeScanner(
        "recorded-scanner",
        `import { readFileSync } from "node:fs";
process.stdout.write(readFileSync(${JSON.stringify(recording())}, "utf8"));`,
      );
    }

    beforeAll(async () => {
      scanned.output = path.join(root, "low-score");
      const out = capture();
      scanned.code = await main(["--output", scanned.output], {
        root: workspace,
        ...out,
      });
      scanned.lines = out.lines;
    }, 120_000);

    it("writes a valid low-score report and exits 0, because scores never block", () => {
      const output = scanned.output;
      expect(scanned.code, scanned.lines.join("\n")).toBe(0);
      const raw = JSON.parse(
        readFileSync(path.join(output, "shadscan.raw.json"), "utf8"),
      );
      const summary: Summary = JSON.parse(
        readFileSync(path.join(output, "shadscan.summary.json"), "utf8"),
      );
      // The report came from the pinned scanner, not a stand-in.
      expect(raw.engineVersion).toBe(scanner().installedVersion);
      expect(raw.score).toBeLessThan(50);
      expect(summary.score).toBe(raw.score);
      expect(
        readFileSync(path.join(output, "shadscan.summary.md"), "utf8"),
      ).toContain("<!-- shadscan-report -->");
    });

    it("reports each application's overall score, every category score and its failing rule IDs", async () => {
      const output = path.join(root, "categories");
      const code = await main(["--output", output], {
        root: workspace,
        scanner: recordedScanner(),
        ...capture(),
      });
      expect(code).toBe(0);
      const raw = JSON.parse(
        readFileSync(path.join(output, "shadscan.raw.json"), "utf8"),
      );
      const summary: Summary = JSON.parse(
        readFileSync(path.join(output, "shadscan.summary.json"), "utf8"),
      );
      const admin = summary.applications.find(
        (app) => app.packageDir === "apps/admin",
      );
      const project = raw.workspace.projects.find(
        (item: { packageDir: string }) => item.packageDir === "apps/admin",
      );
      expect(admin?.discovered).toBe(true);
      expect(admin?.score).toBe(project.score);
      // With one application the per-app categories must equal the scanner's
      // own pooled categories, which proves the moved calculation.
      expect(
        admin?.categories?.map(({ id, applicable, percentage }) => ({
          id,
          applicable,
          percentage,
        })),
      ).toEqual(
        raw.categories.map(
          ({
            id,
            applicable,
            percentage,
          }: {
            id: string;
            applicable: boolean;
            percentage: number | null;
          }) => ({ id, applicable, percentage }),
        ),
      );
      const failing = (raw.findings as Finding[])
        .filter(
          (finding) =>
            finding.packageDir === "apps/admin" && finding.status === "fail",
        )
        .map((finding) => finding.id)
        .sort();
      expect(failing.length).toBeGreaterThan(0);
      expect(admin?.failingRules).toEqual(failing);
      const markdown = readFileSync(
        path.join(output, "shadscan.summary.md"),
        "utf8",
      );
      for (const rule of failing) expect(markdown).toContain(rule);
      expect(markdown).not.toMatch(/floor|classification/i);
    });

    it("lists every expected application and marks an undiscovered one as not discovered", async () => {
      const output = path.join(root, "discovery");
      expect(
        await main(["--output", output], {
          root: workspace,
          scanner: recordedScanner(),
          ...capture(),
        }),
      ).toBe(0);
      const summary: Summary = JSON.parse(
        readFileSync(path.join(output, "shadscan.summary.json"), "utf8"),
      );
      expect(summary.applications.map((app) => app.packageDir)).toEqual(
        EXPECTED_APPLICATIONS,
      );
      const donor = summary.applications.find(
        (app) => app.packageDir === "apps/donor",
      );
      expect(donor).toMatchObject({ discovered: false });
      expect(
        readFileSync(path.join(output, "shadscan.summary.md"), "utf8"),
      ).toMatch(/apps\/donor \| not discovered/);
    });
  });

  it.each([
    ["invalid JSON", "process.stdout.write('not json');"],
    [
      "a schema mismatch",
      "process.stdout.write(JSON.stringify({ schemaVersion: 8, findings: [] }));",
    ],
    ["a scanner failure", "process.stderr.write('boom'); process.exit(3);"],
  ])("exits non-zero and writes no summary on %s", async (_name, source) => {
    const output = path.join(root, `bad-${_name.replaceAll(" ", "-")}`);
    const out = capture();
    const code = await main(["--output", output], {
      root: workspace,
      scanner: fakeScanner(`scanner-${_name.replaceAll(" ", "-")}`, source),
      ...out,
    });
    expect(code).not.toBe(0);
    expect(out.lines.join("\n")).toMatch(/Shadscan/);
    expect(existsSync(path.join(output, "shadscan.summary.json"))).toBe(false);
  });

  it("exits non-zero when the scanner does not finish in time", async () => {
    const out = capture();
    const code = await main(["--output", path.join(root, "slow")], {
      root: workspace,
      scanner: fakeScanner("slow-scanner", "setTimeout(() => {}, 60_000);"),
      timeoutMs: 500,
      ...out,
    });
    expect(code).not.toBe(0);
    expect(out.lines.join("\n")).toMatch(/did not finish/);
  });

  it("exits non-zero unless the declared and installed scanner versions match exactly", async () => {
    expect(() => validateInstalledVersion("0.17.0", "0.17.0")).not.toThrow();
    expect(() => validateInstalledVersion("^0.17.0", "0.17.0")).toThrow(
      /match exactly/,
    );
    expect(() => validateInstalledVersion("0.17.0", "0.1.1")).toThrow(
      /match exactly/,
    );
    const out = capture();
    const code = await main(["--output", path.join(root, "version")], {
      root: workspace,
      scanner: { ...scanner(), declaredVersion: "^0.17.0" },
      ...out,
    });
    expect(code).not.toBe(0);
    expect(out.lines.join("\n")).toMatch(/match exactly/);
  });

  it("keeps reporting tokens and Node injection options out of the scanner process", async () => {
    const environment = {
      PATH: "/test/bin",
      CI: "1",
      GH_TOKEN: "test-gh",
      GITHUB_TOKEN: "test-github",
      NODE_OPTIONS: "--import=/test/hook.mjs",
    };
    expect(scannerEnvironment(environment)).toEqual({
      PATH: "/test/bin",
      CI: "1",
    });
    expect(environment.GH_TOKEN).toBe("test-gh");

    const seen = path.join(root, "seen-environment.json");
    const code = await main(["--output", path.join(root, "environment")], {
      root: workspace,
      environment: { ...process.env, ...environment, PATH: process.env.PATH },
      scanner: fakeScanner(
        "environment-scanner",
        `import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(seen)}, JSON.stringify(Object.keys(process.env)));
process.stdout.write("not json");`,
      ),
      ...capture(),
    });
    expect(code).not.toBe(0);
    const names: string[] = JSON.parse(readFileSync(seen, "utf8"));
    expect(names).toContain("CI");
    for (const name of ["GH_TOKEN", "GITHUB_TOKEN", "NODE_OPTIONS"])
      expect(names).not.toContain(name);
  });
});

describe("Shadscan advisory summary", () => {
  it("computes category percentages from scored pass and fail findings only", () => {
    const findings = [
      { category: "forms", status: "pass", score: 2, maxScore: 2 },
      { category: "forms", status: "fail", score: 0, maxScore: 2 },
      { category: "forms", status: "advisory", score: 3, maxScore: 3 },
      { category: "forms", status: "not-applicable", score: 0, maxScore: 0 },
    ];
    const forms = categoryScores(findings).find(
      (category: { id: string }) => category.id === "forms",
    );
    expect(forms).toMatchObject({
      id: "forms",
      applicable: true,
      percentage: 50,
    });
    expect(
      categoryScores(findings).find(
        (category: { id: string }) => category.id === "states",
      ),
    ).toMatchObject({ applicable: false, percentage: null });
  });

  it("renders an unassessed category as n/a rather than zero", () => {
    const markdown = renderSummary({
      engineVersion: "0.17.0",
      rulesetVersion: "2026.08.46",
      score: 40,
      coverage: { source: "complete" },
      applications: [
        {
          packageDir: "apps/admin",
          discovered: true,
          score: 40,
          categories: categoryScores([]),
          failingRules: [],
        },
      ],
      libraries: [],
    });
    expect(markdown).toContain("| apps/admin | 40 | n/a |");
  });
});
