import { readOperatorAdmission } from "@asym/auth/operator-area-server";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { notFound } from "next/navigation";

import { OperatorAreaClient } from "./operator-area-client";

import type { Metadata } from "next";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const admission = await readOperatorAdmission();
  return admission.admitted ? { title: "Operator area" } : {};
}

export default async function OperatorAreaPage() {
  const admission = await readOperatorAdmission();
  if (!admission.admitted) notFound();
  return (
    <main className="mx-auto w-full max-w-3xl">
      <PageShell title="Operator area">
        <OperatorAreaClient />
      </PageShell>
    </main>
  );
}
