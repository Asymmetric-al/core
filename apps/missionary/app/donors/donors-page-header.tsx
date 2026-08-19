"use client";

import { motion } from "@asym/lib/motion";
import { AddPartnerDialog } from "@asym/missionary/components/add-partner-dialog";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button } from "@asym/ui/components/shadcn/button";
import { Plus, Download } from "lucide-react";

import { useDonorsPageViewFields } from "./use-donors-page-view";

export function DonorsPageHeader() {
  const view = useDonorsPageViewFields();
  const { profile } = view;
  const { refreshDonors } = view.actions;
  return (
    <PageHeader
      title="Partners"
      description="Manage your support network and donor relationships."
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-medium"
        >
          <Download className="mr-2 size-4" />
          Export
        </Button>
      </motion.div>
      {profile?.id && (
        <AddPartnerDialog
          missionaryId={profile.id}
          onSuccess={refreshDonors}
          trigger={
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-medium hover-scale-subtle"
            >
              <Plus className="mr-2 size-4" />
              Add Partner
            </Button>
          }
        />
      )}
    </PageHeader>
  );
}
