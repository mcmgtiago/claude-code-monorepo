"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Briefcase,
  Clock3,
  Globe2,
  GraduationCap,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import {
  PROFILE_MEDIA_ACCEPT_ATTRIBUTE,
  PROFILE_MEDIA_MAX_BYTES,
  defaultProfile,
  demoProfile,
  normalizeProfile,
  type ProfileFormState,
} from "@/lib/profile";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import { syncProfileIdentityBridge } from "@/lib/profile-client";
import { readJsonSafely } from "@/lib/settings-client";
import { cn } from "@/lib/utils";

const avatarToneOptions: Array<{ value: ProfileFormState["avatarTone"]; label: string }> = [
  { value: "sand", label: "Sand" },
  { value: "rose", label: "Rose" },
  { value: "olive", label: "Olive" },
  { value: "slate", label: "Slate" },
  { value: "peach", label: "Peach" },
];

const timezoneOptions = [
  "Asia/Kolkata",
  "Central Time (UTC-6)",
  "Eastern Time (UTC-5)",
  "Pacific Time (UTC-8)",
  "UTC",
];

const PROFILE_CACHE_KEY = "planix.cache.profile";
const PROFILE_CACHE_MAX_AGE_MS = 1000 * 60 * 10;

type ProfileCachePayload = {
  profile: ProfileFormState;
  mode: "remote" | "demo";
};

function readProfileCache() {
  return readMemoryCache<ProfileCachePayload>(PROFILE_CACHE_KEY, PROFILE_CACHE_MAX_AGE_MS);
}

