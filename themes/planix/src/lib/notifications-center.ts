"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ProjectNotification, WorkspaceProject } from "@/data/project-board";
import { useHydrated } from "@/lib/use-hydrated";
import { emitPersistentStateSync, usePersistentState } from "@/lib/use-persistent-state";
import {
  PROJECT_NOTIFICATIONS_STORAGE_KEY,
  PROJECT_NOTIFICATION_SNOOZED_STORAGE_KEY,
} from "@/lib/workspace-counts";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import type { NotificationsCenterData } from "@/lib/notifications-db";
import { writeCompatibleLocalStorageItem } from "@/lib/storage-compat";

type NotificationsCenterMode = "loading" | "remote" | "demo" | "local";

type NotificationsCenterCache = {
  mode: NotificationsCenterMode;
  data: NotificationsCenterData;
};

type NotificationsResponse = {
  data?: NotificationsCenterData;
  error?: string;
  mode?: "remote" | "demo";
};

type UseNotificationsCenterOptions = {
  requireFresh?: boolean;
};

let notificationsRequestSequence = 0;
let notificationsLatestAppliedSequence = 0;
let notificationsMutationBarrierSequence = 0;

export type NotificationMutation =
  | {
      action: "set-read";
      projectRef: string;
      notificationId: string;
      unread: boolean;
    }
  | {
      action: "set-snoozed";
      projectRef: string;
      notificationId: string;
      snoozed: boolean;
    }
  | {
      action: "remove";
      projectRef: string;
      notificationId: string;
    }
  | {
      action: "mark-all-read";
    };

const NOTIFICATIONS_CACHE_KEY = "planix.cache.notifications-center";
const NOTIFICATIONS_CACHE_MAX_AGE_MS = 60_000;
const WORKSPACE_PROJECTS_STORAGE_KEY = "planix.workspace.projects";

function beginNotificationsRequest({ mutation = false }: { mutation?: boolean } = {}) {
  notificationsRequestSequence += 1;

  if (mutation) {
    notificationsMutationBarrierSequence = notificationsRequestSequence;
  }

  return notificationsRequestSequence;
}

function shouldApplyNotificationsResponse(requestSequence: number) {
  return (
    requestSequence >= notificationsMutationBarrierSequence
    && requestSequence >= notificationsLatestAppliedSequence
  );
}

function markNotificationsResponseApplied(requestSequence: number) {
  notificationsLatestAppliedSequence = requestSequence;
}

