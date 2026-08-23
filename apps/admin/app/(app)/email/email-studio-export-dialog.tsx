"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Check,
  Copy,
  Download,
  FileCode,
  Layers,
  Sparkles,
} from "lucide-react";

import type { EmailStudioFullConfig } from "@asym/config/email-studio";

export interface EmailStudioExportDialogProps {
  studioConfig: EmailStudioFullConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportedHtml: string;
  copiedHtml: boolean;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
}

export function EmailStudioExportDialog({
  studioConfig,
  open,
  onOpenChange,
  exportedHtml,
  copiedHtml,
  onCopyHtml,
  onDownloadHtml,
}: EmailStudioExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Exported HTML
          </DialogTitle>
          <DialogDescription>
            Copy the HTML below or download as a file. The export includes
            inline CSS
            {studioConfig?.export.minifyHtml ? " and minification" : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {exportedHtml.length.toLocaleString()} characters
              {studioConfig?.export.minifyHtml ? " · minified" : ""}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyHtml}
                className="gap-2"
              >
                {copiedHtml ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy HTML
                  </>
                )}
              </Button>
              <Button size="sm" onClick={onDownloadHtml} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-lg border bg-muted/30">
            <pre className="h-[400px] overflow-auto p-4 text-xs leading-relaxed">
              <code>{exportedHtml.slice(0, 3000)}</code>
            </pre>
            {exportedHtml.length > 3000 ? (
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-muted/80 to-transparent p-3 text-center text-xs text-muted-foreground">
                <Layers className="mr-1 inline h-3 w-3" />
                Showing first 3,000 characters of{" "}
                {exportedHtml.length.toLocaleString()} total
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
