import { describe, expect, it } from "vitest";

import {
  FACTORY_MARKER,
  currentDisposition,
  feedbackItems,
  threadIdentity,
  threadLastComment,
} from "../../../scripts/archon-factory/pack/.shared/readiness.mjs";
import {
  planDispositions,
  threadsToResolve,
} from "../../../scripts/archon-factory/pack/deliver/scripts/readiness-logic.mjs";

const HEAD = "1".repeat(40);
const CURRENT =
  "NEW CRITICAL: tenant authorization is still bypassed; do not merge.";
const comment = (number: number, body = `Old comment ${number}`) => ({
  id: `C${number}`,
  databaseId: number,
  author: { login: "reviewer" },
  body,
  url: `https://example.test/comment/${number}`,
});
const thread = (nodes: any[], recent?: any[]) => ({
  id: "T1",
  isResolved: false,
  comments: { nodes },
  ...(recent ? { recent: { nodes: recent } } : {}),
});
const dispose = {
  task_status: "DONE",
  items: [
    {
      id: "T1",
      action: "rebut",
      reason: "Investigated exact current feedback",
      reply: "Evidence",
    },
  ],
};

describe("current feedback content accompanies its identity (F2)", () => {
  it("includes the exact current reply beyond GitHub first-50 pagination", () => {
    const live = thread(
      Array.from({ length: 50 }, (_, index) => comment(index + 1)),
      [comment(51, CURRENT)],
    );
    const [item] = feedbackItems({ threads: [live] });
    expect(item.lastComment).toBe("C51");
    expect(item.lastReply).toMatchObject({ id: "C51", body: CURRENT });
    expect(JSON.stringify(item)).toContain(CURRENT);
  });

  it("preserves the exact current reply when preceding context exceeds its budget", () => {
    const current = `CURRENT-BEGIN ${"critical detail ".repeat(800)} CURRENT-END`;
    const [item] = feedbackItems({
      threads: [thread([comment(1, "old ".repeat(4000)), comment(2, current)])],
    });
    expect(item.lastReply.body).toBe(current);
    expect(item.comments.length).toBeLessThanOrEqual(4000);
  });

  it("merges overlap without duplicating or retaining stale comment content", () => {
    const [item] = feedbackItems({
      threads: [
        thread(
          [comment(1), comment(2, "stale content")],
          [comment(2, "edited context"), comment(3, CURRENT)],
        ),
      ],
    });
    expect(item.lastReply.body).toBe(CURRENT);
    expect(item.comments).toContain("edited context");
    expect(item.comments).not.toContain("stale content");
    expect(item.comments.match(/edited context/g)).toHaveLength(1);
  });

  it("falls back to first-page feedback when the recent page contains only factory replies", () => {
    const live = thread(
      [comment(1, CURRENT)],
      [comment(2, `Factory response ${FACTORY_MARKER}`)],
    );
    expect(threadLastComment(live)).toBe("C1");
    expect(feedbackItems({ threads: [live] })[0].lastReply.body).toBe(CURRENT);
  });

  it("cannot certify an unseen last human reply across a factory-only pagination gap", () => {
    const live = thread(
      Array.from({ length: 50 }, (_, index) => comment(index + 1)),
      Array.from({ length: 20 }, (_, index) =>
        comment(index + 80, `Factory response ${FACTORY_MARKER}`),
      ),
    );
    const dispositions = {
      T1: { action: "rebut", head: HEAD, lastComment: "C50" },
    };
    expect(threadIdentity(live).contentUnavailable).toBe(true);
    expect(currentDisposition(dispositions, threadIdentity(live))).toBeNull();
    expect(
      feedbackItems({ threads: [live], dispositions })[0].contentUnavailable,
    ).toBe(true);
    expect(
      threadsToResolve({ threads: [live], dispositions, head: HEAD }),
    ).toEqual([]);
  });

  it("prioritizes the current reply in implementation repair evidence", () => {
    const items = feedbackItems({
      threads: [
        thread([
          comment(1, "Obsolete allegation ".repeat(400)),
          comment(2, CURRENT),
        ]),
      ],
    });
    const plan = planDispositions({
      items,
      dispose: {
        task_status: "DONE",
        items: [
          {
            id: "T1",
            action: "fix-implementation",
            reason: "Confirmed defect",
          },
        ],
      },
      head: HEAD,
    });
    expect(plan.implementation[0]).toContain(CURRENT);
    expect(plan.implementation[0]).not.toContain("Obsolete allegation");
  });

  it.each([undefined, null])(
    "cannot certify or resolve a current reply with unavailable body %s",
    (body) => {
      const live = thread([comment(1)], [{ id: "C51", body }]);
      const dispositions = {
        T1: { action: "rebut", head: HEAD, lastComment: "C51" },
      };
      const [item] = feedbackItems({ threads: [live], dispositions });
      expect(item).toMatchObject({
        lastComment: "C51",
        contentUnavailable: true,
      });
      expect(currentDisposition(dispositions, threadIdentity(live))).toBeNull();
      expect(
        threadsToResolve({ threads: [live], dispositions, head: HEAD }),
      ).toEqual([]);
      expect(
        planDispositions({ items: [item], dispose, head: HEAD }).blocked?.code,
      ).toBe("feedback-content-unavailable");
    },
  );

  it("fails safe on empty comment pages without changing human-resolution handling", () => {
    const live = thread([]);
    expect(feedbackItems({ threads: [live] })[0].contentUnavailable).toBe(true);
    expect(feedbackItems({ threads: [{ ...live, isResolved: true }] })).toEqual(
      [],
    );
  });
});
