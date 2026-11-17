import { permanentRedirectInTenant } from "@asym/auth/tenant-server";

// Updates live at /feed; this older path is kept working for saved links.
export default async function MinistryUpdatesPage() {
  await permanentRedirectInTenant("/feed");
}
