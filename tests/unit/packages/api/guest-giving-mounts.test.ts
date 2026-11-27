import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { STAFF_EXEMPT_PATHS } from "../../../../packages/auth/front";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(path.join(ROOT, dir))) {
    if (name === "node_modules" || name === ".next") continue;
    const rel = path.join(dir, name);
    if (statSync(path.join(ROOT, rel)).isDirectory())
      out.push(...sourceFiles(rel));
    else if (/\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

describe("AL-2681 PR 2a: what is mounted and what is not", () => {
  it("the payment-event destination is a thin admin route, exempt from the staff front door, admitted as a signed route and rewritten like the other webhooks", () => {
    const route = "apps/admin/app/api/webhooks/stripe-payment-events/route.ts";
    expect(read(route).trim()).toBe(
      'export { POST } from "@asym/api/stripe/payment-events-webhook";',
    );
    expect(STAFF_EXEMPT_PATHS).toContain("/api/webhooks/stripe-payment-events");
    expect(read("packages/auth/mutation-admission.ts")).toContain(
      '"/api/webhooks/stripe-payment-events"',
    );
    const vercel = JSON.parse(read("apps/admin/vercel.json")) as {
      rewrites: Array<{ source: string; destination: string }>;
    };
    expect(vercel.rewrites).toContainEqual({
      source: "/api/webhooks/stripe-payment-events",
      destination: "/admin/api/webhooks/stripe-payment-events",
    });
  });

  it("the config read's route is mounted on the donor app; the guest intake handler is mounted nowhere until 2b", () => {
    expect(read("apps/donor/app/api/checkout/config/route.ts").trim()).toBe(
      'export { POST } from "@asym/api/donate/guest/config-route";',
    );
    const mounts = [...sourceFiles("apps")].filter((file) =>
      /guest\/intake-handler|createGuestIntakeHandler|begin_line_gift/.test(
        read(file),
      ),
    );
    expect(mounts).toEqual([]);
    expect(
      existsSync(path.join(ROOT, "apps/donor/app/api/donate/route.ts")),
    ).toBe(true);
    expect(read("apps/donor/app/api/donate/route.ts")).not.toMatch(
      /guest\/intake-handler/,
    );
  });

  it("the money schedule is served once, beside the existing functions", () => {
    const serve = read("packages/api/src/workflows/serve.ts");
    expect(serve.match(/\bmoneySchedule\b/g)).toHaveLength(2);
    expect(serve).toContain(
      'import { moneySchedule } from "./functions/money-schedule";',
    );
  });
});
