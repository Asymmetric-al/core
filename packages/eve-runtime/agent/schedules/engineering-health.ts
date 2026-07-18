import { defineSchedule } from "eve/schedules";

import { runEveEngineeringMonitorSweep } from "../../src/monitors/sweep";

export default defineSchedule({
  cron: "*/5 * * * *",
  run({ waitUntil }) {
    waitUntil(runEveEngineeringMonitorSweep());
  },
});
