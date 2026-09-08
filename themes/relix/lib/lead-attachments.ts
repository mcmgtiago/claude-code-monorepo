import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type LeadAttachment = {
  id: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "text/plain",
  "text/csv"
]);

const maxFileSizeBytes = 10 * 1024 * 1024;

function storageRoot() {
  return path.resolve(process.cwd(), "storage", "lead-attachments");
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function isLegacyStorageKey(storageKey: string) {
  return storageKey.includes("/") || storageKey.includes("\\");
}

export function parseLeadAttachments(value: string | null | undefined) {
  if (!value) {
    return [] as LeadAttachment[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (typeof item === "string") {
        return [
          {
            id: randomUUID(),
            fileName: item,
            storageKey: "",
            mimeType: "application/octet-stream",
            size: 0,
            uploadedAt: new Date().toISOString()
          }
        ];
      }

      if (
        item &&
        typeof item === "object" &&
        typeof (item as Partial<LeadAttachment>).id === "string" &&
        typeof (item as Partial<LeadAttachment>).fileName === "string"
      ) {
        const attachment = item as Partial<LeadAttachment>;

        return [
          {
            id: attachment.id!,
            fileName: attachment.fileName!,
            storageKey:
              typeof attachment.storageKey === "string" && attachment.storageKey
                ? attachment.storageKey
                : attachment.id!,
            mimeType: typeof attachment.mimeType === "string" ? attachment.mimeType : "application/octet-stream",
            size: typeof attachment.size === "number" ? attachment.size : 0,
            uploadedAt: typeof attachment.uploadedAt === "string" ? attachment.uploadedAt : new Date().toISOString()
          }
        ];
      }

      return [];
    });
  } catch {
    return [];
  }
}

export function serializeLeadAttachments(attachments: LeadAttachment[]) {
  return JSON.stringify(attachments);
}

export async function saveLeadAttachment(leadId: string, file: File) {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("This file type is not allowed.");
  }

  if (file.size > maxFileSizeBytes) {
    throw new Error("Each attachment must be 10 MB or smaller.");
  }

  const attachmentId = randomUUID();
  const safeFileName = normalizeFileName(file.name || "attachment");
  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.leadAttachmentFile.create({
    data: {
      id: attachmentId,
      leadId,
      fileName: file.name || safeFileName,
      mimeType: file.type,
      sizeBytes: buffer.length,
      data: buffer
    }
  });

  return {
    id: attachmentId,
    fileName: file.name || safeFileName,
    storageKey: attachmentId,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString()
  } satisfies LeadAttachment;
}

export async function removeLeadAttachmentFile(leadId: string, attachmentId: string, storageKey: string) {
  const deleted = await prisma.leadAttachmentFile.deleteMany({
    where: {
      id: attachmentId,
      leadId
    }
  });

  if (deleted.count > 0 || !storageKey || !isLegacyStorageKey(storageKey)) {
    return;
  }

  const absolutePath = path.join(storageRoot(), storageKey);

  try {
    await fs.unlink(absolutePath);
  } catch {
    // Ignore missing files; metadata cleanup is the source of truth.
  }
}

export async function readLeadAttachmentFile(leadId: string, attachmentId: string, storageKey: string) {
  const attachment = await prisma.leadAttachmentFile.findFirst({
    where: {
      id: attachmentId,
      leadId
    },
    select: {
      data: true
    }
  });

  if (attachment) {
    return Buffer.from(attachment.data);
  }

  if (!storageKey || !isLegacyStorageKey(storageKey)) {
    throw new Error("Attachment file is missing.");
  }

  return fs.readFile(path.join(storageRoot(), storageKey));
}
