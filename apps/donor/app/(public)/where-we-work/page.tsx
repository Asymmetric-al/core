import type { Metadata } from "next";

import { WhereWeWorkContent } from "./where-we-work-client";

export const metadata: Metadata = {
  title: "Where we work",
  description: "Explore the countries and communities served by our workers.",
};

export default function WhereWeWorkPage() {
  return (
    <main className="w-full">
      <WhereWeWorkContent />
    </main>
  );
}
