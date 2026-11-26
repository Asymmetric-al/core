"use client";

import { ownApiFetch } from "@asym/database/own-api";

import {
  partnerIntent,
  toPartnerCommandBody,
  type PartnerFormValues,
} from "./add-partner-form-model";

export type AddedPartner = {
  donorId: string;
  partyId: string;
  duplicate: boolean;
};

export class AddPartnerRefused extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Add Partner was refused with status ${status}`);
    this.name = "AddPartnerRefused";
    this.status = status;
  }
}

const submissionKeys = new Map<string, string>();
const inFlight = new Map<string, Promise<AddedPartner>>();

async function submit(
  intent: string,
  values: PartnerFormValues,
): Promise<AddedPartner> {
  const key = submissionKeys.get(intent) ?? crypto.randomUUID();
  submissionKeys.set(intent, key);

  const response = await ownApiFetch("/api/missionary/donors", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify(toPartnerCommandBody(values)),
  });
  if (response.status < 500) {
    submissionKeys.delete(intent);
  }
  if (!response.ok) {
    throw new AddPartnerRefused(response.status);
  }

  const payload = (await response.json()) as Partial<AddedPartner>;
  if (
    typeof payload.donorId !== "string" ||
    typeof payload.partyId !== "string"
  ) {
    throw new TypeError("Add Partner answered without the stored partner");
  }
  return {
    donorId: payload.donorId,
    partyId: payload.partyId,
    duplicate: payload.duplicate === true,
  };
}

export function addPartner(values: PartnerFormValues): Promise<AddedPartner> {
  const intent = partnerIntent(values);
  const running = inFlight.get(intent);
  if (running) {
    return running;
  }
  const request = submit(intent, values).finally(() => {
    inFlight.delete(intent);
  });
  inFlight.set(intent, request);
  return request;
}
