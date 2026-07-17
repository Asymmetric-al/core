"use client";

import { getQueryClient } from "@asym/database/providers";
import { createBrowserClient } from "@asym/database/supabase";

import {
  signOutOnServer as defaultSignOutOnServer,
  type ServerSignOutResult,
} from "./client-signout";

import type { Profile } from "@asym/database/types";
import type { Session, User } from "@supabase/supabase-js";

const DEFAULT_SIGN_OUT_ERROR = "Unable to sign out. Please try again.";
const DEFAULT_SIGN_OUT_REDIRECT = "/login";

export type ClientSessionSupabase = ReturnType<typeof createBrowserClient>;

export interface ClientAuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export interface SubscribeToClientAuthStateOptions {
  supabase?: ClientSessionSupabase;
  includeProfile?: boolean;
  logger?: Pick<Console, "warn">;
}

export interface SignOutClientSessionOptions {
  createClient?: () => ClientSessionSupabase;
  logger?: Pick<Console, "warn">;
  notify?: (message: string) => void;
  redirect?: (href: string) => void;
  redirectTo?: string;
  signOutOnServer?: () => Promise<ServerSignOutResult>;
}

export type SignOutClientSessionResult =
  | { ok: true; redirected: true }
  | { ok: false; message: string; redirected: false };

let sharedBrowserClient: ClientSessionSupabase | null = null;
let queryCacheUserId: string | null | undefined;

export function getClientSessionSupabase() {
  sharedBrowserClient ??= createBrowserClient();
  return sharedBrowserClient;
}

function createSignedOutState(): ClientAuthState {
  return { user: null, profile: null, loading: false };
}

function clearClientQueryCache(logger: Pick<Console, "warn">) {
  try {
    getQueryClient().clear();
  } catch (error) {
    logger.warn("[auth] query cache cleanup failed", error);
  }
}

function isolateQueryCacheForUser(
  user: User | null,
  logger: Pick<Console, "warn">,
) {
  const nextUserId = user?.id ?? null;
  const previousUserId = queryCacheUserId;
  queryCacheUserId = nextUserId;

  const signedOutFromKnownOrUnknownUser =
    nextUserId === null && previousUserId !== null;
  const switchedAuthenticatedUser =
    previousUserId !== undefined &&
    previousUserId !== null &&
    nextUserId !== null &&
    previousUserId !== nextUserId;

  if (signedOutFromKnownOrUnknownUser || switchedAuthenticatedUser) {
    clearClientQueryCache(logger);
  }
}

async function loadProfileForUser(
  supabase: ClientSessionSupabase,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  return (profile ?? null) as Profile | null;
}

async function createAuthStateForUser(
  supabase: ClientSessionSupabase,
  user: User | null,
  includeProfile: boolean,
): Promise<ClientAuthState> {
  if (!user) {
    return createSignedOutState();
  }

  const profile = includeProfile
    ? await loadProfileForUser(supabase, user.id)
    : null;

  return { user, profile, loading: false };
}

export async function loadClientAuthState(
  supabase = getClientSessionSupabase(),
  options: { includeProfile?: boolean } = {},
): Promise<ClientAuthState> {
  const includeProfile = options.includeProfile ?? true;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return createSignedOutState();
  }

  return createAuthStateForUser(supabase, user, includeProfile);
}

export function subscribeToClientAuthState(
  onState: (state: ClientAuthState) => void,
  options: SubscribeToClientAuthStateOptions = {},
) {
  const supabase = options.supabase ?? getClientSessionSupabase();
  const includeProfile = options.includeProfile ?? true;
  const logger = options.logger ?? console;
  let active = true;
  // Async profile loads can resolve after newer auth events; only publish the latest request.
  let authStateLoadVersion = 0;

  function publishIfCurrent(nextVersion: number, state: ClientAuthState) {
    if (active && nextVersion === authStateLoadVersion) {
      isolateQueryCacheForUser(state.user, logger);
      onState(state);
    }
  }

  function publishSignedOut() {
    const nextVersion = ++authStateLoadVersion;
    publishIfCurrent(nextVersion, createSignedOutState());
  }

  function handleClientAuthLoadFailure(nextVersion: number, error: unknown) {
    logger.warn("[auth] client auth state load failed", error);
    publishIfCurrent(nextVersion, createSignedOutState());
  }

  function loadAndPublishForUser(user: User | null) {
    const nextVersion = ++authStateLoadVersion;

    void createAuthStateForUser(supabase, user, includeProfile)
      .then((state) => publishIfCurrent(nextVersion, state))
      .catch((error) => handleClientAuthLoadFailure(nextVersion, error));
  }

  const initialVersion = ++authStateLoadVersion;
  void loadClientAuthState(supabase, { includeProfile })
    .then((state) => publishIfCurrent(initialVersion, state))
    .catch((error) => handleClientAuthLoadFailure(initialVersion, error));

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event: string, session: Session | null) => {
      if (!session?.user) {
        publishSignedOut();
        return;
      }

      loadAndPublishForUser(session.user);
    },
  );

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}

function defaultNotify(message: string) {
  if (typeof window !== "undefined") {
    window.alert(message);
  }
}

function defaultRedirect(href: string) {
  if (typeof window !== "undefined") {
    window.location.href = href;
  }
}

export async function signOutClientSession(
  options: SignOutClientSessionOptions = {},
): Promise<SignOutClientSessionResult> {
  const signOutOnServer = options.signOutOnServer ?? defaultSignOutOnServer;
  const logger = options.logger ?? console;
  const serverSignOut = await signOutOnServer().catch((error) => {
    logger.warn("[auth] server signout request failed", error);
    return {
      ok: false,
      message: DEFAULT_SIGN_OUT_ERROR,
    };
  });

  if (!serverSignOut.ok) {
    const message = serverSignOut.message ?? DEFAULT_SIGN_OUT_ERROR;
    (options.notify ?? defaultNotify)(message);
    return { ok: false, message, redirected: false };
  }

  const createClient = options.createClient ?? getClientSessionSupabase;

  try {
    const { error } = await createClient().auth.signOut({ scope: "local" });
    if (error) {
      logger.warn("[auth] browser signout cleanup failed", error);
    }
  } catch (error) {
    logger.warn("[auth] browser signout cleanup failed", error);
  }

  queryCacheUserId = null;
  clearClientQueryCache(logger);

  const redirectTo = options.redirectTo ?? DEFAULT_SIGN_OUT_REDIRECT;
  (options.redirect ?? defaultRedirect)(redirectTo);
  return { ok: true, redirected: true };
}
