import "virtual:base-ui-styles";

import React from "react";
import { createRoot } from "react-dom/client";

import { FAQPageClient } from "../../../apps/donor/app/(public)/(hero)/faq/faq-client";
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
      <main id="faq-contracts">
        <FAQPageClient />
      </main>
    </MotionProvider>
  </ThemeProvider>,
);
