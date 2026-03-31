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
        intro="This cookie policy scaffold documents the donor app's essential-cookie baseline and current conservative assumptions. A full consent banner is intentionally not claimed or shipped in this pass."
        title="Cookie Policy"
      >
        <CookiePolicyDocument />
      </LegalPageShell>
    </>
  );
}
