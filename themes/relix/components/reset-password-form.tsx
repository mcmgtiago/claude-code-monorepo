"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { getPasswordRequirementState, passwordRequirementLabels } from "@/lib/password-rules";

const inputClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordState = useMemo(() => getPasswordRequirementState(password), [password]);
  const passwordValid = Object.values(passwordState).every(Boolean);

  return (
    <div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback(null);

          if (!token) {
            setFeedback("This reset link is missing a token.");
            return;
          }

          if (password !== confirmPassword) {
            setFeedback("Passwords do not match.");
            return;
          }

          setIsSubmitting(true);

          void (async () => {
            try {
              const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ token, password })
              });
              const payload = (await response.json().catch(() => null)) as { error?: string } | null;

              if (!response.ok) {
                throw new Error(payload?.error || "Unable to reset password");
              }

              router.push("/" as Route);
              router.refresh();
            } catch (error) {
              setFeedback(error instanceof Error ? error.message : "Unable to reset password");
            } finally {
              setIsSubmitting(false);
            }
          })();
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
          <div className="relative">
            <Lock className={inputIconWrapperClassName} />
            <input className={inputWithIconClassName} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { id: "length", label: "8 characters minimum", passed: passwordState.length },
              { id: "number", label: "numbers (0-9)", passed: passwordState.number },
              { id: "uppercase", label: "Uppercase letters (A-Z)", passed: passwordState.uppercase },
              { id: "special", label: "special characters (!@#$%^&*)", passed: passwordState.special }
            ].map((item) => (
              <div key={item.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors ${item.passed ? "border-[#386df4]/20 bg-[#eef4ff] text-[#386df4]" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
                <div className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${item.passed ? "bg-[#386df4] text-white" : "bg-slate-200 text-slate-400"}`}>
                  {item.passed ? "✓" : "•"}
                </div>
                <span className="text-[11px] font-medium sm:text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
          <div className="relative">
            <Lock className={inputIconWrapperClassName} />
            <input className={inputWithIconClassName} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat the new password" />
          </div>
        </div>

        {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}

        <button
          type="submit"
          disabled={isSubmitting || !passwordValid || confirmPassword.length < 8 || password !== confirmPassword}
          className="h-12 w-full rounded-2xl bg-[#386df4] px-4 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Need the original form?{" "}
        <Link href={"/forgot-password" as Route} className="font-semibold text-slate-900 hover:text-[#386df4]">
          Request a new link
        </Link>
      </div>
    </div>
  );
}
