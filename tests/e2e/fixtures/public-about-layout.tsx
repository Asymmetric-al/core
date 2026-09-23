import React from "react";
import { createRoot } from "react-dom/client";

import AboutPage from "../../../apps/donor/app/(public)/(hero)/about/page";
import HeroPublicLayout from "../../../apps/donor/app/(public)/(hero)/layout";
import PublicLayout from "../../../apps/donor/app/(public)/layout";
import { MotionProvider } from "../../../packages/lib/motion";
import { ThemeProvider } from "../../../packages/ui/lib/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    forcedTheme="light"
    enableSystem={false}
  >
    <MotionProvider>
      <PublicLayout>
        <HeroPublicLayout>
          <div data-testid="about-theme-parent">
            <AboutPage />
          </div>
        </HeroPublicLayout>
      </PublicLayout>
    </MotionProvider>
  </ThemeProvider>,
);
