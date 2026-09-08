import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-server";
import { createUniqueMeetingSlug, isMeetingSlugAvailable } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";
import { createUniqueWorkspaceSlug, slugifyWorkspaceName } from "@/lib/workspace";

const createWorkspaceSchema = z.object({
  workspaceName: z.string().trim().min(2),
  companyWebsite: z.string().trim().optional().default("")
});

const workspaceSchema = z.object({
  workspaceId: z.string().cuid(),
  workspaceName: z.string().trim().min(2),
  workspaceSlug: z.string().trim().optional().default(""),
  companyWebsite: z.string().trim().optional().default(""),
  profileName: z.string().trim().min(2),
  profileEmail: z.string().trim().email(),
  personalMeetingSlug: z.string().trim().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
});

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function createUniqueWorkspaceSlugExceptCurrent(baseName: string, currentWorkspaceId: string) {
  const baseSlug = slugifyWorkspaceName(baseName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === currentWorkspaceId) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const payload = createWorkspaceSchema.parse(await request.json());
    const workspaceName = payload.workspaceName;
    const website = normalizeWebsite(payload.companyWebsite);
    const slug = await createUniqueWorkspaceSlug(workspaceName);
    const meetingSlug = await createUniqueMeetingSlug(slug);
    const schedulingPageSlug = await createUniqueMeetingSlug(`${meetingSlug}-intro`);

    const workspace = await prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          website,
          createdById: currentUser.id
        }
      });

      await tx.workspaceMembership.create({
        data: {
          userId: currentUser.id,
          workspaceId: createdWorkspace.id,
          accessRole: currentUser.accessRole
        }
      });

      await tx.workspaceSetting.create({
        data: {
          workspaceId: createdWorkspace.id,
          countryCode: "IN",
          timezone: "Asia/Kolkata",
          currencyCode: "INR",
          locale: "en-IN",
          dateFormat: "DD MMM YYYY",
          timeFormat: "12h",
          weekStartsOn: "Monday"
        }
      });

      await tx.meetingPreference.create({
        data: {
          workspaceId: createdWorkspace.id,
          profileName: currentUser.fullName,
          profileEmail: currentUser.email,
          personalMeetingSlug: meetingSlug
        }
      });

      await tx.schedulingPage.create({
        data: {
          workspaceId: createdWorkspace.id,
          title: "Intro call",
          slug: schedulingPageSlug,
          durationMinutes: 30,
          hostType: "Single host",
          active: true,
          hostName: currentUser.fullName,
          hostEmail: currentUser.email
        }
      });

      await tx.company.create({
        data: {
          workspaceId: createdWorkspace.id,
          name: workspaceName,
          website,
          stage: "Engaged"
        }
      });

      return createdWorkspace;
    });

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      website: workspace.website || ""
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid workspace payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create workspace" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const payload = workspaceSchema.parse(await request.json());

    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
      select: { id: true, name: true }
    });

    if (!existingWorkspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const workspaceName = payload.workspaceName;
    const workspaceSlug = await createUniqueWorkspaceSlugExceptCurrent(payload.workspaceSlug || workspaceName, payload.workspaceId);
    const website = normalizeWebsite(payload.companyWebsite);
    const profileEmail = payload.profileEmail.toLowerCase();
    const personalMeetingSlug = payload.personalMeetingSlug.toLowerCase();
    const existingMeetingPreference = await prisma.meetingPreference.findUnique({
      where: { workspaceId: payload.workspaceId },
      select: { id: true }
    });

    if (
      !(await isMeetingSlugAvailable(personalMeetingSlug, {
        excludeMeetingPreferenceId: existingMeetingPreference?.id
      }))
    ) {
      return NextResponse.json({ error: "That meeting scheduler slug is already in use." }, { status: 409 });
    }

    const [workspace, workspaceUsers, , meetingPreference] = await prisma.$transaction([
      prisma.workspace.update({
        where: { id: payload.workspaceId },
        data: {
          name: workspaceName,
          slug: workspaceSlug,
          website
        }
      }),
      prisma.user.updateMany({
        where: { workspaceId: payload.workspaceId },
        data: {
          workspaceName,
          companyWebsite: website
        }
      }),
      prisma.company.updateMany({
        where: {
          workspaceId: payload.workspaceId,
          name: existingWorkspace.name
        },
        data: {
          name: workspaceName,
          website
        }
      }),
      prisma.meetingPreference.upsert({
        where: { workspaceId: payload.workspaceId },
        update: {
          profileName: payload.profileName,
          profileEmail,
          personalMeetingSlug
        },
        create: {
          workspaceId: payload.workspaceId,
          profileName: payload.profileName,
          profileEmail,
          personalMeetingSlug
        }
      })
    ]);

    return NextResponse.json({
      workspaceId: workspace.id,
      workspaceName,
      workspaceSlug: workspace.slug,
      companyWebsite: workspace.website || "",
      profileName: meetingPreference.profileName,
      profileEmail: meetingPreference.profileEmail,
      personalMeetingSlug: meetingPreference.personalMeetingSlug,
      updatedUsers: workspaceUsers.count
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid workspace payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update workspace" }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ error: "Use the workspace-specific delete endpoint in SaaS mode." }, { status: 405 });
}
