import { beforeAll, describe, expect, it } from "vitest";

type Rule = (args: {
  merged: Record<string, unknown>;
}) => Array<{ path: string }>;
let isSafeExternalHref: (href: string) => boolean;
let navigationItemsRule: Rule;

beforeAll(async () => {
  ({ isSafeExternalHref, navigationItemsRule } =
    (await import("../../../apps/admin/src/cms/tenancy/navigation-rules")) as unknown as {
      isSafeExternalHref: typeof isSafeExternalHref;
      navigationItemsRule: Rule;
    });
});

describe("test 7: a navigation item is one page of its Site or one absolute http(s) address with a host", () => {
  it.each(["https://x.test/a", "http://x.test", "HTTPS://x.test/a?b=c#d"])(
    "keeps %s",
    (href) => {
      expect(isSafeExternalHref(href)).toBe(true);
    },
  );

  it.each([
    "javascript:alert(1)",
    "data:text/html,x",
    "//x.test",
    "/a",
    "https:/x",
    "",
    " https://x.test",
    "https://x.test/a b",
    "https:\\\\x.test",
    "mailto:a@x.test",
    "ftp://x.test",
    "http://",
  ])("refuses %j", (href) => {
    expect(isSafeExternalHref(href)).toBe(false);
  });

  it("refuses both a page and an address, neither, and an empty address; keeps exactly one", () => {
    const paths = (items: unknown[]) =>
      navigationItemsRule({ merged: { items } }).map((item) => item.path);
    expect(paths([{ label: "a", page: "p", href: "https://x.test" }])).toEqual([
      "items.0",
    ]);
    expect(paths([{ label: "a" }])).toEqual(["items.0"]);
    expect(paths([{ label: "a", href: "" }])).toEqual(["items.0.href"]);
    expect(paths([{ label: "a", page: "p", href: null }])).toEqual([]);
    expect(paths([{ label: "a", href: "https://x.test" }])).toEqual([]);
  });
});

describe("F6: a row holds exactly one of page and href, and an href is a string that passes the safe-address rule", () => {
  const paths = (items: unknown[]) =>
    navigationItemsRule({ merged: { items } }).map((item) => item.path);

  it.each([12345, true, { url: "https://x.test" }, ["https://x.test"]])(
    "refuses a page beside an href of %j",
    (href) => {
      expect(paths([{ label: "a", page: "p", href }])).toEqual(["items.0"]);
    },
  );

  it.each([12345, true, { url: "https://x.test" }, ["https://x.test"]])(
    "refuses an href of %j on its own",
    (href) => {
      expect(paths([{ label: "a", href }])).toEqual(["items.0.href"]);
    },
  );
});
