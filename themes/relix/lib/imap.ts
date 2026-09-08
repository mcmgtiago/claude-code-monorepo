import { ImapFlow, type FetchMessageObject } from "imapflow";
import { emailBodyNeedsRepair, extractEmailAttachmentFromMime, extractEmailContentFromMime } from "@/lib/email-content";
import { buildMailboxScopedProviderId, getMailboxProviderIdCandidates } from "@/lib/email-provider-id";
import { matchesThreadByParticipants, normalizeEmail, splitEmailList } from "@/lib/email-threading";
import { getFreshGoogleMailConnectionByUserId } from "@/lib/google-mail";
import { getPlatformSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";

const bounceSubjectPattern = /undeliver|delivery[ -]status|failure notice|returned mail|mail delivery subsystem|couldn'?t be delivered|delivery has failed/i;
const bounceSenderPattern = /(mailer-daemon|postmaster|mail delivery subsystem)/i;
const mailboxFetchLimit = 5000;

type SyncFolder = {
  path: string;
  kind: "inbox" | "sent" | "junk" | "trash";
};

type ImapSettings = {
  imapHost: string | null;
  imapPort: number | null;
  imapUser: string | null;
  imapPass: string | null;
  imapSecure: boolean;
  configured: boolean;
};

type ImapResolutionOptions = {
  personalOnly?: boolean;
};

type MailboxClient = {
  client: ImapFlow;
  accountEmail: string;
};

type EnvelopeAddress = {
  address?: string | null;
};

function formatEnvelopeAddresses(addresses: EnvelopeAddress[] | undefined | null) {
  return Array.from(
    new Set(
      (addresses || [])
        .map((address) => normalizeEmail(address.address))
        .filter(Boolean)
    )
  ).join(", ");
}

function sanitizeImapValue(value: string | null | undefined) {
  const normalized = (value || "").trim();
  return normalized.length ? normalized : null;
}

function sanitizeImapPort(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value || "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function readPlatformImapSettings(): Promise<ImapSettings> {
  const platform = await getPlatformSettings();

  return {
    imapHost: sanitizeImapValue(platform.imapHost),
    imapPort: sanitizeImapPort(platform.imapPort) || 993,
    imapUser: sanitizeImapValue(platform.imapUser),
    imapPass: sanitizeImapValue(platform.imapPass),
    imapSecure: platform.imapSecure,
    configured: Boolean(platform.imapHost && platform.imapPort && platform.imapUser && platform.imapPass)
  };
}

async function readWorkspaceImapSettings(workspaceId: string | null | undefined): Promise<ImapSettings> {
  const platform = await readPlatformImapSettings();

  if (!workspaceId) {
    return platform;
  }

  const settings = await prisma.workspaceSetting.findFirst({
    where: { workspaceId },
    select: {
      imapHost: true,
      imapPort: true,
      imapUser: true,
      imapPass: true,
      imapSecure: true
    }
  });

  return {
    imapHost: sanitizeImapValue(settings?.imapHost) || platform.imapHost,
    imapPort: sanitizeImapPort(settings?.imapPort) || platform.imapPort,
    imapUser: sanitizeImapValue(settings?.imapUser) || platform.imapUser,
    imapPass: sanitizeImapValue(settings?.imapPass) || platform.imapPass,
    imapSecure: typeof settings?.imapSecure === "boolean" ? settings.imapSecure : platform.imapSecure,
    configured: Boolean(
      (sanitizeImapValue(settings?.imapHost) || platform.imapHost) &&
        (sanitizeImapPort(settings?.imapPort) || platform.imapPort) &&
        (sanitizeImapValue(settings?.imapUser) || platform.imapUser) &&
        (sanitizeImapValue(settings?.imapPass) || platform.imapPass)
    )
  };
}

async function readPersonalImapSettings(userId: string): Promise<ImapSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mailboxSettings: {
        select: {
          imapHost: true,
          imapPort: true,
          imapUser: true,
          imapPass: true,
          imapSecure: true
        }
      }
    }
  });

  const imapHost = sanitizeImapValue(user?.mailboxSettings?.imapHost);
  const imapPort = sanitizeImapPort(user?.mailboxSettings?.imapPort) || 993;
  const imapUser = sanitizeImapValue(user?.mailboxSettings?.imapUser);
  const imapPass = sanitizeImapValue(user?.mailboxSettings?.imapPass);
  const imapSecure = typeof user?.mailboxSettings?.imapSecure === "boolean" ? user.mailboxSettings.imapSecure : true;

  return {
    imapHost,
    imapPort,
    imapUser,
    imapPass,
    imapSecure,
    configured: Boolean(imapHost && imapPort && imapUser && imapPass)
  };
}

