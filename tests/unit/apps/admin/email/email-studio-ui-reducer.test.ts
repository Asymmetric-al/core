import { describe, expect, it } from "vitest";

import type { EmailStudioFullConfig } from "@asym/config/email-studio";

import {
  emailStudioUiReducer,
  INITIAL_EMAIL_STUDIO_UI_STATE,
} from "../../../../../apps/admin/app/(app)/email/email-studio-ui-reducer";

const STUDIO_CONFIG = {
  mergeTags: { donor: { firstName: "Ada" } },
} as EmailStudioFullConfig;

describe("emailStudioUiReducer", () => {
  it("marks the Email Studio editor ready without inventing preview HTML state", () => {
    const next = emailStudioUiReducer(INITIAL_EMAIL_STUDIO_UI_STATE, {
      type: "editor_ready",
      config: STUDIO_CONFIG,
    });

    expect(next.isEditorReady).toBe(true);
    expect(next.studioConfig).toBe(STUDIO_CONFIG);
    expect(next).not.toHaveProperty("previewHtml");
    expect(next).not.toHaveProperty("previewText");
  });

  it("clears editor readiness without dropping studio config", () => {
    const ready = emailStudioUiReducer(INITIAL_EMAIL_STUDIO_UI_STATE, {
      type: "editor_ready",
      config: STUDIO_CONFIG,
    });
    const saving = emailStudioUiReducer(ready, {
      type: "set_show_save_dialog",
      open: true,
    });
    const next = emailStudioUiReducer(saving, { type: "editor_unmounted" });

    expect(next.isEditorReady).toBe(false);
    expect(next.showSaveDialog).toBe(false);
    expect(next.studioConfig).toBe(STUDIO_CONFIG);
  });

  it("opens the export dialog with exported HTML and never stores preview HTML", () => {
    const next = emailStudioUiReducer(INITIAL_EMAIL_STUDIO_UI_STATE, {
      type: "open_export_dialog",
      html: "<p>Campaign body</p>",
    });

    expect(next.showExportDialog).toBe(true);
    expect(next.exportedHtml).toBe("<p>Campaign body</p>");
    expect(next).not.toHaveProperty("previewHtml");
  });

  it("toggles the save dialog without preview or persist-error fields", () => {
    const open = emailStudioUiReducer(INITIAL_EMAIL_STUDIO_UI_STATE, {
      type: "set_show_save_dialog",
      open: true,
    });
    const closed = emailStudioUiReducer(open, {
      type: "set_show_save_dialog",
      open: false,
    });

    expect(open.showSaveDialog).toBe(true);
    expect(closed.showSaveDialog).toBe(false);
    expect(closed).not.toHaveProperty("previewHtml");
    expect(closed).not.toHaveProperty("persistError");
  });
});
