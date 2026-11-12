import { describe, expect, it } from "vitest";

import {
  buildNativeDocumentStateItems,
  describeUnpublishedVersions,
  documentHeading,
  glanceNativeDocumentStateItems,
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
      description: "Some fields need fixing before this can save.",
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
          label: "Editors only",
        }),
        expect.objectContaining({
          id: "preview",
          label: "Private preview",
        }),
      ]),
    );
  });

  it("says who can see the document instead of repeating its status", () => {
    const state = (
      input: Partial<typeof baseInput> & {
        hasPublishedDoc: boolean;
        unpublishedVersionCount: number;
      },
    ) => {
      const items = buildNativeDocumentStateItems({
        ...baseInput,
        previewSupported: true,
        previewURL: "/web-studio/preview/pages/42",
        ...input,
      });
      const editing = items.find((item) => item.id === "editing")!;
      const publication = items.find((item) => item.id === "publication")!;
      expect(publication.label).not.toBe(editing.label);
      expect(publication.description).not.toMatch(/depends on/);
      return publication;
    };

    expect(
      state({
        status: "published",
        hasPublishedDoc: true,
        unpublishedVersionCount: 0,
      }),
    ).toMatchObject({
      label: "Public",
      description:
        "The organization's site can show this version. Only editors see drafts.",
    });
    expect(
      state({
        status: "draft",
        hasPublishedDoc: true,
        unpublishedVersionCount: 2,
      }),
    ).toMatchObject({
      label: "Older version public",
      tone: "warning",
      description:
        "The site can show the last published version. Publish to share these changes.",
    });
    expect(
      state({
        status: "draft",
        hasPublishedDoc: false,
        unpublishedVersionCount: 1,
      }),
    ).toMatchObject({
      label: "Editors only",
      description: "The site can't show this until it is published.",
    });
  });

  it("keeps the phone glance line to visibility and states that need attention", () => {
    const published = buildNativeDocumentStateItems({
      ...baseInput,
      status: "published",
      hasPublishedDoc: true,
      previewSupported: true,
      previewURL: "/web-studio/preview/pages/42",
      unpublishedVersionCount: 0,
    });
    // The header badge already gives the status; healthy autosave and
    // preview stay behind Details.
    expect(
      glanceNativeDocumentStateItems(published).map((item) => item.label),
    ).toEqual(["Public"]);

    const unsaved = buildNativeDocumentStateItems({
      ...baseInput,
      documentId: null,
      hasPublishedDoc: false,
      previewSupported: true,
      previewURL: null,
      unpublishedVersionCount: 0,
    });
    expect(
      glanceNativeDocumentStateItems(unsaved).map((item) => item.label),
    ).toEqual(["Editors only", "Save first"]);

    // Collections without drafts or preview: nothing worth a glance.
    const direct = buildNativeDocumentStateItems({
      ...baseInput,
      hasDrafts: false,
      status: undefined,
      hasPublishedDoc: false,
      previewSupported: false,
      previewURL: null,
      unpublishedVersionCount: 0,
    });
    expect(glanceNativeDocumentStateItems(direct)).toEqual([]);
  });
});

describe("describeUnpublishedVersions", () => {
  it("says None rather than a bare 0, and counts saved versions in words", () => {
    expect(describeUnpublishedVersions(undefined)).toBe("None");
    expect(describeUnpublishedVersions(0)).toBe("None");
    expect(describeUnpublishedVersions(1)).toBe("1 saved version");
    expect(describeUnpublishedVersions(3)).toBe("3 saved versions");
  });
});

describe("documentHeading", () => {
  it("names an untitled saved document as the lists do, by its ID", () => {
    // Payload falls back to the ID when the title field is empty.
    expect(
      documentHeading({ title: "46", documentId: "46", singular: "Page" }),
    ).toBe("Untitled (46)");
    expect(
      documentHeading({ title: undefined, documentId: "46", singular: "Page" }),
    ).toBe("Untitled (46)");
  });

  it("calls a document with no ID yet an untitled page, and keeps real titles", () => {
    expect(
      documentHeading({ title: "", documentId: null, singular: "Page" }),
    ).toBe("Untitled page");
    expect(
      documentHeading({
        title: "Year-End Giving",
        documentId: "46",
        singular: "Page",
      }),
    ).toBe("Year-End Giving");
  });
});
