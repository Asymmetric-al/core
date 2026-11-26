// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignInBackdrop } from "../../../../packages/ui/components/auth/SignInBackdrop";

const STILLS = { narrow: "/still-narrow.webp", wide: "/still-wide.webp" };

function createFakeWebGl(pixel: readonly number[] = [240, 241, 250, 255]) {
  return {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    LINK_STATUS: 3,
    COMPILE_STATUS: 4,
    RGBA: 5,
    UNSIGNED_BYTE: 6,
    TRIANGLES: 7,
    NO_ERROR: 0,
    isContextLost: vi.fn(() => false),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getExtension: vi.fn(() => null),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ""),
    getProgramInfoLog: vi.fn(() => ""),
    getUniformLocation: vi.fn((_program: unknown, name: string) => ({ name })),
    deleteShader: vi.fn(),
    deleteProgram: vi.fn(),
    viewport: vi.fn(),
    useProgram: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform3fv: vi.fn(),
    drawArrays: vi.fn(),
    readPixels: vi.fn(
      (
        _x: number,
        _y: number,
        _width: number,
        _height: number,
        _format: number,
        _type: number,
        target: Uint8Array,
      ) => target.set(pixel),
    ),
    getError: vi.fn(() => 0),
  };
}

type FakeWebGl = ReturnType<typeof createFakeWebGl>;

const frames = new Map<number, FrameRequestCallback>();
const motionListeners = new Set<() => void>();
const resizeDisconnect = vi.fn();
let nextFrameId = 1;
let clock = 0;
let prefersReducedMotion = false;
let webgl: FakeWebGl | null = null;
let getContext: ReturnType<typeof vi.spyOn>;

function webglRequests() {
  return getContext.mock.calls.filter(([type]) => type === "webgl2").length;
}

function runFrames(count: number) {
  for (let index = 0; index < count; index += 1) {
    clock += 1000 / 30;
    const pending = [...frames.values()];
    frames.clear();
    act(() => {
      for (const callback of pending) callback(clock);
    });
  }
}

function setReducedMotion(next: boolean) {
  prefersReducedMotion = next;
  act(() => {
    for (const listener of motionListeners) listener();
  });
}

