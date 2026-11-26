import { createSitePost } from "@asym/api/admin/sites/settings";

import { presentCreatedSite } from "@/src/cms/site-created";

export { GET } from "@asym/api/admin/sites/settings";

export const POST = createSitePost(presentCreatedSite);
