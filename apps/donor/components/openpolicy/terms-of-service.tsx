"use client";

import { TermsOfService } from "@openpolicy/react";

import type { CSSProperties } from "react";

import { policyComponents } from "@/components/openpolicy/policy-components";

const policyDocumentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  maxWidth: "100%",
};

export function TermsOfServiceDocument() {
  return (
    <TermsOfService components={policyComponents} style={policyDocumentStyle} />
  );
}
