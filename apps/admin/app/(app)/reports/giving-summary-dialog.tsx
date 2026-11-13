"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { ClipboardList, Copy } from "lucide-react";
import { useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/**
 * The report's giving summary as plain text, ready to paste into an email or
 * a board report. The text stays on screen and selectable, so a failed copy
 * still leaves staff a way to take it.
 */
export function GivingSummaryDialog({ text }: { text: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const lines = text.split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <Dialog onOpenChange={(open) => (open ? setCopyState("idle") : null)}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <ClipboardList aria-hidden="true" />
            Summary
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giving summary</DialogTitle>
          <DialogDescription>
            Plain text from this report, to paste into an email or a board
            report.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3 text-sm text-foreground select-text">
          {/* Lines are fixed in order and can repeat, so position is the
              stable key. */}
          {lines.map((line, index) => (
            <p
              key={`summary-line-${index}`}
              className={index === 0 ? "font-medium" : undefined}
            >
              {line}
            </p>
          ))}
        </div>
        <DialogFooter>
          <span
            role="status"
            className="me-auto self-center text-sm text-muted-foreground"
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Couldn't copy. Select the text above instead."
                : ""}
          </span>
          <DialogClose render={<Button variant="outline">Close</Button>} />
          <Button onClick={() => void copy()}>
            <Copy aria-hidden="true" />
            Copy summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
