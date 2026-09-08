export const TIME_TRACKER_WINDOW_DAYS = 7;
export const TIME_TRACKER_CHANGED_EVENT = "planix:time-tracker-changed";
export const DEMO_TIME_TRACKER_ACTOR = "Ariana Cole";

export type TimeTrackerEntryRecord = {
  id: string;
  projectRef: string;
  taskId: number | null;
  taskTitle: string | null;
  actorName: string;
  startedAt: string;
  endedAt: string | null;
  totalMinutes: number;
};

export type TimeTrackerDailyPoint = {
  date: string;
  label: string;
  totalMinutes: number;
};

export type TimeTrackerProjectBreakdownItem = {
  projectRef: string;
  totalMinutes: number;
  entryCount: number;
  taskCount: number;
};

export type TimeTrackerTaskBreakdownItem = {
  taskId: number | null;
  projectRef: string;
  title: string;
  totalMinutes: number;
  sharePercent: number;
};

export type TimeTrackerDashboardPayload = {
  activeEntry: TimeTrackerEntryRecord | null;
  activeEntries: TimeTrackerEntryRecord[];
  summary: {
    totalMinutes: number;
    todayMinutes: number;
    previousPeriodMinutes: number;
    trendPercent: number | null;
    daily: TimeTrackerDailyPoint[];
  };
  projectBreakdown: TimeTrackerProjectBreakdownItem[];
  taskBreakdown: TimeTrackerTaskBreakdownItem[];
};

export function resolveTimeTrackerActorName(profileName?: string | null, ownerName?: string | null) {
  return profileName?.trim() || ownerName?.trim() || DEMO_TIME_TRACKER_ACTOR;
}

export function dispatchTimeTrackerChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(TIME_TRACKER_CHANGED_EVENT));
}