async function readStoredImapSettings(userId?: string): Promise<ImapSettings> {
  if (!userId) {
    return readPlatformImapSettings();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      workspaceId: true,
      mailboxSettings: {
        select: {
          imapHost: true,
          imapPort: true,
          imapUser: true,
          imapPass: true,
          imapSecure: true
        }
      }
    }
  });

  const workspace = await readWorkspaceImapSettings(user?.workspaceId);

  const imapHost = sanitizeImapValue(user?.mailboxSettings?.imapHost) || workspace.imapHost;
  const imapPort = sanitizeImapPort(user?.mailboxSettings?.imapPort) || workspace.imapPort;
  const imapUser = sanitizeImapValue(user?.mailboxSettings?.imapUser) || workspace.imapUser;
  const imapPass = sanitizeImapValue(user?.mailboxSettings?.imapPass) || workspace.imapPass;
  const imapSecure = typeof user?.mailboxSettings?.imapSecure === "boolean" ? user.mailboxSettings.imapSecure : workspace.imapSecure;

  return {
    imapHost,
    imapPort,
    imapUser,
    imapPass,
    imapSecure,
    configured: Boolean(imapHost && imapPort && imapUser && imapPass)
  };
}

function validateImapSettings(settings: ImapSettings) {
  const required = [
    ["IMAP_HOST", settings.imapHost],
    ["IMAP_PORT", settings.imapPort],
    ["IMAP_USER", settings.imapUser],
    ["IMAP_PASS", settings.imapPass]
  ] as const;
  const missingVars = required.filter(([, value]) => !value).map(([key]) => key);
  const placeholderPresent = [settings.imapHost, settings.imapUser, settings.imapPass].filter(Boolean).some((value) =>
    /yourprovider\.com|example\.com|your-app-password/i.test(String(value))
  );

  if (missingVars.length) {
    throw new Error(`Inbox sync is not configured. Missing: ${missingVars.join(", ")}`);
  }

  if (placeholderPresent) {
    throw new Error("Inbox sync is not configured. Replace placeholder IMAP values.");
  }
}

export async function getImapSettings(userId?: string, options?: ImapResolutionOptions) {
  if (userId && options?.personalOnly) {
    return readPersonalImapSettings(userId);
  }

  return readStoredImapSettings(userId);
}

async function createMailboxClient(userId: string): Promise<MailboxClient | null> {
  const googleConnection = await getFreshGoogleMailConnectionByUserId(userId).catch(() => null);
  const settings = googleConnection ? null : await readPersonalImapSettings(userId);

  if (settings) {
    validateImapSettings(settings);
  }

  if (!googleConnection && !settings?.configured) {
    return null;
  }

  const client = googleConnection
    ? new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: { user: googleConnection.connection.googleEmail, accessToken: googleConnection.accessToken }
      })
    : new ImapFlow({
        host: settings?.imapHost || "",
        port: settings?.imapPort || 993,
        secure: settings?.imapSecure ?? true,
        auth: { user: settings?.imapUser || "", pass: settings?.imapPass || "" }
      });

  return {
    client,
    accountEmail: googleConnection?.connection.googleEmail || settings?.imapUser || ""
  };
}

