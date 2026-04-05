export interface ProtectedAppAuthSnapshot {
  userId: string | null;
  isAuthenticated: boolean;
}

export function getProtectedAppRedirectPath(
  auth: ProtectedAppAuthSnapshot,
  loginPath: string,
): string | null {
  if (auth.userId == null) {
    return loginPath;
  }

  if (!auth.isAuthenticated) {
    return "/no-access";
  }

  return null;
}
