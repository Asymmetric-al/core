import { permanentRedirectInTenant } from "@asym/auth/tenant-server";
export default async function SupportMacrosPage() {
  await permanentRedirectInTenant("/support/settings/macros");
}
