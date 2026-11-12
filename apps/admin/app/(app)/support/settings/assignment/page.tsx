import type { Metadata } from "next";

import { AssignmentRulesForm } from "@/features/support-hub/components/settings/assignment/AssignmentRulesForm";

export const metadata: Metadata = {
  title: "Assignment rules · Support settings",
};

export default function SupportSettingsAssignmentPage() {
  return (
    <>
      <AssignmentRulesForm />
    </>
  );
}
