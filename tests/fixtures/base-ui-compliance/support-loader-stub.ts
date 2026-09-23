import { supportHubReadModel } from "@asym/database/collections/support-workspace";

export async function loadSupportTicketList() {
  return { ...supportHubReadModel, tickets: [] };
}
