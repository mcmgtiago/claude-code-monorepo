import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthShell
      title="Login to your account"
      subtitle="Unlock Your Progress - Securely Access Your Project Hub!"
      artwork="login"
    >
      <LoginForm
        initialEmail={getFirstSearchParam(resolvedSearchParams.email)}
        initialError={getFirstSearchParam(resolvedSearchParams.error)}
        nextPath={getFirstSearchParam(resolvedSearchParams.next) || "/dashboard"}
      />
    </AuthShell>
  );
}
