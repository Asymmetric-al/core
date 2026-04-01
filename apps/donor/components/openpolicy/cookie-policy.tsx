"use client";

import { CookiePolicy } from "@openpolicy/react";

import type { CSSProperties } from "react";

import { policyComponents } from "@/components/openpolicy/policy-components";

const policyDocumentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  maxWidth: "100%",
};

export function CookiePolicyDocument() {
  return (
    <CookiePolicy components={policyComponents} style={policyDocumentStyle} />
  );
}
