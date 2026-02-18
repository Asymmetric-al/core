import { redirect } from "next/navigation";

/** Read-only demo: no registration; redirect to app. */
export default function RegisterPage() {
  redirect("/donor-dashboard");
}
