import { getDbPool } from "@/lib/db";
import {
  PROFILE_MEDIA_MAX_BYTES,
  PROFILE_MEDIA_STORAGE_BUCKET,
  defaultProfile,
  normalizeProfile,
  type ProfileFormState,
} from "@/lib/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

type AuthLikeUser = {
  id: string;
  email?: string | null;
  new_email?: string | null;
  email_change_sent_at?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  } | null;
};

type UserProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  timezone: string | null;
  job_title: string | null;
  department: string | null;
  years_experience: string | null;
  degree: string | null;
  website: string | null;
  bio: string | null;
  avatar_tone: ProfileFormState["avatarTone"] | null;
  avatar_storage_path: string | null;
  cover_storage_path: string | null;
};

type UpdateUserProfileInput = {
  profile: ProfileFormState;
  avatarFile?: File | null;
  coverFile?: File | null;
  removeAvatar?: boolean;
  removeCover?: boolean;
};

type UploadedMedia = {
  storagePath: string;
};

let ensuredProfileMediaBucket: Promise<void> | null = null;

function createMediaId() {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeFileName(name: string) {
  const trimmed = name.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  const extension = dotIndex >= 0 ? trimmed.slice(dotIndex).toLowerCase() : "";
  const baseName = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;

  return `${baseName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "media"}${extension}`;
}

function buildPublicMediaUrl(storagePath: string | null) {
  if (!storagePath) {
    return "";
  }

  const admin = createSupabaseAdminClient();
  return admin.storage.from(PROFILE_MEDIA_STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

async function ensureProfileMediaBucket() {
  if (!ensuredProfileMediaBucket) {
    ensuredProfileMediaBucket = (async () => {
      const admin = createSupabaseAdminClient();
      const { data: buckets, error } = await admin.storage.listBuckets();

      if (error) {
        throw error;
      }

      if (!buckets.some((bucket) => bucket.name === PROFILE_MEDIA_STORAGE_BUCKET)) {
        const { error: createError } = await admin.storage.createBucket(PROFILE_MEDIA_STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: `${Math.round(PROFILE_MEDIA_MAX_BYTES / (1024 * 1024))}MB`,
        });

        if (createError && !String(createError.message).toLowerCase().includes("already exists")) {
          throw createError;
        }
      }
    })();
  }

  return ensuredProfileMediaBucket;
}

async function fetchUserProfileRow(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<UserProfileRow>(
    `
      select
        id,
        email,
        first_name,
        last_name,
        full_name,
        phone,
        address,
        city,
        timezone,
        job_title,
        department,
        years_experience,
        degree,
        website,
        bio,
        avatar_tone,
        avatar_storage_path,
        cover_storage_path
      from public.user_profiles
      where id = $1
      limit 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

function mapUserProfileRow(user: AuthLikeUser, row: UserProfileRow | null): ProfileFormState {
  const metadataFullName = user.user_metadata?.full_name?.trim() || "";
  const metadataFirstName = user.user_metadata?.first_name?.trim() || "";
  const metadataLastName = user.user_metadata?.last_name?.trim() || "";
  const metadataPhone = user.user_metadata?.phone?.trim() || "";
  const fallbackFullName = [metadataFirstName, metadataLastName].filter(Boolean).join(" ").trim() || metadataFullName;

  return normalizeProfile({
    fullName: row?.full_name?.trim() || fallbackFullName || defaultProfile.fullName,
    email: row?.email?.trim() || user.email?.trim().toLowerCase() || defaultProfile.email,
    pendingEmail: user.new_email?.trim().toLowerCase() || defaultProfile.pendingEmail,
    phone: row?.phone?.trim() || metadataPhone || defaultProfile.phone,
    address: row?.address?.trim() || defaultProfile.address,
    city: row?.city?.trim() || defaultProfile.city,
    timezone: row?.timezone?.trim() || defaultProfile.timezone,
    jobTitle: row?.job_title?.trim() || defaultProfile.jobTitle,
    department: row?.department?.trim() || defaultProfile.department,
    yearsExperience: row?.years_experience?.trim() || defaultProfile.yearsExperience,
    degree: row?.degree?.trim() || defaultProfile.degree,
    website: row?.website?.trim() || defaultProfile.website,
    bio: row?.bio?.trim() || defaultProfile.bio,
    avatarTone: row?.avatar_tone || defaultProfile.avatarTone,
    avatarUrl: buildPublicMediaUrl(row?.avatar_storage_path ?? null),
    coverUrl: buildPublicMediaUrl(row?.cover_storage_path ?? null),
  });
}

async function removeMediaFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  await ensureProfileMediaBucket();
  const admin = createSupabaseAdminClient();
  await admin.storage.from(PROFILE_MEDIA_STORAGE_BUCKET).remove(storagePaths);
}

async function uploadMediaFile(
  userId: string,
  field: "avatar" | "cover",
  file: File,
): Promise<UploadedMedia> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${field === "avatar" ? "Profile picture" : "Cover banner"} must be an image file.`);
  }

  if (file.size > PROFILE_MEDIA_MAX_BYTES) {
    throw new Error(`${field === "avatar" ? "Profile picture" : "Cover banner"} exceeds the 10 MB upload limit.`);
  }

  await ensureProfileMediaBucket();
  const admin = createSupabaseAdminClient();
  const storagePath = `${userId}/${field}-${createMediaId()}-${sanitizeFileName(file.name)}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from(PROFILE_MEDIA_STORAGE_BUCKET).upload(storagePath, fileBuffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return { storagePath };
}

export async function getUserProfile(user: AuthLikeUser): Promise<ProfileFormState> {
  await ensureUserProfileAndSelectedWorkspace(user);
  const row = await fetchUserProfileRow(user.id);
  return mapUserProfileRow(user, row);
}

export async function updateUserProfile(
  user: AuthLikeUser,
  input: UpdateUserProfileInput,
): Promise<ProfileFormState> {
  await ensureUserProfileAndSelectedWorkspace(user);

  const nextProfile = normalizeProfile({
    ...input.profile,
    fullName: input.profile.fullName.trim(),
    email: input.profile.email.trim(),
    pendingEmail: input.profile.pendingEmail.trim(),
    phone: input.profile.phone.trim(),
    address: input.profile.address.trim(),
    city: input.profile.city.trim(),
    timezone: input.profile.timezone.trim(),
    jobTitle: input.profile.jobTitle.trim(),
    department: input.profile.department.trim(),
    yearsExperience: input.profile.yearsExperience.trim(),
    degree: input.profile.degree.trim(),
    website: input.profile.website.trim(),
    bio: input.profile.bio.trim(),
  });

  const existingRow = await fetchUserProfileRow(user.id);
  const uploadedPaths: string[] = [];
  let nextAvatarPath = existingRow?.avatar_storage_path ?? null;
  let nextCoverPath = existingRow?.cover_storage_path ?? null;

  try {
    if (input.avatarFile) {
      const uploadedAvatar = await uploadMediaFile(user.id, "avatar", input.avatarFile);
      nextAvatarPath = uploadedAvatar.storagePath;
      uploadedPaths.push(uploadedAvatar.storagePath);
    } else if (input.removeAvatar) {
      nextAvatarPath = null;
    }

    if (input.coverFile) {
      const uploadedCover = await uploadMediaFile(user.id, "cover", input.coverFile);
      nextCoverPath = uploadedCover.storagePath;
      uploadedPaths.push(uploadedCover.storagePath);
    } else if (input.removeCover) {
      nextCoverPath = null;
    }

    const { firstName, lastName } = splitFullName(nextProfile.fullName);
    const pool = getDbPool();

    await pool.query(
      `
        update public.user_profiles
        set
          email = $2,
          first_name = $3,
          last_name = $4,
          full_name = $5,
          phone = $6,
          address = $7,
          city = $8,
          timezone = $9,
          job_title = $10,
          department = $11,
          years_experience = $12,
          degree = $13,
          website = $14,
          bio = $15,
          avatar_tone = $16,
          avatar_storage_path = $17,
          cover_storage_path = $18
        where id = $1
      `,
      [
        user.id,
        nextProfile.email,
        firstName,
        lastName,
        nextProfile.fullName,
        nextProfile.phone || null,
        nextProfile.address || null,
        nextProfile.city || null,
        nextProfile.timezone || null,
        nextProfile.jobTitle || null,
        nextProfile.department || null,
        nextProfile.yearsExperience || null,
        nextProfile.degree || null,
        nextProfile.website || null,
        nextProfile.bio || null,
        nextProfile.avatarTone,
        nextAvatarPath,
        nextCoverPath,
      ],
    );

    const stalePaths = [
      input.avatarFile && existingRow?.avatar_storage_path ? existingRow.avatar_storage_path : null,
      input.removeAvatar && existingRow?.avatar_storage_path ? existingRow.avatar_storage_path : null,
      input.coverFile && existingRow?.cover_storage_path ? existingRow.cover_storage_path : null,
      input.removeCover && existingRow?.cover_storage_path ? existingRow.cover_storage_path : null,
    ].filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);

    await removeMediaFiles(stalePaths);

    const updatedRow = await fetchUserProfileRow(user.id);
    return mapUserProfileRow(
      {
        ...user,
        email: nextProfile.email,
        new_email: nextProfile.pendingEmail || null,
      },
      updatedRow,
    );
  } catch (error) {
    await removeMediaFiles(uploadedPaths);
    throw error;
  }
}
