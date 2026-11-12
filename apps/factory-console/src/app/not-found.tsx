import { ButtonLink } from "@asym/ui/components/shadcn/button-component";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found · Core Console · VM100",
  description: "This address is not part of the owner-only Core Console",
};

/**
 * The Console is one page with sections. Any other address reaches this
 * boundary (inside the root layout, behind the same owner authentication),
 * which says so and leads back; it reads nothing and runs no control.
 */
export default function ConsoleNotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Console page not found</h1>
      <p>
        This address is not part of the Factory Console. Nothing was read from
        the factory and no control was sent. The Console has a single page; its
        sections open from there.
      </p>
      <div>
        <ButtonLink
          variant="outline"
          render={<Link href="/">Open the Factory Console</Link>}
        />
      </div>
    </main>
  );
}
