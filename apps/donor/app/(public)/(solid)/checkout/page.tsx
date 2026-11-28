import {
  createAnonymousClient,
  createClient,
} from "@asym/database/supabase/server";
import { clientEnv } from "@asym/env";
import { pageMetadata } from "@asym/lib/seo";
import { headers } from "next/headers";

import { CheckoutPageClient, type CheckoutSurface } from "./checkout-client";
import {
  checkoutSurface,
  readCheckoutLink,
  type CheckoutSearchParams,
} from "./checkout-targets";

import type { Metadata } from "next";

export const metadata: Metadata = {
  ...pageMetadata.checkout,
  referrer: "no-referrer",
};

type HostFacts = {
  surface: CheckoutSurface;
  isHome: boolean;
  siteId: string | null;
  homeHost: string | null;
};

type HostRow = {
  site_id: string | null;
  surfaces: string[] | null;
  state: string | null;
  is_home: boolean | null;
};

type AnonymousReads = {
  rpc(
    fn: "resolve_verified_host" | "resolve_home_host",
    args: { p_host: string },
  ): PromiseLike<{ data: unknown; error: unknown }>;
};

async function hostFacts(host: string): Promise<HostFacts> {
  const none: HostFacts = {
    surface: "website",
    isHome: false,
    siteId: null,
    homeHost: null,
  };
  const client = createAnonymousClient() as unknown as AnonymousReads | null;
  if (!client || !host) return none;
  const [verified, home] = await Promise.all([
    client.rpc("resolve_verified_host", { p_host: host }),
    client.rpc("resolve_home_host", { p_host: host }),
  ]);
  const row = (Array.isArray(verified.data) ? verified.data[0] : null) as
    HostRow | undefined;
  if (!row || row.state !== "active") return none;
  const surfaces = row.surfaces ?? [];
  const homeRow = (Array.isArray(home.data) ? home.data[0] : null) as
    { primary_domain?: string | null } | undefined;
  const isHome = row.is_home === true && surfaces.includes("donor_account");
  return {
    surface:
      surfaces.includes("website") && row.site_id ? "website" : "donor_account",
    isHome,
    siteId: row.site_id,
    homeHost: homeRow?.primary_domain ?? null,
  };
}

async function signedInEmail(): Promise<string | null> {
  try {
    const supabase = await createClient(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const [params, requestHeaders] = await Promise.all([searchParams, headers()]);
  const link = readCheckoutLink(params);
  const facts = await hostFacts(requestHeaders.get("host")?.trim() ?? "");
  const surface: CheckoutSurface = checkoutSurface({
    hostSurface: facts.surface,
    isHome: facts.isHome,
    sourceSiteId: link.sourceSiteId,
  });
  const email =
    facts.isHome || surface === "donor_account" ? await signedInEmail() : null;
  return (
    <CheckoutPageClient
      link={link}
      surface={surface}
      isHome={facts.isHome}
      homeHost={facts.homeHost}
      siteId={facts.siteId}
      turnstileSiteKey={clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      signedInEmail={email}
    />
  );
}
