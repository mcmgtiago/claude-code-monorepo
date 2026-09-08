"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { getPasswordRequirementState, passwordRequirementLabels } from "@/lib/password-rules";

const inputClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordState = useMemo(() => getPasswordRequirementState(password), [password]);
  const passwordValid = Object.values(passwordState).every(Boolean);

  return (
    <div>
      {/* Google button */}
      <a
        href="/api/auth/google"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">or sign up with email</span>
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
              const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ fullName, email, password, inviteToken: searchParams.get("invite") || undefined })
              });
              const payload = (await response.json().catch(() => null)) as { user?: { onboardingCompleted?: boolean }; error?: string } | null;

              if (!response.ok) {
                throw new Error(payload?.error || "Unable to create account");
              }

              router.push((payload?.user?.onboardingCompleted ? "/" : "/onboarding") as Route);
              router.refresh();
            } catch (error) {
              setFeedback(error instanceof Error ? error.message : "Unable to create account");
            } finally {
              setIsSubmitting(false);
            }
          })();
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
          <div className="relative">
            <User className={inputIconWrapperClassName} />
            <input className={inputWithIconClassName} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="e.g., Jane Doe" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input className={inputWithIconClassName} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
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

        {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}

        <button
          type="submit"
          disabled={isSubmitting || !fullName.trim() || !email.trim() || !passwordValid}
          className="h-12 w-full rounded-2xl bg-[#386df4] px-4 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {searchParams.get("invite") ? <div className="mt-4 text-center text-sm text-[#386df4]">You are joining a team workspace.</div> : null}

      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href={"/login" as Route} className="font-semibold text-slate-900 hover:text-[#386df4]">
          Sign in
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
