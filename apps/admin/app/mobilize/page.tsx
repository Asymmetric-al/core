"use client";

import React, { useMemo, useState } from "react";

import {
  MOCK_CANDIDATES,
  type Candidate,
  type MobilizeTab,
  MobilizeAddCandidateSheet,
  MobilizeCandidateDetailSheet,
  MobilizeHeader,
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <MobilizeHeader onAddCandidate={() => setIsAddSheetOpen(true)} />
      <MobilizeStatsRow stats={stats} />
      <MobilizePipelineTable
        activeTab={activeTab}
        searchTerm={searchTerm}
        candidates={filteredCandidates}
        onTabChange={setActiveTab}
        onSearchTermChange={setSearchTerm}
        onSelectCandidate={setSelectedCandidate}
      />
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
    </div>
  );
}
