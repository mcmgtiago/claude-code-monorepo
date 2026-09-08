import { PeopleShell } from "@/components/people/people-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export default async function PeoplePage() {
  await redirectToWorkspaceSetupIfNeeded();
  return <PeopleShell />;
}
