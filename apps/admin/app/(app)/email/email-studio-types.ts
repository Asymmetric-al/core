import type { EmailStudioFullConfig } from "@asym/config/email-studio";

export type EmailMetadata = {
  id: string | null;
  name: string;
  subject: string;
  preheader: string;
};

export type PreviewDevice = "desktop" | "mobile";

export type EmailTemplateListEntry = {
  id: string;
  name: string;
  builder: string;
  builder_version: string;
  version: number;
  html_content: string | null;
  text_content: string | null;
  default_subject: string | null;
  default_preheader: string | null;
  design_json: unknown;
};

export type PreviewResult = {
  html: string;
  text: string;
  subject?: string;
  preheader?: string;
  builder?: string;
  builderVersion?: string;
  design?: unknown;
};

export type EmailStudioUiState = {
  isEditorReady: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  previewDevice: PreviewDevice;
  showSaveDialog: boolean;
  showExportDialog: boolean;
  exportedHtml: string;
  isFullscreen: boolean;
  copiedHtml: boolean;
  studioConfig: EmailStudioFullConfig | null;
};

export type EmailStudioUiAction =
  | { type: "editor_ready"; config: EmailStudioFullConfig }
  | { type: "editor_unmounted" }
  | { type: "set_saving"; saving: boolean }
  | { type: "set_unsaved_changes"; unsaved: boolean }
  | { type: "set_preview_device"; device: PreviewDevice }
  | { type: "set_show_save_dialog"; open: boolean }
  | { type: "open_export_dialog"; html: string }
  | { type: "set_show_export_dialog"; open: boolean }
  | { type: "set_fullscreen"; fullscreen: boolean }
  | { type: "toggle_fullscreen" }
  | { type: "set_copied_html"; copied: boolean };
