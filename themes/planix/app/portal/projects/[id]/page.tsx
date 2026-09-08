import { notFound } from "next/navigation";

import { ClientPortalProjectShell } from "@/components/portal/client-portal-project-shell";
import { getDemoPortalProjectDetail } from "@/lib/template-demo-store";

export const dynamic = "force-dynamic";

export default async function ClientPortalProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const projectData = getDemoPortalProjectDetail(projectId);

  if (!projectData) {
    notFound();
  }

  return (
    <ClientPortalProjectShell
      project={projectData.project}
      tasks={projectData.tasks}
      files={projectData.files}
      discussions={projectData.discussions}
      notifications={projectData.notifications}
      canMessage={projectData.account.canMessage}
    />
  );
}
