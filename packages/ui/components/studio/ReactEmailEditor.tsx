"use client";

import {
  EMPTY_REACT_EMAIL_DESIGN,
  type EmailStudioEditorHandle,
  type EmailStudioExportOptions,
  type EmailStudioExportResult,
} from "@asym/email/email-builder-types";
import { composeReactEmail } from "@react-email/editor/core";
import { StarterKit as ReactEmailStarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Loader2, Mail } from "lucide-react";
import dynamic from "next/dynamic";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Progress } from "@asym/ui/components/shadcn/progress";
import { cn } from "@asym/ui/lib/utils";

import { createMergeTagNode, MergeTagExtension } from "./merge-tag-extension";

import type { EmailEditorProps, EmailEditorRef } from "@react-email/editor";

const EmailEditor = dynamic(
  () => import("@react-email/editor").then((mod) => mod.EmailEditor),
  {
    ssr: false,
    loading: () => null,
  },
);

export interface ReactEmailEditorProps {
  initialDesign?: Record<string, unknown> | string | null;
  templateId?: string | null;
  className?: string;
  onReady?: () => void;
  onDesignUpdate?: (design: Record<string, unknown>) => void;
  onExport?: (result: EmailStudioExportResult) => void;
}

function normalizeInitialDesign(
  design: ReactEmailEditorProps["initialDesign"],
): EmailEditorProps["content"] {
  if (!design) {
    return EMPTY_REACT_EMAIL_DESIGN as unknown as EmailEditorProps["content"];
  }
  if (typeof design === "string") {
    try {
      return JSON.parse(design) as EmailEditorProps["content"];
    } catch {
      return EMPTY_REACT_EMAIL_DESIGN as unknown as EmailEditorProps["content"];
    }
  }
  return design as EmailEditorProps["content"];
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : EMPTY_REACT_EMAIL_DESIGN;
}

export const ReactEmailEditor = forwardRef<
  EmailStudioEditorHandle,
  ReactEmailEditorProps
>(function ReactEmailEditor(
  { initialDesign, templateId, className, onReady, onDesignUpdate, onExport },
  ref,
) {
  const editorRef = useRef<EmailEditorRef>(null);
  const [isReady, setIsReady] = useState(false);
  const content = useMemo(
    () => normalizeInitialDesign(initialDesign),
    [initialDesign],
  );
  const extensions = useMemo<NonNullable<EmailEditorProps["extensions"]>>(
    () =>
      [
        ReactEmailStarterKit.configure(),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") {
              return `Heading ${node.attrs.level}`;
            }
            return "Press '/' for commands";
          },
          includeChildren: true,
        }),
        EmailTheming.configure({ theme: "basic" }),
        MergeTagExtension,
      ] as NonNullable<EmailEditorProps["extensions"]>,
    [],
  );

  const exportDesign = useCallback(async () => {
    return asRecord(editorRef.current?.getJSON());
  }, []);

  const exportEmail = useCallback(
    async (
      options?: EmailStudioExportOptions,
    ): Promise<EmailStudioExportResult> => {
      const editor = editorRef.current?.editor;
      const design = asRecord(editorRef.current?.getJSON());
      const email = editor
        ? await composeReactEmail({
            editor,
            preview: options?.preheader,
          })
        : await (editorRef.current?.getEmail() ?? { html: "", text: "" });

      const result: EmailStudioExportResult = {
        builder: "react_email",
        builderVersion: "1.5.3",
        design,
        html: email.html,
        text: email.text,
        subject: options?.subject,
        preheader: options?.preheader,
      };

      onExport?.(result);
      return result;
    },
    [onExport],
  );

  const saveDesign = useCallback(
    async (options?: EmailStudioExportOptions) => {
      const result = await exportEmail(options);
      return result.design;
    },
    [exportEmail],
  );

  const loadDesign = useCallback((design: Record<string, unknown> | string) => {
    const editor = editorRef.current?.editor;
    if (!editor) return;
    const nextDesign =
      typeof design === "string" ? normalizeInitialDesign(design) : design;
    editor.commands.setContent(nextDesign as never);
  }, []);

  const undo = useCallback(() => {
    editorRef.current?.editor?.commands.undo();
  }, []);

  const redo = useCallback(() => {
    editorRef.current?.editor?.commands.redo();
  }, []);

  const focus = useCallback(() => {
    editorRef.current?.editor?.commands.focus();
  }, []);

  const canUndo = useCallback(() => {
    return editorRef.current?.editor?.can().undo() ?? false;
  }, []);

  const canRedo = useCallback(() => {
    return editorRef.current?.editor?.can().redo() ?? false;
  }, []);

  const insertMergeTag = useCallback((key: string) => {
    editorRef.current?.editor
      ?.chain()
      .focus()
      .insertContent(createMergeTagNode(key))
      .run();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getBuilderKind: () => "react_email",
      exportEmail,
      exportDesign,
      saveDesign,
      loadDesign,
      undo,
      redo,
      focus,
      canUndo,
      canRedo,
      insertMergeTag,
    }),
    [
      canRedo,
      canUndo,
      exportDesign,
      exportEmail,
      focus,
      insertMergeTag,
      loadDesign,
      redo,
      saveDesign,
      undo,
    ],
  );

  const handleReady = useCallback(() => {
    setIsReady(true);
    onReady?.();
  }, [onReady]);

  const handleUpdate = useCallback(
    (editor: EmailEditorRef) => {
      onDesignUpdate?.(asRecord(editor.getJSON()));
    },
    [onDesignUpdate],
  );

  const handleUploadImage = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (templateId) {
        formData.append("templateId", templateId);
      }

      const response = await fetch("/api/email/assets/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Image upload failed");
      }

      return { url: payload.url };
    },
    [templateId],
  );

  return (
    <div className={cn("react-email-builder-wrapper", className)}>
      {!isReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex w-56 flex-col items-center gap-5 text-center">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-primary">
              <Mail className="h-8 w-8" />
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading email editor…
              </div>
              <Progress value={65} className="h-1.5" />
            </div>
          </div>
        </div>
      )}

      <EmailEditor
        ref={editorRef}
        content={content}
        onReady={handleReady}
        onUpdate={handleUpdate}
        onUploadImage={handleUploadImage}
        extensions={extensions}
        theme="basic"
        className="min-h-full w-full p-8 outline-none"
        placeholder="Press '/' for blocks"
      />
    </div>
  );
});

export default ReactEmailEditor;
