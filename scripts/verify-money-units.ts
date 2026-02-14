import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type ColumnCheck = {
  table: string;
  columns: string[];
};

type Verdict = "YES" | "NO" | "INCONCLUSIVE" | "ERROR";

type Analysis = {
  verdict: Verdict;
  reason: string;
  sampleCount: number;
  min: number;
  median: number;
  max: number;
  decimals: number;
  nonHundredMultiples: number;
};

type TableFetchResult =
  | { ok: true; rows: Record<string, unknown>[] }
  | { ok: false; error: string };

const SAMPLE_SIZE = Number.parseInt(
  process.env.MONEY_UNIT_SAMPLE_SIZE ?? "200",
  10,
);

const MONEY_COLUMNS: ColumnCheck[] = [
  { table: "donations", columns: ["amount"] },
  { table: "donor_pledges", columns: ["amount"] },
  {
    table: "funds",
    columns: ["target_amount", "goal_amount", "current_amount"],
  },
];

function loadEnvFile(fileName: string) {
  const filePath = join(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.floor((sorted.length - 1) * p),
  );
  return sorted[index]!;
}

function analyze(values: number[]): Analysis {
  const sorted = [...values].sort((a, b) => a - b);
  const sampleCount = sorted.length;
  const decimals = sorted.filter((value) => !Number.isInteger(value)).length;
  const nonHundredMultiples = sorted.filter(
    (value) => Number.isInteger(value) && Math.abs(value % 100) !== 0,
  ).length;
  const min = sorted[0] ?? 0;
  const median = percentile(sorted, 0.5);
  const max = sorted[sorted.length - 1] ?? 0;
  const p90 = percentile(sorted, 0.9);

  if (sampleCount === 0) {
    return {
      verdict: "INCONCLUSIVE",
      reason: "No numeric values sampled.",
      sampleCount,
      min,
      median,
      max,
      decimals,
      nonHundredMultiples,
    };
  }

  if (decimals > 0) {
    return {
      verdict: "NO",
      reason: "Found decimal values; cents storage is usually integer-only.",
      sampleCount,
      min,
      median,
      max,
      decimals,
      nonHundredMultiples,
    };
  }

  if (nonHundredMultiples > 0) {
    return {
      verdict: "YES",
      reason:
        "Found integer values not divisible by 100 (e.g. 2599), which strongly suggests cents.",
      sampleCount,
      min,
      median,
      max,
      decimals,
      nonHundredMultiples,
    };
  }

  if (median >= 10_000 || p90 >= 10_000) {
    return {
      verdict: "YES",
      reason:
        "Values are large integers; this looks like cents entered in whole-dollar increments.",
      sampleCount,
      min,
      median,
      max,
      decimals,
      nonHundredMultiples,
    };
  }

  return {
    verdict: "INCONCLUSIVE",
    reason:
      "All sampled values are integer multiples of 100, which can represent whole-dollar values in either dollars or cents storage.",
    sampleCount,
    min,
    median,
    max,
    decimals,
    nonHundredMultiples,
  };
}

async function fetchRows(
  baseUrl: string,
  apiKey: string,
  table: string,
  columns: string[],
) {
  const url = new URL(
    `/rest/v1/${table}`,
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  );
  url.searchParams.set("select", columns.join(","));
  url.searchParams.set("limit", String(SAMPLE_SIZE));

  const response = await fetch(url, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} for ${table}: ${body}`);
  }

  return (await response.json()) as Record<string, unknown>[];
}

async function main() {
  // Bun loads env automatically in many setups, but this keeps behavior explicit.
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authKey = serviceRoleKey ?? anonKey;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!authKey) {
    throw new Error(
      "Missing auth key. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  console.log(`Checking money unit storage with sample size ${SAMPLE_SIZE}...`);
  console.log(
    `Auth key in use: ${serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY"}`,
  );
  console.log("");

  const rowsByTable = new Map<string, TableFetchResult>();
  const analyses: { table: string; column: string; analysis: Analysis }[] = [];

  for (const spec of MONEY_COLUMNS) {
    try {
      const rows = await fetchRows(
        supabaseUrl,
        authKey,
        spec.table,
        spec.columns,
      );
      rowsByTable.set(spec.table, { ok: true, rows });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      rowsByTable.set(spec.table, { ok: false, error: message });
    }
  }

  for (const spec of MONEY_COLUMNS) {
    const tableResult = rowsByTable.get(spec.table);
    for (const column of spec.columns) {
      if (!tableResult || !tableResult.ok) {
        analyses.push({
          table: spec.table,
          column,
          analysis: {
            verdict: "ERROR",
            reason: tableResult?.error ?? "Table was not fetched.",
            sampleCount: 0,
            min: 0,
            median: 0,
            max: 0,
            decimals: 0,
            nonHundredMultiples: 0,
          },
        });
        continue;
      }

      const values = tableResult.rows
        .map((row) => row[column])
        .filter(
          (value): value is number | string =>
            value !== null && value !== undefined,
        )
        .map((value) => (typeof value === "number" ? value : Number(value)))
        .filter((value) => Number.isFinite(value));

      analyses.push({
        table: spec.table,
        column,
        analysis: analyze(values),
      });
    }
  }

  for (const { table, column, analysis } of analyses) {
    console.log(
      `${table}.${column}: ${analysis.verdict} | samples=${analysis.sampleCount} | min=${analysis.min} median=${analysis.median} max=${analysis.max} | decimals=${analysis.decimals} nonHundredMultiples=${analysis.nonHundredMultiples}`,
    );
    console.log(`  -> ${analysis.reason}`);
  }

  console.log("");
  console.log("Interpretation:");
  console.log("- YES: sampled values look like integer cents.");
  console.log(
    "- NO: sampled values look like dollars (or mixed units), not cents.",
  );
  console.log(
    "- INCONCLUSIVE: data shape is ambiguous; verify with schema, migrations, or known transactions.",
  );
  console.log(
    "- ERROR: table/query could not be read with the current key or schema.",
  );

  const hardFailures = analyses.some((item) => item.analysis.verdict === "NO");
  if (hardFailures) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
