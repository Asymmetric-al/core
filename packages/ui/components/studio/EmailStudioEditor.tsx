"use client";

import {
  type EmailBuilderKind,
  type EmailStudioEditorHandle,
  type EmailStudioExportOptions,
  type EmailStudioExportResult,
} from "@asym/email/email-builder-types";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { cn } from "@asym/ui/lib/utils";

import {
  LegacyUnlayerEmailEditor,
  type LegacyUnlayerEditorHandle,
} from "./legacy/UnlayerEmailEditor";
import { ReactEmailEditor } from "./ReactEmailEditor";

import type { UnlayerDesignJSON } from "@asym/email/email-studio-types";

export interface EmailStudioEditorProps {
  builder?: EmailBuilderKind;
  legacyUnlayerEnabled?: boolean;
  initialDesign?: Record<string, unknown> | string | null;
  templateId?: string | null;
  className?: string;
  onReady?: (builder: EmailBuilderKind) => void;
  onDesignUpdate?: (design: Record<string, unknown>) => void;
  onExport?: (result: EmailStudioExportResult) => void;
}

function htmlToText(html: string): string {
  if (typeof document === "undefined") {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const container = document.createElement("div");
  container.innerHTML = html;
  return (container.textContent ?? "").replace(/\s+/g, " ").trim();
}

function normalizeLegacyDesign(
  design: EmailStudioEditorProps["initialDesign"],
): UnlayerDesignJSON | undefined {
  if (!design) return undefined;
  if (typeof design === "string") {
    try {
      return JSON.parse(design) as UnlayerDesignJSON;
    } catch {
      return undefined;
    }
  }
  return design as unknown as UnlayerDesignJSON;
}

export const EmailStudioEditor = forwardRef<
  EmailStudioEditorHandle,
  EmailStudioEditorProps
>(function EmailStudioEditor(
  {
    builder = "react_email",
    legacyUnlayerEnabled = true,
    initialDesign,
    templateId,
    className,
    onReady,
    onDesignUpdate,
    onExport,
  },
  ref,
) {
  const reactEditorRef = useRef<EmailStudioEditorHandle>(null);
  const legacyEditorRef = useRef<LegacyUnlayerEditorHandle>(null);
  const legacyDesign = useMemo(
    () => normalizeLegacyDesign(initialDesign),
    [initialDesign],
  );

  const activeHandle = useCallback(() => {
    if (builder === "unlayer") {
      return legacyEditorRef.current;
    }
    return reactEditorRef.current;
  }, [builder]);

  const exportEmail = useCallback(
    async (
      options?: EmailStudioExportOptions,
    ): Promise<EmailStudioExportResult> => {
      if (builder !== "unlayer") {
        const result = await reactEditorRef.current!.exportEmail(options);
        onExport?.(result);
        return result;
      }

      const legacy = legacyEditorRef.current;
      if (!legacy) throw new Error("Legacy editor not ready");

      const payload = await legacy.exportHtml({
        minify: options?.minify,
        mergeTags: options?.mergeTagSamples,
      });
      const result: EmailStudioExportResult = {
        builder: "unlayer",
        builderVersion: "react-email-editor-legacy",
        design: payload.design as unknown as Record<string, unknown>,
        html: payload.html,
        text: htmlToText(payload.html),
        subject: options?.subject,
        preheader: options?.preheader,
      };
      onExport?.(result);
      return result;
    },
    [builder, onExport],
  );

  const exportDesign = useCallback(async () => {
    if (builder !== "unlayer") {
      return reactEditorRef.current!.exportDesign();
    }
    const design = await legacyEditorRef.current!.exportDesign();
    return design as unknown as Record<string, unknown>;
  }, [builder]);

  const saveDesign = useCallback(
    async (options?: EmailStudioExportOptions) => {
      const result = await exportEmail(options);
      return result.design;
    },
    [exportEmail],
  );

  const loadDesign = useCallback(
    (design: Record<string, unknown> | string) => {
      if (builder !== "unlayer") {
        reactEditorRef.current?.loadDesign(design);
        return;
      }
      const legacyDesign = normalizeLegacyDesign(design);
      if (legacyDesign) {
        legacyEditorRef.current?.loadDesign(legacyDesign);
      }
    },
    [builder],
  );

  useImperativeHandle(
    ref,
    () => ({
      getBuilderKind: () => builder,
      exportEmail,
      exportDesign,
      saveDesign,
      loadDesign,
      undo: () => activeHandle()?.undo(),
      redo: () => activeHandle()?.redo(),
      focus: () =>
        (activeHandle() as Partial<EmailStudioEditorHandle> | null)?.focus?.(),
      canUndo: () =>
        (
          activeHandle() as Partial<EmailStudioEditorHandle> | null
        )?.canUndo?.() ?? true,
      canRedo: () =>
        (
          activeHandle() as Partial<EmailStudioEditorHandle> | null
        )?.canRedo?.() ?? true,
      insertMergeTag: (key: string) =>
        (
          activeHandle() as Partial<EmailStudioEditorHandle> | null
        )?.insertMergeTag?.(key),
    }),
    [activeHandle, builder, exportDesign, exportEmail, loadDesign, saveDesign],
  );

  if (builder === "unlayer") {
    if (!legacyUnlayerEnabled) {
      return (
        <div
          className={cn(
            "flex h-full items-center justify-center bg-background p-8 text-center text-sm text-muted-foreground",
            className,
          )}
        >
          Legacy Unlayer editing is disabled for this environment.
        </div>
      );
    }

    return (
      <LegacyUnlayerEmailEditor
        ref={legacyEditorRef}
        mode="email"
        editorId="email-studio-legacy-unlayer-editor"
        initialDesign={legacyDesign}
        className={className}
        onReady={() => onReady?.("unlayer")}
        onDesignUpdate={(design) =>
          onDesignUpdate?.(design as unknown as Record<string, unknown>)
        }
      />
    );
  }

  return (
    <ReactEmailEditor
      ref={reactEditorRef}
      initialDesign={initialDesign}
      templateId={templateId}
      className={className}
      onReady={() => onReady?.("react_email")}
      onDesignUpdate={onDesignUpdate}
      onExport={onExport}
    />
  );
});

export default EmailStudioEditor;
