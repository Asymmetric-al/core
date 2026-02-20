import { pageMetadata } from "@asym/lib/seo";

import { CheckoutPageClient } from "./checkout-client";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.checkout;

interface CheckoutPageProps {
  searchParams: Promise<{
    amount?: string | string[];
    fund?: string | string[];
    workerId?: string | string[];
  }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams;
  return <CheckoutPageClient searchParams={resolvedSearchParams} />;
}
