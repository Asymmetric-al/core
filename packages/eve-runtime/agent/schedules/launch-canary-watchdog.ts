import { defineSchedule } from "eve/schedules";

import { runEveLaunchCanaryWatchdog } from "../../src/launch/watchdog";

export default defineSchedule({
  cron: "* * * * *",
  run({ waitUntil }) {
    waitUntil(runEveLaunchCanaryWatchdog());
  },
});
