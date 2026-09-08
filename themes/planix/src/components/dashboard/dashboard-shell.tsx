import { PlanSelectionModal } from "@/components/dashboard/plan-selection-modal";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { CompletedTaskCard } from "@/components/dashboard/completed-task-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { ProductivityCard } from "@/components/dashboard/productivity-card";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";
import { TimeTrackerCard } from "@/components/dashboard/time-tracker-card";
import { UrgentTasksCard } from "@/components/dashboard/urgent-tasks-card";
import type { BillingUiConfig } from "@/lib/billing";

export function DashboardShell({
  billing,
}: {
  billing: BillingUiConfig;
}) {
  return (
    <main className="bg-dashboard min-h-[100dvh] p-3 sm:p-4 md:p-6 text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <PlanSelectionModal billing={billing} />
      <div className="flex w-full flex-col lg:h-full lg:flex-row gap-3 sm:gap-0">
        <AppSidebar />

        <div className="overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:flex-1 lg:border-l lg:border-white/6">
          <div className="grid min-h-[calc(100vh-48px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_clamp(320px,27vw,356px)] lg:h-full lg:min-h-0">
            <div className="border-r border-white/6 lg:min-h-0 lg:overflow-y-auto">
              <DashboardHeader />

              <div className="space-y-4 sm:space-y-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:overflow-x-hidden">
                <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)]">
                  <TimeTrackerCard />

                  <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-1">
                    <ProductivityCard />
                    <CompletedTaskCard />
                  </div>
                </div>

                <div className="w-full">
                  <UrgentTasksCard />
                </div>
              </div>
            </div>

            <aside className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-1 p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto">
              <NotificationsPanel />
              <RecentActivityPanel />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
