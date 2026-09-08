import { NextResponse } from "next/server";

import { deleteDemoTask, updateDemoTask } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const taskId = Number(id);

  if (!Number.isInteger(taskId)) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown> & {
    projectRef?: string | null;
  };
  const task = updateDemoTask(taskId, {
    title: typeof body.title === "string" ? body.title.trim() : undefined,
    description: typeof body.description === "string" ? body.description.trim() : undefined,
    status_id: typeof body.statusId === "string" ? body.statusId.trim() : undefined,
    tag: typeof body.tag === "string" ? body.tag.trim() : undefined,
    priority: typeof body.priority === "string" ? body.priority as "Normal" | "Medium" | "High" | "Done" : undefined,
    assigned_to: Array.isArray(body.assignedTo)
      ? body.assignedTo.map((item) => `${item}`.trim()).filter(Boolean).join(", ")
      : typeof body.assignedTo === "string"
        ? body.assignedTo.trim()
        : undefined,
    due_date: typeof body.dueDate === "string" ? body.dueDate.trim() : body.dueDate === null ? null : undefined,
    reminder_at: typeof body.reminderDate === "string" ? body.reminderDate.trim() : body.reminderDate === null ? null : undefined,
    reminder_date: typeof body.reminderDate === "string" ? body.reminderDate.trim() : body.reminderDate === null ? null : undefined,
    created_by: typeof body.createdBy === "string" ? body.createdBy.trim() : undefined,
    subtasks: Array.isArray(body.subtasks)
      ? body.subtasks.map((item, index) => {
          const candidate = item as { id?: string; title?: string; completed?: boolean };
          return {
            id: candidate.id?.trim() || `subtask-${taskId}-${index + 1}`,
            title: candidate.title?.trim() || "",
            completed: Boolean(candidate.completed),
          };
        }).filter((item) => item.title)
      : undefined,
    notes: Array.isArray(body.notes) ? body.notes.map((item) => `${item}`.trim()).filter(Boolean) : undefined,
    links: Array.isArray(body.links)
      ? body.links.map((item, index) => {
          const candidate = item as { id?: string; url?: string };
          return {
            id: candidate.id?.trim() || `link-${taskId}-${index + 1}`,
            url: candidate.url?.trim() || "",
          };
        }).filter((item) => item.url)
      : undefined,
    comments: Array.isArray(body.comments)
      ? body.comments.map((item, index) => {
          const candidate = item as { id?: string; body?: string };
          return {
            id: candidate.id?.trim() || `comment-${taskId}-${index + 1}`,
            body: candidate.body?.trim() || "",
          };
        }).filter((item) => item.body)
      : undefined,
    file_ids: Array.isArray(body.fileIds) ? body.fileIds.map((item) => `${item}`.trim()).filter(Boolean) : undefined,
    sort_order: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
    projectRef: typeof body.projectRef === "string" ? body.projectRef : undefined,
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteDemoTask(Number(id));

  if (!deleted) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
