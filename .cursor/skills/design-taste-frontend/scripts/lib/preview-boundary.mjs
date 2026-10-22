// Core-owned boundaries for explicitly requested browser inspection.
export function requirePreviewUrl(target) {
  let url;
  try {
    url = new URL(target);
  } catch {
    throw new Error(
      "Browser inspection requires an explicit HTTP(S) dev-server URL; follow the project's development-server workflow for local files.",
    );
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error(
      "Browser inspection requires an explicit HTTP(S) dev-server URL.",
    );
  return url.href;
}
export function sceneScreenshotName(sceneIndex, viewport) {
  if (
    !Number.isSafeInteger(sceneIndex) ||
    sceneIndex < 0 ||
    sceneIndex > 1000000 ||
    !["desktop", "phone"].includes(viewport)
  )
    throw new Error("Invalid scene screenshot identity");
  return `scene-${sceneIndex + 1}-${viewport}.jpg`;
}
// Passed as a serialized function to the browser; keep it free of module closures.
export function renderSceneContactSheet(a) {
  document.body.style.cssText = `margin:0;background:#777;display:grid;grid-template-columns:repeat(${a.cols},${a.cellW}px);font:12px/22px system-ui;color:#fff`;
  document.body.replaceChildren();
  for (const [index, frame] of a.frames.entries()) {
    const figure = document.createElement("figure");
    figure.style.margin = "0";
    const image = document.createElement("img");
    image.src = "data:image/jpeg;base64," + frame;
    image.style.cssText = `width:${a.cellW}px;height:${a.cellH}px;display:block;outline:1px solid #777`;
    const caption = document.createElement("figcaption");
    caption.style.cssText = "padding-left:6px;background:#111";
    caption.textContent = String(a.labels[index] ?? "");
    figure.append(image, caption);
    document.body.append(figure);
  }
  return Promise.all(
    [...document.images].map((image) => image.decode().catch(() => {})),
  );
}
