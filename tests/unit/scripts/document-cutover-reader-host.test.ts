/**
 * #2067 PR #2169 review r4334143546, Builder-owned: for a hosted target the
 * reader URL's host itself is checked, not only the project ref. Only
 * db.<ref>.supabase.co, or a Supabase pooler host
 * (aws-<n>-<region>.pooler.supabase.com) with the login
 * document_cutover_reader.<ref>, is accepted; everything else fails closed
 * before any client exists. Loopback behaviour is unchanged.
 */

import { describe, expect, it } from "vitest";

import { checkDatabaseUrl } from "../../../scripts/document-cutover/assess-document-cutover";

const REF = "readerhost2067ref";
const OTHER_REF = "otherhost2067ref";
/** Obviously fake, built at runtime; never a real credential. */
const PASSWORD = ["reader", "host", "2067", "not", "a", "pw"].join("-");
const HOSTED_ENV = { SUPABASE_URL: `https://${REF}.supabase.co` };

function check(login: string, hostAndPort: string, env = HOSTED_ENV) {
  return checkDatabaseUrl({
    ...env,
    DOCUMENT_CUTOVER_DATABASE_URL: `postgresql://${login}:${PASSWORD}@${hostAndPort}/postgres?sslmode=require`,
  });
}

const pooled = `document_cutover_reader.${REF}`;

describe("#2067 review r4334143546 — the hosted reader host is pinned", () => {
  it.each([
    [
      "an arbitrary host with the target's pooler login",
      pooled,
      "any-host.example:6543",
    ],
    [
      "db.<other ref>.supabase.co",
      "document_cutover_reader",
      `db.${OTHER_REF}.supabase.co:5432`,
    ],
    [
      "a lookalike db.<ref>.supabase.co.evil.example",
      pooled,
      `db.${REF}.supabase.co.evil.example:5432`,
    ],
    [
      "a lookalike pooler host with an extra label",
      pooled,
      "aws-0-us-east-1.pooler.supabase.com.evil.example:5432",
    ],
    [
      "a pooler host with an extra leading label",
      pooled,
      "x.aws-0-us-east-1.pooler.supabase.com:5432",
    ],
    ["the bare pooler domain", pooled, "pooler.supabase.com:5432"],
    [
      "the project API host instead of the database",
      pooled,
      `${REF}.supabase.co:5432`,
    ],
    [
      "a pooler host with a mismatched login ref",
      `document_cutover_reader.${OTHER_REF}`,
      "aws-0-us-east-1.pooler.supabase.com:5432",
    ],
    [
      "a pooler host with no login ref",
      "document_cutover_reader",
      "aws-0-us-east-1.pooler.supabase.com:5432",
    ],
  ])("%s is refused before any client exists", (_label, login, host) => {
    const result = check(login, host);
    expect(result).toHaveProperty("blocker");
    expect("blocker" in result ? result.blocker : "").toMatch(
      /^STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL does not match the SUPABASE_URL project/,
    );
  });

  it("an arbitrary host is refused for its host, even though the login ref matches", () => {
    const result = check(pooled, "any-host.example:6543");
    expect("blocker" in result ? result.blocker : "").toContain(
      `the host any-host.example is not db.${REF}.supabase.co or a Supabase pooler host`,
    );
  });

  it.each([
    [
      "the direct host db.<ref>.supabase.co",
      "document_cutover_reader",
      `db.${REF}.supabase.co:5432`,
    ],
    [
      "the direct host with the ref also in the login",
      pooled,
      `db.${REF}.supabase.co:6543`,
    ],
    [
      "the direct host in upper case",
      "document_cutover_reader",
      `DB.${REF.toUpperCase()}.SUPABASE.CO:5432`,
    ],
    [
      "the session pooler aws-0-<region>",
      pooled,
      "aws-0-us-east-1.pooler.supabase.com:5432",
    ],
    [
      "the pooler aws-1-<region>, transaction port",
      pooled,
      "aws-1-eu-west-2.pooler.supabase.com:6543",
    ],
  ])("%s is accepted", (_label, login, host) => {
    const result = check(login, host);
    expect(result).toHaveProperty("config");
  });

  it("loopback is unchanged: a loopback target with a loopback reader URL is accepted", () => {
    const result = checkDatabaseUrl({
      SUPABASE_URL: "http://127.0.0.1:54321",
      DOCUMENT_CUTOVER_DATABASE_URL: `postgresql://document_cutover_reader:${PASSWORD}@127.0.0.1:54322/postgres`,
    });
    expect(result).toHaveProperty("config");
  });
});
