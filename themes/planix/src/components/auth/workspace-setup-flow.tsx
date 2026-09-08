"use client";

import { useRouter } from "next/navigation";
import { Building2, Check, MailPlus, Sparkles, UserPlus, X } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";

import { AuthField, AuthPrimaryButton } from "@/components/auth/auth-shell";
import { readJsonSafely } from "@/lib/settings-client";

type SetupState = {
  workspaceName: string;
  workspaceSlug: string;
  ownerEmail: string;
  completed: boolean;
  invites: string[];
};

type StepStatus = "complete" | "current" | "upcoming";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SecondaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[50px] items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.035] px-5 text-[0.94rem] font-medium text-[var(--text-primary)] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SetupMessage({ error }: { error: string }) {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-[14px] border border-[var(--red)]/20 bg-[var(--red)]/8 px-4 py-3 text-[0.86rem] text-[var(--red)]">
      {error}
    </div>
  );
}

function SetupStepCard({
  title,
  icon,
  status,
}: {
  title: string;
  icon: React.ReactNode;
  status: StepStatus;
}) {
  const wrapperClassName =
    status === "complete"
      ? "border-[var(--accent)]/24 bg-[linear-gradient(180deg,rgba(251,138,116,0.12),rgba(251,138,116,0.06))]"
      : status === "current"
        ? "border-[var(--accent)]/26 bg-white/[0.03]"
        : "border-white/8 bg-white/[0.03]";

  const iconClassName =
    status === "complete"
      ? "bg-[var(--accent)] text-[var(--background)]"
      : status === "current"
        ? "bg-white/[0.06] text-[var(--accent)]"
        : "bg-white/[0.06] text-[var(--text-primary)]";

  return (
    <div className={`rounded-[16px] border p-3 ${wrapperClassName}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
            {icon}
          </span>
          <p className="truncate text-[0.9rem] font-medium text-[var(--text-primary)]">{title}</p>
        </div>
        {status === "complete" ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/24 bg-[var(--accent)]/12 text-[var(--accent)]">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function WorkspaceSetupFlow() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSetup() {
      try {
        const response = await fetch("/api/auth/workspace-setup", {
          cache: "no-store",
        });
        const result = await readJsonSafely<{ error?: string; setup?: SetupState }>(response);

        if (!response.ok || !result?.setup) {
          throw new Error(result?.error || "Unable to load workspace setup.");
        }

        if (!active) {
          return;
        }

        if (result.setup.completed) {
          router.replace("/dashboard?onboarding=1&modal=plan");
          router.refresh();
          return;
        }

        setWorkspaceName(result.setup.workspaceName);
        setInvites(result.setup.invites);
      } catch (nextError) {
        if (active) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load workspace setup.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSetup();

    return () => {
      active = false;
    };
  }, [router]);

  const normalizedInviteInput = inviteInput.trim().toLowerCase();
  const canAddInvite = normalizedInviteInput.length > 0;
  const stepTitle = step === 1 ? "Name your workspace" : "Invite your team";
  const stepDescription = step === 1
    ? "Start with the name people will see across projects, files, and updates."
    : "Add teammate emails now, or skip and invite them later from the workspace.";
  const workspaceStepStatus: StepStatus = step === 1 ? "current" : "complete";
  const invitesStepStatus: StepStatus = step === 2 ? "current" : "upcoming";

  function addInvite(rawValue: string) {
    const value = rawValue.trim().toLowerCase();

    if (!value) {
      return;
    }

    if (!EMAIL_REGEX.test(value)) {
      setError("Enter a valid email address before adding an invite.");
      return;
    }

    setInvites((current) => {
      if (current.includes(value)) {
        return current;
      }

      return [...current, value].slice(0, 12);
    });
    setInviteInput("");
    setError("");
  }

  function handleInviteKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addInvite(inviteInput);
    }
  }

  function handleContinue() {
    if (!workspaceName.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setError("");
    setStep(2);
  }

  async function submitSetup(nextInvites: string[], options?: { includeDraftInvite?: boolean }) {
    const finalInvite = inviteInput.trim().toLowerCase();
    const includeDraftInvite = options?.includeDraftInvite ?? true;

    if (includeDraftInvite && finalInvite && !EMAIL_REGEX.test(finalInvite)) {
      setError("Enter a valid email address before finishing setup.");
      return;
    }

    const finalInvites = includeDraftInvite && finalInvite && !nextInvites.includes(finalInvite)
      ? [...nextInvites, finalInvite]
      : nextInvites;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/auth/workspace-setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceName,
          invites: finalInvites,
        }),
      });
      const result = await readJsonSafely<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(result?.error || "Unable to save workspace setup.");
      }

      router.replace("/dashboard?onboarding=1&modal=plan");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to save workspace setup.");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto w-full rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.28)] sm:p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-3.5 w-28 rounded-full bg-white/10" />
          <div className="h-9 w-56 rounded-full bg-white/10" />
          <div className="h-24 rounded-[16px] bg-white/[0.045]" />
          <div className="h-[54px] rounded-[14px] bg-white/[0.045]" />
          <div className="h-[50px] rounded-[14px] bg-white/[0.045]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
      <div className="w-full space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/18 bg-[var(--accent)]/10 px-3 py-1.5 text-[0.76rem] font-semibold tracking-[0.08em] text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" />
            WORKSPACE SETUP
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-[0.8rem] text-[var(--text-secondary)]">
            Step {step} of 2
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
            {stepTitle}
          </h2>
          <p className="text-[0.95rem] leading-6 text-[var(--text-secondary)]">
            {stepDescription}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <SetupStepCard
            title={workspaceStepStatus === "complete" ? (workspaceName.trim() || "Workspace") : "Workspace name"}
            icon={<Building2 className="h-4 w-4" />}
            status={workspaceStepStatus}
          />
          <SetupStepCard
            title="Team invites"
            icon={<UserPlus className="h-4 w-4" />}
            status={invitesStepStatus}
          />
        </div>

        <SetupMessage error={error} />

        {step === 1 ? (
          <div className="space-y-3">
            <AuthField
              label="Workspace Name"
              placeholder="Enter your workspace name"
              icon={<Building2 className="h-4 w-4" />}
              name="workspaceName"
              value={workspaceName}
              onChange={(event) => {
                setWorkspaceName(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              autoComplete="organization"
              disabled={saving}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-[0.88rem] font-medium text-[var(--white-soft)]">
                Team Invitation
              </span>
              <div className="flex gap-2">
                <div className="flex h-[54px] flex-1 items-center gap-3 rounded-[14px] border border-white/5 bg-[rgba(255,255,255,0.03)] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors focus-within:border-[var(--accent)]/40 focus-within:bg-white/[0.045]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-[var(--text-muted)] ring-1 ring-white/5">
                    <MailPlus className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={inviteInput}
                    onChange={(event) => setInviteInput(event.target.value)}
                    onKeyDown={handleInviteKeyDown}
                    placeholder="Add teammate email"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.94rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    disabled={saving}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addInvite(inviteInput)}
                  disabled={saving || !canAddInvite}
                  className="flex h-[54px] min-w-[92px] items-center justify-center rounded-[14px] border border-[var(--accent)]/18 bg-[var(--accent)]/12 px-4 text-[0.92rem] font-medium text-[var(--accent)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add
                </button>
              </div>
            </label>

            <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
              {invites.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {invites.map((invite) => (
                    <span
                      key={invite}
                      className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[0.84rem] text-[var(--text-primary)]"
                    >
                      {invite}
                      <button
                        type="button"
                        onClick={() => setInvites((current) => current.filter((item) => item !== invite))}
                        className="text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                        aria-label={`Remove ${invite}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[0.84rem] text-[var(--text-secondary)]">
                  No invites yet. Add emails one by one, or skip this step for now.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {step === 2 ? (
              <SecondaryButton onClick={() => setStep(1)} disabled={saving}>
                Back
              </SecondaryButton>
            ) : null}
            {step === 2 ? (
              <SecondaryButton onClick={() => void submitSetup([], { includeDraftInvite: false })} disabled={saving}>
                Skip
              </SecondaryButton>
            ) : null}
          </div>
          <div className="sm:min-w-[220px]">
            {step === 1 ? (
              <AuthPrimaryButton type="button" disabled={saving || !workspaceName.trim()} onClick={handleContinue}>
                Continue
              </AuthPrimaryButton>
            ) : (
              <AuthPrimaryButton type="button" disabled={saving} onClick={() => void submitSetup(invites)}>
                {saving ? "Saving..." : "Enter Workspace"}
              </AuthPrimaryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
