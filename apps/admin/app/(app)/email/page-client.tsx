"use client";
"use no memo";

import { getEmailStudioConfig } from "@asym/config/email-studio";
import {
  getAdminSurfaceQueryKey,
  invalidateAdminSurfaceQuery,
} from "@asym/database/query-keys";
import {
  EMPTY_REACT_EMAIL_DESIGN,
  type EmailStudioEditorHandle,
} from "@asym/email/email-builder-types";
import { EmailStudioEditor } from "@asym/ui/components/studio/EmailStudioEditor";
import { EmailStudioPreviewDialog } from "@asym/ui/components/studio/EmailStudioPreview";
import { cn } from "@asym/ui/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import {
  fetchEmailTemplates,
  persistEmailTemplate,
  sendTemplateTestEmail,
} from "./email-studio-api";
import { EmailStudioExportDialog } from "./email-studio-export-dialog";
import { EmailStudioHeader } from "./email-studio-header";
import { EmailStudioSaveDialog } from "./email-studio-save-dialog";
import { EmailStudioTemplatePickerDialog } from "./email-studio-template-picker-dialog";
import { EmailStudioTestSendDialog } from "./email-studio-test-send-dialog";
import {
  emailStudioUiReducer,
  INITIAL_EMAIL_STUDIO_UI_STATE,
} from "./email-studio-ui-reducer";

import type {
  EmailMetadata,
  EmailTemplateListEntry,
  PreviewDevice,
  PreviewResult,
} from "./email-studio-types";

const DEFAULT_METADATA: EmailMetadata = {
  id: null,
  name: "Untitled Email",
  subject: "",
  preheader: "",
};

function coercePreviewText(value: string | null | undefined): string {
  return value ?? "";
}

function previewFromTemplate(template: EmailTemplateListEntry): PreviewResult {
  return {
    html: coercePreviewText(template.html_content),
    text: coercePreviewText(template.text_content),
    subject: coercePreviewText(template.default_subject),
    preheader: coercePreviewText(template.default_preheader),
    builder: template.builder,
    builderVersion: template.builder_version,
    design: template.design_json,
  };
}

