import { DEMO_PROFILE_ID, DEMO_TENANT_ID } from "@asym/auth/constants";

import {
  buildDonorPortalSnapshot,
  type DonorPortalDonationRow,
  type DonorPortalDonorRow,
  type DonorPortalFeedPreferencesRow,
  type DonorPortalPledgeRow,
  type DonorPortalProfileRow,
  type DonorPortalSnapshot,
} from "./model";

const DEMO_DONOR_ID = "30000000-0000-0000-0000-000000000001";

const profile: DonorPortalProfileRow = {
  id: DEMO_PROFILE_ID,
  email: "demo-owner@givehope.test",
  first_name: "Jordan",
  last_name: "Hale",
  full_name: "Jordan Hale",
  display_name: "Jordan Hale",
  phone: "+1-555-0100",
  avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
};

const donor: DonorPortalDonorRow = {
  id: DEMO_DONOR_ID,
  tenant_id: DEMO_TENANT_ID,
  profile_id: DEMO_PROFILE_ID,
  missionary_id: "20000000-0000-0000-0000-000000000001",
  name: "Jordan Hale",
  email: "demo-owner@givehope.test",
  phone: "+1-555-0100",
  mobile: "+1-555-1100",
  preferred_contact: "email",
  avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  location: "Austin, TX",
  status: "active",
  giving_preferences: { causes: ["education"], preferred_channel: "email" },
  total_given: 87_500,
  first_gift_date: "2026-01-15",
  last_gift_date: "2026-06-15",
  last_gift_amount: 12_500,
  gift_count: 5,
  frequency: "monthly",
  joined_date: "2025-11-01",
  receipt_email_frequency: "monthly",
  default_update_frequency: "monthly",
  preferred_language: "en",
  do_not_contact: false,
  do_not_email: false,
  has_active_pledge: true,
  stripe_customer_id: "cus_demo_000001",
};

const donations: DonorPortalDonationRow[] = [
  {
    id: "90000000-0000-0000-0000-000000000001",
    amount: 12_500,
    currency: "usd",
    status: "completed",
    donation_type: "recurring",
    payment_method: "Visa ending in 4242",
    is_recurring: true,
    recurring_interval: "monthly",
    gift_date: "2026-06-15T10:00:00.000Z",
    created_at: "2026-06-15T10:00:00.000Z",
    completed_at: "2026-06-15T10:05:00.000Z",
    processed_at: "2026-06-15T10:05:00.000Z",
    stripe_payment_intent_id: "pi_demo_1",
    stripe_charge_id: "ch_demo_1",
    fund: null,
    missionary: {
      id: "20000000-0000-0000-0000-000000000001",
      profile: {
        id: DEMO_PROFILE_ID,
        display_name: "Field Team 1",
        full_name: "Field Team 1",
        first_name: "Field",
        last_name: "Team",
        avatar_url:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      },
    },
  },
  {
    id: "90000000-0000-0000-0000-000000000002",
    amount: 25_000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    payment_method: "Bank transfer",
    is_recurring: false,
    recurring_interval: null,
    gift_date: "2026-04-22T10:00:00.000Z",
    created_at: "2026-04-22T10:00:00.000Z",
    completed_at: "2026-04-22T10:05:00.000Z",
    processed_at: "2026-04-22T10:05:00.000Z",
    stripe_payment_intent_id: "pi_demo_2",
    stripe_charge_id: "ch_demo_2",
    fund: {
      id: "40000000-0000-0000-0000-000000000001",
      name: "Nairobi Water Wells",
    },
    missionary: null,
  },
  {
    id: "90000000-0000-0000-0000-000000000003",
    amount: 10_000,
    currency: "usd",
    status: "pending",
    donation_type: "one_time",
    payment_method: "Visa ending in 4242",
    is_recurring: false,
    recurring_interval: null,
    gift_date: "2026-02-10T10:00:00.000Z",
    created_at: "2026-02-10T10:00:00.000Z",
    completed_at: null,
    processed_at: null,
    stripe_payment_intent_id: "pi_demo_3",
    stripe_charge_id: null,
    fund: null,
    missionary: null,
  },
];

const pledges: DonorPortalPledgeRow[] = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    amount: 12_500,
    currency: "usd",
    frequency: "monthly",
    status: "active",
    start_date: "2026-01-15",
    end_date: null,
    next_payment_date: "2026-07-15",
    next_charge_at: "2026-07-15T10:00:00.000Z",
    stripe_subscription_id: "sub_demo_00001",
    stripe_payment_method_id: "pm_demo_00001",
    payment_method: "Visa ending in 4242",
    total_paid: 75_000,
    total_expected: 150_000,
    payments_completed: 6,
    payments_remaining: 6,
    fund: null,
    missionary: {
      id: "20000000-0000-0000-0000-000000000001",
      profile: {
        id: DEMO_PROFILE_ID,
        display_name: "Field Team 1",
        full_name: "Field Team 1",
        first_name: "Field",
        last_name: "Team",
        avatar_url:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      },
    },
  },
];

const feedPreferences: DonorPortalFeedPreferencesRow = {
  show_org_posts: true,
  show_missionary_posts: true,
  follow_org: true,
  email_org_posts: true,
  email_missionary_posts: true,
  push_org_posts: false,
  push_missionary_posts: false,
};

export function getDemoDonorPortalSnapshot(): DonorPortalSnapshot {
  return buildDonorPortalSnapshot({
    profile,
    donor,
    donations,
    pledges,
    feedPreferences,
    now: new Date("2026-07-07T00:00:00.000Z"),
  });
}
