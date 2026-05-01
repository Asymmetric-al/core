"use client";

import { useTeams, useTeamMembers } from "@asym/database/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { useMemo, useState } from "react";

import {
  TeamsPageActions,
  TeamsTableCard,
  SystemUsersCard,
  type Team,
} from "./teams-sections";

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const teamsQuery = useTeams();
  const membersQuery = useTeamMembers();
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const filteredTeams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return teams;
    }

    return teams.filter((team) => {
      return (
        team.name.toLowerCase().includes(normalizedSearch) ||
        team.description.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm, teams]);

  return (
    <PageShell
      title="Manage Teams"
      description="Organize users and departments with shared, granular permissions."
      className="gap-6 p-4 pb-16 sm:p-6 lg:p-7"
      headerClassName="gap-4 border-border/80 pb-5 md:items-end"
      actions={<TeamsPageActions />}
      contentClassName="space-y-8 animate-in fade-in duration-500"
    >
      <div className="grid gap-6">
        <TeamsTableCard
          teams={filteredTeams}
          members={members}
          isLoading={teamsQuery.isLoading || membersQuery.isLoading}
          searchTerm={searchTerm}
          selectedTeam={selectedTeam}
          onSearchTermChange={setSearchTerm}
          onSelectTeam={setSelectedTeam}
        />
        <SystemUsersCard members={members} />
      </div>
    </PageShell>
  );
}
