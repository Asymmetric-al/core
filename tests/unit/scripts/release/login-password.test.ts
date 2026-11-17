// Council round 2, A5 (record D-24): the hosted rebuild gives seeded logins a
// password from the release environment, sent to the server only as a
// verifier Supabase Auth accepts.
import { argon2Sync } from "node:crypto";

import { describe, expect, it } from "vitest";

import { publishedLoginPasswords } from "../../../../scripts/lib/published-passwords.mjs";
import {
  ARGON2ID_PARAMETERS,
  argon2idVerifier,
  assertLoginPassword,
} from "../../../../scripts/release/lib/login-password.mjs";

/** supabase/auth internal/crypto/password.go, argon2HashRegexp. */
const GOTRUE_ARGON2 =
  /^[$](?<alg>argon2(d|i|id))[$]v=(?<v>(16|19))[$]m=(?<m>[0-9]+),t=(?<t>[0-9]+),p=(?<p>[0-9]+)(,keyid=(?<keyid>[^,$]+))?(,data=(?<data>[^$]+))?[$](?<salt>[^$]*)[$](?<hash>.*)$/;
const password = "Correct-Horse-Battery-Staple-0123456789";

describe("argon2idVerifier", () => {
  it("writes an Argon2id PHC string inside Supabase Auth's accepted bounds", () => {
    const verifier = argon2idVerifier(password);
    const m = GOTRUE_ARGON2.exec(verifier)?.groups;
    expect(m, verifier).toBeDefined();
    // Supabase Auth accepts argon2i and argon2id, version 19 only, with
    // m <= 1 GiB, t <= 20 and p <= 16, and no keyid or data.
    expect(m!.alg).toBe("argon2id");
    expect(m!.v).toBe("19");
    expect(Number(m!.m)).toBeLessThanOrEqual(1024 * 1024);
    expect(Number(m!.t)).toBeLessThanOrEqual(20);
    expect(Number(m!.p)).toBeLessThanOrEqual(16);
    expect(m!.keyid).toBeUndefined();
    expect(m!.data).toBeUndefined();
    // Unpadded standard base64, as Go's RawStdEncoding decodes it.
    for (const part of [m!.salt!, m!.hash!])
      expect(part).toMatch(/^[A-Za-z0-9+/]+$/);
    expect(verifier).not.toContain(password);
  });

  it("verifies the password it was made from, and no other", () => {
    const verifier = argon2idVerifier(password);
    const m = GOTRUE_ARGON2.exec(verifier)!.groups!;
    const derive = (message: string) =>
      argon2Sync("argon2id", {
        message,
        nonce: Buffer.from(m.salt!, "base64"),
        memory: Number(m.m),
        passes: Number(m.t),
        parallelism: Number(m.p),
        tagLength: Buffer.from(m.hash!, "base64").length,
      }).toString("base64");
    const stored = Buffer.from(m.hash!, "base64").toString("base64");
    expect(derive(password)).toBe(stored);
    expect(derive(`${password}x`)).not.toBe(stored);
    expect(Buffer.from(m.hash!, "base64")).toHaveLength(
      ARGON2ID_PARAMETERS.tagLength,
    );
  });

  it("salts each verifier afresh", () => {
    expect(argon2idVerifier(password)).not.toBe(argon2idVerifier(password));
  });
});

describe("assertLoginPassword", () => {
  it.each([
    undefined,
    "",
    "short",
    "x".repeat(31),
    "x".repeat(73),
    `${"x".repeat(30)} spaced`,
    `${"x".repeat(31)}é`,
  ])("refuses %j", (value) => {
    expect(() => assertLoginPassword(value, "THE_SECRET")).toThrow(
      /THE_SECRET must be 32 to 72 printable ASCII characters/,
    );
  });

  it("accepts 32 to 72 printable ASCII characters", () => {
    expect(() => assertLoginPassword("x".repeat(32), "S")).not.toThrow();
    expect(() => assertLoginPassword("~".repeat(72), "S")).not.toThrow();
  });
});

describe("publishedLoginPasswords", () => {
  it("lists the passwords supabase/seed.sql hashes for its logins", () => {
    expect(publishedLoginPasswords()).toEqual(["demo-password"]);
  });
});
