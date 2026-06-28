import { redirect } from "next/navigation";

/**
 * Canonical contribution link (`/contributions/{donation.id}`).
 *
 * Durable share/bookmark URL keyed by the canonical gift identity. It opens
 * the same shared contribution detail overlay the Contributions Hub and CRM
 * gift history use, without requiring any CRM context (ADR-CD-019).
 */
export default async function CanonicalContributionPage({
  params,
}: {
  params: Promise<{ contributionId: string }>;
}) {
  const { contributionId } = await params;
  redirect(`/contributions?gift=${encodeURIComponent(contributionId)}`);
}
