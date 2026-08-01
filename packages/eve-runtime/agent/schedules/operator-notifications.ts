import { defineSchedule } from "eve/schedules";

import { runEveNotificationSweep } from "../../src/notifications/sweep";

export default defineSchedule({
  cron: "* * * * *",
  run({ waitUntil }) {
    waitUntil(runEveNotificationSweep());
  },
});
