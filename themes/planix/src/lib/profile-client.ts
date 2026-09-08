"use client";

import { emitPersistentStateSync } from "@/lib/use-persistent-state";
import { writeCompatibleLocalStorageItem } from "@/lib/storage-compat";
import type { ProfileFormState } from "@/lib/profile";

export const PROFILE_IDENTITY_STORAGE_KEY = "planix.profile.identity";
const LEGACY_PROFILE_STORAGE_KEY = "planique.profile.settings";

export type ProfileIdentity = Pick<ProfileFormState, "fullName" | "email" | "jobTitle" | "avatarTone" | "avatarUrl">;

export function toProfileIdentity(profile: ProfileFormState): ProfileIdentity {
  return {
    fullName: profile.fullName,
    email: profile.email,
    jobTitle: profile.jobTitle,
    avatarTone: profile.avatarTone,
    avatarUrl: profile.avatarUrl,
  };
}

export function syncProfileIdentityBridge(profile: ProfileFormState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const value = toProfileIdentity(profile);
    window.localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);
    writeCompatibleLocalStorageItem(PROFILE_IDENTITY_STORAGE_KEY, JSON.stringify(value));
    emitPersistentStateSync(PROFILE_IDENTITY_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures and keep profile usable.
  }
}
