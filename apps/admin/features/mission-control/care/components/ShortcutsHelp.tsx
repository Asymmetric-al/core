import { Keyboard, Command } from "lucide-react";
import React from "react";

import { Dialog, DialogHeader, DialogTitle } from "./UI";

interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShortcutRow = ({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
    <span className="text-sm text-foreground font-sans font-medium">
      {description}
    </span>
    <div className="flex shrink-0 items-center gap-1.5">
      {keys.map((key, i) => (
        <React.Fragment key={`${description}-${key}`}>
          <kbd className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-border bg-background px-2 text-xs font-semibold uppercase text-foreground shadow-sm">
            {key === "cmd" ? <Command className="size-3" /> : key}
          </kbd>
          {i < keys.length - 1 && (
            <span className="mx-0.5 text-xs font-semibold text-muted-foreground">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-4 sm:max-w-md sm:p-6"
    >
      <DialogHeader>
        <div className="flex items-center gap-3 pr-6 text-left">
          <div className="shrink-0 rounded-xl bg-muted p-2 text-foreground sm:p-3">
            <Keyboard className="size-6" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            Keyboard Shortcuts
          </DialogTitle>
        </div>
      </DialogHeader>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Global Controls
          </h4>
          <div className="flex flex-col gap-1">
            <ShortcutRow keys={["cmd", "k"]} description="Global Search" />
            <ShortcutRow keys={["?"]} description="Show Shortcuts" />
          </div>
        </div>

        <div>
          <h4 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Navigation
          </h4>
          <div className="flex flex-col gap-1">
            <ShortcutRow keys={["g", "h"]} description="Go to Dashboard" />
            <ShortcutRow keys={["g", "d"]} description="Go to Directory" />
            <ShortcutRow keys={["g", "s"]} description="Go to Settings" />
          </div>
        </div>

        <div>
          <h4 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Profile Actions
          </h4>
          <div className="flex flex-col gap-1">
            <ShortcutRow keys={["l"]} description="Log Activity" />
            <ShortcutRow keys={["e"]} description="Send Email" />
            <ShortcutRow keys={["n"]} description="New Private Note" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted p-3">
        <span className="text-xs font-semibold text-muted-foreground">
          Pro Tip
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-tight text-muted-foreground">
          PRESS{" "}
          <kbd className="rounded-md border border-border bg-background px-2 py-1 text-foreground shadow-sm">
            ESC
          </kbd>{" "}
          TO CLOSE
        </div>
      </div>
    </Dialog>
  );
};
