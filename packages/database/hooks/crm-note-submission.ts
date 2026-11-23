"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";

import { ownApiFetch } from "@asym/database/own-api";

import type { AdminCrmNoteCreateResponse } from "@asym/database/types";
import type { UseMutationOptions } from "@tanstack/react-query";

type Submission = { key: string; payload: string };

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function postCrmNote(
  input: object,
  idempotencyKey: string,
): Promise<AdminCrmNoteCreateResponse> {
  const response = await ownApiFetch("/api/admin/crm/notes", {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await parseJsonError(
        response,
        `Failed to save CRM note (${response.status})`,
      ),
    );
  }

  return (await response.json()) as AdminCrmNoteCreateResponse;
}

export function useCrmNoteSubmission<Input extends object>(
  options: Omit<
    UseMutationOptions<AdminCrmNoteCreateResponse, Error, Input>,
    "mutationFn"
  > = {},
) {
  const pending = React.useRef<Submission | null>(null);

  return useMutation<AdminCrmNoteCreateResponse, Error, Input>({
    ...options,
    mutationFn: (input) => {
      const payload = JSON.stringify(input);
      const submission =
        pending.current?.payload === payload
          ? pending.current
          : { key: crypto.randomUUID(), payload };
      pending.current = submission;
      return postCrmNote(input, submission.key);
    },
    onSuccess: (...args) => {
      if (pending.current?.payload === JSON.stringify(args[1])) {
        pending.current = null;
      }
      return options.onSuccess?.(...args);
    },
  });
}
