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
