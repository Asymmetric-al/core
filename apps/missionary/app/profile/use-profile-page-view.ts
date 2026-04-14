"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
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

type ProfilePageUiState = {
  isSaving: boolean;
  previewMode: PreviewMode;
  saveSuccess: boolean;
  copiedLink: boolean;
  fetchError: string | null;
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
  | { type: "SET_FETCH_ERROR"; payload: string | null }
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
    case "SET_FETCH_ERROR":
      return { ...state, fetchError: action.payload };
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
  fetchError: null,
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
  const {
    isSaving,
    previewMode,
    saveSuccess,
    copiedLink,
    fetchError,
    validationErrors,
  } = uiState;

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
  const setFetchError = useCallback((value: string | null) => {
    dispatch({ type: "SET_FETCH_ERROR", payload: value });
  }, []);
  const setValidationErrors = useCallback(
    (value: React.SetStateAction<ValidationErrors>) => {
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: value });
    },
    [],
  );

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [originalProfile, setOriginalProfile] =
    useState<ProfileData>(initialProfile);

  const initials =
    (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");
  const bioWordCount = countWords(profile.bio);
  const hasChanges = hasProfileChanges(profile, originalProfile);

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

  const hasInitializedProfile = React.useRef(false);

  const initializeProfileFromQuery = useCallback(
    (nextProfile: ProfileData) => {
      setFetchError(null);
      setProfile(nextProfile);
      setOriginalProfile(nextProfile);
      hasInitializedProfile.current = true;
    },
    [setFetchError],
  );

  useEffect(() => {
    if (hasInitializedProfile.current) return;
    if (!profileQuery.data) return;
    initializeProfileFromQuery(profileQuery.data);
  }, [profileQuery.data, initializeProfileFromQuery]);

  useEffect(() => {
    if (!profileQuery.error) return;
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : "Failed to load profile";
    setFetchError(message);
    toast.error(message);
  }, [profileQuery.error, setFetchError]);

  const isLoading = profileQuery.isPending && !hasInitializedProfile.current;

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
      setProfile((prev) => ({ ...prev, [field]: value }));
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [validationErrors, setValidationErrors],
  );

  const handleSave = useCallback(async () => {
    if (!validateProfile()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
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
      if (res.ok) {
        setOriginalProfile(profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        toast.success("Profile saved");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save profile";
      console.error("Failed to save profile:", error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [profile, setIsSaving, setSaveSuccess, validateProfile]);

  const handleDiscard = useCallback(() => {
    setProfile(originalProfile);
    setValidationErrors({});
    toast.info("Changes discarded");
  }, [originalProfile, setValidationErrors]);

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
