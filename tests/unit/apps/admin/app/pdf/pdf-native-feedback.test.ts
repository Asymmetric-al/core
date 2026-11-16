import { describe, expect, it } from "vitest";
import { nativeRenderFeedback } from "../../../../../../apps/admin/app/(app)/pdf/pdf-native-feedback";

describe("native PDF test render feedback", () => {
  it.each([
    undefined,
    {},
    { success: true },
    { success: true, render: { status: "processing" } },
    { success: true, render: { status: "success" } },
  ])("does not claim success for incomplete output %#", (body) => {
    expect(nativeRenderFeedback(true, body).success).toBe(false);
  });
  it.each(["success", "warning"])(
    "recognizes terminal %s without claiming a download",
    (status) => {
      const feedback = nativeRenderFeedback(true, {
        success: true,
        render: { status, errors: [] },
      });
      expect(feedback.success).toBe(true);
      expect(feedback.description).toContain(
        "No file was saved or downloaded.",
      );
    },
  );
  it("classifies setup failures without exposing infrastructure messages", () => {
    const feedback = nativeRenderFeedback(true, {
      success: true,
      render: {
        status: "error",
        errors: [
          {
            code: "docraptor_not_configured",
            message: "DocRaptor secret setup",
          },
        ],
      },
    });
    expect(feedback.success).toBe(false);
    expect(feedback.description).toContain("setup");
    expect(JSON.stringify(feedback)).not.toMatch(/DocRaptor|secret|rollout/);
  });
});
