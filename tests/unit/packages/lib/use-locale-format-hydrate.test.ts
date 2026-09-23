import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

interface LocaleFormatProbeTexts {
  dateOnly: string;
  hydrated: string;
  instantDate: string;
  instantDateTime: string;
  timeAgo: string;
  timeAgoDateOnly: string;
}

const workerPath = fileURLToPath(
  new URL("./locale-format-cross-tz-worker.ts", import.meta.url),
);

const UTC_SSR_TEXTS: LocaleFormatProbeTexts = {
  dateOnly: "1/5/2026",
  hydrated: "false",
  instantDate: "1/6/2026",
  instantDateTime: "1/6/2026, 5:00:00 AM",
  timeAgo: "Jan 6",
  timeAgoDateOnly: "Jan 5",
};

const LA_AFTER_HYDRATE: LocaleFormatProbeTexts = {
  dateOnly: "1/5/2026",
  hydrated: "true",
  instantDate: "1/5/2026",
  instantDateTime: "1/5/2026, 9:00:00 PM",
  timeAgo: "Jan 5",
  timeAgoDateOnly: "Jan 5",
};

interface SsrReport {
  html: string;
  resolvedTimeZone: string;
  texts: LocaleFormatProbeTexts;
  tz: string;
}

interface HydrateReport {
  afterTexts: LocaleFormatProbeTexts;
  initialTexts: LocaleFormatProbeTexts;
  recoverableErrors: string[];
  resolvedTimeZone: string;
  tz: string;
}

function parseJsonLine<T>(stdout: string, stderr: string, label: string): T {
  const line = stdout
    .trim()
    .split("\n")
    .filter((entry) => entry.startsWith("{"))
    .at(-1);
  if (!line) {
    throw new Error(
      `${label} produced no JSON\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }
  return JSON.parse(line) as T;
}

const repoRoot = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../..",
);

function runWorker(
  tz: string,
  args: string[],
  extraEnv: NodeJS.ProcessEnv = {},
) {
  const result = spawnSync("bun", [workerPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      ...extraEnv,
      NODE_PATH: path.join(repoRoot, "node_modules"),
      TZ: tz,
    },
  });

  if (result.status !== 0) {
    throw new Error(
      `worker ${args.join(" ")} TZ=${tz} exited ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }

  return result;
}

interface VisitorReport {
  dateOnly: string;
  dateOnlyExplicitLa: string;
  instantDate: string;
  instantDateTime: string;
  instantTime: string;
  resolvedTimeZone: string;
}

describe("date-only and visitor-instant formatters", () => {
  it("keeps YYYY-MM-DD on the calendar day while instants follow America/Los_Angeles", () => {
    const result = runWorker("UTC", ["--mode=visitor"]);
    const report = parseJsonLine<VisitorReport>(
      result.stdout,
      result.stderr,
      "visitor formatters",
    );

    expect(report.dateOnly).toBe("1/5/2026");
    expect(report.instantDate).toBe("1/5/2026");
    expect(report.instantDateTime).toBe("1/5/2026, 9:00:00 PM");
    expect(report.instantTime).toBe("9:00:00 PM");
    expect(report.dateOnlyExplicitLa).toBe("1/4/2026");
  });
});

describe("UTC SSR / America/Los_Angeles hydrate", () => {
  it("renders a UTC-stable snapshot even when the SSR host is Pacific", () => {
    const result = runWorker("America/Los_Angeles", ["--mode=ssr"]);
    const report = parseJsonLine<SsrReport>(
      result.stdout,
      result.stderr,
      "LA SSR",
    );

    expect(report.resolvedTimeZone).toBe("America/Los_Angeles");
    expect(report.texts).toEqual(UTC_SSR_TEXTS);
  });

  it("hydrates UTC markup in America/Los_Angeles without mismatch, then uses visitor instants", () => {
    const ssrResult = runWorker("UTC", ["--mode=ssr"]);
    const ssr = parseJsonLine<SsrReport>(
      ssrResult.stdout,
      ssrResult.stderr,
      "UTC SSR",
    );

    expect(ssr.resolvedTimeZone).toBe("UTC");
    expect(ssr.texts).toEqual(UTC_SSR_TEXTS);

    const hydrateResult = runWorker("America/Los_Angeles", ["--mode=hydrate"], {
      LOCALE_FORMAT_SSR_HTML: ssr.html,
    });
    const hydrate = parseJsonLine<HydrateReport>(
      hydrateResult.stdout,
      hydrateResult.stderr,
      "LA hydrate",
    );

    expect(hydrate.resolvedTimeZone).toBe("America/Los_Angeles");
    expect(hydrate.initialTexts).toEqual(UTC_SSR_TEXTS);
    expect(hydrate.recoverableErrors).toEqual([]);
    expect(hydrate.afterTexts).toEqual(LA_AFTER_HYDRATE);
  });
});
