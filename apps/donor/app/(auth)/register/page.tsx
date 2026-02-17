"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Read-only demo: no registration; redirect to app. */
export default function RegisterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/donor-dashboard");
  }, [router]);
  return null;
}
