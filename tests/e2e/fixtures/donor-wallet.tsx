import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import WalletPage from "../../../apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client";
import { MotionProvider } from "../../../packages/lib/motion-provider";

// The wallet reads saved payment methods (Stripe) and recurring gifts (the
// donor portal). Seed both queries so the layout renders without a server.
const client = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});
client.setQueryData(["donor", "wallet"], {
  status: "linked",
  methods: [
    {
      id: "pm_visa",
      kind: "card",
      brand: "Visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2030,
      isDefault: true,
      recurringGiftIds: ["pledge-1", "pledge-2"],
    },
    {
      id: "pm_mc",
      kind: "card",
      brand: "Mastercard",
      last4: "5454",
      expMonth: 1,
      expYear: 2020,
      isDefault: false,
      recurringGiftIds: [],
    },
    {
      id: "pm_bank",
      kind: "bank",
      brand: "First Community Credit Union Of The Long Valley",
      last4: "6789",
      expMonth: null,
      expYear: null,
      isDefault: false,
      recurringGiftIds: [],
    },
  ],
});
client.setQueryData(["donor", "portal"], {
  recurringGifts: [
    {
      id: "pledge-1",
      amountCents: 3000,
      currency: "USD",
      frequency: "monthly",
      designation: { name: "Nairobi Water Wells" },
    },
    {
      id: "pledge-2",
      amountCents: 12000,
      currency: "USD",
      frequency: "quarterly",
      designation: {
        name: "The Okonkwo-Hernandez Family Literacy and Teacher Training Fund",
      },
    },
  ],
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <MotionProvider>
      <main className="p-4 sm:p-6">
        <WalletPage />
      </main>
    </MotionProvider>
  </QueryClientProvider>,
);
