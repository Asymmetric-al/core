export function matchesListedRoute(pathname: string, route: string) {
  if (route === "/") {
    return pathname === "/";
  }
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function matchesProtectedPrefix(pathname: string, prefix: string) {
  if (prefix === "/") {
    return pathname.startsWith("/");
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isListedRouteMatch(
  pathname: string,
  routes: string[],
  matcher: (pathname: string, route: string) => boolean,
) {
  return routes.some((route) => matcher(pathname, route));
}
