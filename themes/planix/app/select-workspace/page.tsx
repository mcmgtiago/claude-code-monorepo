import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ensureUserIsNotSuspended } from "@/lib/super-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeWorkspaceRedirectPath, resolveWorkspaceSelectionState } from "@/lib/workspace-selection";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function SelectWorkspacePage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeWorkspaceRedirectPath(getFirstSearchParam(resolvedSearchParams.next), "/dashboard");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?next=${encodeURIComponent("/select-workspace")}`);
  }

  const canAccessApp = await ensureUserIsNotSuspended(user);

  if (!canAccessApp) {
    redirect("/login?error=Your account has been suspended. Contact support.");
  }

  const selection = await resolveWorkspaceSelectionState(user.id);

  if (selection.workspaces.length === 0) {
    redirect("/dashboard");
  }

  if (selection.workspaces.length === 1) {
    redirect(`/api/auth/workspace-selection?workspaceId=${encodeURIComponent(selection.workspaces[0].workspaceId)}&next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <AuthShell
      title="Choose your workspace"
      subtitle="This login belongs to multiple workspaces. Pick the one you want to open right now."
      artwork="login"
      centerContent
      contentClassName="max-w-[520px]"
    >
      <div className="w-full space-y-3">
        {selection.workspaces.map((workspace) => {
          const isSelected = workspace.workspaceId === selection.selectedWorkspaceId;

          return (
            <Link
              key={workspace.workspaceId}
              href={`/api/auth/workspace-selection?workspaceId=${encodeURIComponent(workspace.workspaceId)}&next=${encodeURIComponent(nextPath)}`}
              className={[
                "block rounded-[20px] border px-5 py-4 text-left transition",
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)]/8"
                  : "border-black/10 bg-white/70 hover:border-[var(--accent)]/40 hover:bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[1rem] font-semibold text-[var(--text-primary)]">{workspace.name}</p>
                  <p className="mt-1 text-[0.88rem] text-[var(--text-secondary)]">
                    {workspace.role === "owner" ? "Owner" : "Member"} · {workspace.slug}
                  </p>
                </div>
                {isSelected ? (
                  <span className="rounded-full bg-[var(--accent)]/12 px-3 py-1 text-[0.75rem] font-medium text-[var(--accent)]">
                    Current
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </AuthShell>
  );
}
