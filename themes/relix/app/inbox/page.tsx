import { unstable_noStore } from "next/cache";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { InboxWorkspace } from "@/components/inbox-workspace";
import { emailWorkspaceThreadListSelect, getEmailWorkspaceThreads } from "@/lib/email-workspace";
import { ensureActiveMailboxData, getPersonalMailboxConnectionState } from "@/lib/mailbox-maintenance";
import { isGoogleMailConfigured } from "@/lib/google-mail";

export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams
}: {
  searchParams: Promise<{ compose?: string; to?: string; subject?: string; message?: string; thread?: string }>;
}) {
  unstable_noStore();
  const params = await searchParams;
  const { user, workspace } = await requireWorkspaceContextForAnyRole();
  const [mailboxState, googleAuthAvailable] = await Promise.all([
    getPersonalMailboxConnectionState(user.id),
    isGoogleMailConfigured()
  ]);
  await ensureActiveMailboxData(user.id, mailboxState);

  const gmailReady = mailboxState.gmailConfigured;
  const canSendEmail = gmailReady || mailboxState.smtpConfigured;
  const canSyncEmail = gmailReady || mailboxState.imapConfigured;
  const hasPersonalMailbox = canSendEmail || canSyncEmail;

  const threads = hasPersonalMailbox
    ? await prisma.emailThread.findMany({
        where: {
          workspaceId: workspace.id,
          mailboxUserId: user.id
        },
        select: emailWorkspaceThreadListSelect,
        orderBy: { lastMessageAt: "desc" }
      })
    : [];

  const initialCompose =
    params.compose === "new"
      ? {
          mode: "new" as const,
          to: params.to || "",
          subject: params.subject || "",
          message: params.message || ""
        }
      : null;

  const workspaceThreads = getEmailWorkspaceThreads(threads);
  const initialSelectedThread = params.thread ? workspaceThreads.find((thread) => thread.id === params.thread) || null : null;

  return (
    <InboxWorkspace
      initialThreads={workspaceThreads}
      initialCompose={initialCompose}
      initialSelectedThreadId={initialSelectedThread?.id || null}
      initialMailbox={initialSelectedThread?.mailbox || "inbox"}
      mailSetup={{
        hasPersonalMailbox,
        canSendEmail,
        canSyncEmail,
        googleAuthAvailable
      }}
    />
  );
}
