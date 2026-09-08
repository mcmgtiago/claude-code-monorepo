"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";

const inputWithIconClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5";

const googleErrorMessages: Record<string, string> = {
  "google-not-configured": "Google login is not configured on this server.",
  "google-denied": "Google sign-in was cancelled.",
  "google-invalid": "Google sign-in failed. Please try again.",
  "google-error": "Something went wrong with Google sign-in.",
  suspended: "This account has been suspended."
};

const emailChangeMessages: Record<string, string> = {
  success: "Your login email has been updated. Sign in with the new address.",
  invalid: "This email change link is invalid or expired.",
  conflict: "That email address is already in use by another account."
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState<"google-password-setup" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(() => {
    const err = searchParams.get("error");
    if (err) {
      return googleErrorMessages[err] ?? null;
    }

    const emailChange = searchParams.get("email-change");
    return emailChange ? (emailChangeMessages[emailChange] ?? null) : null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = searchParams.get("next") || "/";

  return (
    <div>
      {/* Google button */}
      <a
        href={`/api/auth/google?next=${encodeURIComponent(next)}`}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">or sign in with email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setFeedback(null);

          void (async () => {
            try {
              const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email, password })
              });
              const payload = (await response.json().catch(() => null)) as { error?: string; code?: string } | null;

              if (!response.ok) {
                if (response.status === 403) {
                  router.push(`/blocked?reason=suspended&email=${encodeURIComponent(email.trim())}` as Route);
                  router.refresh();
                  return;
                }

                setRecoveryMode(payload?.code === "PASSWORD_NOT_SET" ? "google-password-setup" : null);
                throw new Error(payload?.error || "Unable to sign in");
              }

              setRecoveryMode(null);
              router.push((next.startsWith("/") ? next : "/") as Route);
              router.refresh();
            } catch (error) {
              setFeedback(error instanceof Error ? error.message : "Unable to sign in");
              setIsSubmitting(false);
            }
          })();
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (recoveryMode) {
                  setRecoveryMode(null);
                }
              }}
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link
              href={`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ""}` as Route}
              className="text-sm font-medium text-[#386df4] hover:text-[#2d5de0]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (recoveryMode) {
                  setRecoveryMode(null);
                }
              }}
              placeholder="Enter your password"
            />
          </div>
        </div>

        {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
        {recoveryMode === "google-password-setup" ? (
          <div className="rounded-2xl border border-[#dbe6ff] bg-[#f6f9ff] p-4 text-sm text-slate-600">
            <p className="leading-6">
              This email is linked to Google sign-in. Use Google now, or request a secure setup link to create your password by email.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`/api/auth/google?next=${encodeURIComponent(next)}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#386df4] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#2d5de0]"
              >
                Continue with Google
              </a>
              <Link
                href={`/forgot-password?email=${encodeURIComponent(email.trim())}` as Route}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Set password by email
              </Link>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !email.trim() || !password.trim()}
          className="h-12 w-full rounded-2xl bg-[#386df4] px-4 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        New here?{" "}
        <Link href={"/signup" as Route} className="font-semibold text-slate-900 hover:text-[#386df4]">
          Create account
        </Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}
