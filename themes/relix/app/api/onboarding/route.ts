import { z } from "zod";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { createOrRefreshTeamInvite } from "@/lib/team-invites";
import { createWorkspaceForUser } from "@/lib/workspace-membership";

const onboardingSchema = z.object({
  jobRole: z.string().min(2),
  primaryUseCase: z.string().min(2),
  teamSize: z.string().min(1),
  workspaceName: z.string().min(2),
  companyWebsite: z.string().optional().default(""),
  hasExistingData: z.boolean().optional().default(false),
  importTarget: z.enum(["contacts", "companies", "deals", "all", "none"]).optional().default("none"),
  setupPipelineNow: z.boolean().optional().default(false),
  pipelineStages: z.array(z.string().min(1)).max(8).optional().default([]),
  inviteTeamNow: z.boolean(),
  inviteEmails: z.array(z.string().email()).max(20)
});

function normalizeWebsite(input: string) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json();
    const payload = onboardingSchema.parse(raw);
    const website = normalizeWebsite(payload.companyWebsite);
    const importTarget = payload.hasExistingData ? payload.importTarget : "none";
    const pipelineStages = payload.setupPipelineNow
      ? payload.pipelineStages.map((item) => item.trim()).filter(Boolean)
      : [];
    const inviteEmails = payload.inviteTeamNow
      ? [...new Set(payload.inviteEmails.map((item) => item.trim().toLowerCase()).filter(Boolean))]
      : [];

    const workspaceName = payload.workspaceName.trim();
    const workspace = await createWorkspaceForUser({
      user: currentUser,
      workspaceName,
      website,
      activate: true
    });

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        jobRole: payload.jobRole.trim(),
        primaryUseCase: payload.primaryUseCase.trim(),
        teamSize: payload.teamSize,
        companyWebsite: website,
        hasExistingData: payload.hasExistingData,
        importTarget,
        setupPipelineNow: payload.setupPipelineNow,
        pipelineStagesJson: JSON.stringify(pipelineStages),
        inviteTeamNow: payload.inviteTeamNow,
        inviteEmailsJson: JSON.stringify(inviteEmails)
      }
    });

    const inviteWarnings: string[] = [];
    const inviteFailures: string[] = [];

    for (const email of inviteEmails) {
      try {
        const result = await createOrRefreshTeamInvite({
          workspaceId: workspace.id,
          email,
          accessRole: "MEMBER",
          invitedById: currentUser.id,
          invitedByName: currentUser.fullName,
          senderUserId: currentUser.id
        });

        if (result.warning) {
          inviteWarnings.push(`${email}: ${result.warning}`);
        }
      } catch (error) {
        inviteFailures.push(`${email}: ${error instanceof Error ? error.message : "Unable to create invite."}`);
      }
    }

    const inviteFailureCount = inviteFailures.length;
    const inviteWarningCount = inviteWarnings.length;
    const inviteNotice = [
      inviteFailureCount ? `${inviteFailureCount} invite${inviteFailureCount === 1 ? "" : "s"} could not be created.` : "",
      inviteWarningCount ? `${inviteWarningCount} invite${inviteWarningCount === 1 ? "" : "s"} were saved, but email delivery needs attention.` : ""
    ]
      .filter(Boolean)
      .join(" ");
    const redirectTo = inviteEmails.length
      ? inviteNotice
        ? `/team?inviteNotice=${encodeURIComponent(inviteNotice)}`
        : "/team"
      : "/";

    const response = NextResponse.json({
      success: true,
      redirectTo,
      inviteWarnings,
      inviteFailures
    });
    const sessionToken = await createSessionToken({
      userId: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.fullName,
      sessionVersion: currentUser.sessionVersion,
      onboardingCompleted: true,
      profileImageUrl: currentUser.profileImageUrl ?? null
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid onboarding payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save onboarding" }, { status: 500 });
  }
}
