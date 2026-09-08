import { disconnectGoogleCalendarConnection } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function POST() {
  const { user: currentUser, workspace } = await requireWorkspaceContext();

  await disconnectGoogleCalendarConnection(currentUser.id);
  await prisma.meetingPreference.updateMany({
    where: { workspaceId: workspace.id },
    data: { googleMeetConnected: false }
  });

  return Response.json({
    ok: true
  });
}
