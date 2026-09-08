import nodemailer from "nodemailer";
import { type EmailAttachmentMeta } from "@/lib/email-attachments";
import { buildMailboxScopedProviderId } from "@/lib/email-provider-id";
import { buildPasswordResetEmail, buildSignInAlertEmail, buildTeamInviteEmail, buildWelcomeEmail } from "@/lib/email-html";
import { extractEmailAddress, matchesThreadByParticipants, splitEmailList } from "@/lib/email-threading";
import { getAppBaseUrl } from "@/lib/app-url";
import { findGoogleMailConnectionByUserId, getFreshGoogleMailConnectionByUserId, hasGoogleMailScope } from "@/lib/google-mail";
import { getPlatformSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";

export type EmailAttachmentInput = {
  fileName: string;
  contentType: string;
  size: number;
  content: Buffer;
};

type SmtpSettings = {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
};

type SmtpResolutionOptions = {
  personalOnly?: boolean;
};

function sanitizeHeaderValue(value: string | null | undefined) {
  const normalized = (value || "").trim();
  return normalized.length ? normalized : null;
}

function sanitizePortValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value || "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function readPlatformSmtpSettings(): Promise<SmtpSettings> {
  const platform = await getPlatformSettings();
  return {
    smtpHost: sanitizeHeaderValue(platform.smtpHost),
    smtpPort: sanitizePortValue(platform.smtpPort) || 587,
    smtpUser: sanitizeHeaderValue(platform.smtpUser),
    smtpPass: sanitizeHeaderValue(platform.smtpPass),
    smtpFrom: sanitizeHeaderValue(platform.smtpFrom),
    openTrackingEnabled: platform.openTrackingEnabled,
    clickTrackingEnabled: platform.clickTrackingEnabled
  };
}

async function readSystemSmtpSettings(): Promise<SmtpSettings> {
  const platform = await readPlatformSmtpSettings();
  const superuser = await prisma.user.findFirst({
    where: {
      accessRole: "SUPERUSER",
      status: "ACTIVE",
      mailboxSettings: {
        isNot: null
      }
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      mailboxSettings: {
        select: {
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPass: true,
          smtpFrom: true,
          openTrackingEnabled: true,
          clickTrackingEnabled: true
        }
      }
    }
  });

  return {
    smtpHost: sanitizeHeaderValue(superuser?.mailboxSettings?.smtpHost) || platform.smtpHost,
    smtpPort: sanitizePortValue(superuser?.mailboxSettings?.smtpPort) || platform.smtpPort,
    smtpUser: sanitizeHeaderValue(superuser?.mailboxSettings?.smtpUser) || platform.smtpUser,
    smtpPass: sanitizeHeaderValue(superuser?.mailboxSettings?.smtpPass) || platform.smtpPass,
    smtpFrom: sanitizeHeaderValue(superuser?.mailboxSettings?.smtpFrom) || platform.smtpFrom,
    openTrackingEnabled: superuser?.mailboxSettings?.openTrackingEnabled ?? platform.openTrackingEnabled,
    clickTrackingEnabled: superuser?.mailboxSettings?.clickTrackingEnabled ?? platform.clickTrackingEnabled
  };
}

async function readWorkspaceSmtpSettings(workspaceId: string | null | undefined): Promise<SmtpSettings> {
  const platform = await readPlatformSmtpSettings();

  if (!workspaceId) {
    return platform;
  }

  const settings = await prisma.workspaceSetting.findFirst({
    where: { workspaceId },
    select: {
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpPass: true,
      smtpFrom: true,
      openTrackingEnabled: true,
      clickTrackingEnabled: true
    }
  });

  return {
    smtpHost: sanitizeHeaderValue(settings?.smtpHost) || platform.smtpHost,
    smtpPort: sanitizePortValue(settings?.smtpPort) || platform.smtpPort,
    smtpUser: sanitizeHeaderValue(settings?.smtpUser) || platform.smtpUser,
    smtpPass: sanitizeHeaderValue(settings?.smtpPass) || platform.smtpPass,
    smtpFrom: sanitizeHeaderValue(settings?.smtpFrom) || platform.smtpFrom,
    openTrackingEnabled: settings?.openTrackingEnabled ?? platform.openTrackingEnabled,
    clickTrackingEnabled: settings?.clickTrackingEnabled ?? platform.clickTrackingEnabled
  };
}

