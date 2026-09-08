import { NextResponse } from "next/server";

import {
  buildTaskCsvFilename,
  mapTaskRowToCsvRecord,
  serializeTasksToCsv,
  type TaskCsvFormat,
} from "@/lib/task-data-exchange";
import { getDemoTasks } from "@/lib/template-demo-store";

function normalizeFormat(value: string | null): TaskCsvFormat {
  if (value === "jira" || value === "asana") {
    return value;
  }

  return "standard";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectRef = searchParams.get("projectRef")?.trim() ?? "";
  const projectName = searchParams.get("projectName")?.trim() ?? "project";
  const format = normalizeFormat(searchParams.get("format"));

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  const csv = serializeTasksToCsv(getDemoTasks(projectRef).map((task) => mapTaskRowToCsvRecord(task)), format);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${buildTaskCsvFilename(projectName, format)}"`,
      "cache-control": "no-store",
    },
  });
}
