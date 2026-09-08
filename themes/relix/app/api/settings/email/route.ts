import { z } from "zod";
import { clearStoredMailboxData } from "@/lib/mailbox-maintenance";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { getSmtpSettings } from "@/lib/email";
import { disconnectGoogleMailConnection, findAnyGoogleMailConnectionByUserId, hasGoogleMailScope, isGoogleMailConfigured } from "@/lib/google-mail";
import { getPlatformSettings, isPlatformSmtpConfigured } from "@/lib/platform-settings";

const smtpSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpUser: z.string().min(1),
  smtpPass: z.string().min(1),
  smtpFrom: z.string().min(1),
  openTrackingEnabled: z.boolean().optional(),
  clickTrackingEnabled: z.boolean().optional()
});

export async function GET() {
  try {
    const currentUser = await requireUser();
    const [user, effectiveSettings, platformSettings, googleAuthAvailable] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUser.id },
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
      }),
      getSmtpSettings(currentUser.id, { personalOnly: true }),
      getPlatformSettings(),
      isGoogleMailConfigured()
    ]);
    const googleConnection = await findAnyGoogleMailConnectionByUserId(currentUser.id).catch(() => null);

    const workspaceSettings = user?.workspaceId
      ? await prisma.workspaceSetting.findFirst({
          where: { workspaceId: user.workspaceId },
          select: {
            smtpHost: true,
            smtpPort: true,
            smtpUser: true,
            smtpPass: true,
            smtpFrom: true
          }
        })
      : null;

    const personalConfigured = Boolean(
      user?.mailboxSettings?.smtpHost &&
        user.mailboxSettings.smtpPort &&
        user.mailboxSettings.smtpUser &&
        user.mailboxSettings.smtpPass &&
        user.mailboxSettings.smtpFrom
    );
    const workspaceConfigured = Boolean(workspaceSettings?.smtpHost && workspaceSettings.smtpPort && workspaceSettings.smtpUser && workspaceSettings.smtpPass && workspaceSettings.smtpFrom);
    const platformConfigured = isPlatformSmtpConfigured(platformSettings);
    const googleReady = Boolean(googleConnection && googleConnection.googleEmail && hasGoogleMailScope(googleConnection.scope));
    const configuredSource = googleReady ? "google" : personalConfigured ? "personal" : "none";

    return Response.json({
      smtpHost: user?.mailboxSettings?.smtpHost || "",
      smtpPort: user?.mailboxSettings?.smtpPort ? String(user.mailboxSettings.smtpPort) : "587",
      smtpUser: user?.mailboxSettings?.smtpUser || "",
      smtpPass: user?.mailboxSettings?.smtpPass || "",
      smtpFrom: user?.mailboxSettings?.smtpFrom || "",
      openTrackingEnabled: effectiveSettings.openTrackingEnabled,
      clickTrackingEnabled: effectiveSettings.clickTrackingEnabled,
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
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load email settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireUser();
    const raw = await request.json();
    const payload = smtpSchema.parse(raw);

    const settings = await prisma.userMailbox.upsert({
      where: { userId: currentUser.id },
      update: {
        smtpHost: payload.smtpHost.trim(),
        smtpPort: payload.smtpPort,
        smtpUser: payload.smtpUser.trim(),
        smtpPass: payload.smtpPass.trim(),
        smtpFrom: payload.smtpFrom.trim(),
        openTrackingEnabled: payload.openTrackingEnabled ?? true,
        clickTrackingEnabled: payload.clickTrackingEnabled ?? true
      },
      create: {
        userId: currentUser.id,
        smtpHost: payload.smtpHost.trim(),
        smtpPort: payload.smtpPort,
        smtpUser: payload.smtpUser.trim(),
        smtpPass: payload.smtpPass.trim(),
        smtpFrom: payload.smtpFrom.trim(),
        openTrackingEnabled: payload.openTrackingEnabled ?? true,
        clickTrackingEnabled: payload.clickTrackingEnabled ?? true
      }
    });

    void settings;

    return GET();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid SMTP settings", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to save email settings" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await requireUser();
    const disconnectGmailIfLast = new URL(request.url).searchParams.get("disconnectGmailIfLast") === "1";
    await prisma.userMailbox.upsert({
      where: { userId: currentUser.id },
      update: {
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpPass: null,
        smtpFrom: null
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
            imapHost: true,
            imapPort: true,
            imapUser: true,
            imapPass: true
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
      remainingConnection?.mailboxSettings?.imapHost &&
        remainingConnection.mailboxSettings.imapPort &&
        remainingConnection.mailboxSettings.imapUser &&
        remainingConnection.mailboxSettings.imapPass
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
              imapHost: true,
              imapPort: true,
              imapUser: true,
              imapPass: true
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
      (remainingConnection?.mailboxSettings?.imapHost &&
        remainingConnection.mailboxSettings.imapPort &&
        remainingConnection.mailboxSettings.imapUser &&
        remainingConnection.mailboxSettings.imapPass) ||
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
    return Response.json({ error: error instanceof Error ? error.message : "Unable to clear email settings" }, { status: 500 });
  }
}
