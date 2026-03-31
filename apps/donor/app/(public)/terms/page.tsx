import { BreadcrumbJsonLd, pageMetadata } from "@asym/lib/seo";

import type { Metadata } from "next";

import { LegalPageShell } from "@/components/openpolicy/legal-page-shell";
import { TermsOfServiceDocument } from "@/components/openpolicy/terms-of-service";
import openPolicyConfig from "@/openpolicy";

export const metadata: Metadata = pageMetadata.terms;

export default function TermsOfServicePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Terms of Service", href: "/terms" },
        ]}
      />
      <LegalPageShell
        currentRoute="terms"
        effectiveDate={openPolicyConfig.terms?.effectiveDate}
        intro="This terms scaffold defines the current operating assumptions for donor-facing use of the platform and donation-related flows. Human and legal review are still required before production use."
        title="Terms of Service"
      >
        <TermsOfServiceDocument />
      </LegalPageShell>
    </>
  );
}
