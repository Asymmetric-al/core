import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "../../..");

/** The route folder of the reset step in each product app. */
const RESET_ROUTES = [
  ["admin", "apps/admin/app/(auth)/forgot-password/reset"],
  ["donor", "apps/donor/app/(auth)/forgot-password/reset"],
  ["missionary", "apps/missionary/app/forgot-password/reset"],
] as const;

// AL-2673: the reset page reads the recovery session per request
// (`readPasswordRecovery` awaits `connection()`), so it streams. A person
// reaches it by a client navigation from the request step, and a boundary
// higher up, such as the group's `loading.tsx`, is already revealed by then:
// React keeps the old page and waits, and Next.js reports the route as
// blocking ("uncached data ... outside of <Suspense>"). The route needs a
// boundary of its own.
describe("the reset-password route streams behind its own boundary", () => {
  it.each(RESET_ROUTES)(
    "%s reads the recovery session in the page",
    (_app, dir) => {
      const page = readFileSync(join(REPO_ROOT, dir, "page.tsx"), "utf8");
      expect(page).toContain("await readPasswordRecovery()");
    },
  );

  it.each(RESET_ROUTES)(
    "%s has a loading boundary in the route's own folder",
    (_app, dir) => {
      const file = join(REPO_ROOT, dir, "loading.tsx");
      expect(existsSync(file), `${dir}/loading.tsx`).toBe(true);
      const loading = readFileSync(file, "utf8");
      expect(loading).toMatch(/export default function \w+\(\)/);
      expect(loading).toContain(
        '<AuthScreenSkeleton label="Loading password reset" />',
      );
    },
  );
});
