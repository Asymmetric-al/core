import "virtual:base-ui-styles";

import React from "react";
import { createRoot } from "react-dom/client";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Isolated browser coverage of the actual Administration surface.
import AdminPage from "../../../apps/admin/app/(app)/admin/page-client";
import { MotionProvider } from "../../../packages/lib/motion-provider";
import { ThemeProvider } from "../../../packages/ui/lib/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    forcedTheme="light"
    defaultTheme="light"
    enableSystem={false}
  >
    <MotionProvider>
      <main id="admin-availability-contracts">
        <AdminPage />
      </main>
    </MotionProvider>
  </ThemeProvider>,
);
