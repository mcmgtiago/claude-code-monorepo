import { disconnectGoogleMailConnection } from "@/lib/google-mail";
import { clearStoredMailboxData } from "@/lib/mailbox-maintenance";
import { requireUser } from "@/lib/auth-server";

export async function POST() {
  try {
    const currentUser = await requireUser();
    const result = await disconnectGoogleMailConnection(currentUser.id);
    await clearStoredMailboxData(currentUser.id);

    return Response.json({
      ok: true,
      mailboxCleared: true,
      calendarStillConnected: result.calendarStillConnected
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to disconnect Gmail" }, { status: 500 });
  }
}