async function readPersonalSmtpSettings(userId: string): Promise<SmtpSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mailboxSettings: {
        select: {
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPass: true,
          smtpFrom: true,
          openTrackingEnabled: true,
          clickTrackingEnabled: true
        }
      }
    }
  });

  return {
    smtpHost: sanitizeHeaderValue(user?.mailboxSettings?.smtpHost),
    smtpPort: sanitizePortValue(user?.mailboxSettings?.smtpPort) || 587,
    smtpUser: sanitizeHeaderValue(user?.mailboxSettings?.smtpUser),
    smtpPass: sanitizeHeaderValue(user?.mailboxSettings?.smtpPass),
    smtpFrom: sanitizeHeaderValue(user?.mailboxSettings?.smtpFrom),
    openTrackingEnabled: user?.mailboxSettings?.openTrackingEnabled ?? true,
    clickTrackingEnabled: user?.mailboxSettings?.clickTrackingEnabled ?? true
  };
}

async function readStoredSmtpSettings(userId?: string): Promise<SmtpSettings> {
  if (!userId) {
    return readSystemSmtpSettings();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      workspaceId: true,
      mailboxSettings: {
        select: {
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPass: true,
          smtpFrom: true,
          openTrackingEnabled: true,
          clickTrackingEnabled: true
        }
      }
    }
  });

  const workspace = await readWorkspaceSmtpSettings(user?.workspaceId);

  return {
    smtpHost: sanitizeHeaderValue(user?.mailboxSettings?.smtpHost) || workspace.smtpHost,
    smtpPort: sanitizePortValue(user?.mailboxSettings?.smtpPort) || workspace.smtpPort,
    smtpUser: sanitizeHeaderValue(user?.mailboxSettings?.smtpUser) || workspace.smtpUser,
    smtpPass: sanitizeHeaderValue(user?.mailboxSettings?.smtpPass) || workspace.smtpPass,
    smtpFrom: sanitizeHeaderValue(user?.mailboxSettings?.smtpFrom) || workspace.smtpFrom,
    openTrackingEnabled: user?.mailboxSettings?.openTrackingEnabled ?? workspace.openTrackingEnabled,
    clickTrackingEnabled: user?.mailboxSettings?.clickTrackingEnabled ?? workspace.clickTrackingEnabled
  };
}

function validateSmtpSettings(settings: SmtpSettings) {
  const required: Array<keyof SmtpSettings> = ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"];
  const missing = required.filter((key) => !settings[key]);

  if (missing.length) {
    throw new Error(`Email sending is not configured. Missing: ${missing.join(", ")}`);
  }

  const placeholders = [settings.smtpHost, settings.smtpUser, settings.smtpFrom, settings.smtpPass]
    .filter(Boolean)
    .some((value) => /yourprovider\.com|example\.com|your-app-password/i.test(String(value)));

  if (placeholders) {
    throw new Error("Email sending is not configured. Replace placeholder SMTP values.");
  }
}

export async function getSmtpSettings(userId?: string, options?: SmtpResolutionOptions) {
  const settings =
    userId && options?.personalOnly ? await readPersonalSmtpSettings(userId) : await readStoredSmtpSettings(userId);

  return {
    smtpHost: settings.smtpHost || "",
    smtpPort: String(settings.smtpPort || 587),
    smtpUser: settings.smtpUser || "",
    smtpPass: settings.smtpPass || "",
    smtpFrom: settings.smtpFrom || "",
    openTrackingEnabled: settings.openTrackingEnabled,
    clickTrackingEnabled: settings.clickTrackingEnabled,
    configured: Boolean(settings.smtpHost && settings.smtpUser && settings.smtpPass && settings.smtpFrom)
  };
}

export async function isSmtpConfigured(userId?: string, options?: SmtpResolutionOptions) {
  try {
    if (userId) {
      const googleConnection = await findGoogleMailConnectionByUserId(userId);

      if (googleConnection) {
        return true;
      }
    }

    const settings =
      userId && options?.personalOnly ? await readPersonalSmtpSettings(userId) : await readStoredSmtpSettings(userId);
    validateSmtpSettings(settings);
    return true;
  } catch {
    return false;
  }
}

