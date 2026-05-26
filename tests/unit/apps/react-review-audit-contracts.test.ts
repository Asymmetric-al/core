import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("React Review audit cleanup contracts", () => {
  it("keeps draft-mode API navigation on Next Link without prefetching", () => {
    for (const path of [
      ".agents/skills/nextjs/templates/app-router-async-params.tsx",
      ".cursor/skills/nextjs/templates/app-router-async-params.tsx",
    ]) {
      const source = readRepoFile(path);

      expect(source, path).toContain("import Link from 'next/link'");
      expect(source, path).toContain(
        '<Link href="/api/disable-draft" prefetch={false}>',
      );
      expect(source, path).not.toContain('<a href="/api/disable-draft">');
    }
  });

  it("keeps review-touched examples on gap utilities at the affected call sites", () => {
    for (const path of [
      ".agents/skills/shadcn-ui/examples/auth-layout.tsx",
      ".cursor/skills/shadcn-ui/examples/auth-layout.tsx",
    ]) {
      const source = readRepoFile(path);

      expect(source, path).toContain(
        'CardFooter className="flex flex-col gap-y-4"',
      );
      expect(source, path).not.toContain(
        'CardFooter className="flex flex-col space-y-4"',
      );
    }

    for (const path of [
      ".agents/skills/shadcn-ui/examples/data-table.tsx",
      ".cursor/skills/shadcn-ui/examples/data-table.tsx",
    ]) {
      const source = readRepoFile(path);

      expect(source, path).toContain(
        'className="flex items-center justify-end gap-x-2 py-4"',
      );
      expect(source, path).not.toContain(
        'className="flex items-center justify-end space-x-2 py-4"',
      );
    }
  });

  it("keeps review-touched support UI imports on leaf modules", () => {
    const importContracts = [
      {
        path: "apps/admin/features/support-hub/components/board/SupportBoardView.tsx",
        forbidden: 'from "../../types";',
        required: 'from "../../types/conversation";',
      },
      {
        path: "apps/admin/features/support-hub/components/labels/LabelForm.tsx",
        forbidden: 'from "../../types";',
        required: 'from "../../types/label";',
      },
      {
        path: "apps/admin/features/support-hub/components/detail/composer/ConversationComposer.tsx",
        forbidden: 'from "./extensions";',
        required: 'from "./extensions/mention-suggestion";',
      },
      {
        path: "packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx",
        forbidden: 'from "./filters";',
        required: 'from "./filters/use-advanced-filter";',
      },
      {
        path: "packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx",
        forbidden: 'from "./hooks";',
        required: 'from "./hooks/use-data-table-keyboard";',
      },
    ];

    for (const contract of importContracts) {
      const source = readRepoFile(contract.path);

      expect(source, contract.path).not.toContain(contract.forbidden);
      expect(source, contract.path).toContain(contract.required);
    }
  });
});
