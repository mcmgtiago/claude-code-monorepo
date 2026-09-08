import { prisma } from "@/lib/prisma";
import sharp from "sharp";

const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024;
const PROFILE_IMAGE_DIMENSION = 200;
const PROFILE_IMAGE_OUTPUT_MIME = "image/webp";
const PROFILE_IMAGE_OUTPUT_EXTENSION = "webp";
const LEGACY_PROFILE_IMAGE_PREFIX = "/uploads/profile-images/";
const PROFILE_IMAGE_ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const PROFILE_IMAGE_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

type OptimizedProfileImage = {
  data: Uint8Array<ArrayBuffer>;
  fileName: string;
  mimeType: typeof PROFILE_IMAGE_OUTPUT_MIME;
  width: typeof PROFILE_IMAGE_DIMENSION;
  height: typeof PROFILE_IMAGE_DIMENSION;
};

export function buildProfileImageUrl(version: Date | number | string = Date.now()) {
  const value = version instanceof Date ? version.getTime() : version;
  return `/api/settings/profile/photo?v=${encodeURIComponent(String(value))}`;
}

function toDatabaseBytes(buffer: Buffer): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(buffer.length);
  bytes.set(buffer);
  return bytes;
}

function isSupportedProfileImage(file: File) {
  const normalizedType = file.type.trim().toLowerCase();

  if (normalizedType === "image/svg+xml") {
    return false;
  }

  if (PROFILE_IMAGE_ALLOWED_MIME_TYPES.has(normalizedType)) {
    return true;
  }

  const lowerName = file.name.trim().toLowerCase();
  return PROFILE_IMAGE_ALLOWED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

async function optimizeProfileImage(userId: string, file: File, inputBuffer: Buffer): Promise<OptimizedProfileImage> {
  if (!isSupportedProfileImage(file)) {
    throw new Error("Profile picture must be a JPG, JPEG, PNG, or WebP image.");
  }

  let outputBuffer: Buffer;

  try {
    outputBuffer = await sharp(inputBuffer, { limitInputPixels: 24_000_000 })
      .rotate()
      .resize(PROFILE_IMAGE_DIMENSION, PROFILE_IMAGE_DIMENSION, {
        fit: "cover",
        position: "center"
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch {
    throw new Error("Upload a valid image file.");
  }

  return {
    data: toDatabaseBytes(outputBuffer),
    fileName: `${userId}.${PROFILE_IMAGE_OUTPUT_EXTENSION}`,
    mimeType: PROFILE_IMAGE_OUTPUT_MIME,
    width: PROFILE_IMAGE_DIMENSION,
    height: PROFILE_IMAGE_DIMENSION
  };
}

export async function saveProfileImage(userId: string, file: File) {
  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    throw new Error("Profile picture must be 10 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimizedImage = await optimizeProfileImage(userId, file, buffer);

  const profileImage = await prisma.userProfileImage.upsert({
    where: { userId },
    update: {
      fileName: optimizedImage.fileName,
      mimeType: optimizedImage.mimeType,
      width: optimizedImage.width,
      height: optimizedImage.height,
      sizeBytes: optimizedImage.data.length,
      data: optimizedImage.data
    },
    create: {
      userId,
      fileName: optimizedImage.fileName,
      mimeType: optimizedImage.mimeType,
      width: optimizedImage.width,
      height: optimizedImage.height,
      sizeBytes: optimizedImage.data.length,
      data: optimizedImage.data
    },
    select: { updatedAt: true }
  });

  return buildProfileImageUrl(profileImage.updatedAt);
}

export async function getStoredProfileImage(userId: string) {
  return prisma.userProfileImage.findUnique({
    where: { userId },
    select: {
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      data: true,
      updatedAt: true
    }
  });
}

export async function removeStoredProfileImage(userId: string) {
  await prisma.userProfileImage.deleteMany({
    where: { userId }
  });
}

export async function removeLegacyProfileImage(profileImageUrl: string | null | undefined) {
  // Legacy filesystem images are no longer used; profile images are stored in the DB.
  if (!profileImageUrl?.startsWith(LEGACY_PROFILE_IMAGE_PREFIX)) {
    return;
  }
  // No-op: legacy files have been removed; nothing to delete.
}
