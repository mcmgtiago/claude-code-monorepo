import { redirectIfAuthenticated } from "@/lib/auth-server";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  const platform = await getPlatformSettings();

  return (
    <AuthShell
      appName={platform.appName}
      appLogoUrl={platform.appLogoUrl}
      artwork="forgot"
      title="Recover access"
      description="Enter your email to reset your password or create one for a Google-only account."
      variant="centered"
      footer={null}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
