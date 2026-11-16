"use client";

import { SettingsPanel } from "../SettingsPanel";

/**
 * How a new conversation reaches an agent today. Nothing assigns
 * conversations automatically, so the page explains the manual path instead
 * of showing switches (even disabled ones) for automation that does not run.
 */
export function AssignmentRulesForm() {
  return (
    <SettingsPanel
      title="How conversations are assigned"
      description="Nothing assigns conversations automatically yet, so agents assign them by hand."
    >
      <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm text-foreground marker:text-muted-foreground">
        <li>New conversations wait in the Unassigned view of the inbox.</li>
        <li>
          An agent opens one and chooses <strong>Assign to me</strong>, or
          assigns it to a teammate from the conversation&apos;s assignee menu.
        </li>
        <li>
          The same menu reassigns or unassigns a conversation at any time.
        </li>
      </ol>
    </SettingsPanel>
  );
}
