import { JSDOM } from "jsdom";

const GLOBAL_KEYS = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLButtonElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "SVGElement",
  "Element",
  "Node",
  "DocumentFragment",
  "NodeFilter",
  "Event",
  "CustomEvent",
  "EventTarget",
  "MouseEvent",
  "KeyboardEvent",
  "MutationObserver",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "ResizeObserver",
] as const;

type GlobalKey = (typeof GLOBAL_KEYS)[number];

export interface ContributionTestDom {
  descriptors: Map<GlobalKey, PropertyDescriptor | undefined>;
  dom: JSDOM;
}

function setGlobal(key: GlobalKey, value: unknown) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value,
  });
}

export function installContributionTestDom(): ContributionTestDom {
  const descriptors = new Map<GlobalKey, PropertyDescriptor | undefined>();
  for (const key of GLOBAL_KEYS) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  }

  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });

  Object.defineProperty(dom.window.HTMLElement.prototype, "attachEvent", {
    configurable: true,
    value() {},
  });
  Object.defineProperty(dom.window.HTMLElement.prototype, "detachEvent", {
    configurable: true,
    value() {},
  });

  setGlobal("window", dom.window);
  setGlobal("document", dom.window.document);
  setGlobal("HTMLElement", dom.window.HTMLElement);
  setGlobal("HTMLButtonElement", dom.window.HTMLButtonElement);
  setGlobal("HTMLInputElement", dom.window.HTMLInputElement);
  setGlobal("HTMLTextAreaElement", dom.window.HTMLTextAreaElement);
  setGlobal("SVGElement", dom.window.SVGElement);
  setGlobal("Element", dom.window.Element);
  setGlobal("Node", dom.window.Node);
  setGlobal("DocumentFragment", dom.window.DocumentFragment);
  setGlobal("NodeFilter", dom.window.NodeFilter);
  setGlobal("Event", dom.window.Event);
  setGlobal("CustomEvent", dom.window.CustomEvent);
  setGlobal("EventTarget", dom.window.EventTarget);
  setGlobal("MouseEvent", dom.window.MouseEvent);
  setGlobal("KeyboardEvent", dom.window.KeyboardEvent);
  setGlobal("MutationObserver", dom.window.MutationObserver);
  setGlobal("getComputedStyle", dom.window.getComputedStyle);
  setGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    dom.window.setTimeout(callback, 0),
  );
  setGlobal("cancelAnimationFrame", (id: number) => {
    dom.window.clearTimeout(id);
  });
  setGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  setGlobal("navigator", dom.window.navigator);

  Object.defineProperty(dom.window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }),
  });

  return { descriptors, dom };
}

export function restoreContributionTestDom(
  testDom: ContributionTestDom | undefined,
) {
  if (!testDom) {
    return;
  }

  testDom.dom.window.close();

  for (const key of GLOBAL_KEYS) {
    const descriptor = testDom.descriptors.get(key);
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, key);
    }
  }
}

export async function flushContributionTestDomEffects() {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}
