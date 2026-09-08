"use client";

import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type ActivityItem,
  type AvatarTone,
} from "@/data/dashboard";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import { useHydrated } from "@/lib/use-hydrated";
import { usePersistentState } from "@/lib/use-persistent-state";
import type { ProjectNotification } from "@/data/project-board";

export const WORKSPACE_ACTIVITY_STORAGE_KEY = "planix.workspace.activity";
const WORKSPACE_ACTIVITY_PENDING_STORAGE_KEY = "planix.workspace.activity.pending";
const MAX_ACTIVITY_ITEMS = 80;
const WORKSPACE_ACTIVITY_CACHE_KEY = "planix.cache.workspace-activity";
const WORKSPACE_ACTIVITY_CACHE_MAX_AGE_MS = 60_000;

export type WorkspaceActivityInput = {
  name: string;
  action: string;
  detail?: string;
  tone?: AvatarTone;
  initials?: string;
  status?: ActivityItem["status"];
  time?: string;
};

let workspaceActivitySequence = 0;

function buildActivityInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "WS";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function cloneDefaultWorkspaceActivities() {
  return [];
}

function createWorkspaceActivityId() {
  workspaceActivitySequence += 1;
  return Date.now() * 1000 + workspaceActivitySequence;
}

function normalizeActivityItems(items: ActivityItem[] | null | undefined) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const seen = new Set<string>();

  return items.filter((item) => {
    const key = String(item.id);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function createWorkspaceActivity(input: WorkspaceActivityInput): ActivityItem {
  return {
    id: createWorkspaceActivityId(),
    name: input.name.trim() || "Workspace",
    time: input.time ?? "Just now",
    action: input.action.trim(),
    detail: input.detail?.trim() || undefined,
    tone: input.tone ?? "sand",
    initials: input.initials?.trim() || buildActivityInitials(input.name),
    status: input.status ?? "neutral",
  };
}

export function pushWorkspaceActivity(
  current: ActivityItem[] | null | undefined,
  input: WorkspaceActivityInput | ActivityItem,
): ActivityItem[] {
  const nextActivity: ActivityItem = "id" in input
    ? input
    : createWorkspaceActivity(input);
  const safeCurrent = normalizeActivityItems(current);

  return normalizeActivityItems([nextActivity, ...safeCurrent]).slice(0, MAX_ACTIVITY_ITEMS);
}

export function createWorkspaceActivityFromProjectNotification(
  projectName: string,
  notification: ProjectNotification,
) {
  const toneByKind: Record<ProjectNotification["kind"], AvatarTone> = {
    task: "peach",
    deadline: "sand",
    completed: "olive",
    milestone: "rose",
    comment: "slate",
    overdue: "rose",
    meeting: "sand",
  };

  return createWorkspaceActivity({
    name: projectName,
    initials: buildActivityInitials(projectName),
    tone: notification.avatarTone ?? toneByKind[notification.kind],
    status: notification.unread ? "busy" : "neutral",
    action: notification.title,
    detail: notification.body,
    time: notification.time,
  });
}

export function useWorkspaceActivityFeed() {
  const hydrated = useHydrated();
  const cachedActivity = normalizeActivityItems(readMemoryCache<ActivityItem[]>(
    WORKSPACE_ACTIVITY_CACHE_KEY,
    WORKSPACE_ACTIVITY_CACHE_MAX_AGE_MS,
  ));
  const [activity, setActivityCache] = usePersistentState<ActivityItem[]>(
    WORKSPACE_ACTIVITY_STORAGE_KEY,
    cachedActivity ?? [],
  );
  const [pendingQueue, setPendingQueue] = usePersistentState<ActivityItem[]>(
    WORKSPACE_ACTIVITY_PENDING_STORAGE_KEY,
    [],
  );
  const normalizedActivity = useMemo(() => normalizeActivityItems(activity), [activity]);
  const activityRef = useRef(normalizedActivity);
  const pendingQueueRef = useRef(pendingQueue);
  const [mode, setMode] = useState<"loading" | "remote" | "local" | "demo">(cachedActivity ? "remote" : "loading");
  const [retryNonce, setRetryNonce] = useState(0);
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    activityRef.current = normalizedActivity;
    writeMemoryCache(WORKSPACE_ACTIVITY_CACHE_KEY, normalizedActivity);
  }, [normalizedActivity]);

  useEffect(() => {
    pendingQueueRef.current = pendingQueue;
  }, [pendingQueue]);

  useEffect(() => {
    setActivityCache((current) =>
      normalizeActivityItems(current),
    );
  }, [setActivityCache]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadActivity() {
      try {
        const response = await fetch("/api/activity", { cache: "no-store" });
        const text = await response.text();
        const payload = text.trim()
          ? (JSON.parse(text) as { activity?: ActivityItem[]; mode?: "remote" | "demo"; error?: string })
          : null;

        if (!response.ok || !payload?.activity) {
          throw new Error(payload?.error || "Failed to load workspace activity.");
        }

        if (!cancelled) {
          const nextActivity = normalizeActivityItems(payload.activity);
          activityRef.current = nextActivity;
          setActivityCache(nextActivity);
          writeMemoryCache(WORKSPACE_ACTIVITY_CACHE_KEY, nextActivity);
          setMode(payload.mode ?? "remote");
        }
      } catch {
        if (!cancelled) {
          setMode("local");
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [hydrated, setActivityCache]);

  useEffect(() => {
    if (!hydrated || mode !== "remote" || isFlushing || pendingQueue.length === 0) {
      return;
    }

    let cancelled = false;
    const nextItem = pendingQueue[0];

    async function flushPendingActivity() {
      setIsFlushing(true);

      try {
        const response = await fetch("/api/activity", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            item: nextItem,
          }),
        });
        const text = await response.text();
        const payload = text.trim()
          ? (JSON.parse(text) as { activity?: ActivityItem[]; mode?: "remote" | "demo"; error?: string })
          : null;

        if (!response.ok || !payload?.activity) {
          throw new Error(payload?.error || "Failed to sync workspace activity.");
        }

        if (cancelled) {
          return;
        }

        const nextActivity = normalizeActivityItems(payload.activity);
        activityRef.current = nextActivity;
        setActivityCache(nextActivity);
        writeMemoryCache(WORKSPACE_ACTIVITY_CACHE_KEY, nextActivity);
        setPendingQueue((current) => current.filter((item) => item.id !== nextItem.id));
        setMode(payload.mode ?? "remote");
      } catch {
        if (!cancelled) {
          window.setTimeout(() => {
            setRetryNonce((current) => current + 1);
          }, 5_000);
        }
      } finally {
        if (!cancelled) {
          setIsFlushing(false);
        }
      }
    }

    void flushPendingActivity();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isFlushing, mode, pendingQueue, retryNonce, setActivityCache, setPendingQueue]);

  const setActivity = useCallback<Dispatch<SetStateAction<ActivityItem[]>>>((value) => {
    const current = activityRef.current;
    const next = normalizeActivityItems(typeof value === "function" ? value(current) : value);

    activityRef.current = next;
    setActivityCache(next);
    writeMemoryCache(WORKSPACE_ACTIVITY_CACHE_KEY, next);

    const nextHead = next[0];
    const previousHeadId = current[0]?.id;
    const appendedHead = nextHead && nextHead.id !== previousHeadId;

    if (mode === "remote" && appendedHead) {
      setPendingQueue((queue) => {
        if (!nextHead || queue.some((item) => item.id === nextHead.id)) {
          return queue;
        }

        return [...queue, nextHead];
      });
    }
  }, [mode, setActivityCache, setPendingQueue]);

  return useMemo(() => [normalizedActivity, setActivity] as const, [normalizedActivity, setActivity]);
}