function extractMessageIdCandidates(source: string) {
  const values = new Set<string>();

  for (const match of source.matchAll(/(?:Original-Message-ID|In-Reply-To|References|Message-ID):\s*([^\r\n]+)/gi)) {
    const headerValue = match[1] || "";
    for (const idMatch of headerValue.matchAll(/<([^>]+)>/g)) {
      values.add(`<${idMatch[1]}>`);
    }
  }

  return Array.from(values);
}

async function markBounceIfNeeded(input: {
  workspaceId: string;
  mailboxUserId: string;
  source: string;
  subject: string;
  fromEmail: string;
  sentAt: Date;
}) {
  const normalizedFrom = normalizeEmail(input.fromEmail);
  const looksLikeBounce = bounceSenderPattern.test(normalizedFrom) || bounceSubjectPattern.test(input.subject);

  if (!looksLikeBounce) {
    return;
  }

  const providerIds = extractMessageIdCandidates(input.source);
  if (!providerIds.length) {
    return;
  }

  const providerIdCandidates = providerIds.flatMap((providerId) => getMailboxProviderIdCandidates(input.mailboxUserId, providerId));

  await prisma.emailMessage.updateMany({
    where: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.mailboxUserId,
      direction: "outbound",
      providerId: { in: providerIdCandidates },
      bouncedAt: null
    },
    data: {
      bouncedAt: input.sentAt
    }
  });
}

async function findMatchingThread(input: { workspaceId: string; mailboxUserId: string; subject: string; participantEmails: string[] }) {
  const candidates = await prisma.emailThread.findMany({
    where: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.mailboxUserId
    },
    include: {
      messages: {
        select: {
          fromEmail: true,
          toEmail: true,
          ccEmail: true,
          bccEmail: true
        }
      }
    },
    orderBy: { lastMessageAt: "desc" },
    take: 1000
  });

  return (
    candidates.find((thread) =>
      matchesThreadByParticipants(thread, {
        subject: input.subject,
        participantEmails: input.participantEmails
      })
    ) || null
  );
}

function createFallbackProviderId(path: string, uid: number | bigint | undefined) {
  if (uid === undefined || uid === null) {
    return undefined;
  }

  return `imap:${path}:${String(uid)}`;
}

function parseStoredProviderId(providerId: string | null | undefined) {
  const normalized = String(providerId || "").trim();

  if (!normalized) {
    return null;
  }

  const separatorIndex = normalized.indexOf("::");
  const unscoped = separatorIndex >= 0 ? normalized.slice(separatorIndex + 2) : normalized;

  if (unscoped.startsWith("imap:")) {
    const payload = unscoped.slice(5);
    const lastColonIndex = payload.lastIndexOf(":");

    if (lastColonIndex <= 0) {
      return { kind: "messageId" as const, value: unscoped };
    }

    const path = payload.slice(0, lastColonIndex);
    const uidValue = Number(payload.slice(lastColonIndex + 1));

    if (!path || !Number.isFinite(uidValue)) {
      return { kind: "messageId" as const, value: unscoped };
    }

    return {
      kind: "uid" as const,
      path,
      uid: uidValue
    };
  }

  return {
    kind: "messageId" as const,
    value: unscoped
  };
}

function hasSeenFlag(flags: unknown) {
  if (flags instanceof Set) {
    return flags.has("\\Seen");
  }

  if (Array.isArray(flags)) {
    return flags.includes("\\Seen");
  }

  return false;
}

function hasDeletedFlag(flags: unknown) {
  if (flags instanceof Set) {
    return flags.has("\\Deleted");
  }

  if (Array.isArray(flags)) {
    return flags.includes("\\Deleted");
  }

  return false;
}

async function fetchMessageSource(client: ImapFlow, uid: number | bigint | undefined) {
  if (uid === undefined || uid === null) {
    return Buffer.alloc(0);
  }

  const response = await client.fetchOne(String(uid), { source: true }, { uid: true });
  return response && response.source ? response.source : Buffer.alloc(0);
}

