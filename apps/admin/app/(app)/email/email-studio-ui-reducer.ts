import type {
  EmailStudioUiAction,
  EmailStudioUiState,
} from "./email-studio-types";

export const INITIAL_EMAIL_STUDIO_UI_STATE: EmailStudioUiState = {
  isEditorReady: false,
  isSaving: false,
  hasUnsavedChanges: false,
  previewDevice: "desktop",
  showSaveDialog: false,
  showExportDialog: false,
  exportedHtml: "",
  isFullscreen: false,
  copiedHtml: false,
  studioConfig: null,
};

export function emailStudioUiReducer(
  state: EmailStudioUiState,
  action: EmailStudioUiAction,
): EmailStudioUiState {
  switch (action.type) {
    case "editor_ready":
      return { ...state, isEditorReady: true, studioConfig: action.config };
    case "editor_unmounted":
      return { ...state, isEditorReady: false };
    case "set_saving":
      return { ...state, isSaving: action.saving };
    case "set_unsaved_changes":
      return { ...state, hasUnsavedChanges: action.unsaved };
    case "set_preview_device":
      return { ...state, previewDevice: action.device };
    case "set_show_save_dialog":
      return { ...state, showSaveDialog: action.open };
    case "open_export_dialog":
      return {
        ...state,
        showExportDialog: true,
        exportedHtml: action.html,
        copiedHtml: false,
      };
    case "set_show_export_dialog":
      return { ...state, showExportDialog: action.open };
    case "set_fullscreen":
      return { ...state, isFullscreen: action.fullscreen };
    case "toggle_fullscreen":
      return { ...state, isFullscreen: !state.isFullscreen };
    case "set_copied_html":
      return { ...state, copiedHtml: action.copied };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
