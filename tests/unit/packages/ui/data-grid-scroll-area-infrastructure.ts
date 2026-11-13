import { act } from "@testing-library/react";
import { vi } from "vitest";

export function installDomInfrastructure() {
  const nativeMutationObserver = window.MutationObserver;
  const nativeRect = HTMLElement.prototype.getBoundingClientRect;
  const animationDescriptor = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "getAnimations",
  );
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  const frames = new Map<number, FrameRequestCallback>();
  const executedFrames: number[] = [];
  const resizeObservers: ControlledResizeObserver[] = [];
  const mutationObservers: TrackedMutationObserver[] = [];
  let nextFrame = 1;

  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });

  function rectangle(height: number, width = 320) {
    return DOMRect.fromRect({ x: 0, y: 0, height, width });
  }

  function viewport(element: HTMLElement) {
    return element.getAttribute("data-slot") === "scroll-area-viewport";
  }

  for (const [property, value] of Object.entries({
    clientHeight: 200,
    clientWidth: 320,
    offsetHeight: 200,
    offsetWidth: 320,
    scrollHeight: 600,
    scrollWidth: 320,
  })) {
    const original = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      property,
    );
    descriptors.set(property, original);
    Object.defineProperty(HTMLElement.prototype, property, {
      configurable: true,
      get(this: HTMLElement) {
        if (!this.isConnected) return original?.get?.call(this) ?? 0;
        if (viewport(this)) return value;
        if (this.dataset.slot === "scroll-area-content") {
          return property.endsWith("Height") ? 600 : 320;
        }
        return original?.get?.call(this) ?? 0;
      },
    });
  }

  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (!this.isConnected) return nativeRect.call(this);
      if (this.dataset.testHeight)
        return rectangle(Number(this.dataset.testHeight));
      if (viewport(this)) return rectangle(200);
      if (this.dataset.slot === "scroll-area-content") return rectangle(600);
      return nativeRect.call(this);
    },
  );

  class ControlledResizeObserver implements ResizeObserver {
    readonly targets = new Set<Element>();
    readonly observed: Element[] = [];
    readonly unobserved: Element[] = [];
    disconnectCount = 0;
    deliveryCount = 0;

    constructor(readonly callback: ResizeObserverCallback) {
      resizeObservers.push(this);
    }

    observe(target: Element) {
      this.targets.add(target);
      this.observed.push(target);
    }

    unobserve(target: Element) {
      this.targets.delete(target);
      this.unobserved.push(target);
    }

    disconnect() {
      this.disconnectCount += 1;
      this.targets.clear();
    }

    deliver(target: Element) {
      if (!this.targets.has(target)) return false;
      const bounds = target.getBoundingClientRect();
      this.deliveryCount += 1;
      this.callback(
        [
          {
            target,
            contentRect: bounds,
            borderBoxSize: [
              { blockSize: bounds.height, inlineSize: bounds.width },
            ],
            contentBoxSize: [
              { blockSize: bounds.height, inlineSize: bounds.width },
            ],
            devicePixelContentBoxSize: [
              { blockSize: bounds.height, inlineSize: bounds.width },
            ],
          },
        ],
        this,
      );
      return true;
    }
  }

  class TrackedMutationObserver implements MutationObserver {
    readonly targets = new Map<Node, MutationObserverInit>();
    readonly delivered: MutationRecord[] = [];
    readonly native: MutationObserver;
    disconnectCount = 0;

    constructor(callback: MutationCallback) {
      this.native = new nativeMutationObserver((records) => {
        this.delivered.push(...records);
        callback(records, this);
      });
      mutationObservers.push(this);
    }

    observe(target: Node, options: MutationObserverInit) {
      this.native.observe(target, options);
      this.targets.set(target, options);
    }

    disconnect() {
      this.disconnectCount += 1;
      this.targets.clear();
      this.native.disconnect();
    }

    takeRecords() {
      return this.native.takeRecords();
    }
  }

  vi.stubGlobal("ResizeObserver", ControlledResizeObserver);
  vi.stubGlobal("MutationObserver", TrackedMutationObserver);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const frame = nextFrame++;
    frames.set(frame, callback);
    return frame;
  });
  vi.stubGlobal("cancelAnimationFrame", (frame: number) =>
    frames.delete(frame),
  );

  const addedListeners = vi.spyOn(EventTarget.prototype, "addEventListener");
  const removedListeners = vi.spyOn(
    EventTarget.prototype,
    "removeEventListener",
  );

  async function settle() {
    for (let turn = 0; turn < 12; turn += 1) {
      await act(async () => {
        await Promise.resolve();
      });
      if (frames.size === 0) return;
      const batch = [...frames];
      await act(async () => {
        for (const [frame, callback] of batch) {
          if (!frames.delete(frame)) continue;
          executedFrames.push(frame);
          callback(frame * 16);
        }
      });
    }
    throw new Error("Infrastructure did not settle within the 12-frame bound.");
  }

  function deliverResize(target: Element) {
    return resizeObservers.filter((observer) => observer.deliver(target))
      .length;
  }

  function audit() {
    return {
      resizeInstances: resizeObservers.length,
      resizeTargets: resizeObservers.reduce(
        (count, observer) => count + observer.targets.size,
        0,
      ),
      mutationInstances: mutationObservers.length,
      mutationTargets: mutationObservers.reduce(
        (count, observer) => count + observer.targets.size,
        0,
      ),
      pendingFrames: frames.size,
      executedFrames: executedFrames.length,
    };
  }

  function restore() {
    for (const observer of resizeObservers) observer.disconnect();
    for (const observer of mutationObservers) observer.disconnect();
    frames.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (animationDescriptor)
      Object.defineProperty(
        Element.prototype,
        "getAnimations",
        animationDescriptor,
      );
    else Reflect.deleteProperty(Element.prototype, "getAnimations");
    for (const [property, descriptor] of descriptors) {
      if (descriptor)
        Object.defineProperty(HTMLElement.prototype, property, descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, property);
    }
  }

  return {
    frames,
    resizeObservers,
    mutationObservers,
    addedListeners,
    removedListeners,
    settle,
    deliverResize,
    audit,
    restore,
  };
}

export type DomInfrastructure = ReturnType<typeof installDomInfrastructure>;
