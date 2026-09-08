"use client";

export const TASK_DATA_CHANGED_EVENT = "planix:task-data-changed";
export const LEGACY_TASK_DATA_CHANGED_EVENT = "planique:task-data-changed";

export function dispatchTaskDataChanged() {
  window.dispatchEvent(new CustomEvent(TASK_DATA_CHANGED_EVENT));
  window.dispatchEvent(new CustomEvent(LEGACY_TASK_DATA_CHANGED_EVENT));
}
