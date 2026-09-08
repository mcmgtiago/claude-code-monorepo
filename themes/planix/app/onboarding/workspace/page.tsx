import { AuthShell } from "@/components/auth/auth-shell";
import { WorkspaceSetupFlow } from "@/components/auth/workspace-setup-flow";
import { redirectFromWorkspaceSetupIfCompleted } from "@/lib/workspace-setup-guard";

export default async function WorkspaceOnboardingPage() {
  await redirectFromWorkspaceSetupIfCompleted();
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Two quick steps, then you can start building projects with your team."
      artwork="signup"
      contentClassName="max-w-[560px]"
    >
      <WorkspaceSetupFlow />
    </AuthShell>
  );
}
