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
        intro="This privacy policy covers how we collect, use, and protect your personal information when you use the donor application."
        title="Privacy Policy"
      >
        <PrivacyPolicyDocument />
      </LegalPageShell>
    </>
  );
}
