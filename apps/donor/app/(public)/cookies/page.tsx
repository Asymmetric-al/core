import { BreadcrumbJsonLd, pageMetadata } from "@asym/lib/seo";

import type { Metadata } from "next";

import { CookiePolicyDocument } from "@/components/openpolicy/cookie-policy";
import { LegalPageShell } from "@/components/openpolicy/legal-page-shell";
import openPolicyConfig from "@/openpolicy";

export const metadata: Metadata = pageMetadata.cookies;

export default function CookiePolicyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Cookie Policy", href: "/cookies" },
        ]}
      />
      <LegalPageShell
        currentRoute="cookies"
        effectiveDate={openPolicyConfig.cookie?.effectiveDate}
        intro="This cookie policy explains how we use cookies and similar technologies in the donor application and what choices you have."
        title="Cookie Policy"
      >
        <CookiePolicyDocument />
      </LegalPageShell>
    </>
  );
}
