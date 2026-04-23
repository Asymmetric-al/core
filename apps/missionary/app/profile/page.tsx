import { ProfilePageClient } from "./profile-page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Review and update your missionary profile.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
