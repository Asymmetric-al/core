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
      "docs/features/donor-development/grill/d7-evidence/source-probe/completion-replay.test.ts",
      "tests/unit/packages/api/crm-identity-concepts.test.ts",
      "tests/unit/packages/api/crm-command-log.test.ts",
      "tests/unit/packages/api/admin/crm-query.test.ts",
    ],
    maxWorkers: 2,
    fileParallelism: false,
  },
};
