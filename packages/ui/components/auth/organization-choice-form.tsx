"use client";

import { loadDocument } from "@asym/database/document-reload";
import { useActionState, useEffect } from "react";

import type { ReactNode } from "react";

export type OrganizationChoiceLoad = { readonly load: string } | null;

export function OrganizationChoiceForm({
  action,
  children,
}: {
  action: (
    state: OrganizationChoiceLoad,
    formData: FormData,
  ) => Promise<OrganizationChoiceLoad>;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);
  useEffect(() => {
    if (state?.load) loadDocument(state.load);
  }, [state]);
  return <form action={formAction}>{children}</form>;
}
