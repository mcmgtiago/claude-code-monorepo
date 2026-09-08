import { NextResponse } from "next/server";

import {
  createDemoTask,
  getDemoTasks,
} from "@/lib/template-demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectRef = searchParams.get("projectRef")?.trim() ?? "";

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, tasks: getDemoTasks(projectRef) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    description?: string;
    statusId?: string;
    tag?: string;
    priority?: "Normal" | "Medium" | "High" | "Done";
    assignedTo?: string | string[];
    dueDate?: string | null;
    reminderDate?: string | null;
    createdBy?: string;
    subtasks?: Array<{ id?: string; title?: string; completed?: boolean }>;
    notes?: string[];
    links?: Array<{ id?: string; url?: string }>;
    comments?: Array<{ id?: string; body?: string }>;
    fileIds?: string[];
    projectRef?: string;
    sortOrder?: number;
  };

  const projectRef = body.projectRef?.trim() ?? "";
  const title = body.title?.trim() ?? "";

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Task title is required." }, { status: 400 });
  }

  const task = createDemoTask({
    project_ref: projectRef,
    title,
    description: body.description?.trim() || "",
    status_id: body.statusId || "open",
    tag: body.tag || "General",
    priority: body.priority || "Normal",
    assigned_to: Array.isArray(body.assignedTo) ? body.assignedTo.join(", ") : body.assignedTo ?? null,
    due_date: body.dueDate ?? null,
    reminder_at: body.reminderDate ?? null,
    reminder_date: body.reminderDate ?? null,
    created_by: body.createdBy || "Planix Studio",
    subtasks: (body.subtasks ?? []).map((item, index) => ({
      id: item.id?.trim() || `subtask-${Date.now()}-${index + 1}`,
      title: item.title?.trim() || "",
      completed: Boolean(item.completed),
    })).filter((item) => item.title),
    notes: (body.notes ?? []).map((item) => item.trim()).filter(Boolean),
    links: (body.links ?? []).map((item, index) => ({
      id: item.id?.trim() || `link-${Date.now()}-${index + 1}`,
      url: item.url?.trim() || "",
    })).filter((item) => item.url),
    comments: (body.comments ?? []).map((item, index) => ({
      id: item.id?.trim() || `comment-${Date.now()}-${index + 1}`,
      body: item.body?.trim() || "",
    })).filter((item) => item.body),
    file_ids: (body.fileIds ?? []).map((item) => item.trim()).filter(Boolean),
    sort_order: body.sortOrder ?? getDemoTasks(projectRef).length,
  });

  return NextResponse.json({ ok: true, task }, { status: 201 });
}
