import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { runMissionaryPortalOperation } from "./route-helpers";
import { assertMissionaryDonorAccess } from "./service";
import { ApiHttpError, ensureJsonBody } from "../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const donorActivityTypeSchema = z.enum(["note", "call", "meeting", "email"]);

const donorActivitySchema = z
  .object({
    activityType: donorActivityTypeSchema,
    note: z.string().trim().min(1).max(4000),
  })
  .strict();

const donorTagsSchema = z
  .object({
    tags: z.array(z.string().trim().min(1).max(80)).max(40),
  })
  .strict();

const donorTypeSchema = z.enum(["Individual", "Organization", "Church"]);
const donorStatusSchema = z.enum(["Active", "Lapsed", "New", "At Risk"]);
const preferredContactSchema = z.enum(["email", "phone", "text"]);

const donorUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(240),
    email: z.string().trim().email().max(320),
    phone: z.string().max(80),
    mobile: z.string().max(80),
    work_phone: z.string().max(80),
    preferred_contact: preferredContactSchema,
    type: donorTypeSchema,
    status: donorStatusSchema,
    frequency: z.string().trim().max(120),
    location: z.string().max(240),
    website: z.string().max(300),
    organization: z.string().max(240),
    title: z.string().max(180),
    spouse: z.string().max(180),
    birthday: z.string().max(40),
    anniversary: z.string().max(40),
    notes: z.string().max(4000),
    street: z.string().max(240),
    street2: z.string().max(240),
    city: z.string().max(180),
    state: z.string().max(80),
    zip: z.string().max(40),
  })
  .strict();

const donorPatchSchema = z.union([donorTagsSchema, donorUpdateSchema]);

type DonorActivityType = z.infer<typeof donorActivityTypeSchema>;
type DonorUpdateInput = z.infer<typeof donorUpdateSchema>;

const DONOR_ACTIVITY_TITLES: Record<DonorActivityType, string> = {
  note: "Note",
  call: "Phone Call",
  meeting: "Meeting",
  email: "Email",
};

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toDonorUpdatePayload(input: DonorUpdateInput, now: Date) {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: optionalText(input.phone),
    mobile: optionalText(input.mobile),
    work_phone: optionalText(input.work_phone),
    preferred_contact: input.preferred_contact,
    type: input.type,
    status: input.status,
    frequency: input.frequency.trim(),
    location: optionalText(input.location),
    website: optionalText(input.website),
    organization: optionalText(input.organization),
    title: optionalText(input.title),
    spouse: optionalText(input.spouse),
    birthday: optionalText(input.birthday),
    anniversary: optionalText(input.anniversary),
    notes: optionalText(input.notes),
    address: {
      street: input.street.trim(),
      street2: input.street2.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      zip: input.zip.trim(),
      country: "USA",
    },
    updated_at: now.toISOString(),
  };
}

function assertMutationSucceeded(
  result: {
    data: { id: string } | null;
    error: { code?: string; message: string } | null;
  },
  fallbackMessage: string,
) {
  if (result.error?.code === "PGRST116" || (!result.error && !result.data)) {
    throw new ApiHttpError(404, "Donor relationship not found");
  }

  if (result.error) {
    throw new ApiHttpError(500, result.error.message || fallbackMessage);
  }
}

export async function recordMissionaryDonorActivity(input: {
  supabaseAdmin: AdminSupabaseClient;
  donorId: string;
  profileId: string;
  tenantId: string;
  activityType: DonorActivityType;
  note: string;
  now?: Date;
}) {
  await assertMissionaryDonorAccess({
    supabaseAdmin: input.supabaseAdmin,
    donorId: input.donorId,
    profileId: input.profileId,
    tenantId: input.tenantId,
  });

  const { error } = await input.supabaseAdmin.from("donor_activities").insert({
    donor_id: input.donorId,
    type: input.activityType,
    title: DONOR_ACTIVITY_TITLES[input.activityType],
    description: input.note,
    date: (input.now ?? new Date()).toISOString(),
  });

  if (error) {
    throw new ApiHttpError(500, error.message || "Unable to record activity");
  }
}

export async function updateMissionaryDonorTags(input: {
  supabaseAdmin: AdminSupabaseClient;
  donorId: string;
  profileId: string;
  tenantId: string;
  tags: string[];
  now?: Date;
}) {
  const result = await input.supabaseAdmin
    .from("donors")
    .update({
      tags: input.tags,
      updated_at: (input.now ?? new Date()).toISOString(),
    })
    .eq("id", input.donorId)
    .eq("tenant_id", input.tenantId)
    .eq("missionary_id", input.profileId)
    .select("id")
    .single();

  assertMutationSucceeded(result, "Unable to update donor tags");
}

export async function updateMissionaryDonor(input: {
  supabaseAdmin: AdminSupabaseClient;
  donorId: string;
  profileId: string;
  tenantId: string;
  input: DonorUpdateInput;
  now?: Date;
}) {
  const result = await input.supabaseAdmin
    .from("donors")
    .update(toDonorUpdatePayload(input.input, input.now ?? new Date()))
    .eq("id", input.donorId)
    .eq("tenant_id", input.tenantId)
    .eq("missionary_id", input.profileId)
    .select("id")
    .single();

  assertMutationSucceeded(result, "Unable to update donor");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ donorId: string }> },
) {
  const { donorId } = await params;

  return runMissionaryPortalOperation(
    request,
    async ({ supabaseAdmin, auth }) => {
      const input = donorPatchSchema.parse(await ensureJsonBody(request));

      if ("tags" in input) {
        await updateMissionaryDonorTags({
          supabaseAdmin,
          donorId,
          profileId: auth.profileId,
          tenantId: auth.tenantId,
          tags: input.tags,
        });
      } else {
        await updateMissionaryDonor({
          supabaseAdmin,
          donorId,
          profileId: auth.profileId,
          tenantId: auth.tenantId,
          input,
        });
      }

      return NextResponse.json({ ok: true });
    },
  );
}

export async function POST_ACTIVITY(
  request: NextRequest,
  { params }: { params: Promise<{ donorId: string }> },
) {
  const { donorId } = await params;

  return runMissionaryPortalOperation(
    request,
    async ({ supabaseAdmin, auth }) => {
      const input = donorActivitySchema.parse(await ensureJsonBody(request));

      await recordMissionaryDonorActivity({
        supabaseAdmin,
        donorId,
        profileId: auth.profileId,
        tenantId: auth.tenantId,
        activityType: input.activityType,
        note: input.note,
      });

      return NextResponse.json({ ok: true }, { status: 201 });
    },
  );
}
