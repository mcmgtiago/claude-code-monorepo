import { prisma } from "@/lib/prisma";
import { TeamWorkspace } from "@/components/team-workspace";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function TeamPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const inviteNotice = Array.isArray(resolvedSearchParams.inviteNotice)
    ? resolvedSearchParams.inviteNotice[0]
    : resolvedSearchParams.inviteNotice;
  const legacyMembers = await prisma.user.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, accessRole: true }
  });

  await Promise.all(
    legacyMembers.map((member) =>
      prisma.workspaceMembership.upsert({
        where: {
          userId_workspaceId: {
            userId: member.id,
            workspaceId: workspace.id
          }
        },
        update: {},
        create: {
          userId: member.id,
          workspaceId: workspace.id,
          accessRole: member.accessRole
        }
      })
    )
  );

  const [members, invites] = await Promise.all([
    prisma.workspaceMembership.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImageUrl: true,
            profileImageAsset: { select: { updatedAt: true } },
            status: true,
            createdAt: true,
            lastActiveAt: true
          }
        }
      },
      orderBy: [{ accessRole: "asc" }, { user: { fullName: "asc" } }]
    }),
    prisma.teamInvite.findMany({
      where: { status: "PENDING", workspaceId: workspace.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        accessRole: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        invitedBy: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const memberRows = members.map((membership) => ({
    id: membership.user.id,
    fullName: membership.user.fullName,
    email: membership.user.email,
    avatarUrl: getWorkspaceUserAvatarUrl(membership.user),
    accessRole: membership.accessRole,
    status: membership.user.status,
    createdAt: membership.user.createdAt,
    lastActiveAt: membership.user.lastActiveAt,
    isWorkspaceOwner: membership.user.id === workspace.createdById
  }));

  return (
    <TeamWorkspace
      currentUser={{
        ...currentUser,
        isWorkspaceOwner: currentUser.id === workspace.createdById
      }}
      members={memberRows}
      invites={invites}
      initialFeedback={inviteNotice}
    />
  );
}
