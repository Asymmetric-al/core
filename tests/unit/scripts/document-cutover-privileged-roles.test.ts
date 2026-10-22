/**
 * #2067 PR #2169 review 6326220905 MAJOR-A, Builder-owned: the reader session
 * is rejected when it holds a privileged pg_* role, directly or through
 * inherited membership. A mocked `pg` driver answers the gate's identity
 * queries from a small role graph; the membership query only reports roles
 * the gate itself asks about, so a role missing from the gate's denylist is
 * never reported and its test fails.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runDocumentCutoverCommand } from "../../../scripts/document-cutover/assess-document-cutover";

const READER = "document_cutover_reader";

const fakePg = vi.hoisted(() => ({
  /** Direct memberships: role -> roles it is a member of. */
  memberOf: new Map<string, string[]>(),
  queries: [] as string[],
}));

vi.mock("pg", () => {
  /** Every role `role` belongs to, directly or through inheritance. */
  const closure = (role: string): Set<string> => {
    const seen = new Set<string>();
    const stack = [...(fakePg.memberOf.get(role) ?? [])];
    while (stack.length > 0) {
      const next = stack.pop() as string;
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(...(fakePg.memberOf.get(next) ?? []));
    }
    return seen;
  };

  class Client {
    on() {
      return this;
    }
    async connect() {}
    async query(text: string) {
      fakePg.queries.push(text);
      if (/\bsession_user\b/.test(text) && /\brolsuper\b/.test(text)) {
        return {
          rows: [
            {
              login_role: READER,
              active_role: READER,
              rolsuper: false,
              rolbypassrls: false,
            },
          ],
        };
      }
      if (/\bpg_has_role\b/.test(text)) {
        const asked = [
          ...(/rolname in \(([^)]*)\)/.exec(text)?.[1] ?? "").matchAll(
            /'([^']+)'/g,
          ),
        ].map((match) => match[1] as string);
        const held = closure(READER);
        return {
          rows: asked
            .filter((role) => held.has(role))
            .map((rolname) => ({ rolname })),
        };
      }
      if (/^set default_transaction_read_only/.test(text)) {
        return { rows: [] };
      }
      // Past the identity check: no further reads are served in this test.
      throw Object.assign(new Error("no target data in this test"), {
        code: "42501",
      });
    }
    async end() {}
  }
  const api = { Client };
  return { ...api, default: api };
});

/** Obviously fake, built at runtime; never a real credential. */
const PASSWORD = ["privileged", "roles", "2067", "not", "a", "pw"].join("-");

let output: string[] = [];

beforeEach(() => {
  fakePg.memberOf = new Map();
  fakePg.queries = [];
  output = [];
  const capture = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function assessAsReader(): Promise<{ exitCode: number; text: string }> {
  output = [];
  const exitCode = await runDocumentCutoverCommand({
    argv: [],
    env: {
      SUPABASE_URL: "http://127.0.0.1:54321",
      DOCUMENT_CUTOVER_DATABASE_URL: `postgresql://${READER}:${PASSWORD}@127.0.0.1:54322/postgres`,
    },
  });
  return { exitCode, text: output.join("\n") };
}

const MEMBER_BLOCKER = /is a member \(direct or inherited\) of/;

describe("#2067 review 6326220905 MAJOR-A — privileged pg_* roles are denied", () => {
  it("control: a reader with no privileged membership gets past the identity check", async () => {
    const run = await assessAsReader();
    expect(run.text).not.toMatch(MEMBER_BLOCKER);
    expect(
      fakePg.queries.some((query) =>
        query.startsWith("set default_transaction_read_only"),
      ),
    ).toBe(true);
  });

  it.each([
    "pg_read_server_files",
    "pg_write_server_files",
    "pg_monitor",
    "pg_signal_backend",
    "pg_checkpoint",
    "pg_create_subscription",
  ])(
    "a reader holding %s, directly or through an inherited role, is rejected before any read",
    async (role) => {
      fakePg.memberOf = new Map([[READER, [role]]]);
      const direct = await assessAsReader();
      expect(direct.exitCode).toBe(1);
      expect(direct.text).toMatch(MEMBER_BLOCKER);
      expect(direct.text).toContain(role);

      fakePg.queries = [];
      fakePg.memberOf = new Map([
        [READER, ["privileged_roles_2067_intermediate"]],
        ["privileged_roles_2067_intermediate", [role]],
      ]);
      const inherited = await assessAsReader();
      expect(inherited.exitCode).toBe(1);
      expect(inherited.text).toMatch(MEMBER_BLOCKER);
      expect(inherited.text).toContain(role);
      expect(
        fakePg.queries.some((query) =>
          query.startsWith("set default_transaction_read_only"),
        ),
      ).toBe(false);
    },
  );
});
