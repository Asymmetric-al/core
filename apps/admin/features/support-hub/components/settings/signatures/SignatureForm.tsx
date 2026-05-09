"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import * as React from "react";
import { toast } from "sonner";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useSaveSupportSignature } from "../../../hooks/use-support-mutations";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportSignature } from "../../../types";

interface SignatureFormProps {
  signature?: SupportSignature | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function SignatureForm({
  signature,
  onSaved,
  onCancel,
}: SignatureFormProps) {
  const save = useSaveSupportSignature();
  const { data: agents } = useSupportAgents();

  const [name, setName] = React.useState(signature?.name ?? "");
  const [ownerAgentId, setOwnerAgentId] = React.useState<string | null>(
    signature?.ownerAgentId ?? null,
  );
  const [bodyText, setBodyText] = React.useState(signature?.bodyText ?? "");
  const [isDefault, setIsDefault] = React.useState(
    signature?.isDefault ?? false,
  );

  const isDirty = React.useMemo(
    () =>
      !signature ||
      name !== signature.name ||
      ownerAgentId !== signature.ownerAgentId ||
      bodyText !== signature.bodyText ||
      isDefault !== signature.isDefault,
    [bodyText, isDefault, name, ownerAgentId, signature],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.info("Give the signature a name first.");
      return;
    }
    if (!bodyText.trim()) {
      toast.info("Add some content first.");
      return;
    }
    try {
      await save.mutateAsync({
        id: signature?.id,
        ownerAgentId,
        name: name.trim(),
        bodyText: bodyText.trim(),
        bodyHtml: bodyText.trim().startsWith("<")
          ? bodyText.trim()
          : `<p>${escapeHtml(bodyText.trim()).replace(/\n/g, "<br/>")}</p>`,
        isDefault,
      });
      toast.success(signature ? "Signature updated." : "Signature created.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the signature.",
      );
    }
  };

  return (
    <SettingsPanel
      title={signature ? `Edit "${signature.name}"` : "New signature"}
      description="Rendered at the bottom of outbound donor replies when enabled."
    >
      <SettingsRow label="Name" htmlFor="sig-name">
        <Input
          id="sig-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
        />
      </SettingsRow>
      <SettingsRow
        label="Owner"
        description="Workspace signatures apply to every agent; agent-owned signatures override the default."
      >
        <Select
          value={ownerAgentId ?? "workspace"}
          onValueChange={(value) =>
            setOwnerAgentId(value === "workspace" ? null : value)
          }
        >
          <SelectTrigger className="h-9 max-w-sm text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="workspace">Workspace</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow
        label="Body"
        description="Plain text or basic HTML. Line breaks render as-is."
      >
        <Textarea
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
          rows={6}
          className="font-mono text-[12px]"
          placeholder={"Name\nTitle\nemail@example.org"}
        />
      </SettingsRow>
      <SettingsRow
        label="Default"
        description="Agent signatures default per agent; workspace signatures default across the tenant."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={isDefault}
            onCheckedChange={setIsDefault}
            aria-label="Default signature"
          />
          <span className="text-[12px] text-zinc-500">
            {isDefault ? "Default" : "Not default"}
          </span>
        </div>
      </SettingsRow>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-xs"
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Preview
        </Label>
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3 font-mono text-[12px] text-zinc-700">
          {bodyText.split("\n").map((line, index) => (
            <span key={index} className="block">
              {line.length === 0 ? "\u00A0" : line}
            </span>
          ))}
        </div>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={save.isPending}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </SettingsPanel>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
