import {
  isAnonymousToRecipient,
  redactDonorRelationshipForMissionary,
  redactGiftForMissionary,
  redactTaskDonorForMissionary,
  type GivingPreferences,
} from "./redaction";

const SETTLED_DONATION_STATUSES = new Set([
  "completed",
  "succeeded",
  "success",
]);

export type MissionaryPortalProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type MissionaryPortalMissionaryRow = {
  id: string;
  tenant_id: string;
  profile_id: string;
  bio: string | null;
  mission_field: string | null;
  funding_goal: number | null;
  current_funding: number | null;
  tagline: string | null;
  location: string | null;
  phone: string | null;
  timezone: string | null;
  region: string | null;
  cover_url: string | null;
  social_links: Record<string, unknown> | null;
};

export type MissionaryPortalDonationRow = {
  id: string;
  donor_id: string | null;
  amount: number;
  currency: string | null;
  status: string | null;
  donation_type: string | null;
  is_recurring: boolean | null;
  gift_date: string | null;
  created_at: string | null;
};

export type MissionaryPortalDonorRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  preferred_contact: string | null;
  avatar_url: string | null;
  location: string | null;
  status: string | null;
  total_given: number | null;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  gift_count: number | null;
  frequency: string | null;
  tags: string[] | null;
  has_active_pledge: boolean | null;
  giving_preferences?: GivingPreferences | null;
};

export type MissionaryPortalTaskRow = {
  id: string;
  missionary_id: string;
  donor_id: string | null;
  title: string;
  description: string | null;
  task_type: string | null;
  status: string | null;
  priority: string | null;
  sort_key: number | null;
  due_date: string | null;
  completed_at: string | null;
  is_auto_generated: boolean | null;
  created_at: string;
  updated_at: string;
  donor?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    giving_preferences?: GivingPreferences | null;
  } | null;
};

export type MissionaryPortalPostRow = {
  id: string;
  title: string | null;
  content: string | null;
  post_type: string | null;
  visibility: string | null;
  status: string | null;
  created_at: string | null;
  like_count: number | null;
  prayer_count: number | null;
  comment_count: number | null;
};

export type MissionaryPortalSnapshot = {
  profile: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  publicPage: {
    missionaryId: string;
    tagline: string | null;
    bio: string | null;
    missionField: string | null;
    location: string | null;
    coverUrl: string | null;
    socialLinks: Record<string, unknown>;
  };
  support: {
    goalCents: number;
    raisedCents: number;
    recurringMonthlyCents: number;
    percentFunded: number;
    activeDonorCount: number;
    giftCount: number;
    lastGiftAt: string | null;
  };
  donorRelationships: MissionaryPortalDonorRelationship[];
  recentGifts: MissionaryPortalGift[];
  tasks: MissionaryPortalTask[];
  ministryUpdates: MissionaryPortalUpdate[];
  actions: {
    editProfileUrl: string;
    createUpdateUrl: string;
    tasksUrl: string;
    donorsUrl: string;
  };
};

export type MissionaryPortalDonorRelationship = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  preferredContact: string;
  avatarUrl: string | null;
  location: string | null;
  status: string;
  totalGivenCents: number;
  lastGiftAt: string | null;
  lastGiftAmountCents: number;
  giftCount: number;
  frequency: string | null;
  tags: string[];
  hasActivePledge: boolean;
};

export type MissionaryPortalGift = {
  id: string;
  donorId: string | null;
  amountCents: number;
  amount: number;
  currency: string;
  type: "Recurring" | "One-Time";
  date: string;
};