async function readJsonSafely<T>(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function persistNotificationsSnapshot(data: NotificationsCenterData) {
  const storageEntries = [
    [WORKSPACE_PROJECTS_STORAGE_KEY, data.workspaceProjects],
    [PROJECT_NOTIFICATIONS_STORAGE_KEY, data.projectNotificationsStore],
    [PROJECT_NOTIFICATION_SNOOZED_STORAGE_KEY, data.snoozedNotifications],
  ] as const;

  for (const [storageKey, value] of storageEntries) {
    try {
      writeCompatibleLocalStorageItem(storageKey, JSON.stringify(value));
      emitPersistentStateSync(storageKey, value);
    } catch {
      // Ignore storage write failures and keep the in-memory UI state usable.
    }
  }
}

export function useNotificationsCenter(options: UseNotificationsCenterOptions = {}) {
  const { requireFresh = false } = options;
  const hydrated = useHydrated();
  const isMountedRef = useRef(false);
  const cached = readMemoryCache<NotificationsCenterCache>(NOTIFICATIONS_CACHE_KEY, NOTIFICATIONS_CACHE_MAX_AGE_MS);
  const [workspaceProjects, setWorkspaceProjects] = usePersistentState<WorkspaceProject[]>(
    WORKSPACE_PROJECTS_STORAGE_KEY,
    cached?.data.workspaceProjects ?? [],
  );
  const [projectNotificationsStore, setProjectNotificationsStore] = usePersistentState<Record<string, ProjectNotification[]>>(
    PROJECT_NOTIFICATIONS_STORAGE_KEY,
    cached?.data.projectNotificationsStore ?? {},
  );
  const [snoozedNotifications, setSnoozedNotifications] = usePersistentState<Record<string, boolean>>(
    PROJECT_NOTIFICATION_SNOOZED_STORAGE_KEY,
    cached?.data.snoozedNotifications ?? {},
  );
  const [mode, setMode] = useState<NotificationsCenterMode>(cached?.mode ?? "loading");
  const [error, setError] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [hasResolvedInitialRefresh, setHasResolvedInitialRefresh] = useState(!requireFresh);

  const applyData = useCallback((data: NotificationsCenterData, nextMode: NotificationsCenterMode) => {
    persistNotificationsSnapshot(data);
    setWorkspaceProjects(data.workspaceProjects);
    setProjectNotificationsStore(data.projectNotificationsStore);
    setSnoozedNotifications(data.snoozedNotifications);
    setMode(nextMode);
    writeMemoryCache<NotificationsCenterCache>(NOTIFICATIONS_CACHE_KEY, {
      mode: nextMode,
      data,
    });
  }, [setProjectNotificationsStore, setSnoozedNotifications, setWorkspaceProjects]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    const requestSequence = beginNotificationsRequest();
    const response = await fetch("/api/notifications", {
      cache: "no-store",
      signal,
    });
    const result = await readJsonSafely<NotificationsResponse>(response);

    if (!response.ok || !result?.data) {
      throw new Error(result?.error || "Failed to load notifications.");
    }

    if (signal?.aborted || !isMountedRef.current || !shouldApplyNotificationsResponse(requestSequence)) {
      return result.data;
    }

    markNotificationsResponseApplied(requestSequence);
    applyData(result.data, result.mode ?? "remote");
    setError("");
    return result.data;
  }, [applyData]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;
    const abortController = new AbortController();

    async function loadNotifications() {
      try {
        await refresh({ signal: abortController.signal });
      } catch (loadError) {
        if (!cancelled && !isAbortError(loadError)) {
          setMode("local");
          setError(loadError instanceof Error ? loadError.message : "Failed to load notifications.");
        }
      } finally {
        if (!cancelled && !abortController.signal.aborted) {
          setHasResolvedInitialRefresh(true);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [hydrated, refresh]);

  const mutate = useCallback(async (input: NotificationMutation) => {
    const requestSequence = beginNotificationsRequest({ mutation: true });
    setIsMutating(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const result = await readJsonSafely<NotificationsResponse>(response);

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "Failed to update notifications.");
      }

      if (!shouldApplyNotificationsResponse(requestSequence)) {
        return result.data;
      }

      markNotificationsResponseApplied(requestSequence);
      applyData(result.data, result.mode ?? "remote");
      setError("");
      return result.data;
    } finally {
      setIsMutating(false);
    }
  }, [applyData]);

  const setLocalData = useCallback(
    (updater: (current: NotificationsCenterData) => NotificationsCenterData) => {
      const next = updater({
        workspaceProjects,
        projectNotificationsStore,
        snoozedNotifications,
      });

      applyData(next, mode === "loading" ? "local" : mode);
      return next;
    },
    [applyData, mode, projectNotificationsStore, snoozedNotifications, workspaceProjects],
  );

  const hasLocalCache = useMemo(
    () => workspaceProjects.length > 0 || Object.keys(projectNotificationsStore).length > 0,
    [projectNotificationsStore, workspaceProjects.length],
  );

  return {
    hydrated,
    mode,
    error,
    isLoading: !hydrated || (requireFresh ? !hasResolvedInitialRefresh : mode === "loading" && !hasLocalCache),
    isMutating,
    workspaceProjects,
    projectNotificationsStore,
    snoozedNotifications,
    refresh,
    mutate,
    setLocalData,
  };
}
