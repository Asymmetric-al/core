import { createClient } from "@asym/database/supabase/server";

import { noStoreJson, providerUnavailable } from "./sign-in-answers";

export async function GET() {
  try {
    const supabase = await createClient(null);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError") {
      return providerUnavailable(error)
        ? noStoreJson({ user: null }, 503)
        : noStoreJson({ user: null });
    }
    return noStoreJson({ user: user ?? null });
  } catch {
    return noStoreJson({ user: null }, 503);
  }
}
