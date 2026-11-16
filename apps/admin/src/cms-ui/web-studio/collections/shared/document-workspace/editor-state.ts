export type UploadStatus = "failed" | "idle" | "uploading";

export type NativeDocumentPrimaryStateInput = {
  backgroundProcessing: boolean;
  documentId: string | null;
  documentIsLocked: boolean;
  hasDrafts: boolean;
  isTrashed: boolean;
  isValid: boolean;
  modified: boolean;
  mostRecentVersionIsAutosaved: boolean;
  processing: boolean;
  status: unknown;
  submitted: boolean;
  uploadStatus?: UploadStatus;
};

export type NativeDocumentStateTone =
  "danger" | "info" | "muted" | "success" | "warning";

export type NativeDocumentPrimaryState = {
  description: string;
  label: string;
  tone: NativeDocumentStateTone;
};

type NativeDocumentStateItem = NativeDocumentPrimaryState & {
  id: "autosave" | "editing" | "preview" | "publication";
};

type NativeDocumentStateItemsInput = NativeDocumentPrimaryStateInput & {
  hasPublishedDoc: boolean;
  previewSupported: boolean;
  previewURL: string | null;
  unpublishedVersionCount: number;
};

export function resolveNativeDocumentPrimaryState(
  input: NativeDocumentPrimaryStateInput,
): NativeDocumentPrimaryState {
  if (input.documentIsLocked) {
    return {
      description: "Another editor is active on this document.",
      label: "Locked",
      tone: "warning",
    };
  }

  if (input.isTrashed) {
    return {
      description: "This document is in trash and should not be edited.",
      label: "In trash",
      tone: "danger",
    };
  }

  if (input.uploadStatus === "failed") {
    return {
      description: "The latest upload could not be saved. Try again.",
      label: "Upload failed",
      tone: "danger",
    };
  }

  if (input.uploadStatus === "uploading") {
    return {
      description: "Media for this document is still uploading.",
      label: "Uploading",
      tone: "info",
    };
  }

  if (input.processing) {
    return {
      description: "Checking fields and saving this document.",
      label: "Saving",
      tone: "info",
    };
  }

  if (input.backgroundProcessing) {
    return {
      description: "Saving a draft in the background.",
      label: "Autosaving",
      tone: "info",
    };
  }

  if (input.submitted && !input.isValid) {
    return {
      description: "Some fields need fixing before this can save.",
      label: "Needs fixes",
      tone: "danger",
    };
  }

  if (input.modified) {
    return {
      description: "Your latest changes have not been saved yet.",
      label: "Unsaved changes",
      tone: "warning",
    };
  }

  if (input.hasDrafts && input.mostRecentVersionIsAutosaved) {
    return {
      description: "The latest draft was saved automatically.",
      label: "Autosaved draft",
      tone: "success",
    };
  }

  if (!input.documentId) {
    return {
      description: "Save a draft before previewing or publishing.",
      label: "New document",
      tone: "muted",
    };
  }

  if (input.status === "published") {
    return {
      description: "This document has a published version.",
      label: "Published",
      tone: "success",
    };
  }

  if (input.status === "draft") {
    return {
      description: "The latest saved version is a draft.",
      label: "Draft saved",
      tone: "info",
    };
  }

  return {
    description: "Your document is saved.",
    label: "Saved",
    tone: "success",
  };
}

export function buildNativeDocumentStateItems(
  input: NativeDocumentStateItemsInput,
): NativeDocumentStateItem[] {
  const primary = resolveNativeDocumentPrimaryState(input);
  const publicationState = resolvePublicationState(input);
  const autosaveState = resolveAutosaveState(input);
  const previewState = resolvePreviewState(input);

  return [
    { id: "editing", ...primary },
    { id: "publication", ...publicationState },
    { id: "autosave", ...autosaveState },
    { id: "preview", ...previewState },
  ];
}

export function glanceNativeDocumentStateItems(
  items: NativeDocumentStateItem[],
): NativeDocumentStateItem[] {
  return items.filter((item) => {
    if (item.id === "editing") return false;
    if (item.id === "publication") return item.tone !== "muted";
    return item.tone === "warning" || item.tone === "danger";
  });
}

function resolvePublicationState(
  input: NativeDocumentStateItemsInput,
): NativeDocumentPrimaryState {
  if (!input.hasDrafts) {
    return {
      description: "This collection saves without draft or publish versions.",
      label: "Direct save",
      tone: "muted",
    };
  }

  // Who can see it, not the status again: public reads (the organization's
  // site) get only published versions (`publishedPublicReadAccess`); drafts
  // stay with signed-in editors.
  if (input.status === "published") {
    return {
      description:
        "The organization's site can show this version. Only editors see drafts.",
      label: "Public",
      tone: "success",
    };
  }

  if (input.hasPublishedDoc && input.unpublishedVersionCount > 0) {
    return {
      description:
        "The site can show the last published version. Publish to share these changes.",
      label: "Older version public",
      tone: "warning",
    };
  }

  if (input.hasPublishedDoc) {
    return {
      description:
        "The organization's site can show the published version. Only editors see drafts.",
      label: "Public",
      tone: "success",
    };
  }

  return {
    description: "The site can't show this until it is published.",
    label: "Editors only",
    tone: "info",
  };
}

function resolveAutosaveState(
  input: NativeDocumentStateItemsInput,
): NativeDocumentPrimaryState {
  if (!input.hasDrafts) {
    return {
      description: "Autosave is not configured for this collection.",
      label: "Off",
      tone: "muted",
    };
  }

  if (input.backgroundProcessing) {
    return {
      description: "Saving a draft while you keep editing.",
      label: "Saving",
      tone: "info",
    };
  }

  if (input.mostRecentVersionIsAutosaved) {
    return {
      description: "The most recent private version was autosaved.",
      label: "Saved",
      tone: "success",
    };
  }

  return {
    description: "Draft autosave is enabled for this collection.",
    label: "On",
    tone: "success",
  };
}

function resolvePreviewState(
  input: NativeDocumentStateItemsInput,
): NativeDocumentPrimaryState {
  if (!input.previewSupported) {
    return {
      description: "Preview is not available for this collection.",
      label: "No preview",
      tone: "muted",
    };
  }

  if (!input.documentId || !input.previewURL) {
    return {
      description: "Save the document before opening its private preview.",
      label: "Save first",
      tone: "warning",
    };
  }

  return {
    description:
      "Preview is available only to signed-in editors with access to this document.",
    label: "Private preview",
    tone: "success",
  };
}

export function describeUnpublishedVersions(count: number | undefined): string {
  if (!count) return "None";
  return count === 1 ? "1 saved version" : `${count} saved versions`;
}

export function documentHeading({
  title,
  documentId,
  singular,
}: {
  title: string | undefined;
  documentId: string | null | undefined;
  singular: string;
}): string {
  const id = documentId == null ? "" : String(documentId);
  if (title && title !== id) return title;
  return id ? `Untitled (${id})` : `Untitled ${singular.toLowerCase()}`;
}
