import { ensureSitePresentation } from "./site-presentation-step";

import type { SiteCreatedStep } from "@asym/api/admin/sites/settings";

export const presentCreatedSite: SiteCreatedStep = async ({
  siteId,
  tenantId,
  readSite,
}) => {
  const { getPayloadClient } = await import("./get-payload");
  const payload = await getPayloadClient();
  await ensureSitePresentation(payload, {
    siteId,
    readSite,
    actingTenantId: tenantId,
  });
};
