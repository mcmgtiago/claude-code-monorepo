import { ProjectTasksBoardShell } from "@/components/projects/project-tasks-board-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export default async function ProjectsTasksPage() {
  await redirectToWorkspaceSetupIfNeeded();
  return <ProjectTasksBoardShell />;
}
