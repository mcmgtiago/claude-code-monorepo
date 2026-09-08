import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthShell
      title="Forgot Password?"
      subtitle="Lost Your Key? Reset Your Password and Regain Control!"
      artwork="forgot"
    >
      <ForgotPasswordForm initialEmail={getFirstSearchParam(resolvedSearchParams.email)} />
    </AuthShell>
  );
}
