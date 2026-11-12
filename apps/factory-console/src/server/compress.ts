/**
 * gzip a JSON API answer for a client that accepts it. Next compresses pages
 * and static files, not route handlers, and the Console polls its snapshot
 * through the operator's tunnel.
 */
export function compressed(request: Request, response: Response): Response {
  if (
    !acceptsGzip(request.headers.get("accept-encoding")) ||
    !response.body ||
    response.headers.has("content-encoding") ||
    !/^application\/json\b/i.test(response.headers.get("content-type") ?? "")
  )
    return response;
  const headers = new Headers(response.headers);
  headers.set("Content-Encoding", "gzip");
  headers.append("Vary", "Accept-Encoding");
  headers.delete("Content-Length");
  return new Response(
    response.body.pipeThrough(new CompressionStream("gzip")),
    { status: response.status, statusText: response.statusText, headers },
  );
}

/** True when the header lists gzip with a quality other than zero. */
export function acceptsGzip(header: string | null): boolean {
  for (const part of (header ?? "").split(",")) {
    const [coding, ...parameters] = part.split(";").map((item) => item.trim());
    if (coding?.toLowerCase() !== "gzip") continue;
    const quality = parameters.find((item) => /^q\s*=/i.test(item));
    return quality === undefined || Number(quality.split("=")[1]) > 0;
  }
  return false;
}