export default function EmailStudio() {
  const queryClient = useQueryClient();
  const editorRef = useRef<EmailStudioEditorHandle>(null);
  const [metadata, setMetadata] = useState<EmailMetadata>(DEFAULT_METADATA);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(
    null,
  );
  const [legacyPreviewResult, setLegacyPreviewResult] =
    useState<PreviewResult | null>(null);
  const [ui, dispatch] = useReducer(
    emailStudioUiReducer,
    INITIAL_EMAIL_STUDIO_UI_STATE,
  );
  const [showTestSendDialog, setShowTestSendDialog] = useState(false);
  const [testToEmail, setTestToEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const templatesQuery = useQuery({
    queryKey: getAdminSurfaceQueryKey("emailTemplates"),
    queryFn: fetchEmailTemplates,
    enabled: showTemplatePicker,
  });

  const isLegacyReadOnly = legacyPreviewResult !== null;
  const canEditCurrentTemplate = ui.isEditorReady && !isLegacyReadOnly;

  useEffect(() => {
    if (!templatesQuery.isError) {
      return;
    }
    toast.error("Failed to load templates", {
      description: "Please try again.",
    });
  }, [templatesQuery.isError]);

  const handleEditorReady = useCallback(() => {
    dispatch({ type: "editor_ready", config: getEmailStudioConfig() });
  }, []);

  const handleUndo = useCallback(() => {
    editorRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    editorRef.current?.redo();
  }, []);

  const handlePreview = useCallback(
    async (device: PreviewDevice) => {
      dispatch({ type: "set_preview_device", device });
      if (isLegacyReadOnly && legacyPreviewResult) {
        setPreviewResult(legacyPreviewResult);
        return;
      }
      const editor = editorRef.current;
      if (!editor) {
        return;
      }
      try {
        const exported = await editor.exportEmail();
        setPreviewResult({
          html: exported.html,
          text: exported.text,
          subject: metadata.subject,
          preheader: metadata.preheader,
        });
      } catch (error) {
        toast.error("Preview failed", {
          description:
            error instanceof Error ? error.message : "Could not export email.",
        });
      }
    },
    [
      isLegacyReadOnly,
      legacyPreviewResult,
      metadata.preheader,
      metadata.subject,
    ],
  );

  const handleExportHtml = useCallback(async () => {
    if (isLegacyReadOnly) {
      toast.error("Legacy templates are preview-only in Email Studio");
      return;
    }
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    try {
      const exported = await editor.exportEmail();
      dispatch({ type: "open_export_dialog", html: exported.html });
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Could not export HTML.",
      });
    }
  }, [isLegacyReadOnly]);

  const persistCurrentTemplate = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error("Email editor is not ready.");
    }
    const exportResult = await editor.exportEmail();
    const saved = await persistEmailTemplate(metadata, exportResult);
    setMetadata((current) => ({ ...current, id: saved.id }));
    dispatch({ type: "set_unsaved_changes", unsaved: false });
    void invalidateAdminSurfaceQuery(queryClient, "emailTemplates");
    return saved;
  }, [metadata, queryClient]);

  const handleSaveClick = useCallback(() => {
    if (isLegacyReadOnly) {
      toast.error("Legacy templates are read-only in Email Studio");
      return;
    }
    dispatch({ type: "set_show_save_dialog", open: true });
  }, [isLegacyReadOnly]);

  const handleConfirmSave = useCallback(async () => {
    dispatch({ type: "set_saving", saving: true });
    try {
      await persistCurrentTemplate();
      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully.`,
      });
      dispatch({ type: "set_show_save_dialog", open: false });
    } catch (error) {
      toast.error("Save failed", {
        description:
          error instanceof Error ? error.message : "Could not save template.",
      });
    } finally {
      dispatch({ type: "set_saving", saving: false });
    }
  }, [metadata.name, persistCurrentTemplate]);

  const handleNewTemplate = useCallback(() => {
    setMetadata(DEFAULT_METADATA);
    setPreviewResult(null);
    setLegacyPreviewResult(null);
    dispatch({ type: "set_unsaved_changes", unsaved: false });
    editorRef.current?.loadDesign(EMPTY_REACT_EMAIL_DESIGN);
    toast.success("New template created");
  }, []);

  const handleSelectTemplate = useCallback(
    (template: EmailTemplateListEntry) => {
      setShowTemplatePicker(false);
      const preview = previewFromTemplate(template);
      setMetadata({
        id: template.id,
        name: template.name,
        subject: coercePreviewText(template.default_subject),
        preheader: coercePreviewText(template.default_preheader),
      });
      if (template.builder !== "react_email") {
        setLegacyPreviewResult(preview);
        setPreviewResult(preview);
        toast.info("Legacy template opened read-only", {
          description:
            "Legacy templates can't be edited in React Email. Showing a preview.",
        });
        return;
      }
      setLegacyPreviewResult(null);
      setPreviewResult(null);
      editorRef.current?.loadDesign(
        (template.design_json as Record<string, unknown> | null) ??
          EMPTY_REACT_EMAIL_DESIGN,
      );
      dispatch({ type: "set_unsaved_changes", unsaved: false });
    },
    [],
  );

  const handleConfirmTestSend = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    setIsSendingTest(true);
    try {
      const exportResult = await editor.exportEmail();
      const result = await sendTemplateTestEmail(
        testToEmail,
        metadata,
        exportResult,
      );
      toast.success("Test email sent", {
        description: `Message ${result.messageId} queued for ${testToEmail}.`,
      });
      setShowTestSendDialog(false);
    } catch (error) {
      toast.error("Test send failed", {
        description:
          error instanceof Error ? error.message : "Could not send test email.",
      });
    } finally {
      setIsSendingTest(false);
    }
  }, [metadata, testToEmail]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ui.exportedHtml);
      dispatch({ type: "set_copied_html", copied: true });
      window.setTimeout(() => {
        dispatch({ type: "set_copied_html", copied: false });
      }, 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Could not copy HTML to the clipboard.",
      });
    }
  }, [ui.exportedHtml]);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([ui.exportedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${metadata.name || "email-template"}.html`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [metadata.name, ui.exportedHtml]);

  const onKeyboardShortcut = useEffectEvent((event: KeyboardEvent) => {
    const isMod = event.metaKey || event.ctrlKey;
    if (isMod && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (canEditCurrentTemplate && !ui.isSaving) {
        dispatch({ type: "set_show_save_dialog", open: true });
      }
      return;
    }
    if (isMod && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        editorRef.current?.redo();
      } else {
        editorRef.current?.undo();
      }
      return;
    }
    if (isMod && event.key.toLowerCase() === "e") {
      event.preventDefault();
      void handleExportHtml();
      return;
    }
    if (event.key === "Escape" && ui.isFullscreen) {
      dispatch({ type: "set_fullscreen", fullscreen: false });
    }
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      onKeyboardShortcut(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-colors duration-300 motion-reduce:transition-none",
        ui.isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "flex-1 min-h-0 overflow-hidden",
      )}
    >
      <EmailStudioHeader
        metadata={metadata}
        onMetadataChange={setMetadata}
        isEditorReady={canEditCurrentTemplate}
        isSaving={ui.isSaving}
        hasUnsavedChanges={ui.hasUnsavedChanges}
        isFullscreen={ui.isFullscreen}
        previewDevice={ui.previewDevice}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={handlePreview}
        onExportHtml={() => {
          void handleExportHtml();
        }}
        onTestSend={() => setShowTestSendDialog(true)}
        onInsertMergeTag={(key) => editorRef.current?.insertMergeTag?.(key)}
        onSaveClick={handleSaveClick}
        onNewTemplate={handleNewTemplate}
        onLoadTemplate={() => setShowTemplatePicker(true)}
        onToggleFullscreen={() => dispatch({ type: "toggle_fullscreen" })}
      />

      <div className="relative flex min-h-0 flex-1">
        <EmailStudioEditor
          key={metadata.id ?? "draft"}
          ref={editorRef}
          templateId={metadata.id}
          onReady={handleEditorReady}
          onDesignUpdate={() =>
            dispatch({ type: "set_unsaved_changes", unsaved: true })
          }
        />
        {isLegacyReadOnly ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Legacy template selected read-only"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t bg-background/95 px-4 py-3 text-sm"
          >
            Legacy template selected read-only. Preview remains available after
            closing the dialog.
          </div>
        ) : null}
      </div>

      <EmailStudioPreviewDialog
        open={previewResult !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewResult(null);
          }
        }}
        html={previewResult?.html ?? ""}
        text={previewResult?.text ?? ""}
        subject={previewResult?.subject}
        preheader={previewResult?.preheader}
      />

      <EmailStudioSaveDialog
        open={ui.showSaveDialog}
        onOpenChange={(open) =>
          dispatch({ type: "set_show_save_dialog", open })
        }
        metadata={metadata}
        setMetadata={setMetadata}
        isSaving={ui.isSaving}
        onConfirmSave={() => {
          void handleConfirmSave();
        }}
      />

      <EmailStudioExportDialog
        open={ui.showExportDialog}
        onOpenChange={(open) =>
          dispatch({ type: "set_show_export_dialog", open })
        }
        exportedHtml={ui.exportedHtml}
        copiedHtml={ui.copiedHtml}
        studioConfig={ui.studioConfig}
        onCopyHtml={() => {
          void handleCopyHtml();
        }}
        onDownloadHtml={handleDownloadHtml}
      />

      <EmailStudioTestSendDialog
        open={showTestSendDialog}
        onOpenChange={setShowTestSendDialog}
        toEmail={testToEmail}
        onToEmailChange={setTestToEmail}
        isSending={isSendingTest}
        onSend={() => {
          void handleConfirmTestSend();
        }}
      />

      <EmailStudioTemplatePickerDialog
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        templates={templatesQuery.data ?? []}
        isLoading={templatesQuery.isLoading}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
