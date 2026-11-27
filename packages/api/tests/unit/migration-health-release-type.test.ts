import { expectTypeOf, it } from "vitest";

import type { MigrationHealthDeps } from "../../src/health/migrations";

it("the release reader's declared return names the switch state the default reader reports", () => {
  expectTypeOf<ReturnType<MigrationHealthDeps["readRelease"]>>().toHaveProperty(
    "serveUnderPaths",
  );
});