function serializeIncomingAttachments(content: ReturnType<typeof extractEmailContentFromMime>) {
  const attachments = (content.attachments || []).filter((attachment) => {
    const isInlineImage =
      attachment.contentType.toLowerCase().startsWith("image/") &&
      (attachment.disposition === "inline" || Boolean(attachment.contentId));
    return !isInlineImage;
  });

  return attachments.length ? JSON.stringify(attachments) : null;
}

function resolveSyncFolders(mailboxes: Array<{ path: string; specialUse?: string | null }>) {
  const chosen = new Map<SyncFolder["kind"], SyncFolder>();

  const pickFolder = (kind: SyncFolder["kind"], path: string) => {
    if (chosen.has(kind)) {
      return;
    }

    chosen.set(kind, { kind, path });
  };

  for (const mailbox of mailboxes) {
    const specialUse = mailbox.specialUse || "";

    if (specialUse === "\\Inbox" || mailbox.path.toUpperCase() === "INBOX") {
      pickFolder("inbox", mailbox.path);
    }

    if (specialUse === "\\Sent") {
      pickFolder("sent", mailbox.path);
    }

    if (specialUse === "\\Junk") {
      pickFolder("junk", mailbox.path);
    }

    if (specialUse === "\\Trash") {
      pickFolder("trash", mailbox.path);
    }
  }

  for (const mailbox of mailboxes) {
    const normalizedPath = mailbox.path.toLowerCase();

    if (normalizedPath === "inbox") {
      pickFolder("inbox", mailbox.path);
    } else if (/(^|[\\/ ._-])(sent|sent items|sent mail|outbox)([\\/ ._-]|$)/i.test(mailbox.path)) {
      pickFolder("sent", mailbox.path);
    } else if (/(^|[\\/ ._-])(junk|spam|bulk)([\\/ ._-]|$)/i.test(mailbox.path)) {
      pickFolder("junk", mailbox.path);
    } else if (/(^|[\\/ ._-])(trash|bin|deleted|deleted items)([\\/ ._-]|$)/i.test(mailbox.path)) {
      pickFolder("trash", mailbox.path);
    }
  }

  if (!chosen.has("inbox")) {
    pickFolder("inbox", "INBOX");
  }

  return Array.from(chosen.values());
}

