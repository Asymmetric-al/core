"use client";

import { fetchResult, readErrorMessage } from "@asym/lib/http/fetch-result";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

import { hasProfileChanges } from "./profile-dirty-state";
import {
  asObject,
  asString,
  BIO_MAX_WORDS,
  BIO_MIN_WORDS,
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
  copiedLink: boolean;
  validationErrors: ValidationErrors;
};

type ProfilePageUiAction =
  | { type: "SET_IS_SAVING"; payload: boolean }
  | {
      type: "SET_PREVIEW_MODE";
      payload: PreviewMode | ((prev: PreviewMode) => PreviewMode);
    }
  | { type: "SET_SAVE_SUCCESS"; payload: boolean }
  | { type: "SET_COPIED_LINK"; payload: boolean }
  | {
      type: "SET_VALIDATION_ERRORS";
      payload:
        | ValidationErrors
        | ((prev: ValidationErrors) => ValidationErrors);
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
    case "SET_COPIED_LINK":
      return { ...state, copiedLink: action.payload };
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
  copiedLink: false,
  validationErrors: {},
};

export type ProfilePageViewModel = {
  isLoading: boolean;
  fetchError: string | null;
  profile: ProfileData;
  validationErrors: ValidationErrors;
  bioWordCount: number;
  initials: string;
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  copiedLink: boolean;
  previewMode: PreviewMode;
  setPreviewMode: (value: React.SetStateAction<PreviewMode>) => void;
  updateProfile: (field: keyof ProfileData, value: string) => void;
  handleSave: () => Promise<void>;
  handleDiscard: () => void;
  handleCopyLink: () => Promise<void>;
};

export function useProfilePageView(): ProfilePageViewModel {
  const [uiState, dispatch] = useReducer(profilePageUiReducer, initialUiState);
  const { isSaving, previewMode, saveSuccess, copiedLink, validationErrors } =
    uiState;

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
  const setCopiedLink = useCallback((value: boolean) => {
    dispatch({ type: "SET_COPIED_LINK", payload: value });
  }, []);
  const setValidationErrors = useCallback(
    (value: React.SetStateAction<ValidationErrors>) => {
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: value });
    },
    [],
  );

  const queryClient = useQueryClient();
  const profileQuery = useQuery<ProfileData | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        // Leave as null; we'll surface a generic error.
      }

      const payload = asObject(data);

      if (!res.ok) {
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
  const originalProfile = profileQuery.data ?? initialProfile;
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const profile = draft ?? originalProfile;

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

  const isLoading = profileQuery.isPending;

  const validateProfile = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    if (profile.firstName && profile.firstName.length > 50) {
      errors.firstName = "First name is too long (max 50 characters)";
    }

    if (profile.lastName && profile.lastName.length > 50) {
      errors.lastName = "Last name is too long (max 50 characters)";
    }

    if (profile.phone && !/^[+\d\s()-]*$/.test(profile.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (
      profile.ministryFocus &&
      profile.ministryFocus.length > TAGLINE_MAX_LENGTH
    ) {
      errors.ministryFocus = `Tagline is too long (max ${TAGLINE_MAX_LENGTH} characters)`;
    }

    if (profile.bio) {
      const wordCount = countWords(profile.bio);
      if (wordCount < BIO_MIN_WORDS) {
        errors.bio = `Please write at least ${BIO_MIN_WORDS} words (currently ${wordCount})`;
      } else if (wordCount > BIO_MAX_WORDS) {
        errors.bio = `Please keep under ${BIO_MAX_WORDS} words (currently ${wordCount})`;
      }
    }

    if (profile.website && profile.website.length > 0) {
      if (
        !profile.website.startsWith("http://") &&
        !profile.website.startsWith("https://")
      ) {
        errors.website = "Website should start with http:// or https://";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profile, setValidationErrors]);

  const updateProfile = useCallback(
    (field: keyof ProfileData, value: string) => {
      setDraft((prev) => ({ ...(prev ?? originalProfile), [field]: value }));
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [originalProfile, validationErrors, setValidationErrors],
  );

  const handleSave = useCallback(async () => {
    if (!validateProfile()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    // fetchResult never throws, so no try/finally is needed here (the React
    // Compiler cannot lower those yet); HTTP error payloads arrive as data.
    const result = await fetchResult("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        tagline: profile.ministryFocus,
        location: profile.location,
        phone: profile.phone,
        coverUrl: profile.coverUrl,
        socialLinks: {
          facebook: profile.facebook,
          instagram: profile.instagram,
          twitter: profile.twitter,
          youtube: profile.youtube,
          website: profile.website,
        },
      }),
    });
    setIsSaving(false);

    if (result.ok) {
      queryClient.setQueryData<ProfileData | null>(["profile"], profile);
      setDraft(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      toast.success("Profile saved");
      return;
    }

    const errorMessage =
      (result.error.kind === "http" &&
        readErrorMessage(result.error.payload)) ||
      "Failed to save profile";
    console.error("Failed to save profile:", result.error);
    toast.error(errorMessage);
  }, [profile, queryClient, setIsSaving, setSaveSuccess, validateProfile]);

  const handleDiscard = useCallback(() => {
    setDraft(null);
    setValidationErrors({});
    toast.info("Changes discarded");
  }, [setValidationErrors]);

  const handleCopyLink = useCallback(async () => {
    const link = `${window.location.origin}/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Link copied!");
  }, [profile.firstName, profile.lastName, setCopiedLink]);

  return {
    isLoading,
    fetchError,
    profile,
    validationErrors,
    bioWordCount,
    initials,
    hasChanges,
    isSaving,
    saveSuccess,
    copiedLink,
    previewMode,
    setPreviewMode,
    updateProfile,
    handleSave,
    handleDiscard,
    handleCopyLink,
  };
}
