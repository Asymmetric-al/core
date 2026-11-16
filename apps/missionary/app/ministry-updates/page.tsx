import { permanentRedirect } from "next/navigation";

// Updates live at /feed; this older path is kept working for saved links.
export default function MinistryUpdatesPage() {
  permanentRedirect("/feed");
}
