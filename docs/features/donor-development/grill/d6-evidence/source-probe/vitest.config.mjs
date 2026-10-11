import { fileURLToPath } from "node:url";

export default {
  root: fileURLToPath(new URL("../../../../../../", import.meta.url)),
  test: {
    environment: "node",
    setupFiles: ["tests/setup/unit-env.ts"],
    env: {
      SKIP_ENV_VALIDATION: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    },
    include: [
      "docs/features/donor-development/grill/d6-evidence/source-probe/service-mechanics.test.ts",
      "tests/unit/packages/api/admin/mission-control-tasks.test.ts",
      "tests/unit/supabase/mission-control-tasks-migration.test.ts",
      "tests/unit/packages/api/admin/contribution-approval-notifications.test.ts",
    ],
    maxWorkers: 2,
    fileParallelism: false,
  },
};
