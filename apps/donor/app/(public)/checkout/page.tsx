import { pageMetadata } from "@asym/lib/seo";

import { CheckoutPageClient } from "./checkout-client";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.checkout;

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
