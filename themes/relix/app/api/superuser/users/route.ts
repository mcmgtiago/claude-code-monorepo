import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-password";
import { requireUser } from "@/lib/auth-server";
import { getPasswordValidationMessage, isPasswordValid } from "@/lib/password-rules";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";

const createUserSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    accessRole: z.enum(["SUPERUSER", "ADMIN", "MANAGER", "MEMBER"]),
    jobRole: z.string().optional().default(""),
    workspaceId: z.string().cuid().nullable().optional()
  })
  .superRefine((value, ctx) => {
    if (!isPasswordValid(value.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: getPasswordValidationMessage()
      });
    }
  });

export async function POST(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const payload = createUserSchema.parse(await request.json());
    const email = payload.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Another account already uses this email." }, { status: 409 });
    }

    const workspace = payload.workspaceId
      ? await prisma.workspace.findUnique({
          where: { id: payload.workspaceId },
          select: { id: true, name: true }
        })
      : null;

    if (payload.workspaceId && !workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const now = new Date();
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          fullName: payload.fullName.trim(),
          email,
          passwordHash: await hashPassword(payload.password),
          accessRole: payload.accessRole,
          status: "ACTIVE",
          jobRole: payload.jobRole.trim() || null,
          workspaceId: workspace?.id || null,
          workspaceName: workspace?.name || null,
          onboardingCompleted: Boolean(workspace),
          onboardingCompletedAt: workspace ? now : null,
          lastActiveAt: now
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImageUrl: true,
          profileImageAsset: { select: { updatedAt: true } },
          accessRole: true,
          status: true,
          workspaceId: true,
          workspaceName: true,
          jobRole: true,
          onboardingCompleted: true,
          createdAt: true,
          lastActiveAt: true
        }
      });

      if (workspace) {
        await tx.workspaceMembership.create({
          data: {
            userId: createdUser.id,
            workspaceId: workspace.id,
            accessRole: payload.accessRole
          }
        });
      }

      return createdUser;
    });

    return NextResponse.json({ user: { ...user, avatarUrl: getWorkspaceUserAvatarUrl(user) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid user payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create user" }, { status: 500 });
  }
}
