export interface NativeRenderResponse {
  success?: boolean;
  render?: {
    status?: string;
    errors?: Array<{ code?: string; message?: string }>;
  };
}

export function nativeRenderFeedback(
  ok: boolean,
  body: NativeRenderResponse | undefined,
) {
  const render = body?.render;
  if (
    ok &&
    body?.success === true &&
    (render?.status === "success" || render?.status === "warning") &&
    render.errors?.length === 0
  ) {
    return {
      success: true,
      title: "Test render finished",
      description:
        "Rendered with sample data. No file was saved or downloaded.",
    };
  }
  const setup = render?.errors?.some(
    (error) =>
      error.code === "native_render_disabled" ||
      error.code === "docraptor_not_configured",
  );
  return {
    success: false,
    title: "Test render unavailable",
    description: setup
      ? "PDF output setup is incomplete. Ask an administrator to check the PDF output settings."
      : render?.status === "error"
        ? "The document could not be rendered. Check its content and preview diagnostics, then try again."
        : "The test render did not finish. Try again.",
  };
}
