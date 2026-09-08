import { FaqShell } from "@/components/faq/faq-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export default async function FaqPage() {
  await redirectToWorkspaceSetupIfNeeded();
  return <FaqShell />;
}
