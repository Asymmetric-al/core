"use client";

import { motion } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";

import {
  MOCK_CANDIDATES,
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

  const filteredCandidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((candidate) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        candidate.name.toLowerCase().includes(normalizedSearch) ||
        candidate.role.toLowerCase().includes(normalizedSearch);
      const matchesTab =
        activeTab === "all" || candidate.stage.toLowerCase() === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [activeTab, searchTerm]);

  const stats = useMemo(() => {
    return {
      applied: MOCK_CANDIDATES.filter(
        (candidate) => candidate.stage === "Applied",
      ).length,
      vetting: MOCK_CANDIDATES.filter(
        (candidate) => candidate.stage === "Vetting",
      ).length,
      training: MOCK_CANDIDATES.filter(
        (candidate) => candidate.stage === "Training",
      ).length,
      ready: MOCK_CANDIDATES.filter(
        (candidate) =>
          candidate.stage === "Ready" || candidate.stage === "Deployed",
      ).length,
    };
  }, []);

  return (
    <PageShell
      title="Mobilize"
      description="Recruitment pipeline and candidate management."
      actions={
        <Button
          className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px]"
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
