import { loadSupportHubReadModel } from "@asym/api/admin/support/loaders";

import PageClient from "./page-client";

export default async function Page() {
  const model = await loadSupportHubReadModel();

  return <PageClient model={model} />;
}
