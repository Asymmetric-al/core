import { redirect } from "next/navigation";

/** Read-only demo: no login; redirect to app. */
export default function LoginPage() {
  redirect("/donor-dashboard");
}