export type MissionaryPortalTask = {
  id: string;
  missionary_id: string;
  donor_id: string | null;
  title: string;
  description: string | null;
  task_type: string;
  status: string;
  priority: string;
  sort_key: number;
  due_date: string | null;
  completed_at: string | null;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
  donor: {
    id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export type MissionaryPortalUpdate = {
  id: string;
  title: string;
  excerpt: string;
  visibility: string;
  status: string;
  createdAt: string | null;
  engagementCount: number;
};

function displayNameFromParts(row: {
  display_name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}) {
  const direct = row.display_name || row.full_name;
  if (direct?.trim()) return direct.trim();

  const parts = [row.first_name, row.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim());

  return parts.join(" ");
}

function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

function normalizeCurrency(currency: string | null | undefined): string {
  return (currency || "usd").toUpperCase();
}

function donationDate(row: MissionaryPortalDonationRow): string {
  return row.gift_date || row.created_at || new Date(0).toISOString();
}

function isSettled(status: string | null | undefined) {
  return SETTLED_DONATION_STATUSES.has(status?.toLowerCase() ?? "");
}

function giftType(
  row: MissionaryPortalDonationRow,
): MissionaryPortalGift["type"] {
  const donationType = row.donation_type?.toLowerCase() ?? "";
  if (row.is_recurring || donationType.includes("recurring")) {
    return "Recurring";
  }
  return "One-Time";
}

function excerpt(value: string | null | undefined): string {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return "Ministry update";
  return normalized.length > 140
    ? `${normalized.slice(0, 137).trimEnd()}...`
    : normalized;
}

export function mapMissionaryTask(
  row: MissionaryPortalTaskRow,
): MissionaryPortalTask {
  return {
    id: row.id,
    missionary_id: row.missionary_id,
    donor_id: row.donor_id,
    title: row.title,
    description: row.description,
    task_type: row.task_type || "to_do",
    status: row.status || "not_started",
    priority: row.priority || "none",
    sort_key: row.sort_key ?? 0,
    due_date: row.due_date,
    completed_at: row.completed_at,
    is_auto_generated: Boolean(row.is_auto_generated),
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Redact the joined donor server-side (§7.2) when that donor is anonymous
    // to the missionary. Applies to the snapshot AND the standalone task
    // endpoints, since both build through mapMissionaryTask.
    donor: row.donor
      ? redactTaskDonorForMissionary(
          {
            id: row.donor.id,
            name: row.donor.name || "Donor",
            email: row.donor.email,
            avatar_url: row.donor.avatar_url,
          },
          isAnonymousToRecipient({
            givingPreferences: row.donor.giving_preferences,
          }),
        )
      : null,
  };
}

export function buildMissionaryPortalSnapshot(input: {
  profile: MissionaryPortalProfileRow;
  missionary: MissionaryPortalMissionaryRow;
  donations: MissionaryPortalDonationRow[];
  donors: MissionaryPortalDonorRow[];
  tasks: MissionaryPortalTaskRow[];
  posts: MissionaryPortalPostRow[];
}): MissionaryPortalSnapshot {
  // Donors this missionary is NOT allowed to see by name (§7.2). Signal is the
  // donor-level default in giving_preferences; a per-gift override lands with
  // the Track B `donations.anonymous_to_recipient` column (not selected yet).
  const anonymousDonorIds = new Set(
    input.donors
      .filter((donor) =>
        isAnonymousToRecipient({ givingPreferences: donor.giving_preferences }),
      )
      .map((donor) => donor.id),
  );

  const gifts = input.donations
    .filter((row) => isSettled(row.status))
    .map((row) =>
      redactGiftForMissionary(
        {
          id: row.id,
          donorId: row.donor_id,
          amountCents: row.amount ?? 0,
          amount: centsToDollars(row.amount ?? 0),
          currency: normalizeCurrency(row.currency),
          type: giftType(row),
          date: donationDate(row),
        },
        Boolean(row.donor_id && anonymousDonorIds.has(row.donor_id)),
      ),
    );

  const donorRelationships = input.donors.map((donor) =>
    redactDonorRelationshipForMissionary(
      {
        id: donor.id,
        displayName: donor.name || donor.email || "Donor",
        email: donor.email,
        phone: donor.phone || donor.mobile,
        preferredContact: donor.preferred_contact || "email",
        avatarUrl: donor.avatar_url,
        location: donor.location,
        status: donor.status || "active",
        totalGivenCents: donor.total_given ?? 0,
        lastGiftAt: donor.last_gift_date,
        lastGiftAmountCents: donor.last_gift_amount ?? 0,
        giftCount: donor.gift_count ?? 0,
        frequency: donor.frequency,
        tags: donor.tags ?? [],
        hasActivePledge: Boolean(donor.has_active_pledge),
      },
      anonymousDonorIds.has(donor.id),
    ),
  );

  const recurringMonthlyCents = gifts
    .filter((gift) => gift.type === "Recurring")
    .reduce((sum, gift) => sum + gift.amountCents, 0);
  const raisedCents =
    input.missionary.current_funding ??
    gifts.reduce((sum, gift) => sum + gift.amountCents, 0);
  const goalCents = input.missionary.funding_goal ?? 0;
  const percentFunded =
    goalCents > 0
      ? Math.min(100, Math.round((raisedCents / goalCents) * 100))
      : 0;
  const displayName =
    displayNameFromParts(input.profile) || input.profile.email || "Missionary";

  return {
    profile: {
      id: input.profile.id,
      displayName,
      email: input.profile.email,
      phone: input.profile.phone || input.missionary.phone,
      avatarUrl: input.profile.avatar_url,
    },
    publicPage: {
      missionaryId: input.missionary.id,
      tagline: input.missionary.tagline,
      bio: input.missionary.bio,
      missionField: input.missionary.mission_field,
      location: input.missionary.location,
      coverUrl: input.missionary.cover_url,
      socialLinks: input.missionary.social_links ?? {},
    },
    support: {
      goalCents,
      raisedCents,
      recurringMonthlyCents,
      percentFunded,
      activeDonorCount: donorRelationships.filter(
        (donor) => donor.status !== "inactive",
      ).length,
      giftCount: gifts.length,
      lastGiftAt: gifts[0]?.date ?? null,
    },
    donorRelationships,
    recentGifts: gifts,
    tasks: input.tasks.map(mapMissionaryTask),
    ministryUpdates: input.posts.map((post) => ({
      id: post.id,
      title: post.title || "Ministry update",
      excerpt: excerpt(post.content),
      visibility: post.visibility || "public",
      status: post.status || "published",
      createdAt: post.created_at,
      engagementCount:
        (post.like_count ?? 0) +
        (post.prayer_count ?? 0) +
        (post.comment_count ?? 0),
    })),
    actions: {
      editProfileUrl: "/profile",
      createUpdateUrl: "/feed",
      tasksUrl: "/tasks",
      donorsUrl: "/donors",
    },
  };
}
