import React, { useState } from "react";

import SearchDialog from "../../../packages/ui/components/shadcn-studio/blocks/dialog-search";

export function SearchDelegationContracts() {
  const [activations, setActivations] = useState(0);
  return (
    <section aria-label="Library search delegation" className="my-8 border p-4">
      <SearchDialog
        trigger={
          <button
            type="button"
            onClick={() => setActivations((count) => count + 1)}
          >
            Open library search
          </button>
        }
      />
      <output aria-label="Library trigger activations">{activations}</output>
    </section>
  );
}
