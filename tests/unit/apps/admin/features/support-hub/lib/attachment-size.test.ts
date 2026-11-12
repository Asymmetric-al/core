import { expect, it } from "vitest";
import { formatAttachmentSize } from "../../../../../../../apps/admin/features/support-hub/lib/attachment-size";
it("formats safe attachment sizes without assuming download availability", () => {
  expect(formatAttachmentSize(2048)).toBe("2 KB");
  expect(formatAttachmentSize(0)).toBe("0 B");
  expect(formatAttachmentSize(-1)).toBe("Size unavailable");
});
