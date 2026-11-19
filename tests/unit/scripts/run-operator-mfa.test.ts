// AL-2675 (WP2c, part 1): the runner of the operators' second-factor proof
// reads the stack's values from `supabase status`, refuses a stack that is
// not on this machine, and makes the suite fail rather than skip.
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  SUITE,
  operatorMfaEnvFromStatus,
  statusArguments,
} from "../../../scripts/e2e/run-operator-mfa.mjs";

const STATUS = [
  'API_URL="http://127.0.0.1:26321"',
  'ANON_KEY="anon-fixture"',
  'SERVICE_ROLE_KEY="service-fixture"',
  'DB_URL="postgresql://postgres:postgres@127.0.0.1:26322/postgres"',
  'MAILPIT_URL="http://127.0.0.1:26324"',
].join("\n");

describe("run-operator-mfa", () => {
  it("hands the suite the stack's values and requires them", () => {
    expect(operatorMfaEnvFromStatus(STATUS)).toEqual({
      OPERATOR_MFA_API_URL: "http://127.0.0.1:26321",
      OPERATOR_MFA_ANON_KEY: "anon-fixture",
      OPERATOR_MFA_SERVICE_KEY: "service-fixture",
      OPERATOR_MFA_DB_URL:
        "postgresql://postgres:postgres@127.0.0.1:26322/postgres",
      OPERATOR_MFA_REQUIRED: "1",
    });
  });

  it("reads a stack started with --workdir", () => {
    expect(
      statusArguments({ OPERATOR_MFA_SUPABASE_WORKDIR: "/tmp/slot" }),
    ).toEqual(["status", "-o", "env", "--workdir", "/tmp/slot"]);
    expect(statusArguments({})).toEqual(["status", "-o", "env"]);
  });

  it.each([
    ["a missing value", STATUS.replace(/^DB_URL=.*$/m, "")],
    [
      "a hosted API",
      STATUS.replace("127.0.0.1:26321", "abcdefghijklmnopqrst.supabase.co"),
    ],
    [
      "a hosted database",
      STATUS.replace(
        "127.0.0.1:26322",
        "db.abcdefghijklmnopqrst.supabase.co:5432",
      ),
    ],
    [
      "a database address with a routing override",
      STATUS.replace('/postgres"', '/postgres?host=db.example.com"'),
    ],
  ])("refuses %s, naming no value", (_what, status) => {
    let message = "";
    try {
      operatorMfaEnvFromStatus(status);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toBe("");
    expect(message).not.toContain("fixture");
  });

  it("runs the suite that fails without the values, and the suite is not one CI's migrate job picks up", () => {
    expect(SUITE).toBe(
      "tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts",
    );
    expect(SUITE).not.toMatch(/\.realstack\.acceptance\.test\.ts$/);
    const suite = readFileSync(SUITE, "utf8");
    expect(suite).toContain('process.env.OPERATOR_MFA_REQUIRED === "1"');
    expect(suite).toMatch(/it\.runIf\(REQUIRED && !READY\)/);
  });

  it("is run by the Local Supabase Stack workflow after the stack starts", () => {
    const workflow = readFileSync(
      ".github/workflows/local-supabase.yml",
      "utf8",
    );
    const start = workflow.indexOf("- name: Start the local Supabase stack");
    const proof = workflow.indexOf(
      "run: node scripts/e2e/run-operator-mfa.mjs",
    );
    expect(start).toBeGreaterThan(0);
    const mail = workflow.indexOf("run: bun run test:e2e:auth-mail");
    expect(mail).toBeGreaterThan(start);
    expect(proof).toBeGreaterThan(mail);
    for (const path of [
      "scripts/e2e/run-operator-mfa.mjs",
      "scripts/platform/**",
      "packages/api/src/shared/platform-operator.ts",
      "tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts",
    ])
      expect(workflow).toContain(`- ${path}`);
  });
});
