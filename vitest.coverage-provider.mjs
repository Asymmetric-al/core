import { promises as fs } from "node:fs";
import inspector from "node:inspector";
import path from "node:path";

const session = new inspector.Session();
let sessionStarted = false;
const coverageWarnings = [];

function formatError(error) {
  if (!error) {
    return "unknown error";
  }
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function warn(stage, error) {
  const message = `[vitest-coverage:${stage}] ${formatError(error)}`;
  coverageWarnings.push(message);
  console.warn(message);
}

function post(method, params) {
  return new Promise((resolve, reject) => {
    const callback = (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    };

    if (params === undefined) {
      session.post(method, callback);
      return;
    }

    session.post(method, params, callback);
  });
}

function isUserFileCoverage(entry) {
  return (
    typeof entry?.url === "string" &&
    entry.url.startsWith("file://") &&
    !entry.url.includes("/node_modules/")
  );
}

function summarizeCoverage(scripts) {
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (const script of scripts) {
    for (const fn of script?.functions ?? []) {
      totalFunctions += 1;
      const hasHits = (fn?.ranges ?? []).some(
        (range) => (range?.count ?? 0) > 0,
      );
      if (hasHits) {
        coveredFunctions += 1;
      }
    }
  }

  const functionCoverage =
    totalFunctions === 0
      ? 100
      : Number(((coveredFunctions / totalFunctions) * 100).toFixed(2));

  const unknownTotals = {
    total: 0,
    covered: 0,
    skipped: 0,
    pct: 100,
  };

  return {
    total: {
      lines: unknownTotals,
      statements: unknownTotals,
      branches: unknownTotals,
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        skipped: 0,
        pct: functionCoverage,
      },
    },
    meta: {
      totalScripts: scripts.length,
      provider: "custom-v8-raw",
      note: "Development fallback coverage provider; line/statement/branch totals are not computed.",
    },
  };
}

function cloneScript(script) {
  return {
    ...script,
    functions: Array.isArray(script?.functions)
      ? script.functions.map((fn) => ({
          ...fn,
          ranges: Array.isArray(fn?.ranges)
            ? fn.ranges.map((range) => ({ ...range }))
            : [],
        }))
      : [],
  };
}

