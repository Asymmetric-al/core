"use client";

import { Switch } from "@asym/ui/components/shadcn/switch";
import { cn } from "@asym/ui/lib/utils";
import { Signature } from "lucide-react";

import type { SupportAssignee } from "../../../types";

interface SignatureChipProps {
  agent: SupportAssignee | null;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

/**
 * Toggle that appends the agent's signature to outbound replies. The toggle
 * never edits the Tiptap document — the serializer in `serialize-payload.ts`
 * appends the signature to `html` and `text` only at send time.
 */
export function SignatureChip({
  agent,
  enabled,
  onChange,
}: SignatureChipProps) {
  if (!agent) return null;
  const id = `support-signature-${agent.id}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-2 text-[12px] font-medium text-foreground",
        enabled && "border-success/30 bg-success/10 text-success",
      )}
    >
      <Signature className="size-3.5 text-muted-foreground" />
      <span>Append signature</span>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onChange}
        className="ml-1 scale-75"
      />
    </label>
  );
}
