"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportCannedResponse } from "../../../hooks/use-support-mutations";
import { SUPPORTED_MERGE_VARIABLES } from "../../../lib/merge-variables";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportCannedResponse } from "../../../types";

interface CannedResponseFormProps {
  response?: SupportCannedResponse | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function CannedResponseForm({
  response,
  onSaved,
  onCancel,
}: CannedResponseFormProps) {
  const save = useSaveSupportCannedResponse();

  const [title, setTitle] = React.useState(response?.title ?? "");
  const [shortCode, setShortCode] = React.useState(response?.shortCode ?? "");
  const [bodyText, setBodyText] = React.useState(response?.bodyText ?? "");

  const isDirty = React.useMemo(
    () =>
      !response ||
      title !== response.title ||
      shortCode !== response.shortCode ||
      bodyText !== response.bodyText,
    [bodyText, response, shortCode, title],
  );

  const handleSave = async () => {
    if (!title.trim() || !shortCode.trim() || !bodyText.trim()) {
      toast.info("Title, shortcode, and body are required.");
      return;
    }
    try {
      await save.mutateAsync({
        id: response?.id,
        title: title.trim(),
        shortCode: shortCode.trim().replace(/^\//, ""),
        bodyText: bodyText.trim(),
        bodyHtml: bodyText.trim().startsWith("<")
          ? bodyText.trim()
          : `<p>${escapeHtml(bodyText.trim()).replace(/\n/g, "<br/>")}</p>`,
        ownerAgentId: response?.ownerAgentId ?? null,
      });
      toast.success(
        response ? "Canned response updated." : "Canned response created.",
      );
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the canned response.",
      );
    }
  };

  return (
    <SettingsPanel
      title={response ? `Edit "${response.title}"` : "New canned response"}
      description="Inserted by typing `/shortcode` in the reply composer."
    >
      <SettingsRow label="Title" htmlFor="canned-title">
        <Input
          id="canned-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
        />
      </SettingsRow>
      <SettingsRow
        label="Shortcode"
        description="The agent types / + shortcode to insert this response."
        htmlFor="canned-code"
      >
        <Input
          id="canned-code"
          value={shortCode}
          onChange={(event) => setShortCode(event.target.value)}
          maxLength={40}
          placeholder="receipt"
          className="font-mono text-[12px]"
        />
      </SettingsRow>
      <SettingsRow
        label="Body"
        description="Supports plain text and merge variables like {{donor.name}}."
      >
        <Textarea
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
          rows={8}
          className="text-[12px]"
        />
      </SettingsRow>
      <SettingsRow label="Merge variables">
        <ul className="flex flex-wrap gap-1">
          {SUPPORTED_MERGE_VARIABLES.map((token) => (
            <li
              key={token}
              className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
            >
              {token}
            </li>
          ))}
        </ul>
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
