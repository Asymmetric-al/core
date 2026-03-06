import { createClient } from "@asym/database/supabase/server";

function healthyResponse() {
  return Response.json({
    status: "ok",
    checks: { supabase: "ok" },
  });
}

function degradedResponse(message: string) {
  return Response.json(
    {
      status: "degraded",
      checks: { supabase: `error: ${message}` },
    },
    { status: 503 }
  );
}

export async function GET() {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return healthyResponse();
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return degradedResponse(error.message);
    }

    return healthyResponse();
  } catch (error) {
    return degradedResponse(
      error instanceof Error ? error.message : "unknown supabase error"
    );
  }
}
