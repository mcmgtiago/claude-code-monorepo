import { getDbPool } from "@/lib/db";
import { getAppEmailBranding, getAppSmtpSettings } from "@/lib/app-config";
import { getMailer } from "@/lib/mailer";
import { defaultNotificationPreferences, type NotificationPreferences } from "@/lib/settings";

export type NotificationPreferenceKey = "tasks" | "team" | "digest" | "mentions";
export type NotificationEmailStatus = "sent" | "skipped" | "duplicate" | "failed";

type RecipientPreferenceRow = {
  user_id: string | null;
  email: string;
  display_name: string | null;
  notification_preferences: NotificationPreferences | null;
};

type EmailLogRow = {
  id: number;
};

type EmailLogStatus = "sent" | "skipped" | "failed" | "processing";

type EmailCard = {
  label: string;
  value: string;
};

type EmailTemplateIcon = "task" | "stage" | "project" | "reminder" | "digest" | "chat" | "auth" | "signin" | "recovery";

type EmailListSection = {
  title: string;
  items: string[];
};

type EmailTemplateOptions = {
  accentColor?: string;
  icon?: EmailTemplateIcon;
  eyebrow: string;
  title: string;
  intro: string;
  cards?: EmailCard[];
  sections?: EmailListSection[];
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

type SendNotificationEmailOptions = {
  workspaceId?: string | null;
  eventKey: string;
  category: string;
  subject: string;
  to: {
    email: string;
    name?: string;
  };
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
  preferenceKey?: NotificationPreferenceKey | null;
  respectPreferences?: boolean;
};

export type NotificationEmailSendResult = {
  status: NotificationEmailStatus;
  reason?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatNotificationDate(value?: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatNotificationDateTime(value?: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatNotificationStatusLabel(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";

  switch (normalized) {
    case "open":
      return "Open";
    case "progress":
      return "In Progress";
    case "review":
      return "In Review";
    case "completed":
      return "Completed";
    default:
      return normalized
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
        .join(" ") || "Updated";
  }
}

function buildTextVersion(options: EmailTemplateOptions) {
  const lines = [options.eyebrow, options.title, "", options.intro];

  for (const card of options.cards ?? []) {
    lines.push(`${card.label}: ${card.value}`);
  }

  for (const section of options.sections ?? []) {
    lines.push("", section.title);
    for (const item of section.items) {
      lines.push(`- ${item}`);
    }
  }

  if (options.body) {
    lines.push("", options.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  }

  if (options.ctaLabel && options.ctaUrl) {
    lines.push("", `${options.ctaLabel}: ${options.ctaUrl}`);
  }

  if (options.footerNote) {
    lines.push("", options.footerNote);
  }

  return lines.join("\n");
}

function iconPath(icon: EmailTemplateIcon) {
  switch (icon) {
    case "stage":
      return '<path d="M4 7h10M4 12h16M4 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    case "project":
      return '<path d="M4 8.5h6l1.5 2H20v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/>';
    case "reminder":
      return '<path d="M12 4a4.5 4.5 0 0 1 4.5 4.5V11l1.5 2.5H6L7.5 11V8.5A4.5 4.5 0 0 1 12 4Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M10 17.5a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    case "digest":
      return '<path d="M6 6h12v12H6z" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    case "chat":
      return '<path d="M6 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H11l-4 3v-3H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/>';
    case "auth":
      return '<path d="M12 4 5 7v4c0 4.2 2.7 7.7 7 9 4.3-1.3 7-4.8 7-9V7l-7-3Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="m9.5 12 1.7 1.7L14.8 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
    case "signin":
      return '<path d="M10 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M13 8.5 17 12l-4 3.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    case "recovery":
      return '<path d="M18 10a6 6 0 1 0 1.2 3.6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M18 5v5h-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    case "task":
    default:
      return '<rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="m8.5 12 2.2 2.2 4.8-4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  }
}

function renderIconSvg(icon: EmailTemplateIcon, options?: { size?: number; color?: string }) {
  const size = options?.size ?? 22;
  const color = options?.color ?? "#17171d";

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:block;color:${color};" xmlns="http://www.w3.org/2000/svg">${iconPath(icon)}</svg>`;
}

function inferCardIcon(label: string): EmailTemplateIcon {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes("reminder")) return "reminder";
  if (normalized.includes("chat") || normalized.includes("message") || normalized.includes("delay")) return "chat";
  if (normalized.includes("project")) return "project";
  if (normalized.includes("team")) return "project";
  if (normalized.includes("stage")) return "stage";
  if (normalized.includes("account") || normalized.includes("email")) return "auth";
  if (normalized.includes("redirect")) return "signin";
  if (normalized.includes("date") || normalized.includes("due")) return "task";
  return "task";
}

async function renderEmailTemplate(options: EmailTemplateOptions) {
  const accentColor = options.accentColor ?? "#e58f65";
  const branding = await getAppEmailBranding(options.ctaUrl);
  const heroIconMarkup = options.icon
    ? `
      <div style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#f3d8ca;">
          ${escapeHtml(options.eyebrow)}
        </div>
        <div style="display:flex;height:40px;width:40px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);">
          ${renderIconSvg(options.icon, { size: 18, color: "#f3d8ca" })}
        </div>
      </div>
    `
    : `
      <div style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#f3d8ca;">
        ${escapeHtml(options.eyebrow)}
      </div>
    `;
  const cardsMarkup = (options.cards ?? []).length > 0
    ? `
      <div style="margin:20px 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
        ${(options.cards ?? []).map((card) => `
          <div style="border:1px solid #e8dfd7;padding:14px 16px;background:#f8f4ef;">
            <div style="display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7f6c63;">
              <span style="display:flex;height:24px;width:24px;align-items:center;justify-content:center;background:#fff1e7;">${renderIconSvg(inferCardIcon(card.label), { size: 14, color: accentColor })}</span>
              <span>${escapeHtml(card.label)}</span>
            </div>
            <div style="margin-top:8px;font-size:17px;line-height:1.4;color:#17171d;font-weight:600;">${escapeHtml(card.value)}</div>
          </div>
        `).join("")}
      </div>
    `
    : "";
  const sectionsMarkup = (options.sections ?? []).map((section) => `
    <div style="margin-top:22px;border-top:1px solid #ece4dc;padding-top:18px;">
      <div style="font-size:14px;font-weight:700;color:#17171d;letter-spacing:0.02em;">${escapeHtml(section.title)}</div>
      <ul style="margin:14px 0 0;padding-left:18px;color:#494957;font-size:14px;line-height:1.7;">
        ${section.items.map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `).join("");
  const ctaMarkup = options.ctaLabel && options.ctaUrl
    ? `
      <div style="margin-top:22px;">
        <a href="${escapeHtml(options.ctaUrl)}" style="display:inline-block;padding:13px 18px;background:${accentColor};color:#17171d;text-decoration:none;font-size:14px;font-weight:700;">
          ${escapeHtml(options.ctaLabel)}
        </a>
      </div>
    `
    : "";
  const bodyMarkup = options.body
    ? `<div style="margin-top:20px;color:#494957;font-size:14px;line-height:1.7;">${options.body}</div>`
    : "";
  const footerNote = options.footerNote
    ? `<div style="margin-top:22px;color:#7f6c63;font-size:12px;line-height:1.6;">${escapeHtml(options.footerNote)}</div>`
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
        ${heroIconMarkup}
        <h1 style="margin:16px 0 0;font-size:30px;line-height:1.18;font-weight:700;letter-spacing:-0.03em;">${escapeHtml(options.title)}</h1>
        <p style="margin:14px 0 0;max-width:560px;color:rgba(247,241,235,0.8);font-size:15px;line-height:1.7;">${escapeHtml(options.intro)}</p>
      </div>
      <div style="margin-top:14px;padding:24px;background:#ffffff;border:1px solid #e6dfd7;">
        ${cardsMarkup}
        ${sectionsMarkup}
        ${bodyMarkup}
        ${ctaMarkup}
        ${footerNote}
      </div>
    </div>
  </body>
</html>`;
}

async function getRecipientPreference(email: string) {
  const pool = getDbPool();
  const result = await pool.query<RecipientPreferenceRow>(
    `
      select
        up.id as user_id,
        up.email,
        coalesce(up.full_name, up.first_name, split_part(up.email, '@', 1)) as display_name,
        settings.notification_preferences
      from public.user_profiles up
      left join public.app_user_settings settings on settings.user_id = up.id
      where lower(up.email) = lower($1)
      limit 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

function isEmailAllowed(
  preferences: NotificationPreferences | null | undefined,
  preferenceKey?: NotificationPreferenceKey | null,
) {
  const normalized = {
    ...defaultNotificationPreferences,
    ...(preferences ?? {}),
  };

  if (!normalized.email) {
    return false;
  }

  if (!preferenceKey) {
    return true;
  }

  return normalized[preferenceKey];
}

async function insertEmailLog(options: {
  workspaceId?: string | null;
  userId?: string | null;
  recipientEmail: string;
  category: string;
  eventKey: string;
  status: EmailLogStatus;
  subject: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const pool = getDbPool();

  await pool.query(
    `
      insert into public.app_notification_email_logs (
        workspace_id,
        user_id,
        recipient_email,
        category,
        event_key,
        status,
        subject,
        error_message,
        metadata
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      on conflict (event_key, recipient_email) do nothing
    `,
    [
      options.workspaceId ?? null,
      options.userId ?? null,
      options.recipientEmail,
      options.category,
      options.eventKey,
      options.status,
      options.subject,
      options.errorMessage ?? null,
      JSON.stringify(options.metadata ?? {}),
    ],
  );
}

async function reserveEmailLog(options: {
  workspaceId?: string | null;
  userId?: string | null;
  recipientEmail: string;
  category: string;
  eventKey: string;
  subject: string;
  metadata?: Record<string, unknown>;
}) {
  const pool = getDbPool();
  const result = await pool.query<EmailLogRow>(
    `
      insert into public.app_notification_email_logs (
        workspace_id,
        user_id,
        recipient_email,
        category,
        event_key,
        status,
        subject,
        metadata
      )
      values ($1, $2, $3, $4, $5, 'processing', $6, $7::jsonb)
      on conflict (event_key, recipient_email) do nothing
      returning id
    `,
    [
      options.workspaceId ?? null,
      options.userId ?? null,
      options.recipientEmail,
      options.category,
      options.eventKey,
      options.subject,
      JSON.stringify({
        ...(options.metadata ?? {}),
        reserved: true,
      }),
    ],
  );

  return result.rows[0]?.id ?? null;
}

async function updateEmailLog(options: {
  id: number;
  status: EmailLogStatus;
  metadata?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const pool = getDbPool();

  await pool.query(
    `
      update public.app_notification_email_logs
      set
        status = $2,
        metadata = $3::jsonb,
        error_message = $4
      where id = $1
    `,
    [
      options.id,
      options.status,
      JSON.stringify(options.metadata ?? {}),
      options.errorMessage ?? null,
    ],
  );
}

export async function sendNotificationEmail(options: SendNotificationEmailOptions): Promise<NotificationEmailSendResult> {
  const recipientEmail = options.to.email.trim().toLowerCase();

  if (!recipientEmail) {
    return {
      status: "skipped",
      reason: "Missing recipient email.",
    };
  }

  const recipient = await getRecipientPreference(recipientEmail);
  const respectPreferences = options.respectPreferences !== false;

  if (respectPreferences && recipient && !isEmailAllowed(recipient.notification_preferences, options.preferenceKey)) {
    await insertEmailLog({
      workspaceId: options.workspaceId,
      userId: recipient.user_id,
      recipientEmail,
      category: options.category,
      eventKey: options.eventKey,
      status: "skipped",
      subject: options.subject,
      metadata: {
        ...(options.metadata ?? {}),
        reason: "recipient-preferences-disabled",
      },
    });

    return {
      status: "skipped",
      reason: "Recipient preferences disabled this email.",
    };
  }

  const reservationId = await reserveEmailLog({
    workspaceId: options.workspaceId,
    userId: recipient?.user_id ?? null,
    recipientEmail,
    category: options.category,
    eventKey: options.eventKey,
    subject: options.subject,
    metadata: options.metadata,
  });

  if (!reservationId) {
    return {
      status: "duplicate",
      reason: "Event already reserved for this recipient.",
    };
  }

  try {
    const transporter = await getMailer();
    const smtp = await getAppSmtpSettings();
    await transporter.sendMail({
      from: smtp.from,
      to: options.to.name ? `${options.to.name} <${recipientEmail}>` : recipientEmail,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    await updateEmailLog({
      id: reservationId,
      status: "sent",
      metadata: options.metadata,
    });

    return {
      status: "sent",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown email error.";

    await updateEmailLog({
      id: reservationId,
      status: "failed",
      metadata: options.metadata,
      errorMessage: reason,
    });

    return {
      status: "failed",
      reason,
    };
  }
}

export async function buildTaskAssignedEmail(payload: {
  recipientName?: string;
  taskTitle: string;
  projectName: string;
  assignedBy: string;
  statusLabel: string;
  dueDate?: string | null;
  reminderDate?: string | null;
  appUrl: string;
}) {
  const template = {
    icon: "task",
    eyebrow: "Task Assignment",
    title: `A task just landed with ${payload.recipientName?.trim() || "your"} name on it`,
    intro: `${payload.assignedBy} assigned \"${payload.taskTitle}\" in ${payload.projectName}. Ownership, schedule, and execution details are below.`,
    cards: [
      { label: "Project", value: payload.projectName },
      { label: "Stage", value: payload.statusLabel },
      { label: "Due Date", value: formatNotificationDate(payload.dueDate) },
      { label: "Reminder", value: formatNotificationDateTime(payload.reminderDate) },
    ],
    ctaLabel: "Open Workspace",
    ctaUrl: payload.appUrl,
    footerNote: "You are receiving this because task email notifications are enabled for this workspace.",
  } satisfies EmailTemplateOptions;

  const branding = await getAppEmailBranding(payload.appUrl);

  return {
    subject: `${branding.subjectPrefix} Task assigned: ${payload.taskTitle}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}

export async function buildTaskStageChangedEmail(payload: {
  recipientName?: string;
  taskTitle: string;
  projectName: string;
  updatedBy: string;
  previousStatusLabel: string;
  nextStatusLabel: string;
  dueDate?: string | null;
  appUrl: string;
}) {
  const template = {
    icon: "stage",
    eyebrow: "Task Status Updated",
    title: `${payload.taskTitle} moved to ${payload.nextStatusLabel}`,
    intro: `${payload.updatedBy} changed the task stage for ${payload.recipientName?.trim() || "this assignee"} in ${payload.projectName}.`,
    cards: [
      { label: "Previous Stage", value: payload.previousStatusLabel },
      { label: "Current Stage", value: payload.nextStatusLabel },
      { label: "Due Date", value: formatNotificationDate(payload.dueDate) },
    ],
    ctaLabel: "Review Task",
    ctaUrl: payload.appUrl,
    footerNote: "Status emails are sent when active task updates need attention from the assignee.",
  } satisfies EmailTemplateOptions;

  const branding = await getAppEmailBranding(payload.appUrl);

  return {
    subject: `${branding.subjectPrefix} Task stage changed: ${payload.taskTitle}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}

export async function buildTaskChecklistCompletedEmail(payload: {
  recipientName?: string;
  taskTitle: string;
  checklistItemTitle: string;
  projectName: string;
  completedBy: string;
  statusLabel: string;
  appUrl: string;
}) {
  const template = {
    icon: "task",
    eyebrow: "Checklist Update",
    title: `${payload.checklistItemTitle} is checked off`,
    intro: `${payload.completedBy} completed a checklist item on \"${payload.taskTitle}\" in ${payload.projectName}.`,
    cards: [
      { label: "Task", value: payload.taskTitle },
      { label: "Completed Item", value: payload.checklistItemTitle },
      { label: "Current Stage", value: payload.statusLabel },
    ],
    ctaLabel: "Open Task",
    ctaUrl: payload.appUrl,
    footerNote: "Checklist emails are sent to the other assignees so execution stays aligned.",
  } satisfies EmailTemplateOptions;

  const branding = await getAppEmailBranding(payload.appUrl);

  return {
    subject: `${branding.subjectPrefix} Checklist updated: ${payload.taskTitle}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}

export async function buildProjectCreatedEmail(payload: {
  recipientName?: string;
  projectName: string;
  projectType: string;
  createdBy: string;
  startDate?: string | null;
  deadline?: string | null;
  memberCount: number;
  appUrl: string;
}) {
  const branding = await getAppEmailBranding(payload.appUrl);
  const template = {
    icon: "project",
    eyebrow: "Project Assignment",
    title: `${payload.projectName} is ready for kickoff`,
    intro: `${payload.createdBy} added ${payload.recipientName?.trim() || "you"} to a new ${payload.projectType.toLowerCase()} project in ${branding.appName}.`,
    cards: [
      { label: "Project Type", value: payload.projectType },
      { label: "Start Date", value: formatNotificationDate(payload.startDate) },
      { label: "Deadline", value: formatNotificationDate(payload.deadline) },
      { label: "Team Size", value: `${payload.memberCount} members` },
    ],
    ctaLabel: "Open Project",
    ctaUrl: payload.appUrl,
    footerNote: "Project creation emails are sent to assigned members so kickoff details do not get missed.",
  } satisfies EmailTemplateOptions;

  return {
    subject: `${branding.subjectPrefix} New project: ${payload.projectName}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}

export async function buildTaskReminderEmail(payload: {
  recipientName?: string;
  taskTitle: string;
  projectName: string;
  statusLabel: string;
  dueDate?: string | null;
  reminderDate?: string | null;
  appUrl: string;
}) {
  const branding = await getAppEmailBranding(payload.appUrl);
  const template = {
    icon: "reminder",
    eyebrow: "Task Reminder",
    title: `${payload.taskTitle} is due for attention`,
    intro: `${payload.recipientName?.trim() || "You"} asked ${branding.appName} to send a reminder for this task in ${payload.projectName}.`,
    cards: [
      { label: "Current Stage", value: payload.statusLabel },
      { label: "Due Date", value: formatNotificationDate(payload.dueDate) },
      { label: "Reminder Date", value: formatNotificationDateTime(payload.reminderDate) },
    ],
    ctaLabel: "Open Task Board",
    ctaUrl: payload.appUrl,
    footerNote: "Reminder emails are only sent once per task reminder date per recipient.",
  } satisfies EmailTemplateOptions;

  return {
    subject: `${branding.subjectPrefix} Reminder: ${payload.taskTitle}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}

export async function buildWorkspaceDigestEmail(payload: {
  recipientName?: string;
  workspaceName: string;
  projectCount: number;
  activeTaskCount: number;
  dueTodayCount: number;
  reminderCount: number;
  unreadChatCount: number;
  highlightedProjects: string[];
  appUrl: string;
}) {
  const template = {
    icon: "digest",
    eyebrow: "Workspace Digest",
    title: `${payload.workspaceName} at a glance`,
    intro: `${payload.recipientName?.trim() || "You"} asked for a designed summary of task momentum, reminders, and unread collaboration signals.`,
    cards: [
      { label: "Projects", value: `${payload.projectCount}` },
      { label: "Active Tasks", value: `${payload.activeTaskCount}` },
      { label: "Due Today", value: `${payload.dueTodayCount}` },
      { label: "Unread Chats", value: `${payload.unreadChatCount}` },
    ],
    sections: payload.highlightedProjects.length > 0
      ? [{
          title: "Project Focus",
          items: payload.highlightedProjects,
        }]
      : undefined,
    body: `<p style="margin:0;">${payload.reminderCount} reminder${payload.reminderCount === 1 ? "" : "s"} are scheduled for today. Use the workspace board to rebalance ownership before due dates slip.</p>`,
    ctaLabel: "Open Workspace",
    ctaUrl: payload.appUrl,
    footerNote: "Digest emails are sent once per day when email and digest notifications are enabled.",
  } satisfies EmailTemplateOptions;

  const branding = await getAppEmailBranding(payload.appUrl);

  return {
    subject: `${branding.subjectPrefix} Daily digest for ${payload.workspaceName}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}

export async function buildUnreadChatEmail(payload: {
  recipientName?: string;
  contactName: string;
  unreadCount: number;
  hoursUnread: number;
  preview: string;
  appUrl: string;
}) {
  const template = {
    icon: "chat",
    eyebrow: "Unread Chat",
    title: `${payload.unreadCount} unread ${payload.unreadCount === 1 ? "message" : "messages"} from ${payload.contactName}`,
    intro: `${payload.recipientName?.trim() || "You"} still have unread chat activity after ${payload.hoursUnread} hour${payload.hoursUnread === 1 ? "" : "s"}. This is the nudge layer before a longer digest catches it later.`,
    cards: [
      { label: "Unread Count", value: `${payload.unreadCount}` },
      { label: "From", value: payload.contactName },
      { label: "Delay", value: `${payload.hoursUnread} hours` },
    ],
    body: `<p style="margin:0;font-style:italic;">\"${escapeHtml(payload.preview)}\"</p>`,
    ctaLabel: "Open Chat",
    ctaUrl: payload.appUrl,
    footerNote: "Chat email nudges are delayed to reduce noise and are only sent once for each unread message batch.",
  } satisfies EmailTemplateOptions;

  const branding = await getAppEmailBranding(payload.appUrl);

  return {
    subject: `${branding.subjectPrefix} Unread chat from ${payload.contactName}`,
    html: await renderEmailTemplate(template),
    text: buildTextVersion(template),
  };
}
