import type { Metadata } from "next";

export { default } from "../feed/worker-feed-page-client";

export const metadata: Metadata = {
  title: "Ministry updates",
  description: "Publish ministry updates to supporters from the feed.",
};
