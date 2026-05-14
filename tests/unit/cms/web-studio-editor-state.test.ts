import { describe, expect, it } from "vitest";

import {
  buildNativeDocumentStateItems,
  resolveNativeDocumentPrimaryState,
} from "../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state";

const baseInput = {
  backgroundProcessing: false,
  documentId: "42",
  documentIsLocked: false,
  hasDrafts: true,
  isTrashed: false,
  isValid: true,
  modified: false,
  mostRecentVersionIsAutosaved: false,
  processing: false,
  status: "draft",
  submitted: false,
  uploadStatus: "idle" as const,
};

describe("Web Studio editor state adapter", () => {
  it("prioritizes invalid saves and upload errors over saved state", () => {
    expect(
      resolveNativeDocumentPrimaryState({
        ...baseInput,
        status: "published",
        submitted: true,
        isValid: false,
      }),
    ).toEqual({
      description: "Payload validation blocked the latest save attempt.",
      label: "Needs fixes",
      tone: "danger",
    });

    expect(
      resolveNativeDocumentPrimaryState({
        ...baseInput,
        uploadStatus: "failed",
      }).label,
    ).toBe("Upload failed");
  });

  it("distinguishes dirty, autosaving, autosaved, and published states", () => {
    expect(
      resolveNativeDocumentPrimaryState({
        ...baseInput,
        modified: true,
      }).label,
    ).toBe("Unsaved changes");

    expect(
      resolveNativeDocumentPrimaryState({
        ...baseInput,
        backgroundProcessing: true,
      }).label,
    ).toBe("Autosaving");

    expect(
      resolveNativeDocumentPrimaryState({
        ...baseInput,
        mostRecentVersionIsAutosaved: true,
      }).label,
    ).toBe("Autosaved draft");

    expect(
      resolveNativeDocumentPrimaryState({
        ...baseInput,
        status: "published",
      }).label,
    ).toBe("Published");
  });

  it("marks previews as authenticated and publish state as private until publish", () => {
    const items = buildNativeDocumentStateItems({
      ...baseInput,
      hasPublishedDoc: false,
      previewSupported: true,
      previewURL: "/web-studio/preview/pages/42",
      unpublishedVersionCount: 1,
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "publication",
          label: "Private draft",
        }),
        expect.objectContaining({
          id: "preview",
          label: "Authenticated",
        }),
      ]),
    );
  });
});
