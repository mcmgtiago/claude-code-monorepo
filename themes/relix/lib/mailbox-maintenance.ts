import { hasGoogleMailScope } from "@/lib/google-mail";
import { prisma } from "@/lib/prisma";

export async function clearStoredMailboxData(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.emailMessage.deleteMany({
      where: {
        mailboxUserId: userId
      }
    });

    await tx.emailThread.deleteMany({
      where: {
        mailboxUserId: userId
      }
    });
  });
}

export async function hasAnyPersonalMailboxConnection(userId: string) {
  const state = await getPersonalMailboxConnectionState(userId);
  return state.smtpConfigured || state.imapConfigured || state.gmailConfigured;
}

export async function hasAnyPersonalMailboxSyncConnection(userId: string) {
  const state = await getPersonalMailboxConnectionState(userId);
  return state.imapConfigured || state.gmailConfigured;
}

export async function getPersonalMailboxConnectionState(userId: string) {
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

  const smtpConfigured = Boolean(
    user?.mailboxSettings?.smtpHost &&
      user.mailboxSettings.smtpPort &&
      user.mailboxSettings.smtpUser &&
      user.mailboxSettings.smtpPass &&
      user.mailboxSettings.smtpFrom
  );
  const imapConfigured = Boolean(
    user?.mailboxSettings?.imapHost &&
      user.mailboxSettings.imapPort &&
      user.mailboxSettings.imapUser &&
      user.mailboxSettings.imapPass
  );
  const gmailConfigured = Boolean(
    user?.googleCalendarConnection?.googleEmail &&
      user.googleCalendarConnection.refreshToken &&
      hasGoogleMailScope(user.googleCalendarConnection.scope)
  );

  return {
    smtpConfigured,
    imapConfigured,
    gmailConfigured
  };
}

export async function ensureActiveMailboxData(
  userId: string,
  state?: Awaited<ReturnType<typeof getPersonalMailboxConnectionState>>
) {
  const mailboxState = state || (await getPersonalMailboxConnectionState(userId));
  const hasActiveMailbox = mailboxState.smtpConfigured || mailboxState.imapConfigured || mailboxState.gmailConfigured;

  if (!hasActiveMailbox) {
    await clearStoredMailboxData(userId);
  }

  return hasActiveMailbox;
}

export async function backfillMailboxMessageOwnership(input: { userId: string; workspaceId: string }) {
  const threads = await prisma.emailThread.findMany({
    where: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId
    },
    select: { id: true }
  });
  const threadIds = threads.map((thread) => thread.id);

  if (!threadIds.length) {
    return 0;
  }

  const result = await prisma.emailMessage.updateMany({
    where: {
      threadId: { in: threadIds },
      OR: [
        { workspaceId: null },
        { workspaceId: { not: input.workspaceId } },
        { mailboxUserId: null },
        { mailboxUserId: { not: input.userId } }
      ]
    },
    data: {
      workspaceId: input.workspaceId,
      mailboxUserId: input.userId
    }
  });

  return result.count;
}