async function syncMailboxFolder(
  client: ImapFlow,
  folder: SyncFolder,
  input: { workspaceId: string; mailboxUserId: string; accountEmail: string; sinceDate?: Date | null }
) {
  let synced = 0;
  let repaired = 0;
  let updated = 0;
  const lock = await client.getMailboxLock(folder.path);

  try {
    const matchingUids = await client.search(input.sinceDate ? { since: input.sinceDate } : { all: true }, { uid: true });
    const recentUids = (Array.isArray(matchingUids) ? matchingUids : []).slice(-mailboxFetchLimit);

    if (!recentUids.length) {
      return { synced, repaired, updated };
    }

    const fetchedMessages: Array<{
      message: FetchMessageObject;
      rawProviderId: string;
      providerId: string;
    }> = [];

    for await (const message of client.fetch(recentUids, { envelope: true, internalDate: true, flags: true }, { uid: true })) {
      const rawProviderId = message.envelope?.messageId || createFallbackProviderId(folder.path, message.uid);

      if (!rawProviderId) {
        continue;
      }

      const providerId = buildMailboxScopedProviderId(input.mailboxUserId, rawProviderId);

      if (!providerId) {
        continue;
      }

      fetchedMessages.push({ message, rawProviderId, providerId });
    }

    const providerCandidates = Array.from(
      new Set(fetchedMessages.flatMap((item) => getMailboxProviderIdCandidates(input.mailboxUserId, item.rawProviderId)))
    );
    const existingMessages = providerCandidates.length
      ? await prisma.emailMessage.findMany({
          where: {
            workspaceId: input.workspaceId,
            mailboxUserId: input.mailboxUserId,
            providerId: { in: providerCandidates }
          },
          select: {
            id: true,
            body: true,
            bodyHtml: true,
            readAt: true,
            toEmail: true,
            ccEmail: true,
            bccEmail: true,
            attachmentsJson: true,
            threadId: true,
            providerId: true
          }
        })
      : [];
    const existingByProviderId = new Map(existingMessages.map((message) => [message.providerId, message]));

    for (const item of fetchedMessages) {
      const { message, rawProviderId, providerId } = item;

      const from = message.envelope?.from?.[0];
      const subject = message.envelope?.subject || "(No subject)";
      const fromEmail = from?.address || "unknown@example.com";
      const fromName = from?.name || undefined;
      const toEmail = formatEnvelopeAddresses(message.envelope?.to) || input.accountEmail || undefined;
      const ccEmail = formatEnvelopeAddresses(message.envelope?.cc);
      const bccEmail = formatEnvelopeAddresses(message.envelope?.bcc);
      const sentAt = new Date(message.internalDate || new Date());
      const direction = folder.kind === "sent" || normalizeEmail(fromEmail) === normalizeEmail(input.accountEmail) ? "outbound" : "inbound";
      const readAt = direction === "inbound" && hasSeenFlag(message.flags) ? sentAt : null;
      const remoteTrashed = folder.kind === "trash" || hasDeletedFlag(message.flags);

      const existing = getMailboxProviderIdCandidates(input.mailboxUserId, rawProviderId)
        .map((candidate) => existingByProviderId.get(candidate))
        .find(Boolean);

      if (existing) {
        const needsRepair = emailBodyNeedsRepair(existing.body, existing.bodyHtml);
        const shouldSyncReadState = direction === "inbound" && Boolean(existing.readAt) !== Boolean(readAt);
        const shouldSyncRecipients =
          (existing.toEmail || "") !== (toEmail || "") ||
          (existing.ccEmail || "") !== (ccEmail || "") ||
          (existing.bccEmail || "") !== (bccEmail || "");

        if (needsRepair || shouldSyncReadState || shouldSyncRecipients) {
          const source = needsRepair ? await fetchMessageSource(client, message.uid) : null;
          const content = source ? extractEmailContentFromMime(source) : null;
          const body = content?.text.slice(0, 30000) || existing.body;
          const bodyHtml = content?.html.slice(0, 5000000) || existing.bodyHtml;
          const attachmentsJson = content ? serializeIncomingAttachments(content) : existing.attachmentsJson;

          await prisma.emailMessage.update({
            where: { id: existing.id },
            data: {
              ...(shouldSyncReadState ? { readAt } : {}),
              ...(shouldSyncRecipients
                ? {
                    toEmail,
                    ccEmail: ccEmail || null,
                    bccEmail: bccEmail || null
                  }
                : {}),
              ...(needsRepair
                ? {
                    body: body || existing.body,
                    bodyHtml: bodyHtml || null,
                    attachmentsJson
                  }
                : {})
            }
          });

          if (needsRepair) {
            await prisma.emailThread.update({
              where: { id: existing.threadId },
              data: {
                snippet: (body || existing.body || "").slice(0, 180)
              }
            });
          }

          if (needsRepair) {
            repaired += 1;
          }

          if (shouldSyncReadState) {
            updated += 1;
          }
        }

        if (remoteTrashed) {
          const trashResult = await prisma.emailThread.updateMany({
            where: {
              id: existing.threadId,
              workspaceId: input.workspaceId,
              mailboxUserId: input.mailboxUserId,
              trashedAt: null
            },
            data: { trashedAt: new Date() }
          } as never);

          if (trashResult.count > 0) {
            updated += 1;
          }
        }

        continue;
      }

      const source = await fetchMessageSource(client, message.uid);
      const rawSource = source.toString("utf8");
      const content = extractEmailContentFromMime(source);
      const body = content.text.slice(0, 30000);
      const bodyHtml = content.html.slice(0, 5000000);
      const attachmentsJson = serializeIncomingAttachments(content);

      if (direction === "inbound") {
        await markBounceIfNeeded({
          workspaceId: input.workspaceId,
          mailboxUserId: input.mailboxUserId,
          source: rawSource,
          subject,
          fromEmail,
          sentAt
        });
      }

      try {
        const existingThread = await findMatchingThread({
          workspaceId: input.workspaceId,
          mailboxUserId: input.mailboxUserId,
          subject,
          participantEmails: [fromEmail, ...splitEmailList(toEmail || input.accountEmail || ""), ...splitEmailList(ccEmail), ...splitEmailList(bccEmail)]
        });

        const isNewer = existingThread ? sentAt > existingThread.lastMessageAt : true;

        const thread = existingThread
          ? await prisma.emailThread.update({
              where: { id: existingThread.id },
              data: {
                fromName: existingThread.fromName || fromName,
                ...(isNewer && {
                  fromEmail,
                  toEmail,
                  ccEmail: ccEmail || null,
                  bccEmail: bccEmail || null,
                  snippet: body.slice(0, 180),
                  lastMessageAt: sentAt
                }),
                ...(remoteTrashed && { trashedAt: new Date() })
              }
            })
          : await prisma.emailThread.create({
              data: {
                workspaceId: input.workspaceId,
                mailboxUserId: input.mailboxUserId,
                subject,
                fromName,
                fromEmail,
                toEmail,
                ccEmail: ccEmail || null,
                bccEmail: bccEmail || null,
                snippet: body.slice(0, 180),
                lastMessageAt: sentAt,
                ...(remoteTrashed && { trashedAt: new Date() })
              }
            });

        await prisma.emailMessage.create({
          data: {
            workspaceId: input.workspaceId,
            mailboxUserId: input.mailboxUserId,
            threadId: thread.id,
            direction,
            subject,
            fromEmail,
            toEmail,
            ccEmail: ccEmail || null,
            bccEmail: bccEmail || null,
            body,
            bodyHtml: bodyHtml || null,
            attachmentsJson,
            readAt,
            sentAt,
            providerId
          }
        });

        synced += 1;
      } catch (err) {
        console.error("[imap-sync] skipped message", rawProviderId, err instanceof Error ? err.message : err);
      }
    }

    return { synced, repaired, updated };
  } finally {
    lock.release();
  }
}

