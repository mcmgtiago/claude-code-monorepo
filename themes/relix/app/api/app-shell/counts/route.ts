import { getCurrentUser } from "@/lib/auth-server";
import { emailWorkspaceThreadListSelect, getEmailWorkspaceThreads } from "@/lib/email-workspace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store"
};

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json({
        unreadNotificationsCount: 0,
        upcomingMeetingsCount: 0,
        openConversationsCount: 0
      }, { headers: noStoreHeaders });
    }

    if (!currentUser.workspaceId) {
      const unreadNotificationsCount = await prisma.appNotification.count({
        where: { userId: currentUser.id, readAt: null }
      });

      return Response.json({
        unreadNotificationsCount,
        upcomingMeetingsCount: 0,
        openConversationsCount: 0
      }, { headers: noStoreHeaders });
    }

    const [unreadNotificationsCount, upcomingMeetingsCount, unreadThreads] = await Promise.all([
      prisma.appNotification.count({
        where: { userId: currentUser.id, readAt: null }
      }),
      prisma.meetingEvent.count({
        where: { workspaceId: currentUser.workspaceId, startsAt: { gte: new Date() } }
      }),
      prisma.emailThread.findMany({
        where: {
          workspaceId: currentUser.workspaceId,
          mailboxUserId: currentUser.id,
          trashedAt: null,
          messages: {
            some: {
              direction: "inbound",
              readAt: null
            }
          }
        },
        select: emailWorkspaceThreadListSelect
      })
    ]);
    const openConversationsCount = getEmailWorkspaceThreads(unreadThreads).filter((thread) => thread.mailbox === "inbox" && thread.unreadCount > 0).length;

    return Response.json({
      unreadNotificationsCount,
      upcomingMeetingsCount,
      openConversationsCount
    }, { headers: noStoreHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load shell counts" }, { status: 500, headers: noStoreHeaders });
  }
}
