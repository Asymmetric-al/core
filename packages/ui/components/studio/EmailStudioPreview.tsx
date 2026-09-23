"use client";

import { validateMergeTags } from "@asym/email/merge-tag-render";
import { DEFAULT_MERGE_TAG_REGISTRY } from "@asym/email/merge-tags";
import { AlertTriangle, Code2, Monitor, Smartphone, Type } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
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

        {validation.errors.length > 0 ? (
          <Alert className="mx-5 mt-4">
            <AlertTriangle />
            <AlertTitle>Merge tag issues</AlertTitle>
            <AlertDescription>{validation.errors.join("; ")}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs
          defaultValue="rendered"
          className="min-h-0 flex-1 overflow-hidden px-5 pb-5"
        >
          <div className="flex items-center justify-between py-3">
            <TabsList>
              <TabsTrigger value="rendered">
                <Monitor />
                Rendered
              </TabsTrigger>
              <TabsTrigger value="html">
                <Code2 />
                HTML
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type />
                Text
              </TabsTrigger>
            </TabsList>

            <ToggleGroup
              value={[device]}
              onValueChange={(groupValue) => {
                const next = groupValue[0];
                if (next === "desktop" || next === "mobile") {
                  setDevice(next);
                }
              }}
              variant="outline"
              size="sm"
              aria-label="Preview device"
            >
              <ToggleGroupItem value="desktop" aria-label="Desktop preview">
                <Monitor />
              </ToggleGroupItem>
              <ToggleGroupItem value="mobile" aria-label="Mobile preview">
                <Smartphone />
              </ToggleGroupItem>
            </ToggleGroup>
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
