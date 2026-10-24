/**
 * #2225 acceptance, C5: tests/unit/packages/api/stripe-event-store.test.ts
 * (spec r2 §4 criteria 8, 9). The digest test runs against mutated sha256Hex;
 * the literal was computed with coreutils, hashlib and openssl.
 */
import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { STRIPE, loadSpec, read, runOne, sha256 } from "./harness";
import * as store from "../../../../packages/api/src/stripe/event-store";

const TITLE = "sha256Hex returns the standard SHA-256 hex digest";
const DIGEST =
  "40993c639ffb5f13a0a2ef5c93c965f10b405f2b87a379272381da2dbc158dfa";
const hash = (alg: string, s: string, enc: "hex" | "base64" = "hex") =>
  createHash(alg).update(s).digest(enc);
const using = (sha256Hex: (s: string) => string) => ({
  modules: { "src/stripe/event-store": { ...store, sha256Hex } },
});

describe("#2225 C5 Stripe digest", () => {
  it("criterion 8: the retitled test pins the full literal and passes", async () => {
    expect(read(STRIPE)).toContain(`"${DIGEST}"`);
    const r = await runOne(
      STRIPE,
      new RegExp(`^${TITLE}$`),
      using(store.sha256Hex),
    );
    expect(r.outcome, r.error).toBe("passed");
  });

  it.each([
    ["sha1", (s: string) => hash("sha1", s)],
    ["base64", (s: string) => hash("sha256", s, "base64")],
    ["re-serialized input", (s: string) => hash("sha256", JSON.stringify(s))],
    ["truncated input", (s: string) => hash("sha256", s.slice(0, -1))],
    ["constant hex", () => "0".repeat(64)],
  ])("criterion 8: a %s sha256Hex fails the digest test", async (_n, fn) => {
    expect((await runOne(STRIPE, 0, using(fn))).outcome).toBe("failed");
  });

  it("criterion 8: 3 tests, no title mentions storage or signatures", () => {
    const titles = loadSpec(STRIPE, using(store.sha256Hex)).tests.map(
      (t) => t.title,
    );
    expect(titles).toHaveLength(3);
    for (const t of titles) expect(t).not.toMatch(/stor|signature/i);
  });

  it("criterion 9 (guard): the other two tests are byte-identical", () => {
    const src = read(STRIPE);
    const tail = src.slice(src.indexOf('  it("resolves tenant'));
    expect(sha256(tail)).toBe(
      "747f01adbb235c705e2b169345fe6eea50bb9a3f2530514911cd738de923b6a5",
    );
  });
});
