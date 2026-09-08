export type EmailAttachmentMeta = {
  fileName: string;
  contentType: string;
  size: number;
  contentId?: string | null;
  contentLocation?: string | null;
  disposition?: string | null;
};

export function parseEmailAttachments(value: string | null | undefined) {
  if (!value) {
    return [] as EmailAttachmentMeta[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const attachments: EmailAttachmentMeta[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const attachment = item as Partial<EmailAttachmentMeta>;
      if (!attachment.fileName || !attachment.contentType || typeof attachment.size !== "number") {
        continue;
      }

      attachments.push({
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        size: attachment.size,
        contentId: typeof attachment.contentId === "string" ? attachment.contentId : null,
        contentLocation: typeof attachment.contentLocation === "string" ? attachment.contentLocation : null,
        disposition: typeof attachment.disposition === "string" ? attachment.disposition : null
      });
    }

    return attachments;
  } catch {
    return [];
  }
}
