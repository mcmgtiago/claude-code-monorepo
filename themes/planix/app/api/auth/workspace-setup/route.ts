import { NextResponse } from "next/server";

import { completeWorkspaceSetup, getWorkspaceSetupState } from "@/lib/workspace-setup-db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

function messageFromError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Workspace setup request failed.";
}

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue workspace setup." }, { status: 401 });
  }

  try {
    const setup = await getWorkspaceSetupState(user);
    return NextResponse.json({ ok: true, setup });
  } catch (error) {
    return NextResponse.json({ error: messageFromError(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue workspace setup." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      workspaceName?: string;
      invites?: string[];
    };

    const setup = await completeWorkspaceSetup(user, {
      workspaceName: body.workspaceName?.trim() ?? "",
      invites: Array.isArray(body.invites) ? body.invites : [],
    });

    return NextResponse.json({ ok: true, setup });
  } catch (error) {
    return NextResponse.json({ error: messageFromError(error) }, { status: 400 });
  }
}
