import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy as adminProxy } from "../../../../apps/admin/proxy";
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
  it("the payment-event destination is a thin admin route, exempt from the staff front door, admitted as a signed route and rewritten like the other webhooks (AL-2681 PR 2b, issue 2857 item 39: the admission is an originless POST through the admin proxy, not a text in a file)", async () => {
    const route = "apps/admin/app/api/webhooks/stripe-payment-events/route.ts";
    expect(read(route).trim()).toBe(
      'export { POST } from "@asym/api/stripe/payment-events-webhook";',
    );
    expect(STAFF_EXEMPT_PATHS).toContain("/api/webhooks/stripe-payment-events");
    const admitted = await adminProxy(
      new NextRequest(
        "https://admin.asymmetric.al/api/webhooks/stripe-payment-events",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        },
      ),
    );
    expect(admitted.headers.get("x-middleware-next")).toBe("1");
    const vercel = JSON.parse(read("apps/admin/vercel.json")) as {
      rewrites: Array<{ source: string; destination: string }>;
    };
    expect(vercel.rewrites).toContainEqual({
      source: "/api/webhooks/stripe-payment-events",
      destination: "/admin/api/webhooks/stripe-payment-events",
    });
  });

  it("the config read's route and the intake route are mounted on the donor app; the intake handler is mounted nowhere else (D-18, AL-2681 PR 2b: POST /api/donate is the guest intake)", () => {
    expect(read("apps/donor/app/api/checkout/config/route.ts").trim()).toBe(
      'export { POST } from "@asym/api/donate/guest/config-route";',
    );
    expect(read("apps/donor/app/api/donate/route.ts").trim()).toBe(
      'export { POST } from "@asym/api/donate/guest/intake-route";',
    );
    const mounts = [...sourceFiles("apps")].filter((file) =>
      /guest\/intake-(handler|route)|createGuestIntakeHandler|begin_line_gift/.test(
        read(file),
      ),
    );
    expect(mounts).toEqual(["apps/donor/app/api/donate/route.ts"]);
  });

  it("the money schedule is served once, beside the existing functions (AL-2681 PR 2b, issue 2857 item 39: the array handed to serve lists it exactly once as an element)", () => {
    const serve = read("packages/api/src/workflows/serve.ts");
    const list = /functions:\s*\[([^\]]*)\]/.exec(serve);
    expect(list).not.toBeNull();
    const elements = list![1]!
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    expect(elements.length).toBeGreaterThan(1);
    expect(elements.filter((entry) => entry === "moneySchedule")).toHaveLength(
      1,
    );
    expect(serve).toContain(
      'import { moneySchedule } from "./functions/money-schedule";',
    );
  });
});
