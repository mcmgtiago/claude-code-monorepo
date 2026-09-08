import {
  AuthShell,
} from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Your recovery session is ready. Choose a fresh password and continue into Planix."
      artwork="forgot"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
