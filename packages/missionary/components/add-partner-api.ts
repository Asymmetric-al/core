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

export async function addPartner(
  values: PartnerFormValues,
): Promise<AddedPartner> {
  const intent = partnerIntent(values);
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
  submissionKeys.delete(intent);
  return {
    donorId: payload.donorId,
    partyId: payload.partyId,
    duplicate: payload.duplicate === true,
  };
}
