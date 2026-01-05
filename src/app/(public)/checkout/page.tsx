import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';
import { CheckoutPageClient } from './checkout-client';

export const metadata: Metadata = pageMetadata.checkout;

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
