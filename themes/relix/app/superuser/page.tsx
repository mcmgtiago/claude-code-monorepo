import { requireSuperuser } from "@/lib/auth-server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";
import { SuperuserWorkspace } from "@/components/superuser-workspace";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";

export default async function SuperuserPage() {
  const currentUser = await requireSuperuser();
  const platformDefaults = await getPlatformSettings();

  const [users, pendingInvites, workspaces, leadsCount, contactsCount, companiesCount, tasksCount, threadsCount, meetingsCount] = await Promise.all([
    prisma.user.findMany({
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
      },
      orderBy: [{ accessRole: "asc" }, { createdAt: "asc" }]
    }),
    prisma.teamInvite.count({
      where: { status: "PENDING" }
    }),
    prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        createdAt: true,
        createdBy: {
          select: {
            fullName: true,
            email: true
          }
        },
        memberships: {
          select: {
            user: {
              select: {
                id: true,
                status: true
              }
            }
          }
        },
        teamInvites: {
          where: { status: "PENDING" },
          select: { id: true }
        },
        meetingPreference: {
          select: {
            profileName: true,
            profileEmail: true,
            personalMeetingSlug: true
          }
        },
        settings: {
          select: {
            smtpHost: true,
            smtpPort: true,
            smtpUser: true,
            smtpPass: true,
            smtpFrom: true,
            openTrackingEnabled: true,
            clickTrackingEnabled: true,
            imapHost: true,
            imapPort: true,
            imapUser: true,
            imapPass: true,
            imapSecure: true,
            countryCode: true,
            timezone: true,
            currencyCode: true,
            locale: true,
            dateFormat: true,
            timeFormat: true,
            weekStartsOn: true
          }
        },
        _count: {
          select: {
            leads: true,
            contacts: true,
            companies: true,
            tasks: true,
            emailThreads: true,
            meetingEvents: true
          }
        }
      }
    }),
    prisma.lead.count(),
    prisma.contact.count(),
    prisma.company.count(),
    prisma.task.count(),
    prisma.emailThread.count(),
    prisma.meetingEvent.count()
  ]);

  return (
    <SuperuserWorkspace
      currentUserId={currentUser.id}
      currentUserName={currentUser.fullName}
      currentUserEmail={currentUser.email}
      currentUserWorkspaceId={currentUser.workspaceId || null}
      users={users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: getWorkspaceUserAvatarUrl(user),
        accessRole: user.accessRole,
        status: user.status,
        workspaceId: user.workspaceId,
        workspaceName: user.workspaceName,
        jobRole: user.jobRole,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: user.lastActiveAt?.toISOString() || null
      }))}
      workspaces={workspaces.map((workspace) => {
        const smtpHost = workspace.settings?.smtpHost || platformDefaults.smtpHost;
        const smtpPort = workspace.settings?.smtpPort ? String(workspace.settings.smtpPort) : platformDefaults.smtpPort;
        const smtpUser = workspace.settings?.smtpUser || platformDefaults.smtpUser;
        const smtpPass = workspace.settings?.smtpPass || platformDefaults.smtpPass;
        const smtpFrom = workspace.settings?.smtpFrom || platformDefaults.smtpFrom;
        const imapHost = workspace.settings?.imapHost || platformDefaults.imapHost;
        const imapPort = workspace.settings?.imapPort ? String(workspace.settings.imapPort) : platformDefaults.imapPort;
        const imapUser = workspace.settings?.imapUser || platformDefaults.imapUser;
        const imapPass = workspace.settings?.imapPass || platformDefaults.imapPass;
        const imapSecure = typeof workspace.settings?.imapSecure === "boolean" ? workspace.settings.imapSecure : platformDefaults.imapSecure;

        return {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          website: workspace.website || "",
          createdAt: workspace.createdAt.toISOString(),
          ownerName: workspace.createdBy?.fullName || null,
          ownerEmail: workspace.createdBy?.email || null,
          memberCount: workspace.memberships.length,
          activeMembers: workspace.memberships.filter((membership) => membership.user.status === "ACTIVE").length,
          pendingInvites: workspace.teamInvites.length,
          totalRecords:
            workspace._count.leads +
            workspace._count.contacts +
            workspace._count.companies +
            workspace._count.tasks +
            workspace._count.emailThreads +
            workspace._count.meetingEvents,
          smtpConfigured: Boolean(smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom),
          imapConfigured: Boolean(imapHost && imapPort && imapUser && imapPass),
          profileName: workspace.meetingPreference?.profileName || workspace.createdBy?.fullName || currentUser.fullName,
          profileEmail: workspace.meetingPreference?.profileEmail || workspace.createdBy?.email || currentUser.email,
          personalMeetingSlug: workspace.meetingPreference?.personalMeetingSlug || workspace.slug,
          essentials: {
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPass,
            smtpFrom,
            openTrackingEnabled: workspace.settings?.openTrackingEnabled ?? platformDefaults.openTrackingEnabled,
            clickTrackingEnabled: workspace.settings?.clickTrackingEnabled ?? platformDefaults.clickTrackingEnabled,
            imapHost,
            imapPort,
            imapUser,
            imapPass,
            imapSecure,
            countryCode: workspace.settings?.countryCode || "IN",
            timezone: workspace.settings?.timezone || "Asia/Kolkata",
            currencyCode: workspace.settings?.currencyCode || "INR",
            locale: workspace.settings?.locale || "en-IN",
            dateFormat: workspace.settings?.dateFormat || "DD MMM YYYY",
            timeFormat: workspace.settings?.timeFormat || "12h",
            weekStartsOn: workspace.settings?.weekStartsOn || "Monday"
          }
        };
      })}
      overview={{
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.status === "ACTIVE").length,
        suspendedUsers: users.filter((user) => user.status === "SUSPENDED").length,
        pendingInvites,
        totalRecords: leadsCount + contactsCount + companiesCount + tasksCount + threadsCount + meetingsCount,
        totalWorkspaces: workspaces.length
      }}
      platformSettings={platformDefaults}
    />
  );
}
