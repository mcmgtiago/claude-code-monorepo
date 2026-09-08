import { NextResponse } from "next/server";

import type { ProjectFileRecord } from "@/lib/project-files";
import { getDemoProjectFiles, setDemoProjectFiles } from "@/lib/template-demo-store";

async function fileToDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${file.type || "application/octet-stream"};base64,${bytes}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectRef = searchParams.get("projectRef")?.trim() ?? "";

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, files: getDemoProjectFiles(projectRef), mode: "remote" });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const projectRef = String(formData.get("projectRef") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim() || null;
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "Select at least one file to upload." }, { status: 400 });
  }

  const existing = getDemoProjectFiles(projectRef);
  const uploaded: ProjectFileRecord[] = await Promise.all(files.map(async (file, index) => ({
    id: `file-${Date.now()}-${index + 1}`,
    projectRef,
    documentId,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    url: await fileToDataUrl(file),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })));

  const nextFiles = setDemoProjectFiles(projectRef, [...existing, ...uploaded]);
  return NextResponse.json({ ok: true, files: nextFiles }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    action?: "rename" | "duplicate";
    projectRef?: string;
    fileId?: string;
    name?: string;
  };
  const projectRef = body.projectRef?.trim() ?? "";
  const fileId = body.fileId?.trim() ?? "";

  if (!projectRef || !fileId || !body.action) {
    return NextResponse.json({ error: "Project files update is missing required fields." }, { status: 400 });
  }

  const files = getDemoProjectFiles(projectRef);
  const target = files.find((file) => file.id === fileId);

  if (!target) {
    return NextResponse.json({ error: "Project file not found." }, { status: 404 });
  }

  const nextFiles = body.action === "rename"
    ? files.map((file) => file.id === fileId ? { ...file, name: body.name?.trim() || file.name, updatedAt: new Date().toISOString() } : file)
    : [
        ...files,
        {
          ...target,
          id: `file-${Date.now()}`,
          name: `${target.name.replace(/(\.[^.]+)?$/, " copy$1")}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

  return NextResponse.json({ ok: true, files: setDemoProjectFiles(projectRef, nextFiles) });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as {
    projectRef?: string;
    fileId?: string;
  };
  const projectRef = body.projectRef?.trim() ?? "";
  const fileId = body.fileId?.trim() ?? "";

  if (!projectRef || !fileId) {
    return NextResponse.json({ error: "Project files delete is missing required fields." }, { status: 400 });
  }

  const files = getDemoProjectFiles(projectRef).filter((file) => file.id !== fileId);
  return NextResponse.json({ ok: true, files: setDemoProjectFiles(projectRef, files) });
}
