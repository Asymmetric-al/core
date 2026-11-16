"use client";

import { Input } from "@asym/ui/components/shadcn/input";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import * as React from "react";
import { toast } from "sonner";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useSaveSupportSignature } from "../../../hooks/use-support-mutations";
import { plainTextToHtml } from "../../../lib/text";
import { SettingsEditorForm } from "../SettingsEditorSheet";
import { SettingsRow } from "../SettingsRow";

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
        bodyHtml: plainTextToHtml(bodyText.trim()),
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
    <SettingsEditorForm
      draft={{ name, ownerAgentId, bodyText, isDefault }}
      canSave={isDirty}
      isNew={!signature}
      isSaving={save.isPending}
      noun="signature"
      onSave={() => void handleSave()}
      onCancel={onCancel}
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
        control
        label="Owner"
        description="A workspace signature is shared by every agent. An agent’s own signature takes priority over it."
      >
        <div className="max-w-sm">
          <SearchableSelect
            items={[
              { value: "workspace", label: "Workspace" },
              ...agents.map((agent) => ({
                value: agent.id,
                label: agent.name,
              })),
            ]}
            value={ownerAgentId ?? "workspace"}
            onValueChange={(value) => {
              if (value === null) return;
              setOwnerAgentId(value === "workspace" ? null : value);
            }}
            aria-label="Owner"
          />
        </div>
      </SettingsRow>
      <SettingsRow
        label="Body"
        htmlFor="sig-body"
        description="Plain text. Line breaks are kept; markup is displayed as text."
      >
        <Textarea
          id="sig-body"
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
          rows={6}
          placeholder={"Name\nTitle\nemail@example.org"}
        />
      </SettingsRow>
      <SettingsRow
        control
        label="Default"
        description="Marks the default for its owner: the agent, or the whole workspace."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={isDefault}
            onCheckedChange={setIsDefault}
            aria-label="Default signature"
          />
          <span className="text-xs text-muted-foreground">
            {isDefault ? "Default" : "Not default"}
          </span>
        </div>
      </SettingsRow>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">Preview</p>
        <div className="rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
          {bodyText.split("\n").map((line, index) => (
            <span key={index} className="block">
              {line.length === 0 ? "\u00A0" : line}
            </span>
          ))}
        </div>
      </div>
    </SettingsEditorForm>
  );
}
