/**
 * Acceptance test for GitHub issue #2183, done criterion 2.
 * Spec (rev 1, Blake-approved 2026-10-21 3:07 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2183#issuecomment-6327313476}
 *
 * Bot account IDs, as listed in `APPROVED_PR_AUTOMATION_BOT_IDS` at develop
 * c4fd85dd (packages/eve-runtime/src/github/authorize-trigger.ts:8-10) and in
 * the spec: 206_951_365, 199_175_422 and 299_239_962 (Cursor, Codex Connector
 * and Eve, per the source comment) stay; 301_899_336 (Core PR Loop) goes.
 *
 * The behavior is checked directly here. The criterion also names where the
 * Builder's unit test must live; that half is a static check on the file
 * (open question: it cannot prove the test's semantics, only its presence).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it, vi } from "vitest";

import { CRITERION_2_TEST_FILE, readRepoFile } from "./repo-scan";
import {
  APPROVED_PR_AUTOMATION_BOT_IDS,
  authorizeEveGithubActor,
} from "../../../../packages/eve-runtime/src/github/authorize-trigger";

const RETIRED_PR_LOOP_BOT_ID = 301_899_336;
const KEPT_BOT_IDS = [206_951_365, 199_175_422, 299_239_962] as const;

/** A GitHub API stub that would deny any human-path lookup. */
function deniedGithub() {
  return vi.fn(async () => ({
    status: 200,
    body: { state: "inactive", permission: "none" },
  }));
}

async function authorizeBot(id: number): Promise<boolean> {
  return authorizeEveGithubActor({
    actor: { id, login: "automation[bot]", type: "Bot" },
    approvedBotAccountIds: APPROVED_PR_AUTOMATION_BOT_IDS,
    request: deniedGithub(),
  });
}

describe("issue #2183 done criterion 2", () => {
  it('criterion 2: "`authorizeEveGithubActor` returns `false` for actor `301_899_336` ... with `APPROVED_PR_AUTOMATION_BOT_IDS`"', async () => {
    expect(
      await authorizeBot(RETIRED_PR_LOOP_BOT_ID),
      "retired Core PR Loop bot 301_899_336 is still authorized",
    ).toBe(false);
    expect(APPROVED_PR_AUTOMATION_BOT_IDS.has(RETIRED_PR_LOOP_BOT_ID)).toBe(
      false,
    );
  });

  it.each(KEPT_BOT_IDS)(
    'criterion 2: "and still returns `true` for `206_951_365`, `199_175_422` and `299_239_962` with `APPROVED_PR_AUTOMATION_BOT_IDS`" (%i)',
    async (id) => {
      expect(
        await authorizeBot(id),
        `approved bot account ${id} is no longer authorized`,
      ).toBe(true);
    },
  );

  it('criterion 2: "A unit test in `tests/unit/eve-github-trigger-authorization.test.ts` shows ..." (static: the file exercises 301_899_336 and the three kept IDs)', () => {
    const source = readRepoFile(CRITERION_2_TEST_FILE);
    const missing = [
      ["301_899_336", /301_?899_?336/],
      ["206_951_365", /206_?951_?365/],
      ["199_175_422", /199_?175_?422/],
      ["299_239_962", /299_?239_?962/],
      ["authorizeEveGithubActor", /authorizeEveGithubActor/],
      ["APPROVED_PR_AUTOMATION_BOT_IDS", /APPROVED_PR_AUTOMATION_BOT_IDS/],
    ]
      .filter(([, pattern]) => !(pattern as RegExp).test(source))
      .map(([name]) => name);
    expect(
      missing,
      `${CRITERION_2_TEST_FILE} does not mention: ${missing.join(", ")}`,
    ).toEqual([]);
  });
});
