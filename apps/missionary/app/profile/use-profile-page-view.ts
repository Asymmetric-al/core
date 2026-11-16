"use client";

import { fetchResult, readErrorMessage } from "@asym/lib/http/fetch-result";
import { useRetainedDraft } from "@asym/ui/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { toast } from "sonner";

import { hasProfileChanges } from "./profile-dirty-state";
import {
  asObject,
  asString,
  BIO_MAX_WORDS,
  countWords,
  initialProfile,
  mapApiProfileToProfileData,
  TAGLINE_MAX_LENGTH,
} from "./profile-model";

import type {
  PreviewMode,
  ProfileData,
  ValidationErrors,
} from "./profile-model";
import type * as React from "react";

type ProfilePageUiState = {
  isSaving: boolean;
  previewMode: PreviewMode;
  saveSuccess: boolean;
  validationErrors: ValidationErrors;
};

type ProfilePageUiAction =
  | { type: "SET_IS_SAVING"; payload: boolean }
  | {
      type: "SET_PREVIEW_MODE";
      payload: PreviewMode | ((prev: PreviewMode) => PreviewMode);
    }
  | { type: "SET_SAVE_SUCCESS"; payload: boolean }
  | {
      type: "SET_VALIDATION_ERRORS";
      payload:
        ValidationErrors | ((prev: ValidationErrors) => ValidationErrors);
    };

function profilePageUiReducer(
  state: ProfilePageUiState,
  action: ProfilePageUiAction,
): ProfilePageUiState {
  switch (action.type) {
    case "SET_IS_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_PREVIEW_MODE": {
      const next =
        typeof action.payload === "function"
          ? action.payload(state.previewMode)
          : action.payload;
      return { ...state, previewMode: next };
    }
    case "SET_SAVE_SUCCESS":
      return { ...state, saveSuccess: action.payload };
    case "SET_VALIDATION_ERRORS": {
      const next =
        typeof action.payload === "function"
          ? action.payload(state.validationErrors)
          : action.payload;
      return { ...state, validationErrors: next };
    }
    default:
      return state;
  }
}

const initialUiState: ProfilePageUiState = {
  isSaving: false,
  previewMode: "mobile",
  saveSuccess: false,
  validationErrors: {},
};

type ProfilePageViewModel = {
  isLoading: boolean;
  fetchError: string | null;
  profile: ProfileData;
  validationErrors: ValidationErrors;
  bioWordCount: number;
  initials: string;
  hasChanges: boolean;
  canRead: boolean;
  canWrite: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  previewMode: PreviewMode;
  setPreviewMode: (value: React.SetStateAction<PreviewMode>) => void;
  updateProfile: (field: keyof ProfileData, value: string) => void;
  handleSave: () => Promise<void>;
  handleDiscard: () => void;
};

