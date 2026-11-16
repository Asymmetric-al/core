"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { AlertCircle, Check, FileCode, Monitor } from "lucide-react";

export interface NativePreviewState {
  html: string;
  diagnostics: Array<{
    code: string;
    severity: "info" | "warning" | "error";
    message: string;
    path?: string[];
  }>;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
}

export function NativePdfDocumentBuilderSection({
  templateText,
  preview,
  onTemplateTextChange,
  onPreview,
}: {
  templateText: string;
  preview: NativePreviewState;
  onTemplateTextChange: (value: string) => void;
  onPreview: () => void;
}) {
  return (
    <div className="absolute inset-0 grid min-h-0 grid-cols-1 grid-rows-2 bg-background lg:grid-rows-1 lg:grid-cols-11">
      <section className="flex min-h-0 flex-col border-r bg-background lg:col-span-5">
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileCode className="size-4 text-muted-foreground" />
            Document JSON
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onPreview}
            disabled={preview.status === "loading"}
          >
            <Monitor className="mr-2 size-4" />
            Preview
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <textarea
            aria-label="PDF template source"
            value={templateText}
            onChange={(event) => onTemplateTextChange(event.target.value)}
            spellCheck={false}
            className="block h-full min-h-48 w-full resize-y border-0 bg-background px-3 py-2 font-mono text-base md:text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-col bg-muted/30 lg:col-span-6">
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Monitor className="size-4 text-muted-foreground" />
            Authoring Preview
          </div>
          <div
            role="status"
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            {preview.status === "loading" && <Spinner aria-hidden="true" />}
            {
              {
                idle: "Not previewed yet",
                loading: "Previewing…",
                success: "Previewed with sample data",
                error: "Preview failed",
              }[preview.status]
            }
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <iframe
            title="Native PDF authoring preview"
            // The print document is static markup plus inline CSS (no
            // scripts), so the same sandbox as the email preview applies.
            sandbox="allow-same-origin"
            srcDoc={preview.html}
            className="min-h-0 w-full flex-1 bg-card"
          />
          <div className="max-h-40 overflow-y-auto border-t bg-background p-3">
            {preview.error ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertDescription>{preview.error}</AlertDescription>
              </Alert>
            ) : preview.diagnostics.length > 0 ? (
              <div className="space-y-2">
                {preview.diagnostics.map((diagnostic, index) => (
                  <div
                    key={`${diagnostic.code}-${index}`}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      <Badge
                        variant={
                          diagnostic.severity === "error"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {diagnostic.severity === "info"
                          ? "Info"
                          : diagnostic.severity === "warning"
                            ? "Warning"
                            : "Error"}
                      </Badge>{" "}
                      {diagnostic.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : preview.status === "success" ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5" />
                No preview issues found.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
