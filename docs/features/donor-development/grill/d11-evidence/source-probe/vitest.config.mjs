import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { pinWorkspacePackages } from "../../../../../../vitest.pin-workspace-packages.ts";
import { perImporterAtAlias } from "../../../../../../vitest.per-importer-alias.ts";

const root = fileURLToPath(new URL("../../../../../../", import.meta.url));
export default {
  root,
  plugins: [pinWorkspacePackages(root), perImporterAtAlias(root), react()],
  test: {
    environment: "node",
    setupFiles: ["tests/setup/unit-env.ts"],
    env: {
      SKIP_ENV_VALIDATION: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    },
    include: ["tests/unit/packages/ui/searchable-select.test.tsx"],
    clearMocks: true,
    testTimeout: 60000,
    hookTimeout: 120000,
    maxWorkers: 1,
    fileParallelism: false,
  },
};
