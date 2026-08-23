"use client";

import { validateMergeTags } from "@asym/email/merge-tag-render";
import { DEFAULT_MERGE_TAG_REGISTRY } from "@asym/email/merge-tags";
import { AlertTriangle, Code2, Monitor, Smartphone, Type } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";

export interface EmailStudioPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  text: string;
  subject?: string;
  preheader?: string;
  initialDevice?: "desktop" | "mobile";
}

export function EmailStudioPreviewDialog({
  open,
  onOpenChange,
  html,
  text,
  subject,
  preheader,
  initialDevice = "desktop",
}: EmailStudioPreviewDialogProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">(initialDevice);

  useEffect(() => {
    if (open) {
      setDevice(initialDevice);
    }
  }, [open, initialDevice]);
  const validation = useMemo(
    () =>
      validateMergeTags([subject, preheader, html, text].join("\n"), {
        registry: DEFAULT_MERGE_TAG_REGISTRY,
      }),
    [html, preheader, subject, text],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Email preview</DialogTitle>
          <DialogDescription>
            {subject || "Untitled email"}
            {preheader ? ` · ${preheader}` : ""}
          </DialogDescription>
        </DialogHeader>

        {validation.errors.length > 0 && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{validation.errors.map((error) => error).join("; ")}</div>
          </div>
        )}

        <Tabs
          defaultValue="rendered"
          className="min-h-0 flex-1 overflow-hidden px-5 pb-5"
        >
          <div className="flex items-center justify-between py-3">
            <TabsList>
              <TabsTrigger value="rendered">
                <Monitor className="h-4 w-4" />
                Rendered
              </TabsTrigger>
              <TabsTrigger value="html">
                <Code2 className="h-4 w-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center rounded-lg bg-muted p-0.5">
              <button
                type="button"
                aria-label="Desktop preview"
                className={cn(
                  "rounded-md p-1.5 text-muted-foreground transition-colors",
                  device === "desktop" &&
                    "bg-background text-foreground shadow-sm",
                )}
                onClick={() => setDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Mobile preview"
                className={cn(
                  "rounded-md p-1.5 text-muted-foreground transition-colors",
                  device === "mobile" &&
                    "bg-background text-foreground shadow-sm",
                )}
                onClick={() => setDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          <TabsContent value="rendered" className="min-h-0 overflow-auto">
            <div className="flex min-h-[560px] justify-center rounded-md border bg-muted/50 p-4">
              <iframe
                sandbox="allow-same-origin"
                srcDoc={html}
                title="Email preview"
                className={cn(
                  "h-[560px] rounded-sm border bg-white shadow-sm",
                  device === "mobile" ? "w-[390px]" : "w-full max-w-[760px]",
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="min-h-0 overflow-auto">
            <pre className="max-h-[560px] overflow-auto rounded-md border bg-muted p-4 text-xs leading-relaxed">
              {html}
            </pre>
          </TabsContent>

          <TabsContent value="text" className="min-h-0 overflow-auto">
            <pre className="max-h-[560px] whitespace-pre-wrap overflow-auto rounded-md border bg-muted p-4 text-sm leading-relaxed">
              {text}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default EmailStudioPreviewDialog;
