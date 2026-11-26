/*!
 * @alexmiracle · OpenShaders
 * https://openshaders.com/@alexmiracle
 * WebGPU renderer adapted from the OpenShaders React component for the
 * Mission Control sign-in backdrop.
 */

import {
  SIGN_IN_FIELD_SHADER,
  SIGN_IN_SHADER_STILL_TIME,
  SIGN_IN_UNIFORM_FLOATS,
  parseHex,
  writeFieldUniforms,
  type ShaderTheme,
} from "./sign-in-shader-source";

export const SIGN_IN_SWAY_SECONDS = 4.5;
export const SIGN_IN_SWAY_REACH = 0.5;
export const SIGN_IN_MOTION_LIMIT_SECONDS = 5;

const RENDER_SCALE = 0.4;
const MAX_PIXELS = 200_000;
const FRAME_INTERVAL_MS = 1000 / 30;
const FRAME_SLACK_MS = 4;
const MAX_STEP_SECONDS = 0.1;
const PROBE_BYTES = 256;

const BUFFER_USAGE = { MAP_READ: 0x0001, COPY_DST: 0x0008, UNIFORM: 0x0040 };
const TEXTURE_USAGE = { COPY_SRC: 0x01, RENDER_ATTACHMENT: 0x10 };
const MAP_MODE_READ = 0x0001;

export type ShaderOptions = {
  theme?: ShaderTheme;
  background?: { dark?: string; light?: string };
  signal?: AbortSignal;
  onReady?: () => void;
  onSettled?: () => void;
  onError: (error: Error) => void;
};

export type ShaderHandle = {
  destroy(): void;
};

type Playback = ShaderHandle & {
  begin(): void;
};

function toError(cause: unknown) {
  return cause instanceof Error ? cause : new Error(String(cause));
}

function sway(progress: number) {
  return (1 - Math.cos(2 * Math.PI * Math.min(1, progress))) / 2;
}

export function resolveCssColorHex(color: string): string | null {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext("2d");
  if (!context) return null;
  context.fillStyle = "transparent";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0, alpha = 0] = context.getImageData(
    0,
    0,
    1,
    1,
  ).data;
  if (alpha < 255) return null;
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function isGpuCanvasContext(
  context: RenderingContext | null,
): context is GPUCanvasContext {
  return (
    context !== null && "configure" in context && "getCurrentTexture" in context
  );
}

function animate(
  options: ShaderOptions,
  draw: (time: number, pixelRatio: number) => void,
  canvas: HTMLCanvasElement,
  release: () => void,
  maxDimension = Infinity,
): Playback {
  const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  let visible = true;
  let disposed = false;
  let moving = false;
  let settled = false;
  let frame = 0;
  let played = 0;
  let watched = 0;
  let previous: number | null = null;

  function canDraw() {
    return !disposed && !document.hidden && visible && width > 0 && height > 0;
  }

  function advancing() {
    return moving && !settled && !stillness.matches;
  }

  function fitCanvas() {
    const scale = Math.min(
      RENDER_SCALE,
      Math.sqrt(MAX_PIXELS / (width * height)),
      maxDimension / width,
      maxDimension / height,
    );
    const w = Math.max(1, Math.floor(width * scale));
    const h = Math.max(1, Math.floor(height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return w / width;
  }

  function render() {
    if (disposed) return;
    const progress = played / SIGN_IN_SWAY_SECONDS;
    try {
      draw(
        SIGN_IN_SHADER_STILL_TIME + SIGN_IN_SWAY_REACH * sway(progress),
        fitCanvas(),
      );
    } catch (error) {
      destroy();
      options.onError(toError(error));
    }
  }

  function schedule() {
    if (!frame && canDraw()) frame = requestAnimationFrame(tick);
  }

  function refresh() {
    if (!canDraw()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    } else schedule();
  }

  function tick(now: number) {
    frame = 0;
    if (!canDraw()) {
      previous = null;
      return;
    }
    const playing = advancing();
    if (playing && previous !== null) {
      const since = now - previous;
      if (since < FRAME_INTERVAL_MS - FRAME_SLACK_MS) {
        schedule();
        return;
      }
      watched += since / 1000;
      played = Math.min(
        SIGN_IN_SWAY_SECONDS,
        played + Math.min(since / 1000, MAX_STEP_SECONDS),
      );
    }
    previous = playing ? now : null;
    render();
    if (disposed) return;
    if (
      playing &&
      (played >= SIGN_IN_SWAY_SECONDS ||
        watched >= SIGN_IN_MOTION_LIMIT_SECONDS)
    ) {
      settled = true;
      previous = null;
      options.onSettled?.();
      return;
    }
    if (advancing()) schedule();
  }

  const observer = new ResizeObserver(([entry]) => {
    if (disposed || !entry) return;
    const next = entry.contentRect;
    if (width === next.width && height === next.height) return;
    width = next.width;
    height = next.height;
    refresh();
  });
  const intersection = new IntersectionObserver(([entry]) => {
    if (disposed || !entry || visible === entry.isIntersecting) return;
    visible = entry.isIntersecting;
    refresh();
  });

  function destroy() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    observer.disconnect();
    intersection.disconnect();
    stillness.removeEventListener("change", refresh);
    document.removeEventListener("visibilitychange", refresh);
    options.signal?.removeEventListener("abort", destroy);
    release();
  }

  observer.observe(canvas);
  intersection.observe(canvas);
  stillness.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);
  options.signal?.addEventListener("abort", destroy, { once: true });
  if (options.signal?.aborted) destroy();
  else schedule();

  return {
    begin() {
      if (disposed || moving) return;
      moving = true;
      previous = null;
      schedule();
    },
    destroy,
  };
}

