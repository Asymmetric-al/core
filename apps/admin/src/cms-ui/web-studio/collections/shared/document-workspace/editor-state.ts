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
  | "danger"
  | "info"
  | "muted"
  | "success"
  | "warning";

export type NativeDocumentPrimaryState = {
  description: string;
  label: string;
  tone: NativeDocumentStateTone;
};

export type NativeDocumentStateItem = NativeDocumentPrimaryState & {
  id: "autosave" | "editing" | "preview" | "publication";
};

export type NativeDocumentStateItemsInput = NativeDocumentPrimaryStateInput & {
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
      description: "The latest upload failed before Payload could save it.",
      label: "Upload failed",
      tone: "danger",
    };
  }

  if (input.uploadStatus === "uploading") {
    return {
      description: "Payload is still uploading media for this document.",
      label: "Uploading",
      tone: "info",
    };
  }

  if (input.processing) {
    return {
      description: "Payload is validating and saving this document.",
      label: "Saving",
      tone: "info",
    };
  }

  if (input.backgroundProcessing) {
    return {
      description: "Payload autosave is writing a draft in the background.",
      label: "Autosaving",
      tone: "info",
    };
  }

  if (input.submitted && !input.isValid) {
    return {
      description: "Payload validation blocked the latest save attempt.",
      label: "Needs fixes",
      tone: "danger",
    };
  }

  if (input.modified) {
    return {
      description: "There are local changes that Payload has not saved yet.",
      label: "Unsaved changes",
      tone: "warning",
    };
  }

  if (input.hasDrafts && input.mostRecentVersionIsAutosaved) {
    return {
      description: "The latest draft version came from Payload autosave.",
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
      description: "The published version is available to public readers.",
      label: "Published",
      tone: "success",
    };
  }

  if (input.status === "draft") {
    return {
      description: "The saved document is still private to Web Studio.",
      label: "Draft saved",
      tone: "info",
    };
  }

  return {
    description: "Payload has saved the current document state.",
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

  if (input.status === "published") {
    return {
      description: "Public routes can read only this published version.",
      label: "Public",
      tone: "success",
    };
  }

  if (input.hasPublishedDoc && input.unpublishedVersionCount > 0) {
    return {
      description: "A public version exists, with newer private draft changes.",
      label: "Draft ahead",
      tone: "warning",
    };
  }

  if (input.hasPublishedDoc) {
    return {
      description: "A published version exists for public readers.",
      label: "Published copy",
      tone: "success",
    };
  }

  return {
    description: "Public routes exclude this document until it is published.",
    label: "Private draft",
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
      description: "Payload is writing the draft without blocking editing.",
      label: "Running",
      tone: "info",
    };
  }

  if (input.mostRecentVersionIsAutosaved) {
    return {
      description: "The most recent private version was autosaved.",
      label: "Ready",
      tone: "success",
    };
  }

  return {
    description: "Draft autosave is enabled for this collection.",
    label: "Enabled",
    tone: "success",
  };
}

function resolvePreviewState(
  input: NativeDocumentStateItemsInput,
): NativeDocumentPrimaryState {
  if (!input.previewSupported) {
    return {
      description: "This collection has no Web Studio preview surface.",
      label: "Unavailable",
      tone: "muted",
    };
  }

  if (!input.documentId || !input.previewURL) {
    return {
      description:
        "Save the document before opening the authenticated preview.",
      label: "Save first",
      tone: "warning",
    };
  }

  return {
    description: "Preview opens inside authenticated Web Studio only.",
    label: "Authenticated",
    tone: "success",
  };
}
