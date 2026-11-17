import { permanentRedirectInTenant } from "@asym/auth/tenant-server";

// Email Studio was retired; updates are written on the Updates page.
export default async function Page() {
  await permanentRedirectInTenant("/feed");
}
