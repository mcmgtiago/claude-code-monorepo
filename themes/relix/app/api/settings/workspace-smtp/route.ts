import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/team";

const workspaceSmtpSchema = z.object({
  smtpHost: z.string().optional().default(""),
  smtpPort: z.coerce.number().int().min(1).max(65535).optional().nullable(),
  smtpUser: z.string().optional().default(""),
  smtpPass: z.string().optional().default(""),
  smtpFrom: z.string().optional().default("")
});

export async function GET() {
  try {
    const currentUser = await requireUser();

    if (!currentUser.workspaceId) {
      return NextResponse.json({ error: "No workspace assigned." }, { status: 400 });
    }

    const settings = await prisma.workspaceSetting.findFirst({
      where: { workspaceId: currentUser.workspaceId },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPass: true,
        smtpFrom: true
      }
    });

    return NextResponse.json({
      smtpHost: settings?.smtpHost || "",
      smtpPort: settings?.smtpPort ? String(settings.smtpPort) : "587",
      smtpUser: settings?.smtpUser || "",
      smtpPass: settings?.smtpPass || "",
      smtpFrom: settings?.smtpFrom || "",
      configured: Boolean(settings?.smtpHost && settings?.smtpPort && settings?.smtpUser && settings?.smtpPass && settings?.smtpFrom)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load workspace SMTP settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canManageTeam(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only admins and managers can update workspace mail settings." }, { status: 403 });
    }

    if (!currentUser.workspaceId) {
      return NextResponse.json({ error: "No workspace assigned." }, { status: 400 });
    }

    const body = await request.json();
    const payload = workspaceSmtpSchema.parse(body);

    const smtpPort = payload.smtpPort ?? null;

    await prisma.workspaceSetting.upsert({
      where: { workspaceId: currentUser.workspaceId },
      update: {
        smtpHost: payload.smtpHost || null,
        smtpPort,
        smtpUser: payload.smtpUser || null,
        smtpPass: payload.smtpPass || null,
        smtpFrom: payload.smtpFrom || null
      },
      create: {
        workspaceId: currentUser.workspaceId,
        smtpHost: payload.smtpHost || null,
        smtpPort,
        smtpUser: payload.smtpUser || null,
        smtpPass: payload.smtpPass || null,
        smtpFrom: payload.smtpFrom || null
      }
    });

    return NextResponse.json({
      smtpHost: payload.smtpHost || "",
      smtpPort: smtpPort ? String(smtpPort) : "587",
      smtpUser: payload.smtpUser || "",
      smtpPass: payload.smtpPass || "",
      smtpFrom: payload.smtpFrom || "",
      configured: Boolean(payload.smtpHost && smtpPort && payload.smtpUser && payload.smtpPass && payload.smtpFrom)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid SMTP settings", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save workspace SMTP settings" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const currentUser = await requireUser();

    if (!canManageTeam(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only admins and managers can update workspace mail settings." }, { status: 403 });
    }

    if (!currentUser.workspaceId) {
      return NextResponse.json({ error: "No workspace assigned." }, { status: 400 });
    }

    await prisma.workspaceSetting.updateMany({
      where: { workspaceId: currentUser.workspaceId },
      data: {
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpPass: null,
        smtpFrom: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to clear workspace SMTP settings" }, { status: 500 });
  }
}
