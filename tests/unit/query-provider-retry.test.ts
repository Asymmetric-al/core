import { describe, expect, it } from "vitest";

import { getQueryClient } from "../../packages/database/providers/query-provider";

type RetryFunction = (failureCount: number, error: unknown) => boolean;

function getRetryFunction(): RetryFunction {
  const retry = getQueryClient().getDefaultOptions().queries?.retry;
  if (typeof retry !== "function") {
    throw new Error("Expected queries.retry to be a function.");
  }
  return retry as RetryFunction;
}

describe("query provider retry policy", () => {
  const retry = getRetryFunction();

  it("does not retry auth status codes", () => {
    expect(retry(0, { status: 401 })).toBe(false);
    expect(retry(0, { response: { status: 403 } })).toBe(false);
  });

  it("does not retry PostgREST JWT auth error codes", () => {
    expect(retry(0, { code: "PGRST301" })).toBe(false);
    expect(retry(0, { code: "PGRST302" })).toBe(false);
    expect(retry(0, { code: "PGRST303" })).toBe(false);
  });

  it("does not retry nested auth errors", () => {
    expect(retry(0, { cause: { code: "PGRST302" } })).toBe(false);
    expect(retry(0, { error: { code: "PGRST301" } })).toBe(false);
  });

  it("retries unknown errors up to three failures", () => {
    expect(retry(0, new Error("network down"))).toBe(true);
    expect(retry(2, new Error("network down"))).toBe(true);
    expect(retry(3, new Error("network down"))).toBe(false);
  });
});
