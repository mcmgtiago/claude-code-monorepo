"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  AuthBackLink,
  AuthFooter,
  AuthFormGrid,
  AuthGoogleButton,
  AuthNameField,
  AuthPasswordField,
  AuthPhoneField,
  AuthPrimaryButton,
  AuthRememberRow,
  ControlledAuthEmailField,
} from "@/components/auth/auth-shell";
import { WorkspaceSelectionModal } from "@/components/auth/workspace-selection-modal";
import { clearPlanixBrowserState } from "@/lib/browser-state";
import type { WorkspaceSelectionOption } from "@/lib/workspace-selection";

type AuthState = {
  error: string;
  success: string;
  pending: boolean;
  pendingAction: "submit" | "google" | null;
};

function createAuthState(partial?: Partial<AuthState>): AuthState {
  return {
    error: "",
    success: "",
    pending: false,
    pendingAction: null,
    ...partial,
  };
}

function normalizeNextPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

async function readResponseBody<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function AuthMessage({ error, success }: { error: string; success: string }) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={
        error
          ? "rounded-[14px] border border-[var(--red)]/25 bg-[var(--red)]/8 px-4 py-3 text-[0.86rem] text-[var(--red)]"
          : "rounded-[14px] border border-[var(--green)]/20 bg-[var(--green)]/8 px-4 py-3 text-[0.86rem] text-[var(--green)]"
      }
    >
      {error || success}
    </div>
  );
}

async function startGoogleAuth(nextPath: string) {
  window.location.assign(normalizeNextPath(nextPath, "/dashboard"));
}

export function SignupForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [dialCode, setDialCode] = useState("+1");
  const [state, setState] = useState<AuthState>(createAuthState());
  const emailPrefill = initialEmail.trim().toLowerCase();

  useEffect(() => {
    if (!emailPrefill) {
      return;
    }

    setForm((current) => (current.email.trim() ? current : { ...current, email: emailPrefill }));
  }, [emailPrefill]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(createAuthState({ pending: true, pendingAction: "submit" }));

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone ? `${dialCode}${form.phone}` : "" }),
      });

      const result = await readResponseBody<{
        error?: string;
        message?: string;
        signedIn?: boolean;
      }>(response);

      if (!response.ok) {
        throw new Error(result?.error || `Unable to create the account. Server returned ${response.status}.`);
      }

      setState({
        error: "",
        success: result?.message || "Account created successfully.",
        pending: false,
        pendingAction: null,
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to create the account.",
        success: "",
        pending: false,
        pendingAction: null,
      });
      return;
    }

    setState((current) => ({ ...current, pending: false, pendingAction: null }));
  }

  async function handleGoogleSignup() {
    setState(createAuthState({ pending: true, pendingAction: "google" }));

    try {
      await startGoogleAuth("/onboarding/workspace");
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to continue with Google.",
        success: "",
        pending: false,
        pendingAction: null,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <AuthFormGrid>
        <AuthMessage error={state.error} success={state.success} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthNameField
            label="First Name"
            placeholder="Enter your first name"
            name="firstName"
            value={form.firstName}
            onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            autoComplete="given-name"
            disabled={state.pending}
          />
          <AuthNameField
            label="Last Name"
            placeholder="Enter your last name"
            name="lastName"
            value={form.lastName}
            onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            autoComplete="family-name"
            disabled={state.pending}
          />
        </div>
        <ControlledAuthEmailField
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          disabled={state.pending}
        />
        <AuthPhoneField
          dialCode={dialCode}
          onDialCodeChange={setDialCode}
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          disabled={state.pending}
        />
        <AuthPasswordField
          label="Password"
          placeholder="Enter your password"
          name="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          autoComplete="new-password"
          disabled={state.pending}
        />
        <AuthPrimaryButton
          type="submit"
          loading={state.pendingAction === "submit"}
          disabled={
            state.pending
            || !form.firstName.trim()
            || !form.lastName.trim()
            || !form.email.trim()
            || !form.password.trim()
          }
        >
          {state.pending ? "Creating..." : "Create Account"}
        </AuthPrimaryButton>
        <AuthGoogleButton
          disabled={state.pending}
          loading={state.pendingAction === "google"}
          onClick={() => void handleGoogleSignup()}
        />
        <div className="pt-2">
          <AuthFooter prompt="Do you have an account?" actionLabel="Login" href="/login" />
        </div>
      </AuthFormGrid>
    </form>
  );
}

