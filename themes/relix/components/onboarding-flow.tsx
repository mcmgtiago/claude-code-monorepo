"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, ChevronLeft, ListChecks, Users2, X } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { FeedbackToast } from "@/components/feedback-toast";

type OnboardingData = {
  jobRole: string;
  primaryUseCase: string;
  teamSize: string;
  workspaceName: string;
  companyWebsite: string;
  inviteTeamNow: boolean;
  inviteEmails: string[];
};

const roleOptions = ["Founder", "Sales", "RevOps", "BD", "Account Manager"];
const useCaseOptions = ["Lead tracking", "Pipeline management", "Follow-ups", "Account management", "Team CRM"];
const teamSizeOptions = ["Just me", "2-5", "6-20", "21-50", "50+"];

const checklistItems = [
  "Workspace created with CRM defaults",
  "Team invites added to Team",
  "Mailbox setup can wait until later",
  "Pipeline and imports stay editable"
];

const steps = [
  { label: "Profile", title: "Tell us about your role.", icon: Users2 },
  { label: "Workspace", title: "Set the workspace basics.", icon: Building2 },
  { label: "Team", title: "Choose solo or shared setup.", icon: Users2 },
  { label: "Review", title: "Review before entering.", icon: ListChecks }
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

function parseInviteEmails(value: string) {
  return value
    .split(/[,\n;]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function mergeInviteEmails(existing: string[], incoming: string[]) {
  const seen = new Set(existing.map((item) => item.toLowerCase()));
  const next = [...existing];

  for (const email of incoming) {
    const normalized = email.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    next.push(normalized);
  }

  return next;
}

function TagSelector({
  options,
  value,
  onChange
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-[#386df4] bg-[#eef4ff] text-[#386df4]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function OnboardingFlow({
  userName,
  initialData,
  appName = "Relix",
  appLogoUrl = ""
}: {
  userName: string;
  initialData: OnboardingData;
  appName?: string;
  appLogoUrl?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState<OnboardingData>(initialData);
  const [inviteInput, setInviteInput] = useState("");

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";

  const canContinue = (() => {
    if (stepIndex === 0) return form.jobRole && form.primaryUseCase && form.teamSize;
    if (stepIndex === 1) return form.workspaceName.trim().length >= 2;
    if (stepIndex === 2) return !form.inviteTeamNow || (form.inviteEmails.length > 0 && form.inviteEmails.every((item) => isValidEmail(item)));
    return true;
  })();

  const addInviteEmails = (values: string[]) => {
    const nextEmails = parseInviteEmails(values.join(","));

    if (!nextEmails.length) {
      return;
    }

    setForm((state) => ({
      ...state,
      inviteEmails: mergeInviteEmails(state.inviteEmails, nextEmails)
    }));
    setInviteInput("");
  };

  const commitInviteInput = () => {
    if (!inviteInput.trim()) {
      return;
    }

    addInviteEmails([inviteInput]);
  };

  const saveOnboarding = () => {
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ...form,
              hasExistingData: false,
              importTarget: "none",
              setupPipelineNow: false,
              pipelineStages: [],
              inviteEmails: form.inviteTeamNow ? form.inviteEmails.map((item) => item.trim()).filter(Boolean) : []
            })
          });
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
            redirectTo?: string;
            inviteWarnings?: string[];
            inviteFailures?: string[];
          } | null;

          if (!response.ok) {
            throw new Error(payload?.error || "Unable to save onboarding");
          }

          router.push((payload?.redirectTo || "/") as Route);
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to save onboarding");
        }
      })();
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4fb_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1080px] items-center justify-center">
        <section className="w-full rounded-[30px] border border-white/90 bg-white/92 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <AppLogo src={appLogoUrl || undefined} className="h-16 w-[52px] shrink-0" />
              <div className="flex items-center gap-1.5">
                <div className="text-[1.62rem] font-semibold tracking-tight text-slate-900">{appName}</div>
                <div className="mt-0.5 self-start rounded-full border border-[#d7e4ff] bg-[#eef4ff] px-1.5 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.22em] text-[#386df4]">
                  CRM
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Onboarding</div>
              <h1 className="mt-2 text-[1.8rem] font-semibold tracking-tight text-slate-900">{userName.split(" ")[0]}, let&apos;s set up your workspace.</h1>
              <p className="mt-2 text-sm text-slate-500">Three quick steps, then a final review.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const active = index === stepIndex;
                const done = index < stepIndex;

                return (
                  <button
                    key={step.label}
                    type="button"
                    onClick={() => {
                      if (index <= stepIndex) {
                        setStepIndex(index);
                      }
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-[#386df4] bg-[#eef4ff] text-[#386df4]"
                        : done
                          ? "border-slate-200 bg-slate-50 text-slate-700"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.16em] text-slate-400">{steps[stepIndex].label}</div>
                <h2 className="mt-2 text-[1.55rem] font-semibold tracking-tight text-slate-900">{steps[stepIndex].title}</h2>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                {stepIndex + 1}/{steps.length}
              </div>
            </div>

            {stepIndex === 0 ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <div className="mb-3 text-sm font-medium text-slate-700">What best describes your role?</div>
                  <TagSelector options={roleOptions} value={form.jobRole} onChange={(value) => setForm((state) => ({ ...state, jobRole: value }))} />
                </div>
                <div>
                  <div className="mb-3 text-sm font-medium text-slate-700">How big is the team today?</div>
                  <TagSelector options={teamSizeOptions} value={form.teamSize} onChange={(value) => setForm((state) => ({ ...state, teamSize: value }))} />
                </div>
                <div className="lg:col-span-2">
                  <div className="mb-3 text-sm font-medium text-slate-700">What do you want to manage first?</div>
                  <TagSelector
                    options={useCaseOptions}
                    value={form.primaryUseCase}
                    onChange={(value) => setForm((state) => ({ ...state, primaryUseCase: value }))}
                  />
                </div>
              </div>
            ) : null}

            {stepIndex === 1 ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Workspace name</label>
                  <input
                    className={inputClassName}
                    value={form.workspaceName}
                    onChange={(event) => setForm((state) => ({ ...state, workspaceName: event.target.value }))}
                    placeholder={appName}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Company website</label>
                  <input
                    className={inputClassName}
                    value={form.companyWebsite}
                    onChange={(event) => setForm((state) => ({ ...state, companyWebsite: event.target.value }))}
                    placeholder="yourcompany.com"
                  />
                </div>
              </div>
            ) : null}

            {stepIndex === 2 ? (
              <div className="space-y-5">
                <div>
                  <div className="mb-3 text-sm font-medium text-slate-700">Who&apos;s joining now?</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Invite team", value: true, detail: "Add emails now" },
                      { label: "Just me", value: false, detail: "Invite later" }
                    ].map((option) => {
                      const active = option.value === form.inviteTeamNow;

                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setForm((state) => ({ ...state, inviteTeamNow: option.value }))}
                          className={`rounded-[24px] border px-4 py-4 text-left transition ${
                            active
                              ? "border-[#386df4] bg-[#f4f8ff] text-slate-900 shadow-[0_10px_30px_rgba(56,109,244,0.08)]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          <div className="text-sm font-semibold">{option.label}</div>
                          <div className={`mt-1 text-sm ${active ? "text-[#386df4]" : "text-slate-400"}`}>{option.detail}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.inviteTeamNow ? (
                  <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#fcfdff_0%,#f7faff_100%)] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-700">Invite emails</label>
                      <div className="text-sm text-slate-400">{form.inviteEmails.length} added</div>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:flex-row">
                      <input
                        className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        value={inviteInput}
                        onChange={(event) => setInviteInput(event.target.value)}
                        onBlur={commitInviteInput}
                        onPaste={(event) => {
                          const pasted = event.clipboardData.getData("text");

                          if (!/[,\n;]/.test(pasted)) {
                            return;
                          }

                          event.preventDefault();
                          addInviteEmails(parseInviteEmails(pasted));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === "," || (event.key === "Tab" && inviteInput.trim())) {
                            event.preventDefault();
                            commitInviteInput();
                          }
                        }}
                        placeholder="name@company.com"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                      <button
                        type="button"
                        onClick={commitInviteInput}
                        disabled={!inviteInput.trim()}
                        className="rounded-2xl bg-[#386df4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>

                    {form.inviteEmails.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {form.inviteEmails.map((email) => {
                          const valid = isValidEmail(email);

                          return (
                            <div
                              key={email}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                                valid ? "border-[#d7e4ff] bg-[#eef4ff] text-slate-700" : "border-[#ffd7ce] bg-[#fff4f0] text-[#d25d37]"
                              }`}
                            >
                              <span>{email}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((state) => ({
                                    ...state,
                                    inviteEmails: state.inviteEmails.filter((item) => item !== email)
                                  }))
                                }
                                className="rounded-full p-0.5 text-current/70 transition hover:bg-black/5 hover:text-current"
                                aria-label={`Remove ${email}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-slate-400">
                        Add one or paste a list.
                      </div>
                    )}

                    <div className="mt-3 text-sm text-slate-500">Press Enter, comma, or paste multiple emails.</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {stepIndex === 3 ? (
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm uppercase tracking-[0.16em] text-slate-400">Summary</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Role", value: form.jobRole },
                      { label: "Focus", value: form.primaryUseCase },
                      { label: "Team size", value: form.teamSize },
                      { label: "Workspace", value: form.workspaceName },
                      { label: "Website", value: form.companyWebsite || "Not added yet" },
                      { label: "Team setup", value: form.inviteTeamNow ? `${form.inviteEmails.length || 0} pending invite${form.inviteEmails.length === 1 ? "" : "s"}` : "Solo for now" }
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                        <div className="mt-1 text-sm font-medium text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#dbe6ff] bg-[#f7faff] p-5">
                  <div className="text-sm uppercase tracking-[0.16em] text-[#386df4]">What happens next</div>
                  <div className="mt-4 space-y-3">
                    {checklistItems.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#dbe6ff] bg-white px-4 py-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#386df4]" />
                        <span className="text-sm font-medium text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0 || isPending}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={!canContinue || isPending}
                  onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#386df4] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={saveOnboarding}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#386df4] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Finishing..." : "Enter workspace"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
