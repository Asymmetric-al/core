"use client";

import { motion } from "@asym/lib/motion";

import { DonorsPageDetail } from "./donors-page-detail";
import { DonorsPageActivityDialogs } from "./donors-page-dialogs";
import { DonorsPageHeader } from "./donors-page-header";
import { DonorsPageRoster } from "./donors-page-roster";
import { DonorsPageStats } from "./donors-page-stats";

export function DonorsPageContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <DonorsPageHeader />
      <DonorsPageStats />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DonorsPageRoster />
        <DonorsPageDetail />
      </div>
      <DonorsPageActivityDialogs />
    </motion.div>
  );
}
