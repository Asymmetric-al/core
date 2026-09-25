"use client";

import { DonorsPageContent } from "./donors-page-content";
import { DonorsPageViewProvider } from "./use-donors-page-view";

export default function DonorsPageClient() {
  return (
    <DonorsPageViewProvider>
      <DonorsPageContent />
    </DonorsPageViewProvider>
  );
}
