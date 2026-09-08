import { SettingsWorkspace } from "@/components/settings-workspace";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ")
  };
}

function settingsFeedbackFromSearchParam(value: string | string[] | undefined, errorMessage: string | string[] | undefined) {
  const status = firstSearchParam(value);
  const detail = firstSearchParam(errorMessage)?.trim();

  if (status === "google-error" && detail) {
    return `Unable to connect Gmail. ${detail}`;
  }

  if (status === "google-meet-error" && detail) {
    return `Unable to connect Google Meet. ${detail}`;
  }

  switch (status) {
    case "google-connected":
      return "Gmail connected. Outbound mail and inbox sync can now use this Google account.";
    case "google-denied":
      return "Gmail access was cancelled.";
    case "google-invalid-state":
      return "Gmail connection expired. Try connecting again.";
    case "google-missing-config":
      return "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before connecting Gmail.";
    case "google-error":
      return "Unable to connect Gmail.";
    default:
      return null;
  }
}

function integrationFeedbackFromSearchParam(value: string | string[] | undefined, errorMessage: string | string[] | undefined) {
  const status = firstSearchParam(value);
  const detail = firstSearchParam(errorMessage)?.trim();

  if (status === "google-meet-error" && detail) {
    return `Unable to connect Google Meet. ${detail}`;
  }

  switch (status) {
    case "google-meet-connected":
      return "Google Meet connected. Booking links can now create real Meet events.";
    case "google-meet-denied":
      return "Google Meet access was cancelled.";
    case "google-meet-invalid-state":
      return "Google Meet connection expired. Try connecting again.";
    case "google-meet-missing-config":
      return "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before connecting Google Meet.";
    case "google-meet-error":
      return "Unable to connect Google Meet.";
    default:
      return null;
  }
}

function accountFeedbackFromSearchParam(value: string | string[] | undefined) {
  switch (firstSearchParam(value)) {
    case "email-change-success":
      return "Your login email has been updated.";
    default:
      return null;
  }
}

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireUser();
  const workspace = await getCurrentWorkspace();
  const profileUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      fullName: true,
      email: true,
      jobRole: true,
      profileImageUrl: true,
      passwordHash: true,
      googleId: true
    }
  });
  const name = splitFullName(profileUser?.fullName || currentUser.fullName);
  const initialProfile = {
    firstName: name.firstName,
    lastName: name.lastName,
    title: profileUser?.jobRole || "",
    email: profileUser?.email || currentUser.email,
    profileImageUrl: profileUser?.profileImageUrl || currentUser.profileImageUrl || "",
    hasPassword: Boolean(profileUser?.passwordHash),
    googleConnected: Boolean(profileUser?.googleId),
    pendingEmail: ""
  };

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const view = resolvedSearchParams.view;
  const initialView = Array.isArray(view) ? view[0] : view;
  const feedback =
    accountFeedbackFromSearchParam(resolvedSearchParams.account) ||
    settingsFeedbackFromSearchParam(resolvedSearchParams.mailSetup, resolvedSearchParams.mailSetupError) ||
    integrationFeedbackFromSearchParam(resolvedSearchParams.integrationSetup, resolvedSearchParams.meetingSetupError);

  return (
    <SettingsWorkspace
      accessRole={currentUser.accessRole}
      isWorkspaceOwner={workspace?.createdById === currentUser.id}
      initialFeedback={feedback}
      initialProfile={initialProfile}
      initialView={
        initialView === "workspace" || initialView === "mailbox" || initialView === "smtp" || initialView === "imap" || initialView === "integrations" ? initialView : undefined
      }
    />
  );
}
