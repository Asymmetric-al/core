"use client";
"use no memo";

import { DonorsPageContent, useDonorsPageView } from "./use-donors-page-view";

function DonorsPageView() {
  const viewModel = useDonorsPageView();

  return <DonorsPageContent {...viewModel} />;
}

export default function DonorsPage() {
  return <DonorsPageView />;
}
