import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getConfiguredAppUrl } from "@/lib/app-url";
import { resolveOrBootstrapAppAccess } from "@/lib/app-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function normalizeNextPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

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
  const tokenHash = requestUrl.searchParams.get("token_hash")?.trim() ?? "";
  const type = requestUrl.searchParams.get("type")?.trim() as EmailOtpType | "";
  const fallbackPath = type === "recovery" ? "/forgot-password" : "/login";
  const nextPath = normalizeNextPath(
    requestUrl.searchParams.get("next"),
    type === "recovery" ? "/reset-password" : "/onboarding/workspace",
  );

  if (!tokenHash || !type || !ALLOWED_TYPES.has(type)) {
    return NextResponse.redirect(
      buildRedirectUrl(appUrl, fallbackPath, "The email action link is invalid or incomplete."),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(appUrl, fallbackPath, error.message || "The email action could not be completed."),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await resolveOrBootstrapAppAccess(user);

    if (access.kind === "client" && nextPath === "/onboarding/workspace") {
      return NextResponse.redirect(new URL("/portal", appUrl));
    }
  }

  return NextResponse.redirect(new URL(nextPath, appUrl));
}
