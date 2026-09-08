"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, FileText } from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { Panel } from "@/components/ui/panel";
import { emitPersistentStateSync } from "@/lib/use-persistent-state";
import { writeCompatibleLocalStorageItem } from "@/lib/storage-compat";
import { useWorkspaceActivityFeed } from "@/lib/workspace-activity";

export function RecentActivityPanel() {
  const router = useRouter();
  const [activity] = useWorkspaceActivityFeed();
  const openRecentActivity = () => {
    const nextTab = "Activity";

    writeCompatibleLocalStorageItem("planix.notifications.active-tab", JSON.stringify(nextTab));
    emitPersistentStateSync("planix.notifications.active-tab", nextTab);
    router.push("/notifications");
  };

  return (
    <Panel
      title="Recent Activity"
      className="rounded-[var(--radius-xl)]"
      action={
        <button
          type="button"
          aria-label="Open recent activity"
          className="soft-pill flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)]"
          onClick={openRecentActivity}
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      }
    >
      {activity.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.8rem] text-[var(--text-muted)]">
          No recent activity yet.
        </div>
      ) : (
        <div className="divide-y divide-white/6">
        {activity.map((item) => (
          <article key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <Avatar
              initials={item.initials}
              tone={item.tone}
              status={item.status}
              size="sm"
            />
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[0.88rem] font-semibold text-[var(--text-primary)]">{item.name}</h3>
                <span className="text-[0.76rem] text-[var(--text-muted)]">{item.time}</span>
              </div>
              <p className="text-[0.78rem] leading-[1.35] text-[var(--text-secondary)]">{item.action}</p>
              {item.detail && (
                <div className="mt-1 rounded-[var(--radius-md)] border border-white/6 px-2.5 py-1.5 text-[0.76rem] leading-[1.35] text-[var(--text-secondary)]">
                  {item.detail.includes(".txt") ? (
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
                      {item.detail}
                    </span>
                  ) : (
                    item.detail
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
        </div>
      )}
    </Panel>
  );
}
