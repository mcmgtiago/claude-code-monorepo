import { getAppEmailBranding } from "@/lib/app-config";
import { getConfiguredAppHost } from "@/lib/app-url";
import { sendNotificationEmail } from "@/lib/notification-email";

type BaseAuthEmailOptions = {
  recipientEmail: string;
  recipientName?: string | null;
  actionUrl: string;
  appUrl: string;
};

type SigninAlertEmailOptions = BaseAuthEmailOptions & {
  signedInAt?: Date | string;
};

type AccountReadyEmailOptions = BaseAuthEmailOptions & {
  workspaceName?: string | null;
};

type WorkspaceInviteEmailOptions = BaseAuthEmailOptions & {
  workspaceId: string;
  workspaceName: string;
  invitedByName: string;
  existingAccount: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function buildEmailFrame(options: {
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  details?: Array<{ label: string; value: string }>;
  footer?: string;
}) {
  const host = getConfiguredAppHost(options.actionUrl);
  const branding = await getAppEmailBranding(options.actionUrl);

  const detailsMarkup = (options.details ?? []).length > 0
    ? `
      <div style="margin:20px 0 0;display:grid;gap:10px;">
        ${(options.details ?? []).map((detail) => `
          <div style="border:1px solid #e8dfd7;padding:14px 16px;background:#f8f4ef;">
            <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7f6c63;">${escapeHtml(detail.label)}</div>
            <div style="margin-top:8px;font-size:16px;line-height:1.5;color:#17171d;font-weight:600;">${escapeHtml(detail.value)}</div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f3efe8;font-family:Inter,Arial,sans-serif;color:#17171d;">
    <div style="max-width:680px;margin:0 auto;">
      <div style="padding:24px 26px;background:#1f1f27;color:#f7f1eb;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${escapeHtml(branding.absoluteLogoUrl)}" alt="${escapeHtml(branding.appName)} logo" width="42" height="42" style="display:block;height:42px;width:42px;" />
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(247,241,235,0.74);">
            <span>${escapeHtml(branding.companyName)}</span>
            <span style="display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.05);padding:5px 9px;color:#f3d8ca;letter-spacing:0.18em;">${escapeHtml(branding.appName)}</span>
          </div>
        </div>
        <div style="margin-top:18px;display:inline-flex;padding:6px 10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.06);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#f3d8ca;">${escapeHtml(options.eyebrow)}</div>
        <h1 style="margin:16px 0 0;font-size:30px;line-height:1.18;font-weight:700;letter-spacing:-0.03em;">${escapeHtml(options.title)}</h1>
        <p style="margin:14px 0 0;max-width:560px;color:rgba(247,241,235,0.8);font-size:15px;line-height:1.7;">${escapeHtml(options.intro)}</p>
      </div>
      <div style="margin-top:14px;padding:24px;background:#ffffff;border:1px solid #e6dfd7;">
        ${detailsMarkup}
        <div style="margin-top:22px;">
          <a href="${escapeHtml(options.actionUrl)}" style="display:inline-block;padding:13px 18px;background:#e58f65;color:#17171d;text-decoration:none;font-size:14px;font-weight:700;">
            ${escapeHtml(options.actionLabel)}
          </a>
        </div>
        <div style="margin-top:22px;color:#7f6c63;font-size:12px;line-height:1.6;">
          ${escapeHtml(options.footer ?? `If the button does not open, copy and paste this into your browser: ${options.actionUrl}`)}
        </div>
        <div style="margin-top:14px;color:#9a877c;font-size:11px;line-height:1.6;">
          Sent by ${escapeHtml(host)}.
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildEmailText(options: {
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  details?: Array<{ label: string; value: string }>;
  footer?: string;
}) {
  return [
    options.eyebrow,
    options.title,
    "",
    options.intro,
    "",
    ...(options.details ?? []).flatMap((detail) => [`${detail.label}: ${detail.value}`]),
    "",
    `${options.actionLabel}: ${options.actionUrl}`,
    "",
    options.footer ?? "",
  ].filter(Boolean).join("\n");
}

function formatSigninTime(value?: Date | string) {
  const timestamp = value instanceof Date ? value : value ? new Date(value) : new Date();

  if (Number.isNaN(timestamp.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(timestamp);
}

export async function sendSignupConfirmationEmail(options: BaseAuthEmailOptions) {
  const name = options.recipientName?.trim() || "there";
  const branding = await getAppEmailBranding(options.actionUrl);
  const template = {
    eyebrow: "Confirm Signup",
    title: `Activate your ${branding.appName} workspace`,
    intro: `Hi ${name}, confirm your email and finish the last step before your workspace goes live.`,
    actionLabel: "Confirm Email",
    actionUrl: options.actionUrl,
    details: [
      { label: "Email", value: options.recipientEmail },
    ],
    footer: "If you did not create this account, you can ignore this email.",
  };

  return sendNotificationEmail({
    eventKey: `auth-signup:${options.recipientEmail}:${Date.now()}`,
    category: "auth-signup",
    subject: `${branding.subjectPrefix} Confirm your email`,
    to: {
      email: options.recipientEmail,
      name: options.recipientName?.trim() || undefined,
    },
    html: await buildEmailFrame(template),
    text: buildEmailText(template),
    metadata: {
      actionUrl: options.actionUrl,
      appUrl: options.appUrl,
    },
    preferenceKey: null,
    respectPreferences: false,
  });
}

export async function sendPasswordRecoveryEmail(options: BaseAuthEmailOptions) {
  const branding = await getAppEmailBranding(options.actionUrl);
  const template = {
    eyebrow: "Password Recovery",
    title: "Reset your password securely",
    intro: `We received a password reset request for ${options.recipientEmail}. Use the secure action below to continue.`,
    actionLabel: "Reset Password",
    actionUrl: options.actionUrl,
    details: [
      { label: "Account", value: options.recipientEmail },
    ],
    footer: "If you did not request this reset, you can ignore this email.",
  };

  return sendNotificationEmail({
    eventKey: `auth-recovery:${options.recipientEmail}:${Date.now()}`,
    category: "auth-recovery",
    subject: `${branding.subjectPrefix} Reset your password`,
    to: {
      email: options.recipientEmail,
      name: options.recipientName?.trim() || undefined,
    },
    html: await buildEmailFrame(template),
    text: buildEmailText(template),
    metadata: {
      actionUrl: options.actionUrl,
      appUrl: options.appUrl,
    },
    preferenceKey: null,
    respectPreferences: false,
  });
}

export async function sendSigninAlertEmail(options: SigninAlertEmailOptions) {
  const name = options.recipientName?.trim() || "there";
  const branding = await getAppEmailBranding(options.actionUrl);
  const template = {
    eyebrow: "Sign In Alert",
    title: `A new sign-in reached your ${branding.appName} account`,
    intro: `Hi ${name}, your account signed in successfully. If this was you, no action is needed. If not, review your account security immediately.`,
    actionLabel: "Review Security",
    actionUrl: options.actionUrl,
    details: [
      { label: "Email", value: options.recipientEmail },
      { label: "Signed In", value: formatSigninTime(options.signedInAt) },
    ],
    footer: "If you do not recognize this sign-in, reset your password and review active sessions right away.",
  };

  return sendNotificationEmail({
    eventKey: `auth-signin:${options.recipientEmail}:${Date.now()}`,
    category: "auth-signin",
    subject: `${branding.subjectPrefix} New sign-in to your account`,
    to: {
      email: options.recipientEmail,
      name: options.recipientName?.trim() || undefined,
    },
    html: await buildEmailFrame(template),
    text: buildEmailText(template),
    metadata: {
      actionUrl: options.actionUrl,
      appUrl: options.appUrl,
      signedInAt: options.signedInAt instanceof Date ? options.signedInAt.toISOString() : options.signedInAt,
    },
    preferenceKey: null,
    respectPreferences: false,
  });
}

export async function sendAccountReadyEmail(options: AccountReadyEmailOptions) {
  const name = options.recipientName?.trim() || "there";
  const branding = await getAppEmailBranding(options.actionUrl);
  const template = {
    eyebrow: "Account Ready",
    title: `Your ${branding.appName} account is live`,
    intro: `Hi ${name}, your account has been created successfully and your workspace is ready to use.`,
    actionLabel: "Open Workspace",
    actionUrl: options.actionUrl,
    details: [
      { label: "Email", value: options.recipientEmail },
      ...(options.workspaceName?.trim() ? [{ label: "Workspace", value: options.workspaceName.trim() }] : []),
    ],
    footer: "If you did not expect this account, reset the password for this email and review your sign-in methods.",
  };

  return sendNotificationEmail({
    eventKey: `auth-account-ready:${options.recipientEmail}:${Date.now()}`,
    category: "auth-account-ready",
    subject: `${branding.subjectPrefix} Your account is ready`,
    to: {
      email: options.recipientEmail,
      name: options.recipientName?.trim() || undefined,
    },
    html: await buildEmailFrame(template),
    text: buildEmailText(template),
    metadata: {
      actionUrl: options.actionUrl,
      appUrl: options.appUrl,
      workspaceName: options.workspaceName?.trim() || null,
    },
    preferenceKey: null,
    respectPreferences: false,
  });
}

export async function sendWorkspaceInviteEmail(options: WorkspaceInviteEmailOptions) {
  const branding = await getAppEmailBranding(options.actionUrl);
  const template = {
    eyebrow: "Workspace Invite",
    title: `You have been invited to ${options.workspaceName}`,
    intro: `${options.invitedByName} invited you to join ${options.workspaceName} in ${branding.appName}. ${options.existingAccount ? "Sign in with this email to restore the conversation and project access." : "Create your account with this email to accept the invite."}`,
    actionLabel: options.existingAccount ? "Open Workspace" : "Accept Invite",
    actionUrl: options.actionUrl,
    details: [
      { label: "Workspace", value: options.workspaceName },
      { label: "Invited Email", value: options.recipientEmail },
    ],
    footer: `Use the same email address shown above so ${branding.appName} can attach this invite to the right workspace.`,
  };

  return sendNotificationEmail({
    workspaceId: options.workspaceId,
    eventKey: `workspace-invite:${options.workspaceId}:${options.recipientEmail}:${Date.now()}`,
    category: "workspace-invite",
    subject: `${branding.subjectPrefix} Invitation to join ${options.workspaceName}`,
    to: {
      email: options.recipientEmail,
      name: options.recipientName?.trim() || undefined,
    },
    html: await buildEmailFrame(template),
    text: buildEmailText(template),
    metadata: {
      actionUrl: options.actionUrl,
      appUrl: options.appUrl,
      workspaceName: options.workspaceName,
      existingAccount: options.existingAccount,
    },
    preferenceKey: null,
    respectPreferences: false,
  });
}
