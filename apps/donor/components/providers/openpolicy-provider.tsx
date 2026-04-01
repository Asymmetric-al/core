"use client";

import { OpenPolicy as OpenPolicyRoot } from "@openpolicy/react";

import type { PropsWithChildren } from "react";

import openPolicyConfig from "@/openpolicy";

export function OpenPolicyProvider({ children }: PropsWithChildren) {
  return <OpenPolicyRoot config={openPolicyConfig}>{children}</OpenPolicyRoot>;
}
