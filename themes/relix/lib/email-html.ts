/**
 * Beautiful HTML email templates for CRM notifications.
 * Uses table-based inline-style layout for maximum email client compatibility.
 */

type DetailRow = { label: string; value: string; accent?: boolean };

type EmailTemplateOptions = {
  recipientName: string;
  title: string;
  subtitle: string;
  appName?: string;
  details?: DetailRow[];
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  accentColor?: string;
  iconEmoji?: string;
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailRows(rows: DetailRow[]) {
  return rows
    .map(
      (row, i) => `
    <tr>
      <td style="padding:${i === 0 ? "0" : "10px"} 0 0;vertical-align:top;width:110px;">
        <span style="font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(row.label)}</span>
      </td>
      <td style="padding:${i === 0 ? "0" : "10px"} 0 0;vertical-align:top;">
        <span style="font-size:14px;font-weight:${row.accent ? "600" : "500"};color:${row.accent ? "#0f172a" : "#334155"};">${escapeHtml(row.value)}</span>
      </td>
    </tr>`
    )
    .join("");
}

export function buildEmailHtml(options: EmailTemplateOptions): string {
  const {
    recipientName,
    title,
    subtitle,
    appName = "Relix",
    details = [],
    ctaLabel,
    ctaUrl,
    footerNote,
    accentColor = "#386df4",
    iconEmoji = "🔔"
  } = options;

  const detailsBlock =
    details.length > 0
      ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
        <tr>
          <td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRows(details)}
            </table>
          </td>
        </tr>
      </table>`
      : "";

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
      <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td style="background:${accentColor};border-radius:10px;">
            <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-0.1px;">${escapeHtml(ctaLabel)} &rarr;</a>
          </td>
        </tr>
      </table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px 48px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Brand bar -->
          <tr>
            <td style="background:${accentColor};border-radius:14px 14px 0 0;padding:18px 32px;">
              <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.2px;">${escapeHtml(appName)} CRM</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Icon + Title -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <span style="font-size:28px;line-height:1;">${iconEmoji}</span>
                  </td>
                  <td style="vertical-align:middle;">
                    <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.4px;">${escapeHtml(title)}</h1>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin:16px 0 0;font-size:15px;color:#475569;line-height:1.6;">Hi <strong style="color:#0f172a;">${escapeHtml(recipientName)}</strong>,</p>
              <p style="margin:6px 0 0;font-size:15px;color:#475569;line-height:1.6;">${escapeHtml(subtitle)}</p>

              <!-- Details -->
              ${detailsBlock}

              <!-- CTA -->
              ${ctaBlock}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 14px 14px;padding:16px 32px 20px;border:1px solid #e2e8f0;border-top:none;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                ${footerNote ? escapeHtml(footerNote) + "<br/>" : ""}
                Sent by ${escapeHtml(appName)} CRM &bull; Do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Specific builders ────────────────────────────────────────────────────────

const appUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "");

export function buildLeadReminderDueEmail(opts: {
  recipientName: string;
  reminderTitle: string;
  leadName: string;
  companyName: string;
  scheduledFor: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Lead Reminder Due",
    subtitle: "A reminder you set for a lead is now due.",
    iconEmoji: "⏰",
    details: [
      { label: "Reminder", value: opts.reminderTitle, accent: true },
      { label: "Lead", value: opts.leadName },
      { label: "Company", value: opts.companyName },
      { label: "Scheduled", value: opts.scheduledFor }
    ],
    ctaLabel: "Open Lead in CRM",
    ctaUrl: `${appUrl}/pipeline`,
    footerNote: "You're receiving this because you have a reminder set for this lead."
  });
}

export function buildReminderConfirmationEmail(opts: {
  recipientName: string;
  reminderTitle: string;
  leadName: string;
  companyName: string | null;
  scheduledFor: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Reminder Confirmed",
    subtitle: "Your reminder has been set successfully. We'll notify you when it's due.",
    iconEmoji: "✅",
    accentColor: "#2563eb",
    details: [
      { label: "Reminder", value: opts.reminderTitle, accent: true },
      { label: "Lead", value: opts.leadName },
      ...(opts.companyName ? [{ label: "Company", value: opts.companyName }] : []),
      { label: "Scheduled", value: opts.scheduledFor }
    ],
    ctaLabel: "View in CRM",
    ctaUrl: `${appUrl}/pipeline`,
    footerNote: "You're receiving this because you set a reminder in your CRM workspace."
  });
}

export function buildTaskAssignmentEmail(opts: {
  recipientName: string;
  taskTitle: string;
  taskType: string;
  priority: string;
  assignedBy: string;
  dueDate: string | null;
  associateName: string | null;
  associateCompany: string | null;
}) {
  const priorityColors: Record<string, string> = {
    HIGH: "🔴 High",
    MEDIUM: "🟡 Medium",
    LOW: "🟢 Low"
  };

  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Task Assigned to You",
    subtitle: `${opts.assignedBy} has assigned you a new task.`,
    iconEmoji: "📋",
    accentColor: "#7c3aed",
    details: [
      { label: "Task", value: opts.taskTitle, accent: true },
      { label: "Type", value: opts.taskType },
      { label: "Priority", value: priorityColors[opts.priority] ?? opts.priority },
      ...(opts.dueDate ? [{ label: "Due Date", value: opts.dueDate }] : []),
      ...(opts.associateName
        ? [{ label: "Contact", value: opts.associateCompany ? `${opts.associateName} at ${opts.associateCompany}` : opts.associateName }]
        : []),
      { label: "Assigned by", value: opts.assignedBy }
    ],
    ctaLabel: "View Task",
    ctaUrl: `${appUrl}/tasks`,
    footerNote: "You're receiving this because a task has been assigned to you."
  });
}

export function buildTaskStatusChangeEmail(opts: {
  recipientName: string;
  taskTitle: string;
  newStatus: string;
  updatedBy: string;
}) {
  const statusEmoji: Record<string, string> = {
    "To Do": "⬜ To Do",
    "In Progress": "🔄 In Progress",
    Done: "✅ Done"
  };

  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Task Status Updated",
    subtitle: `The status of your task has been changed by ${opts.updatedBy}.`,
    iconEmoji: "🔄",
    accentColor: "#0891b2",
    details: [
      { label: "Task", value: opts.taskTitle, accent: true },
      { label: "New Status", value: statusEmoji[opts.newStatus] ?? opts.newStatus, accent: true },
      { label: "Updated by", value: opts.updatedBy }
    ],
    ctaLabel: "View Task",
    ctaUrl: `${appUrl}/tasks`,
    footerNote: "You're receiving this because you're assigned to this task."
  });
}

export function buildPasswordResetEmail(opts: {
  recipientName: string;
  resetUrl: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Reset Your Password",
    subtitle: "We received a request to reset your password. Click the button below to set a new one.",
    iconEmoji: "🔐",
    accentColor: "#dc2626",
    details: [
      { label: "Valid for", value: "30 minutes" },
      { label: "If not you", value: "You can safely ignore this email." }
    ],
    ctaLabel: "Reset Password",
    ctaUrl: opts.resetUrl,
    footerNote: "If you didn't request a password reset, no action is needed."
  });
}

export function buildTeamInviteEmail(opts: {
  recipientName: string;
  invitedByName: string;
  roleLabel: string;
  appName: string;
  inviteUrl: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: `You're Invited to ${opts.appName}`,
    subtitle: `${opts.invitedByName} has invited you to join ${opts.appName} as ${opts.roleLabel}.`,
    iconEmoji: "🎉",
    accentColor: "#7c3aed",
    details: [
      { label: "Invited by", value: opts.invitedByName, accent: true },
      { label: "Your role", value: opts.roleLabel },
      { label: "Platform", value: opts.appName }
    ],
    ctaLabel: "Accept Invite & Create Account",
    ctaUrl: opts.inviteUrl,
    footerNote: "This invite link expires in 7 days. If you didn't expect this, you can ignore it."
  });
}

