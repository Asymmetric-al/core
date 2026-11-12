import { permanentRedirect } from "next/navigation";

// Email Studio was retired; updates are written on the Updates page.
export default function Page() {
  permanentRedirect("/feed");
}