export async function syncRemoteThreadReadState(input: {
  userId: string;
  workspaceId: string;
  threadIds: string[];
  shouldMarkRead: boolean;
}) {
  const mailbox = await createMailboxClient(input.userId);

  if (!mailbox) {
    return { updated: 0, attempted: 0 };
  }

  const authorizedThreads = await prisma.emailThread.findMany({
    where: {
      id: { in: input.threadIds },
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId
    },
    select: { id: true }
  });
  const authorizedThreadIds = authorizedThreads.map((thread) => thread.id);

  if (!authorizedThreadIds.length) {
    return { updated: 0, attempted: 0 };
  }

  const messages = await prisma.emailMessage.findMany({
    where: {
      threadId: { in: authorizedThreadIds },
      direction: "inbound",
      providerId: { not: null }
    },
    select: {
      providerId: true
    }
  });

  const parsedTargets = messages
    .map((message) => parseStoredProviderId(message.providerId))
    .filter(Boolean) as Array<
    | { kind: "messageId"; value: string }
    | { kind: "uid"; path: string; uid: number }
  >;

  if (!parsedTargets.length) {
    return { updated: 0, attempted: 0 };
  }

  const messageIds = Array.from(
    new Set(
      parsedTargets
        .filter((target): target is { kind: "messageId"; value: string } => target.kind === "messageId")
        .map((target) => target.value)
    )
  );
  const fallbackUidMap = new Map<string, number[]>();

  for (const target of parsedTargets) {
    if (target.kind !== "uid") {
      continue;
    }

    const current = fallbackUidMap.get(target.path) || [];
    if (!current.includes(target.uid)) {
      current.push(target.uid);
      fallbackUidMap.set(target.path, current);
    }
  }

  let attempted = 0;
  let updated = 0;

  try {
    await mailbox.client.connect();
    const mailboxes = await mailbox.client.list();
    const syncFolders = resolveSyncFolders(mailboxes.map((entry) => ({ path: entry.path, specialUse: entry.specialUse })));
    const candidatePaths = Array.from(new Set([...syncFolders.map((folder) => folder.path), ...fallbackUidMap.keys()]));

    for (const path of candidatePaths) {
      const lock = await mailbox.client.getMailboxLock(path);

      try {
        const fallbackUids = fallbackUidMap.get(path) || [];

        if (fallbackUids.length) {
          attempted += fallbackUids.length;
          const changed = input.shouldMarkRead
            ? await mailbox.client.messageFlagsAdd(fallbackUids, ["\\Seen"], { uid: true })
            : await mailbox.client.messageFlagsRemove(fallbackUids, ["\\Seen"], { uid: true });

          if (changed) {
            updated += fallbackUids.length;
          }
        }

        for (const messageId of messageIds) {
          attempted += 1;
          const matchingUidResult = await mailbox.client.search({ header: { "Message-ID": messageId } }, { uid: true });
          const matchingUids = Array.isArray(matchingUidResult) ? matchingUidResult : [];

          if (!matchingUids.length) {
            continue;
          }

          const changed = input.shouldMarkRead
            ? await mailbox.client.messageFlagsAdd(matchingUids, ["\\Seen"], { uid: true })
            : await mailbox.client.messageFlagsRemove(matchingUids, ["\\Seen"], { uid: true });

          if (changed) {
            updated += matchingUids.length;
          }
        }
      } finally {
        lock.release();
      }
    }
  } finally {
    await mailbox.client.logout().catch(() => undefined);
  }

  return { updated, attempted };
}

