"use client";

import {
  type EmailStudioEditorHandle,
  type EmailStudioExportResult,
} from "@asym/email/email-builder-types";
import { forwardRef } from "react";

import { ReactEmailEditor } from "./ReactEmailEditor";

export interface EmailStudioEditorProps {
  initialDesign?: Record<string, unknown> | string | null;
  templateId?: string | null;
  className?: string;
  /** Shows the email without letting anyone change it. */
  readOnly?: boolean;
  onReady?: () => void;
  onDesignUpdate?: (design: Record<string, unknown>) => void;
  onExport?: (result: EmailStudioExportResult) => void;
}

/**
 * Email Studio editor surface.
 *
 * React Email is the sole Email Studio editor. The Unlayer editor has been
 * fully removed from this path; it is retained only for PDF Studio
 * (`UnlayerDocumentEditor`) and for reading legacy `builder='unlayer'`
 * templates outside the visual editor.
 */
export const EmailStudioEditor = forwardRef<
  EmailStudioEditorHandle,
  EmailStudioEditorProps
>(function EmailStudioEditor(
  {
    initialDesign,
    templateId,
    className,
    readOnly,
    onReady,
    onDesignUpdate,
    onExport,
  },
  ref,
) {
  return (
    <ReactEmailEditor
      ref={ref}
      initialDesign={initialDesign}
      templateId={templateId}
      className={className}
      readOnly={readOnly}
      onReady={onReady}
      onDesignUpdate={onDesignUpdate}
      onExport={onExport}
    />
  );
});

export default EmailStudioEditor;
