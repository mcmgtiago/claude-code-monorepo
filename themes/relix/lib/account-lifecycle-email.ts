import "server-only";

import { getAppBaseUrl } from "@/lib/app-url";
import { getPlatformSettings } from "@/lib/platform-settings";
import { sendSystemEmail } from "@/lib/email";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendRoleChangedEmail(input: {
  to: string;
  fullName: string;
  nextRole: string;
  changedByName: string;
  workspaceName?: string | null;
  senderUserId?: string;
}) {
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";
  const workspaceLine = input.workspaceName ? `Workspace: ${input.workspaceName}\n` : "";
  await sendSystemEmail({
    to: input.to,
    senderUserId: input.senderUserId,
    subject: `Your ${appName} CRM role has been updated`,
    text: `Hi ${input.fullName},\n\nYour access role has been updated to ${input.nextRole} by ${input.changedByName}.\n${workspaceLine}\nIf this change looks unexpected, contact your workspace administrator.`,
    html: `
      <div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;color:#18253d;line-height:1.6">
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p>Your access role has been updated to <strong>${escapeHtml(input.nextRole)}</strong> by ${escapeHtml(input.changedByName)}.</p>
        ${input.workspaceName ? `<p><strong>Workspace:</strong> ${escapeHtml(input.workspaceName)}</p>` : ""}
        <p>If this change looks unexpected, contact your workspace administrator.</p>
      </div>
    `
  });
}

export async function sendSuspendedEmail(input: {
  to: string;
  fullName: string;
  changedByName: string;
  workspaceName?: string | null;
  senderUserId?: string;
}) {
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";
  await sendSystemEmail({
    to: input.to,
    senderUserId: input.senderUserId,
    subject: `Your ${appName} CRM access has been suspended`,
    text: `Hi ${input.fullName},\n\nYour access to ${appName} CRM has been suspended by ${input.changedByName}.${input.workspaceName ? `\nWorkspace: ${input.workspaceName}` : ""}\n\nYou can no longer sign in or access workspace data until an administrator restores your account.`,
    html: `
      <div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;color:#18253d;line-height:1.6">
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p>Your access to <strong>${escapeHtml(appName)} CRM</strong> has been suspended by ${escapeHtml(input.changedByName)}.</p>
        ${input.workspaceName ? `<p><strong>Workspace:</strong> ${escapeHtml(input.workspaceName)}</p>` : ""}
        <p>You can no longer sign in or access workspace data until an administrator restores your account.</p>
      </div>
    `
  });
}

export async function sendDeletedEmail(input: {
  to: string;
  fullName: string;
  changedByName: string;
  workspaceName?: string | null;
  senderUserId?: string;
}) {
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";
  await sendSystemEmail({
    to: input.to,
    senderUserId: input.senderUserId,
    subject: `Your ${appName} CRM account has been removed`,
    text: `Hi ${input.fullName},\n\nYour ${appName} CRM account has been removed by ${input.changedByName}.${input.workspaceName ? `\nWorkspace: ${input.workspaceName}` : ""}\n\nYou no longer have access to this workspace. If this was unexpected, contact your administrator.`,
    html: `
      <div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;color:#18253d;line-height:1.6">
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p>Your <strong>${escapeHtml(appName)} CRM</strong> account has been removed by ${escapeHtml(input.changedByName)}.</p>
        ${input.workspaceName ? `<p><strong>Workspace:</strong> ${escapeHtml(input.workspaceName)}</p>` : ""}
        <p>You no longer have access to this workspace. If this was unexpected, contact your administrator.</p>
      </div>
    `
  });
}

export async function sendPasswordChangedEmail(input: {
  to: string;
  fullName: string;
  changedAt: string;
  senderUserId?: string;
}) {
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";

  await sendSystemEmail({
    to: input.to,
    senderUserId: input.senderUserId,
    subject: `Your ${appName} CRM password was updated`,
    text: `Hi ${input.fullName},\n\nYour ${appName} CRM password was updated on ${input.changedAt}.\n\nIf you did not make this change, reset your password immediately and review your account access.`,
    html: `
      <div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;color:#18253d;line-height:1.6">
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p>Your <strong>${escapeHtml(appName)} CRM</strong> password was updated on <strong>${escapeHtml(input.changedAt)}</strong>.</p>
        <p>If you did not make this change, reset your password immediately and review your account access.</p>
      </div>
    `
  });
}

export async function sendEmailChangeVerificationEmail(input: {
  to: string;
  fullName: string;
  newEmail: string;
  verificationUrl: string;
  senderUserId?: string;
}) {
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";
  const appUrl = await getAppBaseUrl();

  await sendSystemEmail({
    to: input.to,
    senderUserId: input.senderUserId,
    subject: `Verify your new ${appName} CRM email address`,
    text: `Hi ${input.fullName},\n\nWe received a request to change your ${appName} CRM email address to ${input.newEmail}.\n\nOpen this link to verify the change:\n${input.verificationUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;color:#18253d;line-height:1.6">
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p>We received a request to change your <strong>${escapeHtml(appName)} CRM</strong> email address to <strong>${escapeHtml(input.newEmail)}</strong>.</p>
        <p>
          <a href="${escapeHtml(input.verificationUrl)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#386df4;color:#ffffff;font-weight:600;text-decoration:none;">
            Verify email change
          </a>
        </p>
        <p>If the button does not open, use this link:</p>
        <p><a href="${escapeHtml(input.verificationUrl)}">${escapeHtml(input.verificationUrl)}</a></p>
        <p>If you did not request this, you can ignore this email.${appUrl ? ` Your current sign-in will continue to use your existing email until verification is completed.` : ""}</p>
      </div>
    `
  });
}

export async function sendEmailChangedEmail(input: {
  to: string;
  fullName: string;
  previousEmail: string;
  newEmail: string;
  changedAt: string;
  senderUserId?: string;
}) {
  const platform = await getPlatformSettings();
  const appName = platform.appName || "Relix";

  await sendSystemEmail({
    to: input.to,
    senderUserId: input.senderUserId,
    subject: `Your ${appName} CRM email was changed`,
    text: `Hi ${input.fullName},\n\nYour ${appName} CRM email was changed on ${input.changedAt}.\nPrevious email: ${input.previousEmail}\nNew email: ${input.newEmail}\n\nIf you did not make this change, contact your administrator immediately.`,
    html: `
      <div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;color:#18253d;line-height:1.6">
        <p>Hi ${escapeHtml(input.fullName)},</p>
        <p>Your <strong>${escapeHtml(appName)} CRM</strong> email was changed on <strong>${escapeHtml(input.changedAt)}</strong>.</p>
        <p><strong>Previous email:</strong> ${escapeHtml(input.previousEmail)}</p>
        <p><strong>New email:</strong> ${escapeHtml(input.newEmail)}</p>
        <p>If you did not make this change, contact your administrator immediately.</p>
      </div>
    `
  });
}
