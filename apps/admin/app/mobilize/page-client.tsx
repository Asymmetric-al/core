"use client";

import { useMobilizeCandidates } from "@asym/database/hooks";
import { motion } from "@asym/lib/motion";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";

import {
  type Candidate,
  type MobilizeTab,
  MobilizeAddCandidateSheet,
  MobilizeCandidateDetailSheet,
  MobilizePipelineTable,
  MobilizeStatsRow,
} from "./mobilize-sections";

export default function Mobilize() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<MobilizeTab>("all");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const candidatesQuery = useMobilizeCandidates();
  const allCandidates = useMemo(
    () => candidatesQuery.data ?? [],
    [candidatesQuery.data],
  );

  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((candidate) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        candidate.name.toLowerCase().includes(normalizedSearch) ||
        candidate.role.toLowerCase().includes(normalizedSearch);
      const matchesTab =
        activeTab === "all" || candidate.stage.toLowerCase() === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [activeTab, allCandidates, searchTerm]);

  const stats = useMemo(() => {
    return {
      applied: allCandidates.filter(
        (candidate) => candidate.stage === "Applied",
      ).length,
      vetting: allCandidates.filter(
        (candidate) => candidate.stage === "Vetting",
      ).length,
      training: allCandidates.filter(
        (candidate) => candidate.stage === "Training",
      ).length,
      ready: allCandidates.filter((candidate) => candidate.stage === "Ready")
        .length,
    };
  }, [allCandidates]);

  return (
    <PageShell
      title="Mobilize"
      description="Recruitment pipeline and candidate management."
      density="compact"
      actions={
        <Button
          className="h-10 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          onClick={() => setIsAddSheetOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Candidate
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <MobilizeStatsRow stats={stats} />
        <MobilizePipelineTable
          activeTab={activeTab}
          searchTerm={searchTerm}
          candidates={filteredCandidates}
          isLoading={candidatesQuery.isLoading}
          onTabChange={setActiveTab}
          onSearchTermChange={setSearchTerm}
          onSelectCandidate={setSelectedCandidate}
        />
      </motion.div>
      <MobilizeAddCandidateSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
      <MobilizeCandidateDetailSheet
        candidate={selectedCandidate}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCandidate(null);
          }
        }}
      />
    </PageShell>
  );
}
