import { redirectIfAuthenticated } from "@/lib/auth-server";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function SignupPage() {
  await redirectIfAuthenticated();
  const platform = await getPlatformSettings();

  return (
    <AuthShell
      appName={platform.appName}
      appLogoUrl={platform.appLogoUrl}
      artwork="signup"
      title="Get started"
      description="Create your account and enter the workspace."
      variant="centered"
      footer={null}
    >
      <SignupForm />
    </AuthShell>
  );
}
