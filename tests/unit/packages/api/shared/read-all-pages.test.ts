import { expect, it } from "vitest";

import { readAllPages } from "../../../../../packages/api/src/shared/read-all-pages";

it("returns 9,999 non-empty pages followed by an empty one, but refuses 10,000 non-empty pages", async () => {
  const read = (count: number) =>
    readAllPages(
      async (from) => ({ data: from < count ? [from] : [], error: null }),
      1,
    );
  await expect(read(9_999)).resolves.toHaveLength(9_999);
  await expect(read(10_000)).rejects.toThrow(/10000 pages/);
});
