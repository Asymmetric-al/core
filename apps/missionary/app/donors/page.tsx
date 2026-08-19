import type { Metadata } from "next";

export { default } from "./donors-page-client";

export const metadata: Metadata = {
  title: "Partners",
  description: "Manage partner profiles, activity, and tags.",
};

// Instant Navigation: this route has no server data reads. Partner rows load
// through the client missionary donor query under RLS.