function mergeFunctionRanges(existingRanges, nextRanges) {
  const merged = new Map();

  for (const range of existingRanges ?? []) {
    merged.set(`${range.startOffset}:${range.endOffset}`, { ...range });
  }

  for (const range of nextRanges ?? []) {
    const key = `${range.startOffset}:${range.endOffset}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...range });
      continue;
    }
    merged.set(key, {
      ...current,
      count: Math.max(current.count ?? 0, range.count ?? 0),
    });
  }

  return Array.from(merged.values());
}

function mergeScriptCoverage(existing, next) {
  const merged = cloneScript(existing);
  const nextCloned = cloneScript(next);
  const fnMap = new Map();

  for (const fn of merged.functions) {
    const firstRange = fn.ranges?.[0];
    const key = `${fn.functionName ?? ""}|${firstRange?.startOffset ?? -1}|${firstRange?.endOffset ?? -1}`;
    fnMap.set(key, fn);
  }

  for (const fn of nextCloned.functions) {
    const firstRange = fn.ranges?.[0];
    const key = `${fn.functionName ?? ""}|${firstRange?.startOffset ?? -1}|${firstRange?.endOffset ?? -1}`;
    const current = fnMap.get(key);
    if (!current) {
      fnMap.set(key, fn);
      continue;
    }
    current.ranges = mergeFunctionRanges(current.ranges, fn.ranges);
  }

  return {
    ...merged,
    ...nextCloned,
    functions: Array.from(fnMap.values()),
  };
}

class RawV8CoverageProvider {
  name = "custom-v8-raw";
  ctx = null;
  options = null;
  coverageByUrl = new Map();

  async initialize(ctx) {
    this.ctx = ctx;
    this.coverageByUrl = new Map();
    coverageWarnings.length = 0;
    const configuredCoverage = ctx.config.coverage ?? {};
    const reportsDirectory = path.resolve(
      ctx.config.root,
      configuredCoverage.reportsDirectory ?? "coverage",
    );

    this.options = {
      ...configuredCoverage,
      provider: "custom",
      reportsDirectory,
      enabled: configuredCoverage.enabled ?? true,
      clean: configuredCoverage.clean ?? true,
      cleanOnRerun: configuredCoverage.cleanOnRerun ?? true,
      reportOnFailure: configuredCoverage.reportOnFailure ?? false,
      allowExternal: configuredCoverage.allowExternal ?? false,
      processingConcurrency: configuredCoverage.processingConcurrency ?? 20,
      include: configuredCoverage.include ?? ["**"],
      exclude: configuredCoverage.exclude ?? [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/coverage/**",
      ],
      extension: configuredCoverage.extension ?? [
        ".js",
        ".cjs",
        ".mjs",
        ".ts",
        ".tsx",
        ".jsx",
        ".mts",
        ".cts",
      ],
      reporter: configuredCoverage.reporter ?? [
        ["json-summary", {}],
        ["text", {}],
      ],
    };
  }

  resolveOptions() {
    return this.options;
  }

  async clean(clean = true) {
    if (!this.options?.reportsDirectory) {
      return;
    }

    if (clean) {
      await fs.rm(this.options.reportsDirectory, {
        recursive: true,
        force: true,
      });
    }

    await fs.mkdir(this.options.reportsDirectory, { recursive: true });
    this.coverageByUrl = new Map();
  }

  onAfterSuiteRun(meta) {
    const result = meta?.coverage?.result;
    if (!Array.isArray(result)) {
      return;
    }

    for (const entry of result) {
      if (typeof entry?.url !== "string") {
        continue;
      }

      const previous = this.coverageByUrl.get(entry.url);
      if (!previous) {
        this.coverageByUrl.set(entry.url, cloneScript(entry));
        continue;
      }

      this.coverageByUrl.set(entry.url, mergeScriptCoverage(previous, entry));
    }
  }

  async generateCoverage() {
    return {
      generatedAt: new Date().toISOString(),
      scripts: Array.from(this.coverageByUrl.values()),
    };
  }

  async reportCoverage(coverage) {
    const reportsDirectory = this.options?.reportsDirectory ?? "coverage";
    const scripts = Array.isArray(coverage?.scripts) ? coverage.scripts : [];
    const summary = summarizeCoverage(scripts);

    await fs.mkdir(reportsDirectory, { recursive: true });
    await Promise.all([
      fs.writeFile(
        path.join(reportsDirectory, "coverage-summary.json"),
        JSON.stringify(summary, null, 2),
        "utf8",
      ),
      fs.writeFile(
        path.join(reportsDirectory, "v8-raw-coverage.json"),
        JSON.stringify(coverage, null, 2),
        "utf8",
      ),
      fs.writeFile(
        path.join(reportsDirectory, "coverage-final.json"),
        JSON.stringify(coverage, null, 2),
        "utf8",
      ),
      fs.writeFile(
        path.join(reportsDirectory, "coverage-warnings.log"),
        `${coverageWarnings.join("\n")}\n`,
        "utf8",
      ),
    ]);
  }

  async mergeReports(coverages) {
    const mergedScripts = [];
    for (const coverage of coverages ?? []) {
      if (Array.isArray(coverage?.scripts)) {
        mergedScripts.push(...coverage.scripts);
      }
    }

    await this.reportCoverage({
      generatedAt: new Date().toISOString(),
      scripts: mergedScripts,
    });
  }
}

async function startCoverage() {
  if (sessionStarted) {
    return;
  }

  try {
    session.connect();
    await post("Profiler.enable");
    await post("Profiler.startPreciseCoverage", {
      callCount: true,
      detailed: true,
    });
    sessionStarted = true;
  } catch (error) {
    warn("start", error);
    sessionStarted = false;
  }
}

async function takeCoverage() {
  if (!sessionStarted) {
    return { result: [] };
  }

  try {
    const data = await post("Profiler.takePreciseCoverage");
    const result = Array.isArray(data?.result)
      ? data.result.filter(isUserFileCoverage)
      : [];
    return { result };
  } catch (error) {
    warn("take", error);
    return { result: [] };
  }
}

async function stopCoverage() {
  if (!sessionStarted) {
    return;
  }

  try {
    await post("Profiler.stopPreciseCoverage");
    await post("Profiler.disable");
  } catch (error) {
    warn("stop", error);
  } finally {
    try {
      session.disconnect();
    } catch (error) {
      warn("disconnect", error);
    }
    sessionStarted = false;
  }
}

export default {
  getProvider() {
    return new RawV8CoverageProvider();
  },
  startCoverage,
  takeCoverage,
  stopCoverage,
};
