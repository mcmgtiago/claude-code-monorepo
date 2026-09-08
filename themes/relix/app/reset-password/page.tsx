import { redirectIfAuthenticated } from "@/lib/auth-server";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated();
  const platform = await getPlatformSettings();

  return (
    <AuthShell
      appName={platform.appName}
      appLogoUrl={platform.appLogoUrl}
      artwork="forgot"
      title="Set a new password"
      description="Choose a fresh password to restore access to your workspace."
      variant="centered"
      footer={null}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
