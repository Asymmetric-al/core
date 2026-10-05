export function usePathname() {
  return new URLSearchParams(location.search).get("workspace") === "missionary"
    ? new URLSearchParams(location.search).get("pathname") || "/"
    : "/donor-dashboard";
}

const router = {
  push(href: string) {
    document.dispatchEvent(
      new CustomEvent("fixture-workspace-navigation", { detail: href }),
    );
  },
};

export function useRouter() {
  return router;
}
