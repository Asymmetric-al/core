import { redirectInTenant } from "@asym/auth/tenant-server";

/**
 * Canonical contribution link (`/contributions/{donation.id}`).
 *
 * Durable share/bookmark URL keyed by the canonical gift identity. It opens
 * the same shared contribution detail overlay the Contributions Hub and CRM
 * gift history use, without requiring any CRM context (ADR-CD-019). The
 * redirect keeps the tenant in the page address (plan 5.2).
 */
export default async function CanonicalContributionPage({
  params,
}: {
  params: Promise<{ contributionId: string }>;
}) {
  const { contributionId } = await params;
  await redirectInTenant(
    `/contributions?gift=${encodeURIComponent(contributionId)}`,
  );
}
