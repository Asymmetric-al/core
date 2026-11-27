import { describe, expect, it } from "vitest";

const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
] as const;

const untouchable = new Proxy(
  {},
  {
    get(_target, property) {
      throw new Error(`the handler read the request (${String(property)})`);
    },
  },
);

describe.each([
  ["/api/*", () => import("../../../../apps/donor/app/api/[...slug]/route")],
  ["/auth/*", () => import("../../../../apps/donor/app/auth/[...slug]/route")],
])(
  "a path under %s that no donor route serves answers a real 404",
  (_prefix, load) => {
    it.each(METHODS)(
      "%s: 404, no-store, no body, and reads nothing",
      async (method) => {
        const module = (await load()) as Record<
          string,
          (request: unknown, context: unknown) => Response | Promise<Response>
        >;
        expect(typeof module[method], method).toBe("function");
        const response = await module[method]!(untouchable, untouchable);
        expect(response.status).toBe(404);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(await response.text()).toBe("");
      },
    );
  },
);
