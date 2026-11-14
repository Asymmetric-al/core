"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { toast } from "@payloadcms/ui";
import { Copy } from "lucide-react";

import { shortReferenceId } from "./payload-list-grid";

/**
 * A raw reference ID (a missionary or fund UUID) in a list cell: both ends
 * of the value, so rows that share a prefix still read differently, and a
 * copy button that keyboard and touch users can reach. The button's name
 * and tooltip carry the full value. With the record's `name` (a missionary,
 * a fund), the cell reads as that name and the ID stays one copy away.
 */
export function ReferenceId({
  value,
  label,
  name,
}: {
  value: string;
  label: string;
  /** The referenced record's name, when the list has loaded it. */
  name?: string | null;
}) {
  const copy = () => {
    const written =
      navigator.clipboard?.writeText(value) ??
      Promise.reject(new Error("Clipboard unavailable"));
    void written.then(
      () => toast.success(`${label} copied`),
      () => toast.error("Couldn't copy to the clipboard."),
    );
  };

  return (
    <span className="inline-flex max-w-60 items-center gap-1 whitespace-nowrap">
      {name ? (
        <span title={name} className="min-w-0 truncate">
          {name}
        </span>
      ) : (
        <span className="font-mono text-xs text-muted-foreground">
          {shortReferenceId(value)}
        </span>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Copy ${label} ${value}`}
              onClick={copy}
            >
              <Copy aria-hidden="true" />
            </Button>
          }
        />
        <TooltipContent>
          <span className="font-mono">{value}</span>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
