"use client";

import { useMemo, useState } from "react";
import { BellRing, CalendarDays, Check, Pencil, Trash2, X } from "lucide-react";
import { AppDateTimePicker } from "@/components/app-date-time-picker";
import { formatLocalizedDateTime, type WorkspaceLocalizationSettings } from "@/lib/localization";

export type LeadReminderRecord = {
  id: string;
  title: string;
  remindAt: string | Date;
  completedAt: string | Date | null;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";

function toDateInputValue(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function reminderTone(reminder: LeadReminderRecord) {
  if (reminder.completedAt) {
    return "border-[#cfe9d8] bg-[#f3fbf6]";
  }

  if (new Date(reminder.remindAt).getTime() < Date.now()) {
    return "border-[#ffd7ca] bg-[#fff5f1]";
  }

  return "border-slate-200 bg-white";
}

function reminderLabel(reminder: LeadReminderRecord, localization: WorkspaceLocalizationSettings) {
  if (reminder.completedAt) {
    return `Completed • ${formatLocalizedDateTime(reminder.completedAt, localization)}`;
  }

  const isOverdue = new Date(reminder.remindAt).getTime() < Date.now();
  return `${isOverdue ? "Overdue" : "Remind at"} • ${formatLocalizedDateTime(reminder.remindAt, localization)}`;
}

export function LeadRemindersPanel({
  reminders,
  localization,
  busy,
  canEdit = true,
  compact = false,
  className = "",
  onCreate,
  onToggleComplete,
  onEdit,
  onDelete
}: {
  reminders: LeadReminderRecord[];
  localization: WorkspaceLocalizationSettings;
  busy: boolean;
  canEdit?: boolean;
  compact?: boolean;
  className?: string;
  onCreate: (payload: { title: string; remindAt: string }) => void;
  onToggleComplete: (reminderId: string, completed: boolean) => void;
  onEdit: (reminderId: string, payload: { title: string; remindAt: string }) => void;
  onDelete: (reminderId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState(() => toDateInputValue(new Date(Date.now() + 60 * 60 * 1000)));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editRemindAt, setEditRemindAt] = useState("");

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort((left, right) => {
        if (Boolean(left.completedAt) !== Boolean(right.completedAt)) {
          return left.completedAt ? 1 : -1;
        }

        return new Date(left.remindAt).getTime() - new Date(right.remindAt).getTime();
      }),
    [reminders]
  );

  const submitReminder = () => {
    if (!title.trim() || !remindAt) {
      return;
    }

    onCreate({
      title: title.trim(),
      remindAt: new Date(remindAt).toISOString()
    });
    setTitle("");
    setRemindAt(toDateInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  };

  const startEdit = (reminder: LeadReminderRecord) => {
    setEditingId(reminder.id);
    setEditTitle(reminder.title);
    setEditRemindAt(toDateInputValue(new Date(reminder.remindAt)));
  };

  const submitEdit = (reminderId: string) => {
    if (!editTitle.trim() || !editRemindAt) return;
    onEdit(reminderId, { title: editTitle.trim(), remindAt: new Date(editRemindAt).toISOString() });
    setEditingId(null);
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <BellRing className="h-4 w-4 text-[#386df4]" />
        Reminders
      </h3>

      <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-[minmax(0,1fr)_auto]" : "sm:grid-cols-[minmax(0,1fr)_220px_auto]"}`}>
        <input
          className={`${inputClassName} ${compact ? "col-span-2" : ""}`}
          placeholder="Follow up with pricing reminder"
          value={title}
          disabled={!canEdit}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="relative min-w-0">
          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <AppDateTimePicker
            className={`${inputClassName} pl-10`}
            value={remindAt}
            disabled={!canEdit}
            onChange={setRemindAt}
            placeholder="Reminder time"
          />
        </div>
        <button
          type="button"
          onClick={submitReminder}
          disabled={busy || !canEdit || !title.trim() || !remindAt}
          className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {sortedReminders.length ? (
          sortedReminders.map((reminder) => (
            <div key={reminder.id} className={`rounded-xl border px-3 py-3 ${reminderTone(reminder)}`}>
              {editingId === reminder.id ? (
                <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-[minmax(0,1fr)_220px_auto_auto]"}`}>
                  <input
                    className={inputClassName}
                    value={editTitle}
                    disabled={!canEdit}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="relative min-w-0">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <AppDateTimePicker
                      className={`${inputClassName} pl-10`}
                      value={editRemindAt}
                      disabled={!canEdit}
                      onChange={setEditRemindAt}
                      placeholder="Reminder time"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => submitEdit(reminder.id)}
                    disabled={busy || !canEdit || !editTitle.trim() || !editRemindAt}
                    className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={busy}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-500 hover:bg-slate-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className={`font-medium ${reminder.completedAt ? "text-slate-500 line-through" : "text-slate-800"}`}>{reminder.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{reminderLabel(reminder, localization)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!reminder.completedAt ? (
                    <button
                      type="button"
                      onClick={() => startEdit(reminder)}
                      disabled={busy || !canEdit}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onToggleComplete(reminder.id, !Boolean(reminder.completedAt))}
                      disabled={busy || !canEdit}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                        reminder.completedAt
                          ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          : "border-[#cfe9d8] bg-white text-[#2f9d57] hover:bg-[#f5fcf8]"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {reminder.completedAt ? "Undo" : "Done"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(reminder.id)}
                      disabled={busy || !canEdit}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No reminders added yet.</p>
        )}
      </div>
    </div>
  );
}
