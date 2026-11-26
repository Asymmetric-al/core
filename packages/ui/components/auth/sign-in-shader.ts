/*! Field shader by @alexmiracle · OpenShaders · https://openshaders.com/@alexmiracle */

import {
  SIGN_IN_FIELD_SHADER,
  SIGN_IN_SHADER_STILL_TIME,
  SIGN_IN_VERTEX_SHADER,
} from "./sign-in-shader-source";

export const SIGN_IN_SHADER_SPEED = 0.4375;

const RENDER_SCALE = 0.4;
const MAX_RENDER_PIXELS = 200_000;
const FRAME_INTERVAL_MS = 1000 / 30;
const FRAME_SLACK_MS = 4;
const MAX_FRAME_DELTA_S = 0.1;

export type RgbColor = readonly [number, number, number];

export interface SignInShaderOptions {
  background: RgbColor;
  paused: boolean;
  onReady: () => void;
  onFailure: (error: Error) => void;
}

export interface SignInShaderHandle {
  setPaused(paused: boolean): void;
  destroy(): void;
}

const UNIFORMS = [
  "iResolution",
  "iTime",
  "uLightMode",
  "uDarkBackground",
  "uLightBackground",
] as const;

type UniformName = (typeof UNIFORMS)[number];

export function resolveCssColor(color: string): RgbColor | null {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#000000";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red / 255, green / 255, blue / 255];
}

function compileStage(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function linkFailure(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  stages: readonly WebGLShader[],
): Error | null {
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const logs = stages
    .filter((stage) => !gl.getShaderParameter(stage, gl.COMPILE_STATUS))
    .map((stage) => gl.getShaderInfoLog(stage));
  logs.push(gl.getProgramInfoLog(program));
  return new Error(
    `Sign-in shader failed to build: ${logs.filter(Boolean).join(" ")}`.trim(),
  );
}

export function createSignInShader(
  canvas: HTMLCanvasElement,
  options: SignInShaderOptions,
): SignInShaderHandle {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!gl || gl.isContextLost()) {
    throw new Error("WebGL2 is not available.");
  }
  const context = gl;

  const program = context.createProgram();
  if (!program) throw new Error("WebGL could not create a program.");
  const stages: WebGLShader[] = [];
  try {
    stages.push(
      compileStage(context, context.VERTEX_SHADER, SIGN_IN_VERTEX_SHADER),
      compileStage(context, context.FRAGMENT_SHADER, SIGN_IN_FIELD_SHADER),
    );
    for (const stage of stages) context.attachShader(program, stage);
    context.linkProgram(program);
  } catch (error) {
    for (const stage of stages) context.deleteShader(stage);
    context.deleteProgram(program);
    throw error;
  }

  const parallel = context.getExtension("KHR_parallel_shader_compile");
  let uniforms: Record<UniformName, WebGLUniformLocation | null> | null = null;
  let paused = options.paused;
  let disposed = false;
  let revealed = false;
  let visible = true;
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  let frame = 0;
  let lastFrameAt: number | null = null;
  let elapsed = SIGN_IN_SHADER_STILL_TIME;

  function canDraw() {
    return !disposed && !document.hidden && visible && width > 0 && height > 0;
  }

  function schedule() {
    if (!frame && canDraw()) frame = requestAnimationFrame(tick);
  }

  function refresh() {
    if (canDraw()) {
      schedule();
      return;
    }
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrameAt = null;
  }

  function fail(cause: unknown) {
    if (disposed) return;
    destroy();
    options.onFailure(
      cause instanceof Error ? cause : new Error(String(cause)),
    );
  }

  function finishBuild() {
    for (const stage of stages) context.deleteShader(stage);
    const failure = linkFailure(context, program, stages);
    stages.length = 0;
    if (failure) throw failure;
    uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, context.getUniformLocation(program, name)]),
    ) as Record<UniformName, WebGLUniformLocation | null>;
  }

  function fitCanvas() {
    const scale = Math.min(
      RENDER_SCALE,
      Math.sqrt(MAX_RENDER_PIXELS / (width * height)),
    );
    const targetWidth = Math.max(1, Math.floor(width * scale));
    const targetHeight = Math.max(1, Math.floor(height * scale));
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
  }

  function draw(locations: Record<UniformName, WebGLUniformLocation | null>) {
    fitCanvas();
    context.viewport(0, 0, canvas.width, canvas.height);
    context.useProgram(program);
    context.uniform2f(locations.iResolution, canvas.width, canvas.height);
    context.uniform1f(locations.iTime, elapsed);
    context.uniform1f(locations.uLightMode, 1);
    context.uniform3f(locations.uDarkBackground, 0, 0, 0);
    context.uniform3fv(locations.uLightBackground, options.background);
    context.drawArrays(context.TRIANGLES, 0, 3);
  }

  function verifyFirstFrame() {
    const pixel = new Uint8Array(4);
    context.readPixels(
      canvas.width >> 1,
      canvas.height >> 1,
      1,
      1,
      context.RGBA,
      context.UNSIGNED_BYTE,
      pixel,
    );
    if (context.getError() !== context.NO_ERROR || context.isContextLost()) {
      throw new Error("Sign-in shader did not draw a frame.");
    }
    if ((pixel[0] ?? 0) + (pixel[1] ?? 0) + (pixel[2] ?? 0) === 0) {
      throw new Error("Sign-in shader drew an empty frame.");
    }
  }

  function tick(now: number) {
    frame = 0;
    if (!canDraw()) {
      lastFrameAt = null;
      return;
    }
    try {
      if (!uniforms) {
        if (
          parallel &&
          !context.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)
        ) {
          schedule();
          return;
        }
        finishBuild();
      }
      if (
        !paused &&
        lastFrameAt !== null &&
        now - lastFrameAt < FRAME_INTERVAL_MS - FRAME_SLACK_MS
      ) {
        schedule();
        return;
      }
      if (!paused && lastFrameAt !== null) {
        elapsed +=
          Math.min((now - lastFrameAt) / 1000, MAX_FRAME_DELTA_S) *
          SIGN_IN_SHADER_SPEED;
      }
      lastFrameAt = paused ? null : now;
      if (uniforms) draw(uniforms);
      if (!revealed) {
        verifyFirstFrame();
        revealed = true;
        options.onReady();
      }
    } catch (error) {
      fail(error);
      return;
    }
    if (!paused) schedule();
  }

  const resizeObserver = new ResizeObserver(([entry]) => {
    if (disposed || !entry) return;
    width = entry.contentRect.width;
    height = entry.contentRect.height;
    refresh();
  });
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    if (disposed || !entry) return;
    visible = entry.isIntersecting;
    refresh();
  });

  function onContextLost() {
    fail(new Error("The sign-in shader lost its WebGL context."));
  }

  function destroy() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", refresh);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    if (!context.isContextLost()) {
      for (const stage of stages) context.deleteShader(stage);
      context.deleteProgram(program);
    }
    stages.length = 0;
  }

  resizeObserver.observe(canvas);
  intersectionObserver.observe(canvas);
  document.addEventListener("visibilitychange", refresh);
  canvas.addEventListener("webglcontextlost", onContextLost);
  schedule();

  return {
    setPaused(next) {
      if (disposed || paused === next) return;
      paused = next;
      lastFrameAt = null;
      if (!paused) {
        schedule();
      } else if (revealed) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    destroy,
  };
}
