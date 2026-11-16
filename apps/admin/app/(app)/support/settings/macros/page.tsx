import type { Metadata } from "next";

import { MacroList } from "@/features/support-hub/components/settings/macros/MacroList";

export const metadata: Metadata = {
  title: "Macros · Support settings",
};

export default function SupportSettingsMacrosPage() {
  return (
    <>
      <MacroList />
    </>
  );
}
