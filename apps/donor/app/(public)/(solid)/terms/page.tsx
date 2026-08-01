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
        intro="These terms of service govern your use of the donor application, including account creation, donations, and related platform features."
        title="Terms of Service"
      >
        <TermsOfServiceDocument />
      </LegalPageShell>
    </>
  );
}
