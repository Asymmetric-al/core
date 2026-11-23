import { InvitationDoorway } from "@asym/ui/components/auth/InvitationDoorway";
import { Suspense } from "react";

import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Accept your organization invitation to Mission Control.",
};

type InvitePageProps = {
  params: Promise<{ selector: string }>;
};

async function InviteDoorwayContent({
  params,
}: {
  params: Promise<{ selector: string }>;
}) {
  const { selector } = await params;
  return (
    <InvitationDoorway selector={selector} surfaceName="Mission Control" />
  );
}

export default function InvitePage({ params }: InvitePageProps) {
  return (
    <Suspense fallback={null}>
      <InviteDoorwayContent params={params} />
    </Suspense>
  );
}
