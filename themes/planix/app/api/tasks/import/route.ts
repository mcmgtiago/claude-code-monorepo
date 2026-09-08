import { NextResponse } from "next/server";

import { parseTasksCsv } from "@/lib/task-data-exchange";
import { createDemoTask, getDemoTasks } from "@/lib/template-demo-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    projectRef?: string;
    csv?: string;
  };

  const projectRef = body.projectRef?.trim() ?? "";
  const csv = body.csv ?? "";

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  if (!csv.trim()) {
    return NextResponse.json({ error: "CSV file is empty." }, { status: 400 });
  }

  const parsed = parseTasksCsv(csv);

  if (parsed.tasks.length === 0) {
    return NextResponse.json({ error: "No importable tasks were found." }, { status: 400 });
  }

  parsed.tasks.forEach((task, index) => {
    createDemoTask({
      project_ref: projectRef,
      title: task.title,
      description: task.description,
      status_id: task.statusId,
      tag: task.tag || "General",
      priority: task.priority,
      assigned_to: task.assignedTo.join(", "),
      due_date: task.dueDate || null,
      created_by: "CSV Import",
      subtasks: task.subtasks,
      notes: task.notes,
      links: task.links,
      comments: task.comments,
      sort_order: getDemoTasks(projectRef).length + index,
    });
  });

  return NextResponse.json({
    ok: true,
    importedCount: parsed.tasks.length,
    skippedRowCount: parsed.skippedRowCount,
    tasks: getDemoTasks(projectRef),
  });
}
