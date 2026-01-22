import React from "react";
import { Footer } from "@asym/ui/components/public/footer";

export default function WorkerDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
