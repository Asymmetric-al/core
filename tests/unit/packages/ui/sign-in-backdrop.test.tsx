// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { Profiler, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthShell } from "../../../../packages/ui/components/auth/auth-primitives";
import { AuthScreenSkeleton } from "../../../../packages/ui/components/auth/AuthScreenSkeleton";
import {
  SIGN_IN_MOTION_LIMIT_SECONDS,
  SIGN_IN_SWAY_REACH,
} from "../../../../packages/ui/components/auth/sign-in-shader";
import { SIGN_IN_SHADER_STILL_TIME } from "../../../../packages/ui/components/auth/sign-in-shader-source";
import { SignInBackdrop } from "../../../../packages/ui/components/auth/SignInBackdrop";

const STILLS = { narrow: "/still-narrow.webp", wide: "/still-wide.webp" };
const FRAME_MS = 1000 / 30;
const MUTED = "rgb(242, 243, 245)";
const PAINTABLE: Record<string, readonly number[]> = {
  transparent: [0, 0, 0, 0],
  [MUTED]: [242, 243, 245, 255],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function createFakeGpu() {
  const lost = deferred<{ reason: string; message: string }>();
  const errorListeners = new Set<(event: unknown) => void>();
  const uniforms: number[][] = [];
  const readback = {
    pixel: [244, 236, 250, 255],
    held: null as ReturnType<typeof deferred<undefined>> | null,
  };
  let destroyed = false;
  const probe = {
    mapAsync: vi.fn(() => {
      if (destroyed) {
        return Promise.reject(
          new DOMException("Device destroyed", "AbortError"),
        );
      }
      return readback.held?.promise ?? Promise.resolve(undefined);
    }),
    getMappedRange: vi.fn(() => new Uint8Array(readback.pixel).buffer),
    unmap: vi.fn(),
    destroy: vi.fn(),
  };
  const pass = {
    setPipeline: vi.fn(),
    setBindGroup: vi.fn(),
    draw: vi.fn(),
    end: vi.fn(),
  };
  const encoder = {
    beginRenderPass: vi.fn(() => pass),
    copyTextureToBuffer: vi.fn(),
    finish: vi.fn(() => ({})),
  };
  const device = {
    limits: { maxTextureDimension2D: 8192 },
    lost: lost.promise,
    addEventListener: vi.fn(
      (_type: string, listener: (event: unknown) => void) =>
        errorListeners.add(listener),
    ),
    removeEventListener: vi.fn(
      (_type: string, listener: (event: unknown) => void) =>
        errorListeners.delete(listener),
    ),
    destroy: vi.fn(() => {
      destroyed = true;
      readback.held?.reject(new DOMException("Device destroyed", "AbortError"));
      lost.resolve({ reason: "destroyed", message: "" });
    }),
    createBuffer: vi.fn(({ usage }: { usage: number }) =>
      usage & 0x0001 ? probe : { destroy: vi.fn() },
    ),
    createShaderModule: vi.fn(() => ({})),
    createRenderPipelineAsync: vi.fn(() =>
      Promise.resolve({ getBindGroupLayout: () => ({}) }),
    ),
    createBindGroup: vi.fn(() => ({})),
    createCommandEncoder: vi.fn(() => encoder),
    queue: {
      writeBuffer: vi.fn(
        (_buffer: unknown, _offset: number, data: Float32Array) =>
          uniforms.push(Array.from(data)),
      ),
      submit: vi.fn(),
    },
  };
  const adapter = { requestDevice: vi.fn(() => Promise.resolve(device)) };
  const gpu = {
    requestAdapter: vi.fn((): Promise<typeof adapter | null> =>
      Promise.resolve(adapter),
    ),
    getPreferredCanvasFormat: vi.fn(() => "bgra8unorm"),
  };
  const context = {
    configure: vi.fn(),
    unconfigure: vi.fn(),
    getCurrentTexture: vi.fn(() => ({ createView: () => ({}) })),
  };
  return {
    gpu,
    adapter,
    device,
    context,
    probe,
    pass,
    encoder,
    readback,
    times: () => uniforms.map((data) => data[2] ?? Number.NaN),
    lastUniforms: () => uniforms.at(-1) ?? [],
    loseDevice: () => lost.resolve({ reason: "unknown", message: "gone" }),
    raiseUncapturedError: () => {
      const event = { preventDefault: vi.fn(), error: { message: "bad" } };
      for (const listener of errorListeners) listener(event);
      return event;
    },
  };
}

type FakeGpu = ReturnType<typeof createFakeGpu>;

const frames = new Map<number, FrameRequestCallback>();
const motionListeners = new Set<() => void>();
const resizeDisconnect = vi.fn();
let nextFrameId = 1;
let clock = 0;
let prefersReducedMotion = false;
let layerBackground = MUTED;
let fake: FakeGpu;

function runFrames(count: number, stepMs = FRAME_MS) {
  for (let index = 0; index < count; index += 1) {
    clock += stepMs;
    const pending = [...frames.values()];
    frames.clear();
    act(() => {
      for (const callback of pending) callback(clock);
    });
  }
}

function runUntilSettled(container: HTMLElement, stepMs = FRAME_MS) {
  for (let index = 0; index < 1000; index += 1) {
    if (backdropLayer(container).dataset.state !== "animating") return index;
    runFrames(1, stepMs);
  }
  throw new Error("The backdrop never settled.");
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function setReducedMotion(next: boolean) {
  prefersReducedMotion = next;
  act(() => {
    for (const listener of [...motionListeners]) listener();
  });
}

function backdropLayer(container: HTMLElement) {
  const layer = container.querySelector<HTMLElement>(
    '[data-slot="sign-in-backdrop"]',
  );
  if (!layer) throw new Error("The backdrop layer is missing.");
  return layer;
}

function canvasClasses(container: HTMLElement) {
  return container.querySelector("canvas")?.className ?? "";
}

function renderBackdrop() {
  return render(
    <SignInBackdrop stills={STILLS}>
      <main data-slot="auth-shell">
        <button type="button">Sign in</button>
      </main>
    </SignInBackdrop>,
  );
}

async function renderRevealedBackdrop() {
  const view = renderBackdrop();
  await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());
  runFrames(1);
  await flush();
  expect(backdropLayer(view.container).dataset.state).toBe("animating");
  return view;
}

beforeEach(() => {
  frames.clear();
  motionListeners.clear();
  nextFrameId = 1;
  clock = 0;
  prefersReducedMotion = false;
  layerBackground = MUTED;
  fake = createFakeGpu();
  Object.defineProperty(navigator, "gpu", {
    configurable: true,
    get: () => fake.gpu,
  });

  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrameId;
    nextFrameId += 1;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames.delete(id);
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe() {
        this.callback(
          [{ contentRect: { width: 800, height: 600 } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        );
      }
      disconnect = resizeDisconnect;
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return prefersReducedMotion;
      },
      addEventListener: (_type: string, listener: () => void) =>
        motionListeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) =>
        motionListeners.delete(listener),
    })),
  );
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) =>
    element instanceof HTMLElement &&
    element.dataset.slot === "sign-in-backdrop"
      ? ({ backgroundColor: layerBackground } as CSSStyleDeclaration)
      : computedStyle(element),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
    type: string,
  ) => {
    if (type === "2d") {
      let fill = "transparent";
      return {
        get fillStyle() {
          return fill;
        },
        set fillStyle(value: string) {
          if (value in PAINTABLE) fill = value;
        },
        fillRect: vi.fn(),
        getImageData: () => ({
          data: new Uint8ClampedArray(PAINTABLE[fill] ?? [0, 0, 0, 0]),
        }),
      };
    }
    return type === "webgpu" ? fake.context : null;
  }) as unknown as HTMLCanvasElement["getContext"]);
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
  Reflect.deleteProperty(navigator, "gpu");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resizeDisconnect.mockClear();
});

