import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { getAuthenticatedHomeRoute, getCurrentUser } from "@/lib/auth-server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const [currentUser, platform] = await Promise.all([getCurrentUser(), getPlatformSettings()]);

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.accessRole === "SUPERUSER" || currentUser.onboardingCompleted) {
    redirect(getAuthenticatedHomeRoute(currentUser));
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      fullName: true,
      email: true,
      jobRole: true,
      primaryUseCase: true,
      teamSize: true,
      workspaceName: true,
      companyWebsite: true,
      hasExistingData: true,
      importTarget: true,
      setupPipelineNow: true,
      pipelineStagesJson: true,
      inviteTeamNow: true,
      inviteEmailsJson: true
    }
  });

  const normalizedWorkspaceName = (() => {
    const workspaceName = user?.workspaceName?.trim() || "";
    if (!workspaceName) {
      return "";
    }

    const legacyDefaultWorkspaceNames = new Set(["Relix", "Relix CRM"]);
    return legacyDefaultWorkspaceNames.has(workspaceName) ? "" : workspaceName;
  })();

  return (
    <OnboardingFlow
      appName={platform.appName}
      appLogoUrl={platform.appLogoUrl}
      userName={user?.fullName || currentUser.fullName}
      initialData={{
        jobRole: user?.jobRole || "",
        primaryUseCase: user?.primaryUseCase || "",
        teamSize: user?.teamSize || "",
        workspaceName: normalizedWorkspaceName,
        companyWebsite: user?.companyWebsite || "",
        inviteTeamNow: user?.inviteTeamNow ?? false,
        inviteEmails: user?.inviteEmailsJson ? JSON.parse(user.inviteEmailsJson) : []
      }}
    />
  );
}