export function useProfilePageView(): ProfilePageViewModel {
  const [uiState, dispatch] = useReducer(profilePageUiReducer, initialUiState);
  const { isSaving, previewMode, saveSuccess, validationErrors } = uiState;

  const setIsSaving = useCallback((value: boolean) => {
    dispatch({ type: "SET_IS_SAVING", payload: value });
  }, []);
  const setPreviewMode = useCallback(
    (value: React.SetStateAction<PreviewMode>) => {
      dispatch({ type: "SET_PREVIEW_MODE", payload: value });
    },
    [],
  );
  const setSaveSuccess = useCallback((value: boolean) => {
    dispatch({ type: "SET_SAVE_SUCCESS", payload: value });
  }, []);
  const setValidationErrors = useCallback(
    (value: React.SetStateAction<ValidationErrors>) => {
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: value });
    },
    [],
  );

  const queryClient = useQueryClient();
  const {
    value: draft,
    read: readDraft,
    update: retainDraft,
    discard: discardDraft,
    beginSave,
    finishSave,
    canRead,
    canWrite,
    isCurrent,
    isSaving: retainedSaving,
    revokeRead,
    revokeWrite,
  } = useRetainedDraft<Partial<Omit<ProfileData, "email">>>(
    "missionary-profile",
  );
  const profileQuery = useQuery<ProfileData | null>({
    queryKey: ["profile"],
    enabled: canRead,
    queryFn: async () => {
      const res = await fetch("/api/profile");
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        // Leave as null; we'll surface a generic error.
      }

      const payload = asObject(data);
      if (!isCurrent()) return null;

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) revokeRead();
        const message = asString(payload?.error);
        throw new Error(message || "Failed to load profile");
      }

      return payload && "profile" in payload
        ? mapApiProfileToProfileData(payload.profile)
        : null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // The query cache is the saved baseline; `draft` holds only the user's
  // unsaved edits, so nothing has to be copied into state when data arrives.
  const originalProfile =
    (canRead ? profileQuery.data : null) ?? initialProfile;
  const profile = useMemo(
    () => ({ ...originalProfile, ...draft }),
    [originalProfile, draft],
  );

  const initials =
    (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");
  const bioWordCount = countWords(profile.bio);
  const hasChanges = hasProfileChanges(profile, originalProfile);

  const fetchError = profileQuery.error
    ? profileQuery.error instanceof Error
      ? profileQuery.error.message
      : "Failed to load profile"
    : null;

  useEffect(() => {
    if (fetchError) toast.error(fetchError);
  }, [fetchError]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timeout = setTimeout(() => setSaveSuccess(false), 2000);
    return () => clearTimeout(timeout);
  }, [saveSuccess, setSaveSuccess]);

  const isLoading = profileQuery.isPending;

  // The photo uploader calls `updateProfile(field, url); handleSave()` in one
  // event. Keep a live snapshot so save reads that pending edit instead of
  // the previous render's `profile` closure.
  const originalProfileRef = useRef(originalProfile);
  const profileRef = useRef(profile);
  const saveRequestIdRef = useRef(0);
  const saveAbortRef = useRef<AbortController | null>(null);
  const saveInFlightRef = useRef(false);
  const saveQueuedRef = useRef(false);
  const saveCancelledRef = useRef(false);
  useLayoutEffect(() => {
    originalProfileRef.current = originalProfile;
    profileRef.current = profile;
  }, [draft, originalProfile, profile]);

  const validateProfile = useCallback(
    (data: ProfileData): boolean => {
      const errors: ValidationErrors = {};

      if (data.firstName && data.firstName.length > 50) {
        errors.firstName = "First name is too long (max 50 characters)";
      }

      if (data.lastName && data.lastName.length > 50) {
        errors.lastName = "Last name is too long (max 50 characters)";
      }

      if (data.phone && !/^[+\d\s()-]*$/.test(data.phone)) {
        errors.phone = "Please enter a valid phone number";
      }

      if (
        data.ministryFocus &&
        data.ministryFocus.length > TAGLINE_MAX_LENGTH
      ) {
        errors.ministryFocus = `Tagline is too long (max ${TAGLINE_MAX_LENGTH} characters)`;
      }

      if (data.bio) {
        const wordCount = countWords(data.bio);
        if (wordCount > BIO_MAX_WORDS) {
          errors.bio = `Please keep under ${BIO_MAX_WORDS} words (currently ${wordCount})`;
        }
      }

      if (data.website && data.website.length > 0) {
        if (
          !data.website.startsWith("http://") &&
          !data.website.startsWith("https://")
        ) {
          errors.website = "Website should start with http:// or https://";
        }
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [setValidationErrors],
  );

  const updateProfile = useCallback(
    (field: keyof ProfileData, value: string) => {
      if (field === "email" || !canWrite) return;
      const next = { ...readDraft(), [field]: value };
      profileRef.current = { ...originalProfileRef.current, ...next };
      retainDraft(next, {
        dirty: hasProfileChanges(
          profileRef.current,
          originalProfileRef.current,
        ),
      });
      setSaveSuccess(false);
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [
      canWrite,
      readDraft,
      retainDraft,
      setSaveSuccess,
      validationErrors,
      setValidationErrors,
    ],
  );

  const handleSave = useCallback(
    async function persistProfile() {
      if (
        !canWrite ||
        !isCurrent() ||
        (retainedSaving && !saveInFlightRef.current)
      )
        return;
      // Photo widgets call handleSave on upload without checking isSaving, so a
      // second save can start while the first PATCH is still in flight. The API
      // applies every truthy avatar/cover URL, so the slower first request can
      // write the previous photo after the UI has already toasted success.
      if (saveInFlightRef.current) {
        saveQueuedRef.current = true;
        return;
      }

      const initialSnapshot = profileRef.current;
      if (!validateProfile(initialSnapshot)) {
        toast.error("Please fix the errors before saving");
        return;
      }

      saveInFlightRef.current = true;
      saveCancelledRef.current = false;
      setIsSaving(true);

      let savedLatestRevision = false;
      let saveFailed = false;

      while (true) {
        saveQueuedRef.current = false;
        if (!isCurrent()) break;
        const save = beginSave();
        if (!save) break;
        // The provider revision survives route eviction; the old mount's ref
        // can lag behind edits made by the remounted editor.
        const snapshot = { ...profileRef.current, ...save.value };
        if (!validateProfile(snapshot)) {
          toast.error("Please fix the errors before saving");
          finishSave(save, false);
          saveFailed = true;
          break;
        }

        const controller = new AbortController();
        saveAbortRef.current = controller;
        const requestId = ++saveRequestIdRef.current;
        // fetchResult never throws, so no try/finally is needed here (the React
        // Compiler cannot lower those yet); HTTP error payloads arrive as data.
        const result = await fetchResult("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            firstName: snapshot.firstName,
            lastName: snapshot.lastName,
            bio: snapshot.bio,
            tagline: snapshot.ministryFocus,
            location: snapshot.location,
            phone: snapshot.phone,
            ...(snapshot.coverUrl ? { coverUrl: snapshot.coverUrl } : {}),
            ...(snapshot.avatarUrl ? { avatarUrl: snapshot.avatarUrl } : {}),
            socialLinks: {
              facebook: snapshot.facebook,
              instagram: snapshot.instagram,
              twitter: snapshot.twitter,
              youtube: snapshot.youtube,
              website: snapshot.website,
            },
          }),
        });

        // Discard (and any other generation bump) always ends this drain.
        // Continuing here would flush a save the user just cancelled.
        if (requestId !== saveRequestIdRef.current || !save.isCurrent()) {
          finishSave(save, false);
          break;
        }

        if (!result.ok) {
          finishSave(save, false);
          if (result.error.kind === "http" && result.error.status === 401)
            revokeRead();
          if (result.error.kind === "http" && result.error.status === 403)
            revokeWrite();
          if (
            result.error.kind === "network" &&
            result.error.cause instanceof Error &&
            result.error.cause.name === "AbortError"
          ) {
            break;
          }
          // Photo auto-save queues a follow-up instead of overlapping PATCHes.
          // If this attempt failed, still flush the latest snapshot so a later
          // cover/avatar upload is not dropped with the failed request.
          if (saveQueuedRef.current) {
            continue;
          }
          const errorMessage =
            (result.error.kind === "http" &&
              readErrorMessage(result.error.payload)) ||
            "Failed to save profile";
          console.error("Failed to save profile:", result.error);
          toast.error(errorMessage);
          saveFailed = true;
          break;
        }

        queryClient.setQueryData<ProfileData | null>(["profile"], snapshot);
        originalProfileRef.current = snapshot;
        savedLatestRevision = finishSave(save, true);

        if (!saveQueuedRef.current) {
          break;
        }
      }

      const restartQueued = saveCancelledRef.current && saveQueuedRef.current;
      saveInFlightRef.current = false;
      saveAbortRef.current = null;
      setIsSaving(false);

      if (savedLatestRevision && !saveFailed && !saveCancelledRef.current) {
        setSaveSuccess(true);
        toast.success("Profile saved");
      }

      if (restartQueued) {
        saveCancelledRef.current = false;
        void persistProfile();
      }
    },
    [
      beginSave,
      canWrite,
      finishSave,
      isCurrent,
      queryClient,
      retainedSaving,
      revokeRead,
      revokeWrite,
      setIsSaving,
      setSaveSuccess,
      validateProfile,
    ],
  );

  const handleDiscard = useCallback(() => {
    saveCancelledRef.current = true;
    saveQueuedRef.current = false;
    // Bump generation before abort so the in-flight PATCH cannot continue
    // this drain even if a later handleSave queues work during the abort.
    saveRequestIdRef.current += 1;
    saveAbortRef.current?.abort();
    saveAbortRef.current = null;
    setIsSaving(false);
    profileRef.current = originalProfileRef.current;
    discardDraft();
    setValidationErrors({});
    toast.info("Changes discarded");
  }, [discardDraft, setIsSaving, setValidationErrors]);

  return {
    isLoading,
    fetchError,
    profile,
    validationErrors,
    bioWordCount,
    initials,
    hasChanges,
    canRead,
    canWrite,
    isSaving: isSaving || retainedSaving,
    saveSuccess,
    previewMode,
    setPreviewMode,
    updateProfile,
    handleSave,
    handleDiscard,
  };
}
