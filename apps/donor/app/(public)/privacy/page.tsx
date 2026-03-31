import { BreadcrumbJsonLd, pageMetadata } from "@asym/lib/seo";

import type { Metadata } from "next";

import { LegalPageShell } from "@/components/openpolicy/legal-page-shell";
import { PrivacyPolicyDocument } from "@/components/openpolicy/privacy-policy";
import openPolicyConfig from "@/openpolicy";

export const metadata: Metadata = pageMetadata.privacy;

export default function PrivacyPolicyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Privacy Policy", href: "/privacy" },
        ]}
      />
      <LegalPageShell
        currentRoute="privacy"
        effectiveDate={openPolicyConfig.privacy?.effectiveDate}
        intro="This privacy policy scaffold covers the donor app's current account, donation, payment, and technical data handling model based on repo evidence as of March 31, 2026."
        title="Privacy Policy"
      >
        <PrivacyPolicyDocument />
      </LegalPageShell>
    </>
  );
}
