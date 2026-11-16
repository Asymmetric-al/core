import type { Metadata } from "next";

import { SignatureList } from "@/features/support-hub/components/settings/signatures/SignatureList";

export const metadata: Metadata = {
  title: "Signatures · Support settings",
};

export default function SupportSettingsSignaturesPage() {
  return (
    <>
      <SignatureList />
    </>
  );
}
