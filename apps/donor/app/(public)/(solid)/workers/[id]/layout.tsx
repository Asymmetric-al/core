import React from "react";

export default function WorkerDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
