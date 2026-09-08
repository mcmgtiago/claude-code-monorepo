"use client";

import { Building2, Check, LoaderCircle, X } from "lucide-react";

import type { WorkspaceSelectionOption } from "@/lib/workspace-selection";
import { cn } from "@/lib/utils";

export function WorkspaceSelectionModal({
  open,
  title,
  subtitle,
  workspaces,
  selectedWorkspaceId,
  pendingWorkspaceId,
  onSelect,
  onClose,
  dismissible = true,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  workspaces: WorkspaceSelectionOption[];
  selectedWorkspaceId?: string | null;
  pendingWorkspaceId?: string | null;
  onSelect: (workspaceId: string) => void;
  onClose?: () => void;
  dismissible?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(6,8,12,0.72)] px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/10 bg-[var(--background)] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
        <div className="border-b border-white/8 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--accent)]/18 bg-[var(--accent)]/10 text-[var(--accent)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
                <p className="mt-1.5 text-[0.92rem] leading-6 text-[var(--text-secondary)]">{subtitle}</p>
              </div>
            </div>
            {dismissible && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                aria-label="Close workspace selector"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 px-6 py-6">
          {workspaces.map((workspace) => {
            const isCurrent = workspace.workspaceId === selectedWorkspaceId;
            const isPending = workspace.workspaceId === pendingWorkspaceId;

            return (
              <button
                key={workspace.workspaceId}
                type="button"
                onClick={() => onSelect(workspace.workspaceId)}
                disabled={Boolean(pendingWorkspaceId)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-[20px] border px-5 py-4 text-left transition",
                  isCurrent
                    ? "border-[var(--accent)] bg-[var(--accent)]/8"
                    : "border-white/8 bg-white/[0.03] hover:border-[var(--accent)]/30 hover:bg-white/[0.05]",
                  pendingWorkspaceId && !isPending && "opacity-60",
                )}
              >
                <div>
                  <p className="text-[0.98rem] font-semibold text-[var(--text-primary)]">{workspace.name}</p>
                  <p className="mt-1 text-[0.84rem] text-[var(--text-secondary)]">
                    {workspace.role === "owner" ? "Owner" : "Member"} · {workspace.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-[var(--accent)]" />
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/12 px-3 py-1 text-[0.75rem] font-medium text-[var(--accent)]">
                      <Check className="h-3 w-3" />
                      Selected
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
