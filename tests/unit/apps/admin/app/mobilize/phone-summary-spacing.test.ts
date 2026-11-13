import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
const root = new URL("../../../../../../", import.meta.url);
it("keeps the disconnected pipeline free of sample rows and local mutation controls", () => {
  const source = readFileSync(
    new URL("apps/admin/app/(app)/mobilize/page-client.tsx", root),
    "utf8",
  );
  expect(source).not.toMatch(
    /SampleDataNotice|useMobilizeCandidates|MobilizePipelineGrid|onCreate|onAdvance/,
  );
});
