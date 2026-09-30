"use client";

import { PrivacyPolicy } from "@openpolicy/react";

import type { CSSProperties } from "react";

import { policyComponents } from "@/components/openpolicy/policy-component-map";

const policyDocumentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  maxWidth: "100%",
};

export function PrivacyPolicyDocument() {
  return (
    <PrivacyPolicy components={policyComponents} style={policyDocumentStyle} />
  );
}
