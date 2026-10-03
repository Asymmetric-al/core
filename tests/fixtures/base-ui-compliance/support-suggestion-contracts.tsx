import React, { useMemo, useState } from "react";
import { Button } from "../../../packages/ui/components/shadcn/button";
import { buildMentionExtension } from "../../../apps/admin/features/support-hub/components/detail/composer/extensions/mention-suggestion";
import { SupportTipTapEditor } from "../../../apps/admin/features/support-hub/components/detail/composer/SupportTipTapEditor";

export function SupportSuggestionContracts() {
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(true);
  const [selected, setSelected] = useState("none");
  const extensions = useMemo(
    () => [
      buildMentionExtension({
        agents: [
          {
            id: "agent-morgan",
            name: "Morgan",
            email: "morgan@example.test",
            avatarUrl: null,
            title: "Care",
          },
          {
            id: "agent-riley",
            name: "Riley",
            email: "riley@example.test",
            avatarUrl: null,
            title: "Care",
          },
          ...["Alex", "Bailey", "Casey", "Devon", "Ellis", "Finley"].map(
            (name) => ({
              id: `agent-${name.toLowerCase()}`,
              name,
              email: `${name.toLowerCase()}@example.test`,
              avatarUrl: null,
              title: "Care",
            }),
          ),
        ],
        onMention: (agent) => setSelected(agent.id),
      }),
    ],
    [],
  );
  return (
    <section
      id="support-suggestion-contracts"
      aria-label="Support editor suggestions"
      className="my-6 max-w-xl"
    >
      <h2>Support editor suggestions</h2>
      {mounted && (
        <SupportTipTapEditor
          value={value}
          onChange={setValue}
          extraExtensions={extensions}
          tone="note"
        />
      )}
      <p role="status" aria-label="Selected suggestion">
        {selected}
      </p>
      <Button onClick={() => setMounted((current) => !current)}>
        {mounted ? "Unmount support editor" : "Mount support editor"}
      </Button>
    </section>
  );
}
