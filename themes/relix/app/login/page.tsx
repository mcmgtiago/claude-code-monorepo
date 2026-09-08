import { redirectIfAuthenticated } from "@/lib/auth-server";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  const platform = await getPlatformSettings();

  return (
    <AuthShell
      appName={platform.appName}
      appLogoUrl={platform.appLogoUrl}
      artwork="login"
      title="Welcome back"
      description="Sign in to continue."
      variant="centered"
      footer={null}
    >
      <LoginForm />
    </AuthShell>
  );
}
