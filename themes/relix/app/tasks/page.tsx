import { TasksWorkspace } from "@/components/tasks-workspace";
import { prisma } from "@/lib/prisma";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ section?: string; taskId?: string }>;
}) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const { section, taskId } = await searchParams;
  const localization = await getWorkspaceLocalizationSettings();

  const [tasks, teamMembers, leads] = await Promise.all([
    prisma.task.findMany({
      where: { workspaceId: workspace.id },
      include: {
        lead: {
          include: {
            companyRecord: { select: { id: true, name: true, logoUrl: true } }
          }
        },
        contact: {
          include: {
            company: true
          }
        },
        company: true
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", workspaceId: workspace.id },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true, profileImageUrl: true, profileImageAsset: { select: { updatedAt: true } } }
    }),
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, company: true }
    })
  ]);

  const initialSection = section === "status" || section === "assigned" ? section : "all";

  return (
    <TasksWorkspace
      initialTasks={tasks}
      initialSection={initialSection}
      initialTaskId={taskId || null}
      localization={localization}
      currentUser={{ name: currentUser.fullName, email: currentUser.email, avatarUrl: currentUser.profileImageUrl || null }}
      teamMembers={teamMembers.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        avatarUrl: getWorkspaceUserAvatarUrl(member)
      }))}
      pipelineLeads={leads}
    />
  );
}
