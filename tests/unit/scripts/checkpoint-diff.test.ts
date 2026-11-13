import { describe, expect, it, vi } from "vitest";

import { buildTrackedDiff } from "../../../docs/qa/admin-workspaces-hillclimb/checkpoint-diff.mjs";

describe("checkpoint tracked diff", () => {
  it("keeps every path while bounding Windows process arguments", () => {
    const paths = Array.from(
      { length: 700 },
      (_, index) =>
        `apps/admin/app/(app)/records/[id]/long name ${index}/page.tsx`,
    );
    const calls: string[][] = [];
    const git = (args: string[]) => {
      if (args.join(" ").length > 12000) {
        throw Object.assign(new Error("spawnSync git ENAMETOOLONG"), {
          code: "ENAMETOOLONG",
        });
      }
      expect(args.slice(0, 4)).toEqual(["diff", "--binary", "base", "--"]);
      calls.push(args.slice(4));
      return args
        .slice(4)
        .map((path) => `patch:${path}\n`)
        .join("");
    };

    const diff = buildTrackedDiff(git, "base", paths);

    expect(calls.flat()).toEqual(paths);
    expect(calls.length).toBeGreaterThan(1);
    expect(diff).toBe(paths.map((path) => `patch:${path}\n`).join(""));
  });

  it("does not run Git when there are no tracked paths", () => {
    const git = vi.fn();
    expect(buildTrackedDiff(git, "base", [])).toBe("");
    expect(git).not.toHaveBeenCalled();
  });
});
