import Stripe from "stripe";

import { STRIPE_API_VERSION } from "./api-version";

export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
