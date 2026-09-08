import { redirect } from "next/navigation";

export async function redirectToWorkspaceSetupIfNeeded(_options?: { allowClient?: boolean }) {
  return;
}

export async function redirectFromWorkspaceSetupIfCompleted() {
  redirect("/dashboard");
}
