import { z } from "zod";
import { clearStoredMailboxData } from "@/lib/mailbox-maintenance";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { disconnectGoogleMailConnection, findAnyGoogleMailConnectionByUserId, hasGoogleMailScope, isGoogleMailConfigured } from "@/lib/google-mail";
import { getPlatformSettings, isPlatformImapConfigured } from "@/lib/platform-settings";

const imapSchema = z.object({
  imapHost: z.string().min(1),
  imapPort: z.coerce.number().int().min(1).max(65535),
  imapUser: z.string().min(1),
  imapPass: z.string().min(1),
  imapSecure: z.boolean().optional()
});

export async function GET() {
  try {
    const currentUser = await requireUser();
    const [user, platformSettings, googleAuthAvailable] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUser.id },
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
      }),
      getPlatformSettings(),
      isGoogleMailConfigured()
    ]);
    const googleConnection = await findAnyGoogleMailConnectionByUserId(currentUser.id).catch(() => null);

    const workspaceSettings = user?.workspaceId
      ? await prisma.workspaceSetting.findFirst({
          where: { workspaceId: user.workspaceId },
          select: {
            imapHost: true,
            imapPort: true,
            imapUser: true,
            imapPass: true
          }
        })
      : null;
    const personalConfigured = Boolean(
      user?.mailboxSettings?.imapHost &&
        user.mailboxSettings.imapPort &&
        user.mailboxSettings.imapUser &&
        user.mailboxSettings.imapPass
    );
    const workspaceConfigured = Boolean(
      workspaceSettings?.imapHost && workspaceSettings.imapPort && workspaceSettings.imapUser && workspaceSettings.imapPass
    );
    const platformConfigured = isPlatformImapConfigured(platformSettings);
    const googleReady = Boolean(googleConnection && googleConnection.googleEmail && hasGoogleMailScope(googleConnection.scope));
    const configuredSource = googleReady ? "google" : personalConfigured ? "personal" : "none";

    return Response.json({
      imapHost: user?.mailboxSettings?.imapHost || "",
      imapPort: user?.mailboxSettings?.imapPort ? String(user.mailboxSettings.imapPort) : "993",
      imapUser: user?.mailboxSettings?.imapUser || "",
      imapPass: user?.mailboxSettings?.imapPass || "",
      imapSecure: user?.mailboxSettings?.imapSecure ?? true,
      configured: googleReady || personalConfigured,
      googleConnected: Boolean(googleConnection),
      googleEmail: googleConnection?.googleEmail || "",
      googleReady,
      googleAuthAvailable,
      personalConfigured,
      workspaceConfigured,
      platformConfigured,
      configuredSource
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load IMAP settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireUser();
    const raw = await request.json();
    const payload = imapSchema.parse(raw);

    // If the IMAP account email has changed, clear old emails so they don't bleed through
    const existing = await prisma.userMailbox.findUnique({
      where: { userId: currentUser.id },
      select: { imapUser: true }
    });

    const accountChanged =
      existing?.imapUser &&
      existing.imapUser.trim().toLowerCase() !== payload.imapUser.trim().toLowerCase();

    if (accountChanged) {
      await clearStoredMailboxData(currentUser.id);
    }

    const settings = await prisma.userMailbox.upsert({
      where: { userId: currentUser.id },
      update: {
        imapHost: payload.imapHost.trim(),
        imapPort: payload.imapPort,
        imapUser: payload.imapUser.trim(),
        imapPass: payload.imapPass.trim(),
        imapSecure: payload.imapSecure ?? true
      },
      create: {
        userId: currentUser.id,
        imapHost: payload.imapHost.trim(),
        imapPort: payload.imapPort,
        imapUser: payload.imapUser.trim(),
        imapPass: payload.imapPass.trim(),
        imapSecure: payload.imapSecure ?? true
      }
    });

    void settings;

    return GET();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid IMAP settings", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to save IMAP settings" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await requireUser();
    const disconnectGmailIfLast = new URL(request.url).searchParams.get("disconnectGmailIfLast") === "1";
    await prisma.userMailbox.upsert({
      where: { userId: currentUser.id },
      update: {
        imapHost: null,
        imapPort: null,
        imapUser: null,
        imapPass: null
      },
      create: {
        userId: currentUser.id
      }
    });
    let remainingConnection = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
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
    const isGmailStillConnected = Boolean(
      remainingConnection?.googleCalendarConnection?.googleEmail &&
        remainingConnection.googleCalendarConnection.refreshToken &&
        hasGoogleMailScope(remainingConnection.googleCalendarConnection.scope)
    );
    const hasRemainingManualMailbox = Boolean(
      remainingConnection?.mailboxSettings?.smtpHost &&
        remainingConnection.mailboxSettings.smtpPort &&
        remainingConnection.mailboxSettings.smtpUser &&
        remainingConnection.mailboxSettings.smtpPass &&
        remainingConnection.mailboxSettings.smtpFrom
    );
    let gmailDisconnected = false;

    if (disconnectGmailIfLast && !hasRemainingManualMailbox && isGmailStillConnected) {
      await disconnectGoogleMailConnection(currentUser.id);
      gmailDisconnected = true;
      remainingConnection = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
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
    }

    const hasRemainingPersonalMailbox = Boolean(
      (remainingConnection?.mailboxSettings?.smtpHost &&
        remainingConnection.mailboxSettings.smtpPort &&
        remainingConnection.mailboxSettings.smtpUser &&
        remainingConnection.mailboxSettings.smtpPass &&
        remainingConnection.mailboxSettings.smtpFrom) ||
        (remainingConnection?.googleCalendarConnection?.googleEmail &&
          remainingConnection.googleCalendarConnection.refreshToken &&
          hasGoogleMailScope(remainingConnection.googleCalendarConnection.scope))
    );

    if (!hasRemainingPersonalMailbox) {
      await clearStoredMailboxData(currentUser.id);
    }

    const response = await GET();
    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return Response.json({
      ...(payload || {}),
      mailboxCleared: !hasRemainingPersonalMailbox,
      gmailDisconnected
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to clear IMAP settings" }, { status: 500 });
  }
}
