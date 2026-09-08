import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { DEMO_SESSION_COOKIE, hasDemoSessionCookie, readDemoCookie } from "@/lib/demo-session";
import { deleteWorkspaceForOwner, DestructiveActionError } from "@/lib/destructive-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

function messageFromError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Workspace deletion failed.";
}

export async function DELETE() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if ((!user || error) && hasDemoSessionCookie(readDemoCookie(cookieStore, DEMO_SESSION_COOKIE))) {
    return NextResponse.json(
      { error: "Workspace deletion is disabled for demo sessions." },
      { status: 400 },
    );
  }

  if (error || !user) {
    return NextResponse.json({ error: "Please sign in to delete this workspace." }, { status: 401 });
  }

  try {
    const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
    const deleted = await deleteWorkspaceForOwner(user.id, workspaceId);

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    const status = error instanceof DestructiveActionError ? error.status : 500;
    return NextResponse.json({ error: messageFromError(error) }, { status });
  }
}
