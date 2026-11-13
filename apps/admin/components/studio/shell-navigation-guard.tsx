"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

interface ShellNavigation {
  requestAction: (action: () => void) => void;
  registerDirty: (id: string, dirty: boolean) => void;
  setFullscreen: (element: HTMLElement | null) => void;
  fullscreen: boolean;
}
const ShellNavigationContext = createContext<ShellNavigation | null>(null);
const runAction = (action: () => void) => action();
const noop = () => {};
const unguarded: ShellNavigation = {
  requestAction: runAction,
  registerDirty: noop,
  setFullscreen: noop,
  fullscreen: false,
};
export function useShellNavigation() {
  return useContext(ShellNavigationContext) ?? unguarded;
}

/** The shared studio breadcrumb already receives the editor's saved/dirty state. */
export function useStudioDirtyState(dirty: boolean) {
  const id = useId();
  const { registerDirty } = useShellNavigation();
  useEffect(() => {
    registerDirty(id, dirty);
    return () => registerDirty(id, false);
  }, [dirty, id, registerDirty]);
}

/** Called by the editor owner with its actual fullscreen state and root. */
export function useStudioFullscreen(
  fullscreen: boolean,
  rootRef: RefObject<HTMLElement | null>,
) {
  const { setFullscreen } = useShellNavigation();
  useEffect(() => {
    if (!fullscreen || !rootRef.current) return;
    const previous = document.activeElement;
    const editor = rootRef.current;
    const previousTabIndex = editor.getAttribute("tabindex");
    editor.tabIndex = -1;
    setFullscreen(editor);
    editor.focus();
    return () => {
      setFullscreen(null);
      if (previousTabIndex === null) editor.removeAttribute("tabindex");
      else editor.setAttribute("tabindex", previousTabIndex);
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, [fullscreen, rootRef, setFullscreen]);
}

export function ShellNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dirtyEditors = useRef(new Set<string>());
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [fullscreenElement, setFullscreen] = useState<HTMLElement | null>(null);
  const registerDirty = useCallback((id: string, dirty: boolean) => {
    if (dirty) dirtyEditors.current.add(id);
    else dirtyEditors.current.delete(id);
  }, []);
  const requestAction = useCallback((action: () => void) => {
    if (dirtyEditors.current.size) setPending(() => action);
    else action();
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        !dirtyEditors.current.size ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const destination = new URL(anchor.href);
      if (
        destination.origin !== location.origin ||
        (destination.pathname === location.pathname &&
          destination.search === location.search)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      requestAction(() =>
        router.push(
          destination.pathname + destination.search + destination.hash,
        ),
      );
    };
    // Capture covers shell links rendered into sheets, flyouts and profile portals.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [requestAction, router]);

  useEffect(() => {
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    let currentIndex =
      typeof history.state?.coreShellIndex === "number"
        ? history.state.coreShellIndex
        : 0;
    let active = true;
    let restoring = false;
    let approved = false;
    let afterRestore: (() => void) | null = null;
    originalReplace.call(
      history,
      { ...history.state, coreShellIndex: currentIndex },
      "",
    );
    const pushState: History["pushState"] = function (data, unused, url) {
      if (!active) return originalPush.call(history, data, unused, url);
      originalPush.call(
        history,
        { ...data, coreShellIndex: ++currentIndex },
        unused,
        url,
      );
    };
    const replaceState: History["replaceState"] = function (data, unused, url) {
      if (!active) return originalReplace.call(history, data, unused, url);
      originalReplace.call(
        history,
        { ...data, coreShellIndex: currentIndex },
        unused,
        url,
      );
    };
    history.pushState = pushState;
    history.replaceState = replaceState;
    const onPopState = (event: PopStateEvent) => {
      const nextIndex: unknown = event.state?.coreShellIndex;
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        afterRestore?.();
        afterRestore = null;
        return;
      }
      if (typeof nextIndex !== "number") return;
      const delta = nextIndex - currentIndex;
      if (approved || !dirtyEditors.current.size || delta === 0) {
        approved = false;
        currentIndex = nextIndex;
        return;
      }
      event.stopImmediatePropagation();
      restoring = true;
      afterRestore = () =>
        requestAction(() => {
          approved = true;
          history.go(delta);
        });
      history.go(-delta);
    };
    window.addEventListener("popstate", onPopState, true);
    return () => {
      // Next may wrap these methods after this child effect has mounted.
      active = false;
      if (history.pushState === pushState) history.pushState = originalPush;
      if (history.replaceState === replaceState)
        history.replaceState = originalReplace;
      window.removeEventListener("popstate", onPopState, true);
    };
  }, [requestAction]);

  const context = useMemo(
    () => ({
      requestAction,
      registerDirty,
      setFullscreen,
      fullscreen: fullscreenElement !== null,
    }),
    [requestAction, registerDirty, fullscreenElement],
  );
  return (
    <ShellNavigationContext.Provider value={context}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your studio changes have not been saved. Discard them to leave
              this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPending(null)}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = pending;
                setPending(null);
                dirtyEditors.current.clear();
                action?.();
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ShellNavigationContext.Provider>
  );
}