export function buildWelcomeEmail(opts: { recipientName: string; appName: string; appUrl: string }) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    appName: opts.appName,
    title: `Welcome to ${opts.appName} CRM`,
    subtitle: "Your account is ready. Start managing your pipeline, contacts, and tasks all in one place.",
    iconEmoji: "👋",
    accentColor: "#386df4",
    details: [
      { label: "Pipeline", value: "Track leads across stages with drag-and-drop" },
      { label: "Contacts", value: "Manage your people and companies" },
      { label: "Tasks", value: "Stay on top of follow-ups and to-dos" },
      { label: "Inbox", value: "Send and track emails directly from CRM" }
    ],
    ctaLabel: "Open Your CRM",
    ctaUrl: opts.appUrl,
    footerNote: `You're receiving this because you just created a ${opts.appName} CRM account.`
  });
}

export function buildSignInAlertEmail(opts: {
  recipientName: string;
  email: string;
  signedInAt: string;
  appName: string;
  appUrl: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    appName: opts.appName,
    title: "New Sign-In Detected",
    subtitle: `A new sign-in to your ${opts.appName} CRM account was just recorded.`,
    iconEmoji: "🔓",
    accentColor: "#0f172a",
    details: [
      { label: "Account", value: opts.email },
      { label: "Time", value: opts.signedInAt }
    ],
    ctaLabel: "Go to My Account",
    ctaUrl: opts.appUrl,
    footerNote: "If this wasn't you, contact your workspace admin immediately or reset your password."
  });
}

