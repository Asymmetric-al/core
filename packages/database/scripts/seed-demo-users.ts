import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type DemoRole =
  | "admin"
  | "missionary"
  | "donor"
  | "delivery"
  | "ticketing"
  | "machinery";

type SeedSummaryStatus = "created" | "updated" | "skipped";

interface SeedSummaryRow {
  role: DemoRole;
  email: string | null;
  status: SeedSummaryStatus;
  note?: string;
}

const DEMO_ROLES: DemoRole[] = [
  "admin",
  "missionary",
  "donor",
  "delivery",
  "ticketing",
  "machinery",
];

const DEMO_EMAIL_ENV: Record<DemoRole, string> = {
  admin: "DEMO_ADMIN_EMAIL",
  missionary: "DEMO_MISSIONARY_EMAIL",
  donor: "DEMO_DONOR_EMAIL",
  delivery: "DEMO_DELIVERY_EMAIL",
  ticketing: "DEMO_TICKETING_EMAIL",
  machinery: "DEMO_MACHINERY_EMAIL",
};

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

function toDisplayName(role: DemoRole) {
  return `Demo ${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

async function resolveTenantId(adminClient: SupabaseClient): Promise<string> {
  const { data, error } = await adminClient
    .from("tenants")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve tenant id: ${error.message}`);
  }

  return data?.id ?? DEFAULT_TENANT_ID;
}

async function listUsersByEmail(
  adminClient: SupabaseClient,
): Promise<Map<string, string>> {
  const usersByEmail = new Map<string, string>();
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  for (const user of data.users) {
    const email = user.email?.toLowerCase();
    if (email) {
      usersByEmail.set(email, user.id);
    }
  }

  return usersByEmail;
}

async function upsertProfile(
  adminClient: SupabaseClient,
  input: {
    userId: string;
    email: string;
    role: DemoRole;
    tenantId: string;
  },
) {
  const displayName = toDisplayName(input.role);
  const { error } = await adminClient.from("profiles").upsert(
    {
      id: input.userId,
      user_id: input.userId,
      email: input.email,
      role: input.role,
      first_name: "Demo",
      last_name: input.role,
      full_name: displayName,
      display_name: displayName,
      tenant_id: input.tenantId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    throw new Error(
      `Failed to upsert profile for ${input.email}: ${error.message}`,
    );
  }
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const demoPassword = process.env.DEMO_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey || !demoPassword) {
    throw new Error(
      "Missing required env vars. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DEMO_PASSWORD.",
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const tenantId = await resolveTenantId(adminClient);
  const usersByEmail = await listUsersByEmail(adminClient);
  const summary: SeedSummaryRow[] = [];

  for (const role of DEMO_ROLES) {
    const envName = DEMO_EMAIL_ENV[role];
    const email = process.env[envName]?.trim().toLowerCase() ?? "";

    if (!email) {
      summary.push({
        role,
        email: null,
        status: "skipped",
        note: `${envName} is not set`,
      });
      continue;
    }

    const existingUserId = usersByEmail.get(email);
    if (existingUserId) {
      const { error } = await adminClient.auth.admin.updateUserById(
        existingUserId,
        {
          password: demoPassword,
          email_confirm: true,
          user_metadata: {
            role,
          },
        },
      );
      if (error) {
        throw new Error(`Failed to update user ${email}: ${error.message}`);
      }

      await upsertProfile(adminClient, {
        userId: existingUserId,
        email,
        role,
        tenantId,
      });
      summary.push({ role, email, status: "updated" });
      continue;
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        role,
      },
      app_metadata: {
        provider: "email",
        providers: ["email"],
      },
    });

    if (error || !data.user?.id) {
      throw new Error(`Failed to create user ${email}: ${error?.message}`);
    }

    usersByEmail.set(email, data.user.id);
    await upsertProfile(adminClient, {
      userId: data.user.id,
      email,
      role,
      tenantId,
    });
    summary.push({ role, email, status: "created" });
  }

  console.table(summary);
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[seed-demo-users] ${message}`);
  process.exit(1);
});
