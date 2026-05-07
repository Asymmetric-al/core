"use client";

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

export function getClientSessionSupabase() {
  sharedBrowserClient ??= createBrowserClient();
  return sharedBrowserClient;
}

function createSignedOutState(): ClientAuthState {
  return { user: null, profile: null, loading: false };
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

function isSupabaseClient(value: unknown): value is ClientSessionSupabase {
  return Boolean(
    value && typeof value === "object" && "auth" in value && "from" in value,
  );
}

function resolveSubscribeOptions(
  optionsOrSupabase?: ClientSessionSupabase | SubscribeToClientAuthStateOptions,
) {
  if (isSupabaseClient(optionsOrSupabase)) {
    return { supabase: optionsOrSupabase };
  }

  return optionsOrSupabase ?? {};
}

export function subscribeToClientAuthState(
  onState: (state: ClientAuthState) => void,
  optionsOrSupabase?: ClientSessionSupabase | SubscribeToClientAuthStateOptions,
) {
  const options = resolveSubscribeOptions(optionsOrSupabase);
  const supabase = options.supabase ?? getClientSessionSupabase();
  const includeProfile = options.includeProfile ?? true;
  const logger = options.logger ?? console;
  let active = true;
  let version = 0;

  function publishIfCurrent(nextVersion: number, state: ClientAuthState) {
    if (active && nextVersion === version) {
      onState(state);
    }
  }

  function publishSignedOut() {
    const nextVersion = ++version;
    publishIfCurrent(nextVersion, createSignedOutState());
  }

  function loadAndPublishForUser(user: User | null) {
    const nextVersion = ++version;

    void createAuthStateForUser(supabase, user, includeProfile)
      .then((state) => publishIfCurrent(nextVersion, state))
      .catch((error) => {
        logger.warn("[auth] client auth state load failed", error);
        publishIfCurrent(nextVersion, createSignedOutState());
      });
  }

  const initialVersion = ++version;
  void loadClientAuthState(supabase, { includeProfile })
    .then((state) => publishIfCurrent(initialVersion, state))
    .catch((error) => {
      logger.warn("[auth] client auth state load failed", error);
      publishIfCurrent(initialVersion, createSignedOutState());
    });

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

  const redirectTo = options.redirectTo ?? DEFAULT_SIGN_OUT_REDIRECT;
  (options.redirect ?? defaultRedirect)(redirectTo);
  return { ok: true, redirected: true };
}
