#!/usr/bin/env bun

import { getTwentyCrmHealth } from "../../packages/api/src/crm/health";

const health = await getTwentyCrmHealth({
  env: {
    TWENTY_API_KEY: process.env.TWENTY_API_KEY,
    TWENTY_API_URL: process.env.TWENTY_API_URL,
    TWENTY_RATE_LIMIT_RPM: process.env.TWENTY_RATE_LIMIT_RPM,
    TWENTY_WEBHOOK_SECRET: process.env.TWENTY_WEBHOOK_SECRET,
    TWENTY_WORKSPACE_ID: process.env.TWENTY_WORKSPACE_ID,
  },
});

console.log(JSON.stringify(health, null, 2));

if (!health.ok) {
  process.exit(1);
}
