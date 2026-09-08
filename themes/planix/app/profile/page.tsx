import { ProfileShell } from "@/components/profile/profile-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export default async function ProfilePage() {
  await redirectToWorkspaceSetupIfNeeded();
  return <ProfileShell />;
}
