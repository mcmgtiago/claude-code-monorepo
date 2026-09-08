import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/auth-forms";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthShell
      title="Create an account"
      subtitle="Empower Your Projects, Simplify Your Success!"
      artwork="signup"
    >
      <SignupForm initialEmail={getFirstSearchParam(resolvedSearchParams.email)} />
    </AuthShell>
  );
}
