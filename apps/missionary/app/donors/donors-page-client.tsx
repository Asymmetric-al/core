"use client";
"use no memo";

import { useDonorsPageLayout } from "./use-donors-page-view";

function DonorsPageView() {
  return useDonorsPageLayout();
}

export default function DonorsPage() {
  return <DonorsPageView />;
}
