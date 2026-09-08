"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AvatarTone } from "@/data/dashboard";
import type { TaskPriority, WorkspaceProject } from "@/data/project-board";
import { readJsonSafely } from "@/lib/settings-client";
import { TASK_DATA_CHANGED_EVENT } from "@/lib/task-events";
import { getDemoWorkspaceProjects } from "@/lib/template-demo-store";
import { usePersistentState } from "@/lib/use-persistent-state";

type ApiTaskRecord = {
  id: number;
  title: string;
  description: string;
  status_id: string;
  tag: string;
  priority?: TaskPriority | null;
  assigned_to: string | null;
  due_date: string | null;
  reminder_at?: string | null;
  reminder_date?: string | null;
  created_by: string;
  subtasks: unknown;
  created_at: string;
  completed_at?: string | null;
  project_ref?: string;
  sort_order?: number;
};

export type DashboardTaskRecord = ApiTaskRecord & {
  projectName: string;
  projectTone: AvatarTone;
};

const FALLBACK_TONES: AvatarTone[] = ["sand", "rose", "olive", "slate", "peach"];

export function buildInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function splitAssignedNames(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useDashboardTasks() {
  const [projects] = usePersistentState<WorkspaceProject[]>("planix.workspace.projects", getDemoWorkspaceProjects());
  const [tasks, setTasks] = useState<DashboardTaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const visibleProjects = useMemo(
    () => projects.filter((project) => !project.hidden && !project.archived),
    [projects],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadTasks = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (visibleProjects.length === 0) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setTasks([]);
        setLoading(false);
      }
      return;
    }

    try {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(true);
      }

      const responses = await Promise.all(
        visibleProjects.map(async (project, index) => {
          const response = await fetch(`/api/tasks?projectRef=${encodeURIComponent(String(project.id))}`, {
            cache: "no-store",
          });
          const payload = await readJsonSafely<{ tasks?: ApiTaskRecord[] }>(response);

          if (!response.ok || !Array.isArray(payload?.tasks)) {
            return [];
          }

          const tone = project.tone ?? FALLBACK_TONES[index % FALLBACK_TONES.length];

          return payload.tasks.map((task) => ({
            ...task,
            projectName: project.name,
            projectTone: tone,
          }));
        }),
      );

      if (mountedRef.current && requestId === requestIdRef.current) {
        setTasks(responses.flat());
      }
    } catch {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setTasks([]);
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [visibleProjects]);

  useEffect(() => {
    void loadTasks();

    const handleRefresh = () => {
      void loadTasks();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadTasks();
      }
    };
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadTasks();
      }
    }, 30000);

    window.addEventListener("focus", handleRefresh);
    window.addEventListener(TASK_DATA_CHANGED_EVENT, handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(TASK_DATA_CHANGED_EVENT, handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadTasks]);

  return {
    loading,
    tasks,
    visibleProjects,
  };
}