async function fetchSourceForProviderId(
  client: ImapFlow,
  target: { kind: "messageId"; value: string } | { kind: "uid"; path: string; uid: number },
  fallbackPaths: string[]
) {
  if (target.kind === "uid") {
    const lock = await client.getMailboxLock(target.path);

    try {
      return await fetchMessageSource(client, target.uid);
    } finally {
      lock.release();
    }
  }

  for (const path of fallbackPaths) {
    const lock = await client.getMailboxLock(path);

    try {
      const matchingUidResult = await client.search({ header: { "Message-ID": target.value } }, { uid: true });
      const matchingUids = Array.isArray(matchingUidResult) ? matchingUidResult : [];

      if (!matchingUids.length) {
        continue;
      }

      return await fetchMessageSource(client, matchingUids[0]);
    } finally {
      lock.release();
    }
  }

  return null;
}

export async function repairEmailThreadBodies(input: { userId: string; workspaceId: string; threadId: string }) {
  const mailbox = await createMailboxClient(input.userId);

  if (!mailbox) {
    return { repaired: 0 };
  }

  const messages = await prisma.emailMessage.findMany({
    where: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId,
      threadId: input.threadId,
      providerId: { not: null }
    },
    select: {
      id: true,
      body: true,
      bodyHtml: true,
      providerId: true
    },
    orderBy: { sentAt: "asc" }
  });
  const targets = messages
    .filter((message) => emailBodyNeedsRepair(message.body, message.bodyHtml))
    .map((message) => ({
      message,
      providerTarget: parseStoredProviderId(message.providerId)
    }))
    .filter((item): item is { message: (typeof messages)[number]; providerTarget: NonNullable<ReturnType<typeof parseStoredProviderId>> } =>
      Boolean(item.providerTarget)
    );

  if (!targets.length) {
    return { repaired: 0 };
  }

  let repaired = 0;

  try {
    await mailbox.client.connect();
    const mailboxes = await mailbox.client.list();
    const syncFolders = resolveSyncFolders(mailboxes.map((entry) => ({ path: entry.path, specialUse: entry.specialUse })));
    const fallbackPaths = syncFolders.map((folder) => folder.path);

    for (const target of targets) {
      const source = await fetchSourceForProviderId(mailbox.client, target.providerTarget, fallbackPaths);

      if (!source?.length) {
        continue;
      }

      const content = extractEmailContentFromMime(source);
      const body = content.text.slice(0, 30000) || target.message.body;
      const bodyHtml = content.html.slice(0, 5000000) || target.message.bodyHtml;

      await prisma.emailMessage.update({
        where: { id: target.message.id },
        data: {
          body,
          bodyHtml: bodyHtml || null,
          attachmentsJson: serializeIncomingAttachments(content)
        }
      });
      repaired += 1;
    }

    if (repaired > 0) {
      await prisma.emailThread.update({
        where: { id: input.threadId },
        data: {
          snippet: (messages.find((message) => message.body)?.body || "").slice(0, 180)
        }
      });
    }
  } finally {
    await mailbox.client.logout().catch(() => undefined);
  }

  return { repaired };
}

