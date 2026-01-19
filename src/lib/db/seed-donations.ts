/**
 * Donation Seed Data Configuration
 *
 * This file contains seed data configuration for demonstrating the missionary dashboard.
 * It defines realistic donation patterns across 13 months with three donation types:
 * - Recurring: Monthly automated donations from consistent supporters
 * - One-Time: Single online donations via Stripe
 * - Offline: Checks, cash, and wire transfers received offline
 *
 * The data patterns reflect real missionary support scenarios:
 * - Year-end giving spike (November-December)
 * - Summer slowdown (June-August)
 * - New recurring donors acquired throughout the year
 * - Occasional large offline gifts
 */

export const DEMO_MISSIONARY_ID = "b378164f-8a6a-42c8-883f-59815d01e48c";
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Valid donation types in the system
 */
export const DONATION_TYPES = {
  RECURRING: "recurring",
  ONE_TIME: "one_time",
  OFFLINE: "offline",
} as const;

export type DonationType = (typeof DONATION_TYPES)[keyof typeof DONATION_TYPES];

/**
 * SQL to update the donation_type constraint to include 'offline'
 * Run this if the database constraint doesn't include 'offline'
 */
export const UPDATE_CONSTRAINT_SQL = `
  ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_donation_type_check;
  ALTER TABLE donations ADD CONSTRAINT donations_donation_type_check 
    CHECK (donation_type = ANY (ARRAY['one_time'::text, 'recurring'::text, 'offline'::text]));
`;
