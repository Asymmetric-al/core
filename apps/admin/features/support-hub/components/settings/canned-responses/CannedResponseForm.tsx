"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { FieldError } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import * as React from "react";
import { toast } from "sonner";

import { useSupportCannedResponses } from "../../../hooks/use-support-canned-responses";
import { useSaveSupportCannedResponse } from "../../../hooks/use-support-mutations";
import { SUPPORTED_MERGE_VARIABLES } from "../../../lib/merge-variables";
import { plainTextToHtml } from "../../../lib/text";
import { SettingsEditorForm } from "../SettingsEditorSheet";
import { SettingsRow } from "../SettingsRow";

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
  const responses = useSupportCannedResponses();
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);

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
    const code = shortCode.trim().replace(/^\//, "");
    const unchanged = response && code === response.shortCode;
    const issue =
      !unchanged && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code)
        ? "Use lowercase letters, numbers and hyphens."
        : responses.data.some(
              (other) =>
                other.id !== response?.id &&
                other.ownerAgentId === (response?.ownerAgentId ?? null) &&
                other.shortCode.toLowerCase() === code.toLowerCase(),
            )
          ? "This shortcode is already in use."
          : null;
    setCodeError(issue);
    if (issue) {
      document.getElementById("canned-code")?.focus();
      return;
    }
    try {
      await save.mutateAsync({
        id: response?.id,
        title: title.trim(),
        shortCode: code,
        bodyText: bodyText.trim(),
        bodyHtml: plainTextToHtml(bodyText.trim()),
        ownerAgentId: response?.ownerAgentId ?? null,
      });
      toast.success(
        response ? "Canned response updated." : "Canned response created.",
      );
      onSaved();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "This shortcode is already in use."
      ) {
        setCodeError(error.message);
        document.getElementById("canned-code")?.focus();
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the canned response.",
      );
    }
  };

  return (
    <SettingsEditorForm
      draft={{ title, shortCode, bodyText }}
      canSave={isDirty}
      isNew={!response}
      isSaving={save.isPending}
      noun="response"
      onSave={() => void handleSave()}
      onCancel={onCancel}
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
        description="Type / and this shortcode in the reply composer to insert the response."
        htmlFor="canned-code"
      >
        <InputGroup>
          <InputGroupAddon aria-hidden="true">/</InputGroupAddon>
          <InputGroupInput
            id="canned-code"
            aria-invalid={!!codeError}
            aria-describedby={codeError ? "canned-code-error" : undefined}
            value={shortCode}
            onChange={(event) => setShortCode(event.target.value)}
            maxLength={40}
            placeholder="receipt"
            className="font-mono"
          />
        </InputGroup>
        {codeError ? (
          <FieldError id="canned-code-error">{codeError}</FieldError>
        ) : null}
      </SettingsRow>
      <SettingsRow
        label="Response text"
        htmlFor="canned-body"
        description="Plain text. Merge variables such as {{donor.name}} are filled in when the response is inserted."
      >
        <Textarea
          ref={bodyRef}
          id="canned-body"
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
          rows={8}
          className=""
        />
      </SettingsRow>
      {response?.bodyText.trim().startsWith("<") &&
      response.bodyHtml === response.bodyText ? (
        <p className="text-sm text-muted-foreground">
          This response was stored as HTML. Saving converts it to plain text,
          including any markup shown here.
        </p>
      ) : null}
      <SettingsRow control label="Merge variables">
        <ul className="flex flex-wrap gap-1">
          {SUPPORTED_MERGE_VARIABLES.map((token) => (
            <li key={token}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const body = bodyRef.current;
                  const start = body?.selectionStart ?? bodyText.length;
                  const end = body?.selectionEnd ?? start;
                  setBodyText(
                    bodyText.slice(0, start) + token + bodyText.slice(end),
                  );
                  requestAnimationFrame(() => {
                    body?.focus();
                    body?.setSelectionRange(
                      start + token.length,
                      start + token.length,
                    );
                  });
                }}
              >
                {token}
              </Button>
            </li>
          ))}
        </ul>
      </SettingsRow>
    </SettingsEditorForm>
  );
}
