import { describe, expect, it } from "vitest";

import { dispatchRecoveryScan } from "../../../../../packages/api/src/workflows/functions/dispatch-recovery-scan";
import { donationSagaRecoveryScan } from "../../../../../packages/api/src/workflows/functions/donation-saga-recovery";
import { moneySchedule } from "../../../../../packages/api/src/workflows/functions/money-schedule";
import { stripeEventRecoveryScan } from "../../../../../packages/api/src/workflows/functions/stripe-event-processing";

const INNGEST_FREE_MONTHLY_EXECUTIONS = 50_000;
const MINUTES_IN_31_DAYS = 31 * 24 * 60;

type CronTrigger = { cron: string };

function getSingleCronTrigger(
  triggers: ReadonlyArray<unknown> | undefined,
): string {
  const crons = (triggers ?? []).filter(
    (trigger): trigger is CronTrigger =>
      typeof trigger === "object" &&
      trigger !== null &&
      "cron" in trigger &&
      typeof (trigger as { cron?: unknown }).cron === "string",
  );
  expect(crons).toHaveLength(1);
  return crons[0]!.cron;
}

function runsPer31Days(cron: string): number {
  const everyNMinutes = /^\*\/(\d+) \* \* \* \*$/.exec(cron);
  if (everyNMinutes) {
    const minutes = Number(everyNMinutes[1]);
    expect(minutes).toBeGreaterThan(0);
    return Math.floor(MINUTES_IN_31_DAYS / minutes);
  }
  const hourly = /^\d+ \* \* \* \*$/.exec(cron);
  if (hourly) {
    return 31 * 24;
  }
  throw new Error(`Unsupported recovery cron expression in test: ${cron}`);
}

describe("workflow recovery cron cadence (free-tier execution budget)", () => {
  // Inngest counts both the initial function run and each step.run() call:
  // executions = runs * (steps + 1).
  const scans = [
    {
      name: "workflow-dispatch-recovery-scan",
      fn: dispatchRecoveryScan,
      stepsPerRun: 1,
    },
    {
      name: "donation-saga-recovery-scan",
      fn: donationSagaRecoveryScan,
      stepsPerRun: 1,
    },
    {
      name: "stripe-event-recovery-scan",
      fn: stripeEventRecoveryScan,
      stepsPerRun: 2,
    },
    {
      name: "money-schedule",
      fn: moneySchedule,
      stepsPerRun: 0,
    },
  ] as const;

  it("uses the pre-launch 30-minute cadence on all four scheduled functions (D-18, AL-2681 PR 2a: the money schedule joins the three recovery scans, one execution a run)", () => {
    for (const scan of scans) {
      const cron = getSingleCronTrigger(scan.fn.opts.triggers);
      expect(cron, scan.name).toBe("*/30 * * * *");
    }
  });

  it("keeps the combined 31-day scheduled baseline well below Inngest's 50,000 free-plan cap (D-18, AL-2681 PR 2a: 1,488 more executions, 11,904 in all)", () => {
    const totalExecutions = scans.reduce((sum, scan) => {
      const cron = getSingleCronTrigger(scan.fn.opts.triggers);
      return sum + runsPer31Days(cron) * (scan.stepsPerRun + 1);
    }, 0);

    expect(totalExecutions).toBe(11_904);
    expect(totalExecutions).toBeLessThanOrEqual(15_000);
    expect(totalExecutions).toBeLessThan(INNGEST_FREE_MONTHLY_EXECUTIONS);
  });
});
