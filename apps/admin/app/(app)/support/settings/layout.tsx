import type { ReactNode } from "react";

import { SupportSettingsLayout } from "@/features/support-hub/components/workspace/SupportSettingsLayout";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <SupportSettingsLayout>{children}</SupportSettingsLayout>;
}