export async function readEmailMessageAttachment(input: {
  userId: string;
  workspaceId: string;
  messageId: string;
  attachmentIndex: number;
}) {
  const message = await prisma.emailMessage.findFirst({
    where: {
      id: input.messageId,
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId
    },
    select: {
      providerId: true
    }
  });

  if (!message?.providerId) {
    return null;
  }

  const providerTarget = parseStoredProviderId(message.providerId);

  if (!providerTarget) {
    return null;
  }

  const mailbox = await createMailboxClient(input.userId);

  if (!mailbox) {
    throw new Error("Mailbox connection is not available.");
  }

  try {
    await mailbox.client.connect();
    const mailboxes = await mailbox.client.list();
    const syncFolders = resolveSyncFolders(mailboxes.map((entry) => ({ path: entry.path, specialUse: entry.specialUse })));
    const fallbackPaths = syncFolders.map((folder) => folder.path);
    const source = await fetchSourceForProviderId(mailbox.client, providerTarget, fallbackPaths);

    if (!source?.length) {
      return null;
    }

    return extractEmailAttachmentFromMime(source, input.attachmentIndex);
  } finally {
    await mailbox.client.logout().catch(() => undefined);
  }
}

export async function syncRecentInbox(input: { userId: string; workspaceId: string }) {
  const mailbox = await createMailboxClient(input.userId);

  if (!mailbox) {
    return { synced: 0, repaired: 0, updated: 0 };
  }

  const latestStoredMessage = await prisma.emailMessage.findFirst({
    where: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId
    },
    orderBy: { sentAt: "desc" },
    select: { sentAt: true }
  });
  const sinceDate = latestStoredMessage?.sentAt
    ? new Date(latestStoredMessage.sentAt.getTime() - 14 * 24 * 60 * 60 * 1000)
    : null;

  let synced = 0;
  let repaired = 0;
  let updated = 0;

  try {
    await mailbox.client.connect();
    const mailboxes = await mailbox.client.list();
    const folders = resolveSyncFolders(mailboxes.map((mailbox) => ({ path: mailbox.path, specialUse: mailbox.specialUse })));

    for (const folder of folders) {
      try {
        const result = await syncMailboxFolder(mailbox.client, folder, {
          workspaceId: input.workspaceId,
          mailboxUserId: input.userId,
          accountEmail: mailbox.accountEmail,
          sinceDate
        });
        synced += result.synced;
        repaired += result.repaired;
        updated += result.updated;
      } catch (err) {
        console.error("[imap-sync] failed to sync folder", folder.path, err instanceof Error ? err.message : err);
      }
    }
  } finally {
    await mailbox.client.logout().catch(() => undefined);
  }

  return { synced, repaired, updated };
}
