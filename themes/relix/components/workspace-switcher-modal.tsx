"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Check, Globe2, Loader2, Plus, X } from "lucide-react";

type WorkspaceOption = {
  id: string;
  name: string;
  slug: string;
  accessRole: string;
  active: boolean;
};

type WorkspaceInvite = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  accessRole: string;
};

type WorkspaceChoices = {
  activeWorkspaceId: string | null;
  workspaces: WorkspaceOption[];
  invites: WorkspaceInvite[];
};

const dismissedStorageKey = "relix-workspace-switcher-dismissed-session";

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "MANAGER") return "Manager";
  if (role === "SUPERUSER") return "Superuser";
  return "Member";
}

export function WorkspaceSwitcherModal({
  open,
  onOpenChange,
  autoPrompt = false
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoPrompt?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [internalOpen, setInternalOpen] = useState(false);
  const [choices, setChoices] = useState<WorkspaceChoices | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const visible = open ?? internalOpen;
  const allChoices = useMemo(() => (choices ? choices.workspaces.length + choices.invites.length : 0), [choices]);

  const setVisible = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }

    if (!value && autoPrompt && typeof window !== "undefined") {
      window.sessionStorage.setItem(dismissedStorageKey, "1");
    }
  };

  const loadChoices = async () => {
    const response = await fetch("/api/workspaces", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as WorkspaceChoices | { error?: string } | null;

    if (!response.ok) {
      throw new Error((payload as { error?: string } | null)?.error || "Unable to load workspaces");
    }

    setChoices(payload as WorkspaceChoices);
    return payload as WorkspaceChoices;
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextChoices = await loadChoices();

        if (cancelled || !autoPrompt || typeof window === "undefined") {
          return;
        }

        const dismissed = window.sessionStorage.getItem(dismissedStorageKey) === "1";
        const shouldPrompt = !dismissed && nextChoices.workspaces.length + nextChoices.invites.length > 1;

        if (shouldPrompt) {
          setInternalOpen(true);
        }
      } catch {
        if (!cancelled) {
          setChoices({ activeWorkspaceId: null, workspaces: [], invites: [] });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoPrompt]);

  useEffect(() => {
    if (!visible || choices) {
      return;
    }

    void loadChoices().catch((error) => setFeedback(error instanceof Error ? error.message : "Unable to load workspaces"));
  }, [choices, visible]);

  const switchWorkspace = (workspaceId: string, inviteId?: string) => {
    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/workspaces/switch", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ workspaceId, inviteId })
          });
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;

          if (!response.ok) {
            throw new Error(payload?.error || "Unable to switch workspace");
          }

          await loadChoices();
          setVisible(false);
          router.push("/");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to switch workspace");
        }
      })();
    });
  };

  const createWorkspace = () => {
    if (workspaceName.trim().length < 2) {
      setFeedback("Workspace name must be at least 2 characters.");
      return;
    }

    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/workspaces", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ workspaceName, companyWebsite })
          });
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;

          if (!response.ok) {
            throw new Error(payload?.error || "Unable to create workspace");
          }

          setWorkspaceName("");
          setCompanyWebsite("");
          setCreateOpen(false);
          await loadChoices();
          setVisible(false);
          router.push("/");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to create workspace");
        }
      })();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.28)] p-4 backdrop-blur-[2px]" onClick={() => setVisible(false)}>
      <div
        className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
            <h2 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-slate-900">Choose where to work</h2>
            <p className="mt-1 text-sm text-slate-500">Only data from the selected workspace is loaded.</p>
          </div>
          <button type="button" onClick={() => setVisible(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {feedback ? <div className="mb-4 rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-3 text-sm text-[#d25d37]">{feedback}</div> : null}

          {!choices ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading workspaces...
            </div>
          ) : (
            <div className="space-y-3">
              {choices.workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  disabled={isPending || workspace.active}
                  onClick={() => switchWorkspace(workspace.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-default disabled:bg-[#f7faff]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#386df4]">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{workspace.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{roleLabel(workspace.accessRole)}</span>
                    </span>
                  </span>
                  {workspace.active ? <Check className="h-4 w-4 text-[#386df4]" /> : <ArrowRight className="h-4 w-4 text-slate-400" />}
                </button>
              ))}

              {choices.invites.map((invite) => (
                <button
                  key={invite.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => switchWorkspace(invite.workspaceId, invite.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#d7e4ff] bg-[#f7faff] px-4 py-3 text-left transition hover:bg-[#eef4ff] disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#386df4]">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{invite.name}</span>
                      <span className="mt-0.5 block text-xs text-[#386df4]">Pending invite · {roleLabel(invite.accessRole)}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#386df4]" />
                </button>
              ))}

              {allChoices === 0 ? <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No workspaces available yet.</div> : null}
            </div>
          )}

          <div className="mt-5 border-t border-slate-200 pt-5">
            <button type="button" onClick={() => setCreateOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" />
              Create workspace
            </button>

            {createOpen ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder="Workspace name"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
                  />
                </div>
                <div className="relative sm:col-span-2">
                  <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={companyWebsite}
                    onChange={(event) => setCompanyWebsite(event.target.value)}
                    placeholder="company.com"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
                  />
                </div>
                <button type="button" disabled={isPending} onClick={createWorkspace} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