describe("SignInBackdrop", () => {
  it("shows the still behind usable content before any shader loads", () => {
    const { container } = renderBackdrop();
    const layer = backdropLayer(container);

    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(layer.className).toContain("pointer-events-none");
    expect(layer.style.getPropertyValue("--sign-in-still-wide")).toBe(
      'url("/still-wide.webp")',
    );
    expect(layer.dataset.state).toBe("still");
    expect(canvasClasses(container)).toContain("opacity-0");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it.each([
    ["the sign-in screen", <AuthShell key="shell">Form</AuthShell>],
    [
      "its loading state",
      <AuthScreenSkeleton key="skeleton" label="Loading sign-in" />,
    ],
  ])("lets %s show the backdrop through", (_name, child) => {
    const { container } = render(
      <SignInBackdrop stills={STILLS}>{child}</SignInBackdrop>,
    );
    const wrapper = backdropLayer(container).parentElement;
    const shell = container.querySelector('[data-slot="auth-shell"]');

    expect(shell?.parentElement).toBe(wrapper);
    expect(wrapper?.className).toContain(
      "*:data-[slot=auth-shell]:bg-transparent",
    );
  });

  it("never asks for a GPU while reduced motion is requested", async () => {
    prefersReducedMotion = true;
    const { container } = renderBackdrop();
    await flush();

    expect(fake.gpu.requestAdapter).not.toHaveBeenCalled();
    expect(backdropLayer(container).dataset.state).toBe("still");
  });

  it("starts once reduced motion is switched off", async () => {
    prefersReducedMotion = true;
    renderBackdrop();
    await flush();

    setReducedMotion(false);

    await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());
    expect(fake.gpu.requestAdapter).toHaveBeenCalledTimes(1);
  });

  it("keeps the still when the browser has no WebGPU", async () => {
    Reflect.deleteProperty(navigator, "gpu");
    const { container } = renderBackdrop();

    await vi.waitFor(() =>
      expect(backdropLayer(container).dataset.state).toBe("failed"),
    );
    expect(canvasClasses(container)).toContain("opacity-0");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  });

  it("keeps the still when no adapter is available", async () => {
    fake.gpu.requestAdapter.mockResolvedValue(null);
    const { container } = renderBackdrop();

    await vi.waitFor(() =>
      expect(backdropLayer(container).dataset.state).toBe("failed"),
    );
    expect(fake.adapter.requestDevice).not.toHaveBeenCalled();
  });

  it("keeps the still when the device cannot be created", async () => {
    fake.adapter.requestDevice.mockRejectedValue(new Error("no device"));
    const { container } = renderBackdrop();

    await vi.waitFor(() =>
      expect(backdropLayer(container).dataset.state).toBe("failed"),
    );
  });

  it("keeps the still and releases the device when the pipeline fails", async () => {
    fake.device.createRenderPipelineAsync.mockRejectedValue(
      new Error("invalid shader"),
    );
    const { container } = renderBackdrop();

    await vi.waitFor(() =>
      expect(backdropLayer(container).dataset.state).toBe("failed"),
    );
    expect(fake.device.destroy).toHaveBeenCalled();
    expect(fake.context.configure).not.toHaveBeenCalled();
  });

  it("keeps the still without asking for a GPU when the page colour is unreadable", async () => {
    layerBackground = "";
    const { container } = renderBackdrop();

    await vi.waitFor(() =>
      expect(backdropLayer(container).dataset.state).toBe("failed"),
    );
    expect(fake.gpu.requestAdapter).not.toHaveBeenCalled();
  });

  it("blends the field into the resolved page colour in the light theme", async () => {
    await renderRevealedBackdrop();
    const data = fake.lastUniforms();

    expect(data[3]).toBe(1);
    const muted = [242, 243, 245].map((channel) => channel / 255);
    for (const [index, channel] of muted.entries()) {
      expect(data[4 + index]).toBeCloseTo(channel, 5);
      expect(data[8 + index]).toBeCloseTo(channel, 5);
    }
  });

  it("follows a dark document theme", async () => {
    document.documentElement.classList.add("dark");
    await renderRevealedBackdrop();

    expect(fake.lastUniforms()[3]).toBe(0);
  });

  it("reveals the canvas only after the first frame is read back", async () => {
    const readBack = deferred<undefined>();
    fake.readback.held = readBack;
    const { container } = renderBackdrop();
    await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());

    runFrames(1);
    await flush();

    const [configuration] = fake.context.configure.mock.calls[0] as [
      { usage: number },
    ];
    const [, destination] = fake.encoder.copyTextureToBuffer.mock.calls[0] as [
      unknown,
      { bytesPerRow: number },
    ];
    expect(configuration.usage & 0x10).toBeTruthy();
    expect(configuration.usage & 0x01).toBeTruthy();
    expect(destination.bytesPerRow % 256).toBe(0);
    expect(fake.device.queue.submit.mock.invocationCallOrder[0]).toBeLessThan(
      fake.probe.mapAsync.mock.invocationCallOrder[0]!,
    );
    expect(fake.times()).toEqual([SIGN_IN_SHADER_STILL_TIME]);
    expect(backdropLayer(container).dataset.state).toBe("still");
    expect(canvasClasses(container)).toContain("opacity-0");

    await act(async () => readBack.resolve(undefined));

    expect(backdropLayer(container).dataset.state).toBe("animating");
    expect(canvasClasses(container)).toContain("opacity-100");
  });

  it("keeps the still when the first frame comes back blank", async () => {
    fake.readback.pixel = [0, 0, 0, 255];
    const { container } = renderBackdrop();
    await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());

    runFrames(1);
    await flush();

    expect(backdropLayer(container).dataset.state).toBe("failed");
    expect(fake.context.unconfigure).toHaveBeenCalled();
    expect(fake.device.destroy).toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("sways out and back to the still frame, then releases the GPU", async () => {
    const { container } = await renderRevealedBackdrop();
    runFrames(3);
    const early = fake.times().at(-1) ?? 0;

    const settleFrames = runUntilSettled(container);
    await flush();

    const times = fake.times();
    const furthest = Math.max(...times);
    expect(early - SIGN_IN_SHADER_STILL_TIME).toBeLessThan(
      SIGN_IN_SWAY_REACH * 0.01,
    );
    expect(furthest).toBeGreaterThan(
      SIGN_IN_SHADER_STILL_TIME + SIGN_IN_SWAY_REACH * 0.99,
    );
    expect(times.at(-1)).toBe(SIGN_IN_SHADER_STILL_TIME);
    expect(settleFrames * FRAME_MS).toBeLessThanOrEqual(
      SIGN_IN_MOTION_LIMIT_SECONDS * 1000,
    );
    expect(backdropLayer(container).dataset.state).toBe("settled");
    expect(canvasClasses(container)).toContain("opacity-0");
    expect(fake.context.unconfigure).toHaveBeenCalled();
    expect(fake.device.destroy).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it("never plays again after settling", async () => {
    const { container } = await renderRevealedBackdrop();
    runUntilSettled(container);

    setReducedMotion(true);
    setReducedMotion(false);
    await flush();

    expect(fake.gpu.requestAdapter).toHaveBeenCalledTimes(1);
    expect(backdropLayer(container).dataset.state).toBe("settled");
  });

  it("caps drawing at thirty frames a second on fast displays", async () => {
    await renderRevealedBackdrop();
    const before = fake.pass.draw.mock.calls.length;

    runFrames(60, 1000 / 120);

    expect(fake.pass.draw.mock.calls.length - before).toBeLessThanOrEqual(16);
  });

  it("moves only a short step after a stalled frame", async () => {
    await renderRevealedBackdrop();
    runFrames(1, 300);

    runFrames(3, 300);

    expect((fake.times().at(-1) ?? 0) - SIGN_IN_SHADER_STILL_TIME).toBeLessThan(
      SIGN_IN_SWAY_REACH * 0.1,
    );
  });

  it("still stops within five seconds when every frame stalls", async () => {
    const { container } = await renderRevealedBackdrop();

    const stalledFrames = runUntilSettled(container, 300);
    await flush();

    expect(stalledFrames * 300).toBeLessThanOrEqual(
      SIGN_IN_MOTION_LIMIT_SECONDS * 1000 + 600,
    );
    expect(backdropLayer(container).dataset.state).toBe("settled");
    expect(fake.device.destroy).toHaveBeenCalled();
  });

  it("returns to the still for good when the device is lost", async () => {
    const { container } = await renderRevealedBackdrop();

    fake.loseDevice();
    await flush();
    setReducedMotion(true);
    setReducedMotion(false);
    await flush();

    expect(backdropLayer(container).dataset.state).toBe("failed");
    expect(canvasClasses(container)).toContain("opacity-0");
    expect(frames.size).toBe(0);
    expect(fake.gpu.requestAdapter).toHaveBeenCalledTimes(1);
  });

  it("returns to the still when the GPU reports an error", async () => {
    const { container } = await renderRevealedBackdrop();

    const event = fake.raiseUncapturedError();
    await flush();

    expect(event.preventDefault).toHaveBeenCalled();
    expect(backdropLayer(container).dataset.state).toBe("failed");
    expect(fake.device.destroy).toHaveBeenCalled();
  });

  it("stops drawing and holds its place while the tab is hidden", async () => {
    await renderRevealedBackdrop();
    runFrames(10);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const timeWhenHidden = fake.times().at(-1);

    expect(frames.size).toBe(0);
    clock += 60_000;

    hidden.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    runFrames(1);

    expect(fake.times().at(-1)).toBe(timeWhenHidden);
    expect(frames.size).toBe(1);
  });

  it("drops straight to the still and releases the GPU if reduced motion is switched on mid-sway", async () => {
    const { container } = await renderRevealedBackdrop();
    runFrames(20);

    setReducedMotion(true);
    await flush();
    setReducedMotion(false);
    await flush();

    expect(backdropLayer(container).dataset.state).toBe("still");
    expect(canvasClasses(container)).toContain("opacity-0");
    expect(fake.device.destroy).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    expect(fake.gpu.requestAdapter).toHaveBeenCalledTimes(1);
  });

  it("asks for no device when unmounted while waiting for an adapter", async () => {
    const adapterRequest = deferred<typeof fake.adapter | null>();
    fake.gpu.requestAdapter.mockReturnValue(adapterRequest.promise);
    const { unmount } = renderBackdrop();
    await vi.waitFor(() => expect(fake.gpu.requestAdapter).toHaveBeenCalled());

    unmount();
    adapterRequest.resolve(fake.adapter);
    await flush();

    expect(fake.adapter.requestDevice).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("releases the device when unmounted while the pipeline builds", async () => {
    const pipeline = deferred<{ getBindGroupLayout: () => object }>();
    fake.device.createRenderPipelineAsync.mockReturnValue(pipeline.promise);
    const { unmount } = renderBackdrop();
    await vi.waitFor(() =>
      expect(fake.device.createRenderPipelineAsync).toHaveBeenCalled(),
    );

    unmount();
    pipeline.resolve({ getBindGroupLayout: () => ({}) });
    await flush();

    expect(fake.device.destroy).toHaveBeenCalledTimes(1);
    expect(fake.context.configure).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("reveals nothing when unmounted while the first frame is read back", async () => {
    fake.readback.held = deferred<undefined>();
    const onRender = vi.fn();
    const { container, unmount } = render(
      <Profiler id="backdrop" onRender={onRender}>
        <SignInBackdrop stills={STILLS}>
          <main data-slot="auth-shell" />
        </SignInBackdrop>
      </Profiler>,
    );
    await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());
    runFrames(1);
    const layer = backdropLayer(container);

    unmount();
    await flush();

    expect(layer.dataset.state).toBe("still");
    expect(fake.device.destroy).toHaveBeenCalledTimes(1);
    expect(fake.context.unconfigure).toHaveBeenCalledTimes(1);
  });

  it("creates one device and one frame loop under StrictMode", async () => {
    const { container } = render(
      <StrictMode>
        <SignInBackdrop stills={STILLS}>
          <main data-slot="auth-shell" />
        </SignInBackdrop>
      </StrictMode>,
    );
    await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());
    runFrames(1);
    await flush();
    runFrames(5);

    expect(backdropLayer(container).dataset.state).toBe("animating");
    expect(fake.gpu.requestAdapter).toHaveBeenCalledTimes(1);
    expect(fake.adapter.requestDevice).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(1);
  });

  it("does not re-render React on every frame", async () => {
    const onRender = vi.fn();
    render(
      <Profiler id="backdrop" onRender={onRender}>
        <SignInBackdrop stills={STILLS}>
          <main data-slot="auth-shell" />
        </SignInBackdrop>
      </Profiler>,
    );
    await vi.waitFor(() => expect(fake.context.configure).toHaveBeenCalled());
    runFrames(1);
    await flush();
    const commits = onRender.mock.calls.length;

    runFrames(60);

    expect(fake.pass.draw.mock.calls.length).toBeGreaterThan(30);
    expect(onRender).toHaveBeenCalledTimes(commits);
  });

  it("releases every resource when the screen unmounts", async () => {
    const { unmount } = await renderRevealedBackdrop();

    unmount();

    expect(frames.size).toBe(0);
    expect(fake.context.unconfigure).toHaveBeenCalled();
    expect(fake.device.destroy).toHaveBeenCalled();
    expect(resizeDisconnect).toHaveBeenCalled();
    expect(motionListeners.size).toBe(0);
  });
});
