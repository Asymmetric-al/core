"use client";

import { useState } from "react";

import {
  MEMBERS,
  TEAMS,
  TeamsPageHeader,
  TeamsTableCard,
  SystemUsersCard,
  type Team,
} from "./teams-sections";

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <TeamsPageHeader />

      <div className="grid gap-6">
        <TeamsTableCard
          teams={TEAMS}
          members={MEMBERS}
          searchTerm={searchTerm}
          selectedTeam={selectedTeam}
          onSearchTermChange={setSearchTerm}
          onSelectTeam={setSelectedTeam}
        />
        <SystemUsersCard members={MEMBERS} />
      </div>
    </div>
  );
}
