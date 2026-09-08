import { NextResponse } from "next/server";

import { getConfiguredAppUrl } from "@/lib/app-url";
import { resolveOrBootstrapAppAccess } from "@/lib/app-access";
import { sendAccountReadyEmail, sendSigninAlertEmail } from "@/lib/auth-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  normalizeWorkspaceRedirectPath,
  resolveWorkspaceSelectionState,
  setActiveWorkspaceCookie,
} from "@/lib/workspace-selection";
import { getWorkspaceSetupState } from "@/lib/workspace-setup-db";

function buildRedirectUrl(baseUrl: string, pathname: string, error?: string) {
  const url = new URL(pathname, baseUrl);

  if (error) {
    url.searchParams.set("error", error);
  }

  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const appUrl = getConfiguredAppUrl(requestUrl.origin);
  const code = requestUrl.searchParams.get("code")?.trim() ?? "";
  const nextPath = normalizeWorkspaceRedirectPath(requestUrl.searchParams.get("next"), "/dashboard");

  if (!code) {
    return NextResponse.redirect(
      buildRedirectUrl(appUrl, "/login", "Google sign-in could not be completed."),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(appUrl, "/login", error.message || "Google sign-in could not be completed."),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      buildRedirectUrl(appUrl, "/login", "Your Google session could not be verified."),
    );
  }

  const access = await resolveOrBootstrapAppAccess(user);
  const selection = access.kind === "workspace"
    ? await resolveWorkspaceSelectionState(user.id)
    : null;
  const setup = access.kind === "workspace"
    ? await getWorkspaceSetupState(user)
    : null;

  if (user.email) {
    try {
      const recipientName =
        user.user_metadata?.full_name?.trim()
        || user.user_metadata?.first_name?.trim()
        || undefined;

      if (access.kind === "workspace" && !setup?.completed) {
        await sendAccountReadyEmail({
          recipientEmail: user.email,
          recipientName,
          actionUrl: new URL("/onboarding/workspace", appUrl).toString(),
          appUrl,
        });
      } else if (access.kind === "client") {
        await sendSigninAlertEmail({
          recipientEmail: user.email,
          recipientName,
          actionUrl: new URL("/portal", appUrl).toString(),
          appUrl,
          signedInAt: new Date(),
        });
      } else {
        await sendSigninAlertEmail({
          recipientEmail: user.email,
          recipientName,
          actionUrl: new URL("/settings", appUrl).toString(),
          appUrl,
          signedInAt: new Date(),
        });
      }
    } catch (emailError) {
      console.error("Failed to send sign-in alert email.", emailError);
    }
  }

  if (access.kind === "client") {
    return NextResponse.redirect(new URL("/portal", appUrl));
  }

  if (selection?.hasMultipleWorkspaces) {
    return NextResponse.redirect(new URL(`/select-workspace?next=${encodeURIComponent(nextPath)}`, appUrl));
  }

  if (!setup?.completed) {
    const response = NextResponse.redirect(new URL("/onboarding/workspace", appUrl));

    if (selection?.selectedWorkspaceId) {
      setActiveWorkspaceCookie(response, selection.selectedWorkspaceId);
    }

    return response;
  }

  const destination = nextPath === "/onboarding/workspace" ? "/dashboard" : nextPath;
  const response = NextResponse.redirect(new URL(destination, appUrl));

  if (selection?.selectedWorkspaceId) {
    setActiveWorkspaceCookie(response, selection.selectedWorkspaceId);
  }

  return response;
}
