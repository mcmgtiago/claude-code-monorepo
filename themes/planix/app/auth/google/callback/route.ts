import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getConfiguredAppUrl } from "@/lib/app-url";
import { resolveOrBootstrapAppAccess } from "@/lib/app-access";
import { sendAccountReadyEmail, sendSigninAlertEmail } from "@/lib/auth-email";
import {
  GOOGLE_LOCAL_AUTH_STATE_COOKIE,
  getGoogleCallbackUrl,
  getGoogleClientId,
  getGoogleClientSecret,
  normalizeAuthNextPath,
  readGoogleAuthState,
} from "@/lib/google-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceSelectionState, setActiveWorkspaceCookie } from "@/lib/workspace-selection";
import { getWorkspaceSetupState } from "@/lib/workspace-setup-db";

function buildRedirectUrl(baseUrl: string, pathname: string, error?: string) {
  const url = new URL(pathname, baseUrl);

  if (error) {
    url.searchParams.set("error", error);
  }

  return url;
}

function redirectWithGoogleStateCleared(baseUrl: string, pathname: string, error?: string) {
  const response = NextResponse.redirect(buildRedirectUrl(baseUrl, pathname, error));

  response.cookies.set(GOOGLE_LOCAL_AUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

async function exchangeGoogleCodeForTokens(code: string, requestOrigin: string) {
  const [clientId, clientSecret] = await Promise.all([
    getGoogleClientId(),
    getGoogleClientSecret(),
  ]);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleCallbackUrl(requestOrigin),
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        access_token?: string;
        error?: string;
        error_description?: string;
        id_token?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.error || "Google sign-in could not be completed.");
  }

  if (!payload?.id_token) {
    throw new Error("Google did not return an ID token.");
  }

  return {
    accessToken: payload.access_token,
    idToken: payload.id_token,
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const appUrl = getConfiguredAppUrl(requestUrl.origin);
  const code = requestUrl.searchParams.get("code")?.trim() ?? "";
  const googleError = requestUrl.searchParams.get("error")?.trim();
  const googleState = requestUrl.searchParams.get("state")?.trim() ?? "";
  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_LOCAL_AUTH_STATE_COOKIE)?.value ?? "";
  const parsedState = readGoogleAuthState(googleState);
  const nextPath = normalizeAuthNextPath(parsedState?.nextPath ?? "/dashboard", "/dashboard");

  if (googleError) {
    return redirectWithGoogleStateCleared(appUrl, "/login", "Google sign-in was cancelled.");
  }

  if (!code) {
    return redirectWithGoogleStateCleared(appUrl, "/login", "Google sign-in could not be completed.");
  }

  if (!storedState || storedState !== googleState || !parsedState) {
    return redirectWithGoogleStateCleared(appUrl, "/login", "Google sign-in could not be verified.");
  }

  try {
    const { idToken, accessToken } = await exchangeGoogleCodeForTokens(
      code,
      requestUrl.origin,
    );
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
      access_token: accessToken,
    });

    if (error || !data.user) {
      return redirectWithGoogleStateCleared(
        appUrl,
        "/login",
        error?.message || "Your Google session could not be verified.",
      );
    }

    const access = await resolveOrBootstrapAppAccess(data.user);
    const selection = access.kind === "workspace"
      ? await resolveWorkspaceSelectionState(data.user.id)
      : null;
    const setup = access.kind === "workspace"
      ? await getWorkspaceSetupState(data.user)
      : null;

    if (data.user.email) {
      try {
        const recipientName =
          data.user.user_metadata?.full_name?.trim()
          || data.user.user_metadata?.first_name?.trim()
          || undefined;

        if (access.kind === "workspace" && !setup?.completed) {
          await sendAccountReadyEmail({
            recipientEmail: data.user.email,
            recipientName,
            actionUrl: new URL("/onboarding/workspace", appUrl).toString(),
            appUrl,
          });
        } else if (access.kind === "client") {
          await sendSigninAlertEmail({
            recipientEmail: data.user.email,
            recipientName,
            actionUrl: new URL("/portal", appUrl).toString(),
            appUrl,
            signedInAt: new Date(),
          });
        } else {
          await sendSigninAlertEmail({
            recipientEmail: data.user.email,
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
      return redirectWithGoogleStateCleared(appUrl, "/portal");
    }

    if (selection?.hasMultipleWorkspaces) {
      return redirectWithGoogleStateCleared(appUrl, `/select-workspace?next=${encodeURIComponent(nextPath)}`);
    }

    if (!setup?.completed) {
      const response = redirectWithGoogleStateCleared(appUrl, "/onboarding/workspace");

      if (selection?.selectedWorkspaceId) {
        setActiveWorkspaceCookie(response, selection.selectedWorkspaceId);
      }

      return response;
    }

    const destination = nextPath === "/onboarding/workspace" ? "/dashboard" : nextPath;
    const response = redirectWithGoogleStateCleared(appUrl, destination);

    if (selection?.selectedWorkspaceId) {
      setActiveWorkspaceCookie(response, selection.selectedWorkspaceId);
    }

    return response;
  } catch (error) {
    return redirectWithGoogleStateCleared(
      appUrl,
      "/login",
      error instanceof Error ? error.message : "Google sign-in could not be completed.",
    );
  }
}
