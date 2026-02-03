import React from "react";
import { Dialog, DialogHeader, DialogTitle, cn } from "./UI";
import { Keyboard, Command, ArrowRight } from "lucide-react";

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
  <div className="flex items-center justify-between py-3 border-b last:border-0 border-stone-100 group">
    <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors font-sans font-medium">
      {description}
    </span>
    <div className="flex items-center gap-1.5">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="min-w-[28px] h-7 px-2 flex items-center justify-center bg-white border-2 border-stone-100 rounded-xl text-[10px] font-black text-stone-500 shadow-sm font-sans uppercase">
            {key === "cmd" ? <Command className="h-3 w-3" /> : key}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-[10px] text-stone-300 mx-0.5 font-bold">
              &plus;
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
      className="max-w-md bg-white p-8"
    >
      <DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-stone-100 rounded-2xl text-stone-600 shadow-inner">
            <Keyboard className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black text-stone-900 font-serif">
            Keyboard Shortcuts
          </DialogTitle>
        </div>
      </DialogHeader>

      <div className="space-y-8 pt-4">
        <div>
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 px-1">
            Global Controls
          </h4>
          <div className="space-y-1">
            <ShortcutRow keys={["cmd", "k"]} description="Global Search" />
            <ShortcutRow keys={["?"]} description="Show Shortcuts" />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 px-1">
            Quick Navigation
          </h4>
          <div className="space-y-1">
            <ShortcutRow keys={["g", "h"]} description="Go to Dashboard" />
            <ShortcutRow keys={["g", "d"]} description="Go to Directory" />
            <ShortcutRow keys={["g", "s"]} description="Go to Settings" />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 px-1">
            Profile Actions
          </h4>
          <div className="space-y-1">
            <ShortcutRow keys={["l"]} description="Log Activity" />
            <ShortcutRow keys={["e"]} description="Send Email" />
            <ShortcutRow keys={["n"]} description="New Private Note" />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between group">
        <span className="text-xs text-stone-500 font-bold font-sans">
          Pro Tip
        </span>
        <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 font-sans tracking-tight">
          PRESS{" "}
          <kbd className="bg-white px-2 py-1 border-2 border-stone-100 rounded-lg shadow-sm text-stone-600 group-hover:border-stone-200 transition-colors">
            ESC
          </kbd>{" "}
          TO CLOSE
        </div>
      </div>
    </Dialog>
  );
};
