import { dispatch } from "../../../../server/api";
import { compressed } from "../../../../server/compress";
import { authorize, configuration } from "../../../../server/security";
import { createFactory } from "../../../../server/wiring";

async function handle(request: Request) {
  let config;
  try {
    config = configuration();
  } catch {
    return Response.json(
      {
        error:
          "Console configuration unavailable. The owner must configure the private loopback instance.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const denial = authorize(request, config);
  if (denial) return denial;
  return compressed(request, await dispatch(request, createFactory(config)));
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