export function LoginForm({
  initialEmail = "",
  initialError = "",
  nextPath = "/dashboard",
}: {
  initialEmail?: string;
  initialError?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [state, setState] = useState<AuthState>(createAuthState());
  const [workspaceOptions, setWorkspaceOptions] = useState<WorkspaceSelectionOption[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [selectingWorkspaceId, setSelectingWorkspaceId] = useState<string | null>(null);
  const emailPrefill = initialEmail.trim().toLowerCase();
  const authError = initialError.trim();
  const normalizedNextPath = normalizeNextPath(nextPath, "/dashboard");

  useEffect(() => {
    if (!emailPrefill) {
      return;
    }

    setForm((current) => (current.email.trim() ? current : { ...current, email: emailPrefill }));
  }, [emailPrefill]);

  useEffect(() => {
    if (!authError) {
      return;
    }

    setState((current) => (current.error ? current : { ...current, error: authError, success: "" }));
  }, [authError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(createAuthState({ pending: true, pendingAction: "submit" }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          nextPath: normalizedNextPath,
        }),
      });

      const result = await readResponseBody<{
        error?: string;
        signedIn?: boolean;
        workspaceReady?: boolean;
        requiresWorkspaceSelection?: boolean;
        workspaceOptions?: WorkspaceSelectionOption[];
        selectedWorkspaceId?: string;
        redirectPath?: string;
      }>(response);

      if (!response.ok || !result?.signedIn) {
        throw new Error(result?.error || `Unable to sign in. Server returned ${response.status}.`);
      }

      clearPlanixBrowserState();

      if (result.requiresWorkspaceSelection && Array.isArray(result.workspaceOptions) && result.workspaceOptions.length > 1) {
        setWorkspaceOptions(result.workspaceOptions);
        setSelectedWorkspaceId(result.selectedWorkspaceId ?? null);
        setWorkspaceModalOpen(true);
        setState(createAuthState());
        return;
      }

      router.replace(result.redirectPath || (result.workspaceReady ? normalizedNextPath : "/onboarding/workspace"));
      router.refresh();
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to sign in.",
        success: "",
        pending: false,
        pendingAction: null,
      });
      return;
    }

    setState((current) => ({ ...current, pending: false, pendingAction: null }));
  }

  async function handleGoogleLogin() {
    setState(createAuthState({ pending: true, pendingAction: "google" }));

    try {
      await startGoogleAuth(normalizedNextPath);
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to continue with Google.",
        success: "",
        pending: false,
        pendingAction: null,
      });
    }
  }

  async function handleWorkspaceSelect(workspaceId: string) {
    setSelectingWorkspaceId(workspaceId);
    setState(createAuthState());

    try {
      const response = await fetch("/api/auth/workspace-selection", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          nextPath: normalizedNextPath,
        }),
      });
      const result = await readResponseBody<{
        error?: string;
        redirectPath?: string;
        selectedWorkspaceId?: string;
      }>(response);

      if (!response.ok || !result?.redirectPath) {
        throw new Error(result?.error || "Unable to switch workspace.");
      }

      setSelectedWorkspaceId(result.selectedWorkspaceId ?? workspaceId);
      setWorkspaceModalOpen(false);
      router.replace(result.redirectPath);
      router.refresh();
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to switch workspace.",
        success: "",
        pending: false,
        pendingAction: null,
      });
    } finally {
      setSelectingWorkspaceId(null);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <AuthFormGrid>
          <AuthMessage error={state.error} success={state.success} />
          <ControlledAuthEmailField
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            disabled={state.pending}
          />
          <AuthPasswordField
            label="Password"
            placeholder="Enter your password"
            name="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            autoComplete="current-password"
            disabled={state.pending}
          />
          <AuthRememberRow />
          <AuthPrimaryButton
            type="submit"
            loading={state.pendingAction === "submit"}
            disabled={state.pending}
          >
            {state.pending ? "Signing In..." : "Sign In"}
          </AuthPrimaryButton>
          <AuthGoogleButton
            disabled={state.pending}
            loading={state.pendingAction === "google"}
            onClick={() => void handleGoogleLogin()}
          />
          <div className="pt-2">
            <AuthFooter prompt="Don’t have an account?" actionLabel="Sign up" href="/signup" />
          </div>
        </AuthFormGrid>
      </form>

      <WorkspaceSelectionModal
        open={workspaceModalOpen}
        title="Choose your workspace"
        subtitle="This account belongs to multiple workspaces. Pick the one you want to open right now."
        workspaces={workspaceOptions}
        selectedWorkspaceId={selectedWorkspaceId}
        pendingWorkspaceId={selectingWorkspaceId}
        onSelect={(workspaceId) => {
          void handleWorkspaceSelect(workspaceId);
        }}
        dismissible={false}
      />
    </>
  );
}

