import { createRoot } from "react-dom/client";

import WalletPage from "../../../apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client";
import { MotionProvider } from "../../../packages/lib/motion";

createRoot(document.getElementById("root")!).render(
  <MotionProvider>
    <main className="p-4 sm:p-6">
      <WalletPage />
    </main>
  </MotionProvider>,
);