export async function createShader(
  canvas: HTMLCanvasElement,
  options: ShaderOptions,
): Promise<ShaderHandle> {
  const theme = options.theme ?? "dark";
  const dark = parseHex(options.background?.dark ?? "#090909");
  const light = parseHex(options.background?.light ?? "#ffffff");
  options.signal?.throwIfAborted();
  if (!navigator.gpu)
    throw new Error("WebGPU is not available in this browser.");
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "low-power",
  });
  options.signal?.throwIfAborted();
  if (!adapter) throw new Error("No WebGPU adapter is available.");
  const device = await adapter.requestDevice();
  let context: GPUCanvasContext | null = null;
  let configured = false;
  let released = false;
  let failure: Error | null = null;
  let handle: Playback | null = null;

  function release() {
    if (released) return;
    released = true;
    options.signal?.removeEventListener("abort", abort);
    device.removeEventListener("uncapturederror", gpuError);
    if (configured) context?.unconfigure();
    device.destroy();
  }

  function abort() {
    if (handle) handle.destroy();
    else release();
  }

  function fail(error: Error) {
    if (released) return;
    failure = error;
    if (handle) {
      handle.destroy();
      options.onError(error);
    } else release();
  }

  function gpuError(event: GPUUncapturedErrorEvent) {
    event.preventDefault();
    fail(new Error(event.error.message));
  }

  function checkActive() {
    options.signal?.throwIfAborted();
    if (failure) throw failure;
  }

  options.signal?.addEventListener("abort", abort, { once: true });
  device.addEventListener("uncapturederror", gpuError);
  void device.lost.then((info) => {
    if (!released) {
      fail(new Error(`WebGPU device lost: ${info.message || info.reason}.`));
    }
  });

  try {
    checkActive();
    const format = navigator.gpu.getPreferredCanvasFormat();
    const uniforms = device.createBuffer({
      size: SIGN_IN_UNIFORM_FLOATS * 4,
      usage: BUFFER_USAGE.UNIFORM | BUFFER_USAGE.COPY_DST,
    });
    const uniformData = new Float32Array(SIGN_IN_UNIFORM_FLOATS);
    let probe: GPUBuffer | null = device.createBuffer({
      size: PROBE_BYTES,
      usage: BUFFER_USAGE.MAP_READ | BUFFER_USAGE.COPY_DST,
    });
    const fieldModule = device.createShaderModule({
      code: SIGN_IN_FIELD_SHADER,
    });
    const fieldPipeline = await device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module: fieldModule, entryPoint: "vertexMain" },
      fragment: {
        module: fieldModule,
        entryPoint: "fragmentMain",
        targets: [{ format }],
      },
      primitive: { topology: "triangle-list" },
    });
    checkActive();
    const fieldBindGroup = device.createBindGroup({
      layout: fieldPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniforms } }],
    });

    const canvasContext = canvas.getContext("webgpu");
    if (!isGpuCanvasContext(canvasContext)) {
      throw new Error("A WebGPU canvas context could not be created.");
    }
    context = canvasContext;
    context.configure({
      device,
      format,
      alphaMode: "opaque",
      usage: TEXTURE_USAGE.RENDER_ATTACHMENT | TEXTURE_USAGE.COPY_SRC,
    });
    configured = true;

    function verifyFirstFrame(buffer: GPUBuffer) {
      buffer
        .mapAsync(MAP_MODE_READ)
        .then(() => {
          const [first = 0, second = 0, third = 0] = new Uint8Array(
            buffer.getMappedRange(0, 4),
          );
          buffer.unmap();
          buffer.destroy();
          if (released) return;
          if (first + second + third === 0) {
            throw new Error("The sign-in shader drew a blank first frame.");
          }
          options.onReady?.();
          handle?.begin();
        })
        .catch((error: unknown) => fail(toError(error)));
    }

    handle = animate(
      options,
      (time, pixelRatio) => {
        const { width, height } = canvas;
        const texture = canvasContext.getCurrentTexture();
        writeFieldUniforms(uniformData, {
          width,
          height,
          time,
          theme,
          dark,
          light,
          pixelRatio,
        });
        device.queue.writeBuffer(uniforms, 0, uniformData);
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            { view: texture.createView(), loadOp: "clear", storeOp: "store" },
          ],
        });
        pass.setPipeline(fieldPipeline);
        pass.setBindGroup(0, fieldBindGroup);
        pass.draw(3);
        pass.end();
        const check = probe;
        probe = null;
        if (check) {
          encoder.copyTextureToBuffer(
            { texture, origin: { x: width >> 1, y: height >> 1 } },
            { buffer: check, bytesPerRow: PROBE_BYTES },
            { width: 1, height: 1 },
          );
        }
        device.queue.submit([encoder.finish()]);
        if (check) verifyFirstFrame(check);
      },
      canvas,
      release,
      device.limits.maxTextureDimension2D,
    );
    return handle;
  } catch (error) {
    release();
    throw failure ?? error;
  }
}
