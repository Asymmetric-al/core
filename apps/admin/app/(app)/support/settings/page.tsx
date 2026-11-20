import { redirectInTenant } from "@asym/auth/tenant-server";

export default async function SupportSettingsRoot() {
  await redirectInTenant("/support/settings/inbox");
}
