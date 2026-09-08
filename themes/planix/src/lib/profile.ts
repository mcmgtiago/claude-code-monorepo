import type { AvatarTone } from "@/data/dashboard";

export const PROFILE_MEDIA_STORAGE_BUCKET = "profile-media";
export const PROFILE_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const PROFILE_MEDIA_ACCEPT_ATTRIBUTE = "image/png,image/jpeg,image/webp,image/gif";

export type ProfileFormState = {
  fullName: string;
  email: string;
  pendingEmail: string;
  phone: string;
  address: string;
  city: string;
  timezone: string;
  jobTitle: string;
  department: string;
  yearsExperience: string;
  degree: string;
  website: string;
  bio: string;
  avatarTone: AvatarTone;
  avatarUrl: string;
  coverUrl: string;
};

export const defaultProfile: ProfileFormState = {
  fullName: "",
  email: "",
  pendingEmail: "",
  phone: "",
  address: "",
  city: "",
  timezone: "UTC",
  jobTitle: "",
  department: "",
  yearsExperience: "",
  degree: "",
  website: "",
  bio: "",
  avatarTone: "sand",
  avatarUrl: "",
  coverUrl: "",
};

export const demoProfile: ProfileFormState = {
  fullName: "Martin Saris",
  email: "martin.saris@gmail.com",
  pendingEmail: "",
  phone: "+1 730 860 7820",
  address: "267 Sipes Throughway",
  city: "Austin, Texas",
  timezone: "Central Time (UTC-6)",
  jobTitle: "Senior Product Designer",
  department: "Design",
  yearsExperience: "3 Years",
  degree: "Master Degree",
  website: "martinsaris.design",
  bio:
    "I design product experiences that feel calm, sharp, and useful. My work sits at the intersection of UX systems, interface craft, and product thinking, with a strong focus on turning complex workflows into clean, confident decisions.",
  avatarTone: "sand",
  avatarUrl: "",
  coverUrl: "",
};

export function normalizeProfile(
  value: Partial<ProfileFormState> | null | undefined,
): ProfileFormState {
  return {
    ...defaultProfile,
    ...(value ?? {}),
  };
}
