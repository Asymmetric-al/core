import Stripe from "stripe";

import { STRIPE_API_VERSION } from "./api-version";

export type StripeClientLimits = {
  timeout?: number;
  maxNetworkRetries?: number;
};

export function createStripeClient(
  secretKey: string,
  limits: StripeClientLimits = {},
): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION, ...limits });
}