export function buildLeadStageChangeEmail(opts: {
  recipientName: string;
  actorName: string;
  leadName: string;
  companyName: string | null;
  previousStage: string;
  nextStage: string;
  ctaUrl: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Deal Stage Updated",
    subtitle: `${opts.actorName} moved a deal to a new stage.`,
    iconEmoji: "🔄",
    accentColor: "#386df4",
    details: [
      { label: "Deal", value: opts.leadName, accent: true },
      ...(opts.companyName ? [{ label: "Company", value: opts.companyName }] : []),
      { label: "From", value: opts.previousStage },
      { label: "To", value: opts.nextStage, accent: true },
      { label: "Moved by", value: opts.actorName }
    ],
    ctaLabel: "Open Deal in CRM",
    ctaUrl: opts.ctaUrl,
    footerNote: "You're receiving this because you're assigned to this deal."
  });
}

export function buildLeadAssignmentEmail(opts: {
  recipientName: string;
  actorName: string;
  leadName: string;
  companyName: string | null;
  ctaUrl: string;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: "Lead Assigned to You",
    subtitle: `${opts.actorName} has assigned you to a lead.`,
    iconEmoji: "👤",
    accentColor: "#386df4",
    details: [
      { label: "Lead", value: opts.leadName, accent: true },
      ...(opts.companyName ? [{ label: "Company", value: opts.companyName }] : []),
      { label: "Assigned by", value: opts.actorName }
    ],
    ctaLabel: "Open Lead in CRM",
    ctaUrl: opts.ctaUrl,
    footerNote: "You're receiving this because a lead has been assigned to you."
  });
}

export function buildTaskReminderEmail(opts: {
  recipientName: string;
  taskTitle: string;
  dueDate: string;
  reminderWindow: string;
  associateName: string | null;
  associateCompany: string | null;
  overdue?: boolean;
}) {
  return buildEmailHtml({
    recipientName: opts.recipientName,
    title: opts.overdue ? "Task Reminder" : "Task Due Soon",
    subtitle: opts.overdue ? "A task assigned to you is now overdue." : "A task assigned to you is coming up. Don't miss it.",
    iconEmoji: "⏳",
    accentColor: "#d97706",
    details: [
      { label: "Task", value: opts.taskTitle, accent: true },
      { label: "Due", value: opts.dueDate },
      { label: opts.overdue ? "Reminder window" : "Reminder", value: opts.reminderWindow },
      ...(opts.associateName
        ? [{ label: "Contact", value: opts.associateCompany ? `${opts.associateName} at ${opts.associateCompany}` : opts.associateName }]
        : [])
    ],
    ctaLabel: "View Task",
    ctaUrl: `${appUrl}/tasks`,
    footerNote: "You're receiving this because you have a task reminder configured."
  });
}