function hasPersonalMailboxConfigured(input: {
  mailboxSettings?: {
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    smtpFrom?: string | null;
  } | null;
  googleCalendarConnection?: {
    googleEmail?: string | null;
    refreshToken?: string | null;
    scope?: string | null;
  } | null;
}) {
  const smtpReady = Boolean(
    sanitizeHeaderValue(input.mailboxSettings?.smtpHost) &&
      sanitizePortValue(input.mailboxSettings?.smtpPort) &&
      sanitizeHeaderValue(input.mailboxSettings?.smtpUser) &&
      sanitizeHeaderValue(input.mailboxSettings?.smtpPass) &&
      sanitizeHeaderValue(input.mailboxSettings?.smtpFrom)
  );
  const googleReady = Boolean(
    input.googleCalendarConnection?.googleEmail &&
      input.googleCalendarConnection?.refreshToken &&
      hasGoogleMailScope(input.googleCalendarConnection?.scope)
  );

  return smtpReady || googleReady;
}

export async function getPreferredWorkspaceSenderUserId(workspaceId: string) {
  const candidates = await prisma.user.findMany({
    where: {
      workspaceId,
      status: "ACTIVE",
      accessRole: {
        in: ["ADMIN", "MANAGER", "SUPERUSER"]
      }
    },
    select: {
      id: true,
      accessRole: true,
      createdAt: true,
      mailboxSettings: {
        select: {
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPass: true,
          smtpFrom: true
        }
      },
      googleCalendarConnection: {
        select: {
          googleEmail: true,
          refreshToken: true,
          scope: true
        }
      }
    }
  });

  if (!candidates.length) {
    return null;
  }

  const roleRank: Record<string, number> = {
    ADMIN: 0,
    MANAGER: 1,
    SUPERUSER: 2
  };

  const ordered = [...candidates].sort((left, right) => {
    const roleDelta = (roleRank[left.accessRole] ?? 99) - (roleRank[right.accessRole] ?? 99);

    if (roleDelta !== 0) {
      return roleDelta;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });

  const personalSender = ordered.find((candidate) => hasPersonalMailboxConfigured(candidate));

  return personalSender?.id || ordered[0]?.id || null;
}

async function getSmtpTransport(userId?: string, options?: SmtpResolutionOptions) {
  if (userId) {
    const googleConnection = await getFreshGoogleMailConnectionByUserId(userId).catch(() => null);

    if (googleConnection) {
      const fallbackSettings =
        options?.personalOnly ? await readPersonalSmtpSettings(userId) : await readStoredSmtpSettings(userId);

      return {
        transport: nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: googleConnection.connection.googleEmail,
            clientId: googleConnection.clientId,
            clientSecret: googleConnection.clientSecret,
            refreshToken: googleConnection.connection.refreshToken,
            accessToken: googleConnection.accessToken
          }
        }),
        settings: {
          ...fallbackSettings,
          smtpUser: googleConnection.connection.googleEmail,
          smtpFrom: googleConnection.connection.googleEmail
        }
      };
    }
  }

  const settings =
    userId && options?.personalOnly ? await readPersonalSmtpSettings(userId) : await readStoredSmtpSettings(userId);
  validateSmtpSettings(settings);

  return {
    transport: nodemailer.createTransport({
      host: settings.smtpHost!,
      port: settings.smtpPort!,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser!,
        pass: settings.smtpPass!
      }
    }),
    settings
  };
}

export async function sendSystemEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  senderUserId?: string;
}) {
  const { transport, settings } = await getSmtpTransport(input.senderUserId);
  const fromHeader = await formatBrandFromHeader(settings.smtpFrom || settings.smtpUser || "unknown@example.com");

  await transport.sendMail({
    from: fromHeader,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html || wrapTextAsHtml(input.text)
  });
}

async function getPublicAppUrl() {
  const baseUrl = sanitizeHeaderValue(await getAppBaseUrl());
  return baseUrl ? baseUrl.replace(/\/$/, "") : null;
}

function wrapTextAsHtml(text: string) {
  const safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:1.7">${safeText.replace(/\n/g, "<br/>")}</div>`;
}

async function formatBrandFromHeader(value: string | null | undefined) {
  const platform = await getPlatformSettings();
  const emailBrandName = sanitizeHeaderValue(platform.appName) || "Relix";
  const normalized = sanitizeHeaderValue(value);

  if (!normalized) {
    return `"${emailBrandName}" <unknown@example.com>`;
  }

  const email = extractEmailAddress(normalized);
  if (!email) {
    return normalized;
  }

  return `"${emailBrandName}" <${email}>`;
}

