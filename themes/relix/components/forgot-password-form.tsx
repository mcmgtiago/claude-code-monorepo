"use client";

import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";

const inputWithIconClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setFeedback(null);
          setPreviewUrl(null);

          void (async () => {
            try {
              const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email })
              });
              const payload = (await response.json().catch(() => null)) as { error?: string; previewUrl?: string } | null;

              if (!response.ok) {
                throw new Error(payload?.error || "Unable to send reset link");
              }

              setFeedback("If an account exists for this email, a secure link has been generated to reset or create a password.");
              setPreviewUrl(payload?.previewUrl || null);
            } catch (error) {
              setFeedback(error instanceof Error ? error.message : "Unable to send reset link");
            } finally {
              setIsSubmitting(false);
            }
          })();
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Work email</label>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input className={inputWithIconClassName} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
          </div>
        </div>

        {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
        {previewUrl ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Dev preview link:
            <div className="mt-2 break-all font-medium text-slate-900">{previewUrl}</div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="h-12 w-full rounded-2xl bg-[#386df4] px-4 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        This works for both password-based accounts and Google-only accounts that need a password set for email login.
      </p>

      <div className="mt-6 text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href={"/login" as Route} className="font-semibold text-slate-900 hover:text-[#386df4]">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
