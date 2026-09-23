import { supportHubReadModel } from "@asym/database/collections/support-workspace";
import React from "react";
import { createRoot } from "react-dom/client";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Browser fixture exercises the actual intake form without a live API.
import { NewTicketForm } from "../../../apps/admin/app/(app)/support/tickets/new/new-ticket-form";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Browser fixture exercises the actual server-produced GET form with an inert loader.
import SupportTicketsPage from "../../../apps/admin/app/(app)/support/tickets/page";

import "virtual:base-ui-styles";

const filterPage = await SupportTicketsPage({
  searchParams: Promise.resolve({
    queueId: "donor_care",
    status: "waiting",
    search: "receipt",
  }),
});
createRoot(document.getElementById("root")!).render(
  <main className="mx-auto max-w-3xl space-y-8 p-6">
    <section id="intake">
      <h1 className="mb-4 text-xl font-semibold">Support intake</h1>
      <NewTicketForm
        contacts={[
          { id: "contact-1", name: "Ada Lovelace", email: "ada@example.test" },
        ]}
        queues={supportHubReadModel.queues}
      />
    </section>
    <section id="filters">{filterPage}</section>
  </main>,
);