function injectClickTracking(html: string, baseUrl: string, trackingToken: string) {
  return html.replace(/<a\b([^>]*?)href=(["'])(https?:\/\/[^"']+)\2([^>]*)>/gi, (_match, before, quote, url, after) => {
    const trackedUrl = new URL(`/api/email/click/${trackingToken}`, baseUrl);
    trackedUrl.searchParams.set("url", url);
    return `<a${before}href=${quote}${trackedUrl.toString()}${quote}${after}>`;
  });
}

function injectOpenTracking(html: string, baseUrl: string, trackingToken: string) {
  const pixelUrl = new URL(`/api/email/open/${trackingToken}`, baseUrl).toString();
  const pixel = `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;opacity:0" />`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${pixel}</body>`);
  }

  return `${html}${pixel}`;
}

function toPlainText(input: { text?: string; html?: string }) {
  if (input.text?.trim()) {
    return input.text.trim();
  }

  return (input.html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function findMatchingThread(input: {
  workspaceId: string;
  mailboxUserId: string;
  threadId?: string;
  subject: string;
  participantEmails: string[];
}) {
  if (input.threadId) {
    const directMatch = await prisma.emailThread.findUnique({
      where: { id: input.threadId },
      include: {
        messages: {
          select: {
            fromEmail: true,
            toEmail: true,
            ccEmail: true,
            bccEmail: true
          }
        }
      }
    });

    if (directMatch && directMatch.workspaceId === input.workspaceId && directMatch.mailboxUserId === input.mailboxUserId) {
      return directMatch;
    }
  }

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
    take: 200
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

export async function sendTrackedEmail(input: {
  userId: string;
  workspaceId: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html?: string;
  text?: string;
  threadId?: string;
  attachments?: EmailAttachmentInput[];
  personalOnly?: boolean;
}) {
  const { transport, settings } = await getSmtpTransport(input.userId, { personalOnly: input.personalOnly });
  const sender = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { fullName: true }
  });
  const fromHeader = await formatBrandFromHeader(settings.smtpFrom || settings.smtpUser || "unknown@example.com");
  const fromEmail = extractEmailAddress(fromHeader) || extractEmailAddress(settings.smtpUser) || "unknown@example.com";
  const toEmail = splitEmailList(input.to).join(", ");
  const ccEmail = splitEmailList(input.cc).join(", ");
  const bccEmail = splitEmailList(input.bcc).join(", ");
  const plainText = toPlainText(input);
  const baseHtml = input.html?.trim() ? input.html : wrapTextAsHtml(input.text || plainText);
  const trackingToken = crypto.randomUUID();
  const publicAppUrl = await getPublicAppUrl();
  const htmlWithClickTracking =
    publicAppUrl && settings.clickTrackingEnabled ? injectClickTracking(baseHtml, publicAppUrl, trackingToken) : baseHtml;
  const trackedHtml =
    publicAppUrl && settings.openTrackingEnabled ? injectOpenTracking(htmlWithClickTracking, publicAppUrl, trackingToken) : htmlWithClickTracking;
  const sentAt = new Date();
  const attachmentMeta = (input.attachments || []).map((attachment) => ({
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    size: attachment.size
  }));

  const result = await transport.sendMail({
    from: fromHeader,
    to: toEmail,
    cc: ccEmail || undefined,
    bcc: bccEmail || undefined,
    subject: input.subject,
    html: trackedHtml,
    text: input.text || plainText,
    attachments: (input.attachments || []).map((attachment) => ({
      filename: attachment.fileName,
      content: attachment.content,
      contentType: attachment.contentType
    }))
  });
  const providerId = buildMailboxScopedProviderId(input.userId, result.messageId) || result.messageId || null;

  const existingThread = await findMatchingThread({
    workspaceId: input.workspaceId,
    mailboxUserId: input.userId,
    threadId: input.threadId,
    subject: input.subject,
    participantEmails: [fromEmail, ...splitEmailList(toEmail), ...splitEmailList(ccEmail), ...splitEmailList(bccEmail)]
  });

  const thread = existingThread
    ? await prisma.emailThread.update({
        where: { id: existingThread.id },
        data: {
          subject: existingThread.subject,
          fromEmail,
          toEmail,
          ccEmail: ccEmail || null,
          bccEmail: bccEmail || null,
          snippet: plainText.slice(0, 180),
          lastMessageAt: sentAt
        }
      })
    : await prisma.emailThread.create({
        data: {
          workspaceId: input.workspaceId,
          mailboxUserId: input.userId,
          subject: input.subject,
          fromName: sender?.fullName || null,
          fromEmail,
          toEmail,
          ccEmail: ccEmail || null,
          bccEmail: bccEmail || null,
          snippet: plainText.slice(0, 180),
          lastMessageAt: sentAt
        }
      });

  await prisma.emailMessage.create({
    data: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId,
      threadId: thread.id,
      direction: "outbound",
      subject: input.subject,
      fromEmail,
      toEmail,
      ccEmail: ccEmail || null,
      bccEmail: bccEmail || null,
      body: plainText,
      bodyHtml: baseHtml || null,
      attachmentsJson: attachmentMeta.length ? JSON.stringify(attachmentMeta) : null,
      trackingToken,
      sentAt,
      providerId
    }
  });

  return {
    messageId: result.messageId,
    threadId: thread.id
  };
}

export async function sendPasswordResetEmail(input: {
  to: string;
  fullName: string;
  resetUrl: string;
}) {
  const { transport, settings } = await getSmtpTransport();
  const platform = await getPlatformSettings();
  const fromHeader = await formatBrandFromHeader(settings.smtpFrom || settings.smtpUser || "unknown@example.com");

  await transport.sendMail({
    from: fromHeader,
    to: input.to,
    subject: `Reset your password — ${platform.appName || "Relix"} CRM`,
    html: buildPasswordResetEmail({ recipientName: input.fullName, resetUrl: input.resetUrl })
  });
}

export async function sendWelcomeEmail(input: { to: string; fullName: string }) {
  try {
    const { transport, settings } = await getSmtpTransport();
    const platform = await getPlatformSettings();
    const appUrl = await getAppBaseUrl();
    const fromHeader = await formatBrandFromHeader(settings.smtpFrom || settings.smtpUser || "unknown@example.com");
    await transport.sendMail({
      from: fromHeader,
      to: input.to,
      subject: `Welcome to ${platform.appName || "Relix"} CRM 👋`,
      html: buildWelcomeEmail({
        recipientName: input.fullName,
        appName: platform.appName || "Relix",
        appUrl
      })
    });
  } catch {
    // Non-critical — don't block signup if email fails
  }
}

export async function sendSignInAlertEmail(input: { to: string; fullName: string; signedInAt: string }) {
  try {
    const { transport, settings } = await getSmtpTransport();
    const platform = await getPlatformSettings();
    const appUrl = await getAppBaseUrl();
    const fromHeader = await formatBrandFromHeader(settings.smtpFrom || settings.smtpUser || "unknown@example.com");
    await transport.sendMail({
      from: fromHeader,
      to: input.to,
      subject: `New sign-in to your ${platform.appName || "Relix"} CRM account`,
      html: buildSignInAlertEmail({
        recipientName: input.fullName,
        email: input.to,
        signedInAt: input.signedInAt,
        appName: platform.appName || "Relix",
        appUrl
      })
    });
  } catch {
    // Non-critical — don't block login if email fails
  }
}

export async function sendTeamInviteEmail(input: {
  to: string;
  invitedByName: string;
  roleLabel: string;
  inviteUrl: string;
  senderUserId?: string;
}) {
  let transportResult: Awaited<ReturnType<typeof getSmtpTransport>>;

  try {
    transportResult = await getSmtpTransport(input.senderUserId);
  } catch {
    transportResult = await getSmtpTransport();
  }

  const { transport, settings } = transportResult;
  const fromHeader = await formatBrandFromHeader(settings.smtpFrom || settings.smtpUser || "unknown@example.com");
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";

  await transport.sendMail({
    from: fromHeader,
    to: input.to,
    subject: `You've been invited to ${appName}`,
    html: buildTeamInviteEmail({
      recipientName: input.to.split("@")[0],
      invitedByName: input.invitedByName,
      roleLabel: input.roleLabel,
      appName,
      inviteUrl: input.inviteUrl
    })
  });
}