export function ForgotPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<AuthState>(createAuthState());
  const emailPrefill = initialEmail.trim().toLowerCase();

  useEffect(() => {
    if (!emailPrefill) {
      return;
    }

    setEmail((current) => current.trim() || emailPrefill);
  }, [emailPrefill]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(createAuthState({ pending: true, pendingAction: "submit" }));

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await readResponseBody<{ error?: string; message?: string; redirectPath?: string }>(response);

      if (!response.ok) {
        throw new Error(result?.error || `Unable to send reset instructions. Server returned ${response.status}.`);
      }

      setState({
        error: "",
        success: result?.message || "Reset instructions sent.",
        pending: false,
        pendingAction: null,
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to send reset instructions.",
        success: "",
        pending: false,
        pendingAction: null,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <AuthFormGrid compact>
        <AuthMessage error={state.error} success={state.success} />
        <ControlledAuthEmailField
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={state.pending}
        />
        <AuthPrimaryButton type="submit" loading={state.pendingAction === "submit"} disabled={state.pending || !email.trim()}>
          {state.pending ? "Sending..." : "Reset Password"}
        </AuthPrimaryButton>
        <div className="pt-1 text-center">
          <AuthBackLink />
        </div>
      </AuthFormGrid>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<AuthState>(createAuthState());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setState(createAuthState({ error: "New password is required." }));
      return;
    }

    if (password !== confirmPassword) {
      setState(createAuthState({ error: "Passwords do not match." }));
      return;
    }

    setState(createAuthState({ pending: true, pendingAction: "submit" }));

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await readResponseBody<{ error?: string; message?: string; redirectPath?: string }>(response);

      if (!response.ok) {
        throw new Error(result?.error || `Unable to reset password. Server returned ${response.status}.`);
      }

      setState({
        error: "",
        success: result?.message || "Password updated successfully.",
        pending: false,
        pendingAction: null,
      });

      router.replace(result?.redirectPath || "/dashboard");
      router.refresh();
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to reset password.",
        success: "",
        pending: false,
        pendingAction: null,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <AuthFormGrid compact>
        <AuthMessage error={state.error} success={state.success} />
        <AuthPasswordField
          label="New Password"
          placeholder="Enter your new password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          disabled={state.pending}
        />
        <AuthPasswordField
          label="Confirm Password"
          placeholder="Confirm your new password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          disabled={state.pending}
        />
        <AuthPrimaryButton
          type="submit"
          loading={state.pendingAction === "submit"}
          disabled={state.pending || !password.trim() || !confirmPassword.trim()}
        >
          {state.pending ? "Updating..." : "Update Password"}
        </AuthPrimaryButton>
      </AuthFormGrid>
    </form>
  );
}
