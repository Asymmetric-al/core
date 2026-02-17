"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Read-only demo: no login; redirect to app. */
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/donor-dashboard");
  }, [router]);
  return null;
}
