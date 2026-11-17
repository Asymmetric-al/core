export function signOutClientSession() {
  document.dispatchEvent(new Event("fixture-workspace-signout-start"));
  return new Promise<void>((resolve) => {
    document.addEventListener(
      "fixture-workspace-signout-complete",
      () => resolve(),
      { once: true },
    );
  });
}

// Retained drafts register their sign-out cleanup; the fixture never signs a
// session out through them, so the registration is inert.
export function registerClientSessionCleanup() {
  return () => {};
}