function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatMaxMediaSize() {
  return `${Math.round(PROFILE_MEDIA_MAX_BYTES / (1024 * 1024))} MB`;
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
        <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
        {label}
      </span>
      {children}
      {error && <span className="mt-2 block text-[12px] text-[var(--red)]">{error}</span>}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="panel-surface rounded-[var(--radius-xl)] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-[1rem] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
        <p className="mt-1 text-[0.84rem] leading-6 text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

const inputClassName =
  "w-full rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-[0.95rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/50 focus:bg-white/[0.05] placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-70";

export function ProfileShell() {
  const cachedProfileRef = useRef(readProfileCache());
  const cachedProfile = cachedProfileRef.current;
  const initialProfile = cachedProfile?.mode === "demo" ? cachedProfile.profile : defaultProfile;
  const [profile, setProfile] = useState<ProfileFormState>(initialProfile);
  const [draft, setDraft] = useState<ProfileFormState>(initialProfile);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<"remote" | "demo">(cachedProfile?.mode ?? "remote");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  useEffect(() => {
    if (mode === "remote" && isLoading) {
      return;
    }

    writeMemoryCache<ProfileCachePayload>(PROFILE_CACHE_KEY, {
      profile,
      mode,
    });

    if (mode === "demo" || profile.fullName.trim() || profile.email.trim()) {
      syncProfileIdentityBridge(profile);
    }
  }, [isLoading, mode, profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await fetch("/api/profile", {
          method: "GET",
          cache: "no-store",
        });
        const payload = await readJsonSafely<{
          error?: string;
          profile?: Partial<ProfileFormState>;
          mode?: "remote" | "demo";
        }>(response);

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load profile.");
        }

        if (cancelled) {
          return;
        }

        const nextMode = payload?.mode === "demo" ? "demo" : "remote";
        const nextProfile = nextMode === "demo"
          ? normalizeProfile({ ...demoProfile, ...(payload?.profile ?? {}) })
          : normalizeProfile(payload?.profile);
        setMode(nextMode);
        setProfile(nextProfile);
        setDraft(nextProfile);
        setAvatarFile(null);
        setCoverFile(null);
        setRemoveAvatar(false);
        setRemoveCover(false);
        setIsEditing(false);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load profile.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timer = window.setTimeout(() => setSaveMessage(""), 2400);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = window.setTimeout(() => setErrorMessage(""), 3600);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(removeAvatar ? "" : draft.avatarUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile, draft.avatarUrl, removeAvatar]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(removeCover ? "" : draft.coverUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile, draft.coverUrl, removeCover]);

  const emailError = draft.email.trim() && !isValidEmail(draft.email) ? "Enter a valid email address." : "";
  const hasProfileChanges = JSON.stringify(draft) !== JSON.stringify(profile);
  const hasMediaChanges = Boolean(avatarFile || coverFile || removeAvatar || removeCover);
  const hasChanges = hasProfileChanges || hasMediaChanges;
  const canSaveProfileChanges = Boolean(draft.fullName.trim() && draft.jobTitle.trim() && draft.email.trim() && !emailError);
  const canSubmitChanges = hasChanges && (!hasProfileChanges || canSaveProfileChanges);
  const initials = useMemo(() => buildInitials(draft.fullName), [draft.fullName]);
  const fieldsDisabled = !isEditing || isLoading || isSaving;

  function updateField<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetPendingMedia() {
    setAvatarFile(null);
    setCoverFile(null);
    setRemoveAvatar(false);
    setRemoveCover(false);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  }

  function handleCancelEdit() {
    setDraft(profile);
    resetPendingMedia();
    setSaveMessage("");
    setErrorMessage("");
    setIsEditing(false);
  }

  function handleMediaSelection(kind: "avatar" | "cover", files: FileList | null) {
    const selectedFile = files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      const message = "Only image files are supported for profile media.";
      setErrorMessage(message);
      window.alert(message);
      return;
    }

    if (selectedFile.size > PROFILE_MEDIA_MAX_BYTES) {
      const message = `${kind === "avatar" ? "Profile picture" : "Cover banner"} must be ${formatMaxMediaSize()} or smaller.`;
      setErrorMessage(message);
      window.alert(message);
      return;
    }

    setErrorMessage("");

    if (kind === "avatar") {
      setAvatarFile(selectedFile);
      setRemoveAvatar(false);
    } else {
      setCoverFile(selectedFile);
      setRemoveCover(false);
    }
  }

  function handleMediaButtonClick(kind: "avatar" | "cover") {
    if (!isEditing || isSaving) {
      return;
    }

    if (mode !== "remote") {
      const message = "Profile media uploads need a signed-in workspace session. Demo mode does not upload files.";
      setErrorMessage(message);
      window.alert(message);
      return;
    }

    if (kind === "avatar") {
      avatarInputRef.current?.click();
      return;
    }

    coverInputRef.current?.click();
  }

  function handleRemoveMedia(kind: "avatar" | "cover") {
    if (kind === "avatar") {
      setAvatarFile(null);
      setRemoveAvatar(true);

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }

      return;
    }

    setCoverFile(null);
    setRemoveCover(true);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!canSubmitChanges || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      const formData = new FormData();

      formData.set("fullName", draft.fullName);
      formData.set("email", draft.email);
      formData.set("pendingEmail", draft.pendingEmail);
      formData.set("phone", draft.phone);
      formData.set("address", draft.address);
      formData.set("city", draft.city);
      formData.set("timezone", draft.timezone);
      formData.set("jobTitle", draft.jobTitle);
      formData.set("department", draft.department);
      formData.set("yearsExperience", draft.yearsExperience);
      formData.set("degree", draft.degree);
      formData.set("website", draft.website);
      formData.set("bio", draft.bio);
      formData.set("avatarTone", draft.avatarTone);
      formData.set("avatarUrl", profile.avatarUrl);
      formData.set("coverUrl", profile.coverUrl);
      formData.set("removeAvatar", String(removeAvatar));
      formData.set("removeCover", String(removeCover));

      if (avatarFile) {
        formData.set("avatarFile", avatarFile);
      }

      if (coverFile) {
        formData.set("coverFile", coverFile);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });
      const payload = await readJsonSafely<{
        error?: string;
        profile?: Partial<ProfileFormState>;
        mode?: "remote" | "demo";
      }>(response);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save profile.");
      }

      const nextProfile = normalizeProfile(payload?.profile);
      setMode(payload?.mode === "demo" ? "demo" : "remote");
      setProfile(nextProfile);
      setDraft(nextProfile);
      resetPendingMedia();
      setSaveMessage(
        nextProfile.pendingEmail
          ? `Profile saved. Confirm the email change sent to ${nextProfile.pendingEmail}.`
          : "Profile changes saved.",
      );
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex flex-1 flex-col overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          <header className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="type-page-title tracking-tight text-white">Profile</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {saveMessage && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--green)]/25 bg-[var(--green)]/10 px-3.5 py-2 text-[0.8rem] font-medium text-[var(--green)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {saveMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--red)]/25 bg-[var(--red)]/10 px-3.5 py-2 text-[0.8rem] font-medium text-[var(--red)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {errorMessage}
                  </div>
                )}
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isLoading || isSaving}
                      className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.84rem] font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSubmitChanges || isLoading || isSaving}
                      className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.84rem] font-semibold disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.84rem] font-semibold disabled:opacity-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
              <div className="space-y-6">
                <Section
                  title="Identity"
                  description="Control the main information shown across your workspace profile surfaces."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full Name" icon={User}>
                      <input
                        value={draft.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        className={inputClassName}
                        placeholder="Enter full name"
                        disabled={fieldsDisabled}
                      />
                    </Field>
                    <Field label="Work Email" icon={Mail} error={emailError}>
                      <div className="space-y-2">
                        <input
                          value={draft.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          className={cn(inputClassName, emailError && "border-[var(--red)]/40 focus:border-[var(--red)]/50")}
                          placeholder="Enter email"
                          type="email"
                          disabled={fieldsDisabled}
                        />
                        {profile.pendingEmail && (
                          <p className="text-[12px] text-[var(--accent)]">
                            Pending email change: {profile.pendingEmail}. Confirm the link sent to complete the update.
                          </p>
                        )}
                      </div>
                    </Field>
                    <Field label="Job Title" icon={Briefcase}>
                      <input
                        value={draft.jobTitle}
                        onChange={(event) => updateField("jobTitle", event.target.value)}
                        className={inputClassName}
                        placeholder="Enter job title"
                        disabled={fieldsDisabled}
                      />
                    </Field>
                    <Field label="Department" icon={LayoutGrid}>
                      <input
                        value={draft.department}
                        onChange={(event) => updateField("department", event.target.value)}
                        className={inputClassName}
                        placeholder="Enter department"
                        disabled={fieldsDisabled}
                      />
                    </Field>
                  </div>
                </Section>

                <Section
                  title="Contact Details"
                  description="Keep communication and location details current for teammates and workspace records."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Phone Number" icon={Phone}>
                      <input
                        value={draft.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        className={inputClassName}
                        placeholder="Enter phone number"
                        disabled={fieldsDisabled}
                      />
                    </Field>
                    <Field label="Timezone" icon={Clock3}>
                      <select
                        value={draft.timezone}
                        onChange={(event) => updateField("timezone", event.target.value)}
                        className={inputClassName}
                        disabled={fieldsDisabled}
                      >
                        {timezoneOptions.map((option) => (
                          <option key={option} value={option} className="bg-[#17181b] text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Address" icon={MapPin}>
                      <input
                        value={draft.address}
                        onChange={(event) => updateField("address", event.target.value)}
                        className={inputClassName}
                        placeholder="Enter address"
                        disabled={fieldsDisabled}
                      />
                    </Field>
                    <Field label="City / Region" icon={MapPin}>
                      <input
                        value={draft.city}
                        onChange={(event) => updateField("city", event.target.value)}
                        className={inputClassName}
                        placeholder="Enter city or region"
                        disabled={fieldsDisabled}
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Website" icon={Globe2}>
                        <input
                          value={draft.website}
                          onChange={(event) => updateField("website", event.target.value)}
                          className={inputClassName}
                          placeholder="portfolio.example.com"
                          disabled={fieldsDisabled}
                        />
                      </Field>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Professional Details"
                  description="Capture role depth, educational background, and the story behind your profile."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Years of Experience" icon={Clock3}>
                      <input
                          value={draft.yearsExperience}
                          onChange={(event) => updateField("yearsExperience", event.target.value)}
                          className={inputClassName}
                          placeholder="e.g. 6 Years"
                          disabled={fieldsDisabled}
                      />
                    </Field>
                    <Field label="Degree" icon={GraduationCap}>
                      <input
                          value={draft.degree}
                          onChange={(event) => updateField("degree", event.target.value)}
                          className={inputClassName}
                          placeholder="Enter degree"
                          disabled={fieldsDisabled}
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="About" icon={Sparkles}>
                        <textarea
                          value={draft.bio}
                          onChange={(event) => updateField("bio", event.target.value)}
                          className={cn(inputClassName, "min-h-[140px] resize-y")}
                          placeholder="Write a short profile summary"
                          disabled={fieldsDisabled}
                        />
                      </Field>
                    </div>
                  </div>
                </Section>
              </div>

              <div className="space-y-6">
                <section className="overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] shadow-[0_26px_60px_rgba(0,0,0,0.28)]">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept={PROFILE_MEDIA_ACCEPT_ATTRIBUTE}
                    className="hidden"
                    onChange={(event) => handleMediaSelection("cover", event.target.files)}
                  />
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept={PROFILE_MEDIA_ACCEPT_ATTRIBUTE}
                    className="hidden"
                    onChange={(event) => handleMediaSelection("avatar", event.target.files)}
                  />

                  <div className="relative h-36 overflow-hidden border-b border-white/8">
                    {coverPreviewUrl ? (
                      <img
                        src={coverPreviewUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(251,138,116,0.42),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.18),transparent_22%),linear-gradient(135deg,#1b2434_0%,#14161c_52%,#352018_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,12,0.1),rgba(8,9,12,0.42))]" />

                    {isEditing && (
                      <div className="absolute right-4 top-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMediaButtonClick("cover")}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[rgba(7,9,12,0.56)] px-3.5 py-2 text-[0.76rem] font-medium text-white backdrop-blur-md transition hover:bg-[rgba(7,9,12,0.68)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ImagePlus className="h-3.5 w-3.5" />
                          Cover Banner
                        </button>
                        {(coverPreviewUrl || draft.coverUrl) && !removeCover && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia("cover")}
                            disabled={mode !== "remote" || isSaving}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-[rgba(7,9,12,0.56)] px-3 py-2 text-[0.76rem] font-medium text-white backdrop-blur-md transition hover:bg-[rgba(7,9,12,0.68)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-end gap-4">
                      <Avatar
                        initials={initials}
                        tone={draft.avatarTone}
                        imageSrc={avatarPreviewUrl || undefined}
                        size="lg"
                        className="-mt-8 ring-4 ring-[var(--panel)]"
                      />
                      <div className="flex flex-1 flex-col gap-3 pt-4">
                        <div>
                          <h2 className="text-[1.12rem] font-semibold tracking-tight text-[var(--text-primary)]">
                            {draft.fullName || "Unnamed profile"}
                          </h2>
                          <p className="mt-1 text-[0.84rem] text-[var(--text-muted)]">
                            {draft.jobTitle || "Add job title"}
                          </p>
                        </div>

                        {isEditing && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleMediaButtonClick("avatar")}
                              disabled={isSaving}
                              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/22 bg-[var(--accent)]/10 px-3.5 py-2 text-[0.76rem] font-medium text-[var(--accent)] transition hover:border-[var(--accent)]/34 hover:bg-[var(--accent)]/14 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Profile Picture
                            </button>
                            {(avatarPreviewUrl || draft.avatarUrl) && !removeAvatar && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedia("avatar")}
                                disabled={mode !== "remote" || isSaving}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[0.76rem] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {[
                        { label: "Email", value: draft.email || "Not set" },
                        { label: "Department", value: draft.department || "Not set" },
                        { label: "Timezone", value: draft.timezone || "Not set" },
                        { label: "Experience", value: draft.yearsExperience || "Not set" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3"
                        >
                          <span className="text-[0.76rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {item.label}
                          </span>
                          <span className="max-w-[65%] truncate text-right text-[0.84rem] font-medium text-[var(--text-primary)]">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="panel-surface rounded-[var(--radius-xl)] p-5 sm:p-6">
                  <h2 className="text-[1rem] font-semibold tracking-tight text-[var(--text-primary)]">
                    Profile Appearance
                  </h2>
                  <p className="mt-1 text-[0.84rem] leading-6 text-[var(--text-muted)]">
                    Choose the avatar tone used for your profile badge and quick identity surfaces.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {avatarToneOptions.map((tone) => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => updateField("avatarTone", tone.value)}
                        disabled={fieldsDisabled}
                        className={cn(
                          "flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition",
                          draft.avatarTone === tone.value
                            ? "border-[var(--accent)]/35 bg-[var(--accent)]/10"
                            : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
                          fieldsDisabled && "cursor-not-allowed opacity-70",
                        )}
                      >
                        <Avatar initials={initials} tone={tone.value} size="sm" />
                        <span className="text-[0.85rem] font-medium text-[var(--text-primary)]">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="panel-surface rounded-[var(--radius-xl)] p-5 sm:p-6">
                  <h2 className="text-[1rem] font-semibold tracking-tight text-[var(--text-primary)]">
                    Edit Status
                  </h2>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3.5">
                      <p className="text-[0.76rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">Save State</p>
                      <p className="mt-1.5 text-[0.9rem] font-medium text-[var(--text-primary)]">
                        {isLoading
                          ? "Loading profile data"
                          : hasChanges
                            ? "Unsaved changes in progress"
                            : "Profile is up to date"}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3.5">
                      <p className="text-[0.76rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">Validation</p>
                      <p className="mt-1.5 text-[0.9rem] font-medium text-[var(--text-primary)]">
                        {hasProfileChanges
                          ? (canSaveProfileChanges
                              ? "All edited profile fields are valid"
                              : "Full name, job title, and a valid email are required for profile field edits")
                          : "Media-only changes are ready to save"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