function backdropLayer(container: HTMLElement) {
  const layer = container.querySelector<HTMLElement>(
    '[data-slot="sign-in-backdrop"]',
  );
  if (!layer) throw new Error("The backdrop layer is missing.");
  return layer;
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

async function renderReadyBackdrop() {
  const view = renderBackdrop();
  await vi.waitFor(() => expect(webgl?.createProgram).toHaveBeenCalled());
  runFrames(1);
  return view;
}

beforeEach(() => {
  frames.clear();
  motionListeners.clear();
  nextFrameId = 1;
  clock = 0;
  prefersReducedMotion = false;
  webgl = createFakeWebGl();
  window.localStorage.clear();

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
  getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(((type: string) => {
      if (type === "2d") {
        return {
          fillStyle: "",
          fillRect: vi.fn(),
          getImageData: () => ({
            data: new Uint8ClampedArray([243, 244, 246, 255]),
          }),
        };
      }
      return type === "webgl2" ? webgl : null;
    }) as unknown as HTMLCanvasElement["getContext"]);
});

afterEach(() => {
  cleanup();
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
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /background animation/ }),
    ).toBeNull();
  });

  it("never starts WebGL while reduced motion is requested", async () => {
    prefersReducedMotion = true;
    const { container } = renderBackdrop();
    await act(async () => {});

    expect(webglRequests()).toBe(0);
    expect(backdropLayer(container).dataset.state).toBe("still");
    expect(
      screen.queryByRole("button", { name: /background animation/ }),
    ).toBeNull();
  });

  it("reveals the canvas only after a valid first frame", async () => {
    const { container } = renderBackdrop();
    await vi.waitFor(() => expect(webgl?.createProgram).toHaveBeenCalled());
    expect(container.querySelector("canvas")?.className).toContain("opacity-0");

    runFrames(1);

    expect(webgl?.drawArrays).toHaveBeenCalledTimes(1);
    expect(backdropLayer(container).dataset.state).toBe("playing");
    expect(container.querySelector("canvas")?.className).toContain(
      "opacity-100",
    );
  });

  it("advances shader time by 0.4375 seconds per second of playback", async () => {
    await renderReadyBackdrop();

    expect(webgl?.uniform1f).toHaveBeenCalledWith({ name: "iTime" }, 0);

    runFrames(30);

    expect(webgl?.uniform1f).toHaveBeenCalledWith(
      { name: "iTime" },
      expect.closeTo(0.4375, 6),
    );
  });

  it("keeps the still when WebGL2 is unavailable", async () => {
    webgl = null;
    const { container } = renderBackdrop();

    await vi.waitFor(() =>
      expect(backdropLayer(container).dataset.state).toBe("failed"),
    );
    expect(container.querySelector("canvas")?.className).toContain("opacity-0");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  });

  it("keeps the still when the shader fails to build", async () => {
    webgl?.getProgramParameter.mockReturnValue(false);
    webgl?.getShaderParameter.mockReturnValue(false);
    const { container } = renderBackdrop();
    await vi.waitFor(() => expect(webgl?.createProgram).toHaveBeenCalled());

    runFrames(1);

    expect(webgl?.drawArrays).not.toHaveBeenCalled();
    expect(backdropLayer(container).dataset.state).toBe("failed");
    expect(webgl?.deleteProgram).toHaveBeenCalled();
  });

  it("keeps the still when the first frame comes back empty", async () => {
    webgl = createFakeWebGl([0, 0, 0, 255]);
    const { container } = await renderReadyBackdrop();

    expect(backdropLayer(container).dataset.state).toBe("failed");
    expect(frames.size).toBe(0);
  });

  it("returns to the still for good when the context is lost", async () => {
    const { container } = await renderReadyBackdrop();
    const canvas = container.querySelector("canvas");

    act(() => {
      canvas?.dispatchEvent(new Event("webglcontextlost"));
    });
    setReducedMotion(true);
    setReducedMotion(false);
    await act(async () => {});

    expect(backdropLayer(container).dataset.state).toBe("failed");
    expect(frames.size).toBe(0);
    expect(webglRequests()).toBe(1);
  });

  it("pauses and resumes the same renderer without a second loop", async () => {
    await renderReadyBackdrop();
    runFrames(3);
    const drawnBeforePause = webgl?.drawArrays.mock.calls.length ?? 0;

    fireEvent.click(
      screen.getByRole("button", { name: "Pause background animation" }),
    );
    runFrames(5);

    expect(webgl?.drawArrays).toHaveBeenCalledTimes(drawnBeforePause);
    expect(frames.size).toBe(0);
    expect(window.localStorage.getItem("asym:sign-in-backdrop:paused")).toBe(
      "true",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Play background animation" }),
    );
    runFrames(2);

    expect(webgl?.drawArrays.mock.calls.length).toBeGreaterThan(
      drawnBeforePause,
    );
    expect(frames.size).toBe(1);
    expect(webglRequests()).toBe(1);
    expect(webgl?.createProgram).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem("asym:sign-in-backdrop:paused")).toBe(
      null,
    );
  });

  it("starts paused when the visitor paused it before", async () => {
    window.localStorage.setItem("asym:sign-in-backdrop:paused", "true");
    const { container } = await renderReadyBackdrop();
    runFrames(3);

    expect(backdropLayer(container).dataset.state).toBe("paused");
    expect(webgl?.drawArrays).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Play background animation" }),
    ).toBeTruthy();
  });

  it("stops drawing while the tab is hidden", async () => {
    await renderReadyBackdrop();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(frames.size).toBe(0);

    hidden.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(frames.size).toBe(1);
  });

  it("drops the renderer when reduced motion turns on", async () => {
    const { container } = await renderReadyBackdrop();

    setReducedMotion(true);

    expect(backdropLayer(container).dataset.state).toBe("still");
    expect(frames.size).toBe(0);
    expect(webgl?.deleteProgram).toHaveBeenCalled();
  });

  it("releases the renderer when the screen unmounts", async () => {
    const { unmount } = await renderReadyBackdrop();

    unmount();

    expect(frames.size).toBe(0);
    expect(webgl?.deleteProgram).toHaveBeenCalled();
    expect(resizeDisconnect).toHaveBeenCalled();
    expect(motionListeners.size).toBe(0);
  });
});
