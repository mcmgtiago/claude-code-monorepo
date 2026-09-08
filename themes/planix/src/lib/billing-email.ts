import { getAppEmailBranding, getAppSmtpSettings } from "@/lib/app-config";
import { getConfiguredAppHost, getConfiguredAppUrl } from "@/lib/app-url";
import { sendNotificationEmail } from "@/lib/notification-email";

type BillingReceiptEmailPayload = {
  userEmail: string;
  userName?: string | null;
  workspaceId?: string | null;
  workspaceName?: string | null;
  planName: string;
  displayAmount: string;
  currency: string;
  amountSubunits: number;
  invoiceNumber: string;
  invoiceDate: string;
  renewsOn?: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  receipt: string;
  razorpayEmail?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value: string) {
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

async function buildEmailFrame(options: {
  eyebrow: string;
  title: string;
  intro: string;
  details: Array<{ label: string; value: string }>;
  actionLabel: string;
  actionUrl: string;
  footer: string;
}) {
  const host = getConfiguredAppHost(options.actionUrl);
  const branding = await getAppEmailBranding(options.actionUrl);

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
        <div style="display:grid;gap:10px;">
          ${options.details.map((detail) => `
            <div style="border:1px solid #e8dfd7;padding:14px 16px;background:#f8f4ef;">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7f6c63;">${escapeHtml(detail.label)}</div>
              <div style="margin-top:8px;font-size:16px;line-height:1.5;color:#17171d;font-weight:600;">${escapeHtml(detail.value)}</div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:22px;">
          <a href="${escapeHtml(options.actionUrl)}" style="display:inline-block;padding:13px 18px;background:#e58f65;color:#17171d;text-decoration:none;font-size:14px;font-weight:700;">
            ${escapeHtml(options.actionLabel)}
          </a>
        </div>
        <div style="margin-top:22px;color:#7f6c63;font-size:12px;line-height:1.6;">
          ${escapeHtml(options.footer)}
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
  details: Array<{ label: string; value: string }>;
  actionLabel: string;
  actionUrl: string;
  footer: string;
}) {
  return [
    options.eyebrow,
    options.title,
    "",
    options.intro,
    "",
    ...options.details.map((detail) => `${detail.label}: ${detail.value}`),
    "",
    `${options.actionLabel}: ${options.actionUrl}`,
    "",
    options.footer,
  ].join("\n");
}

export async function sendBillingReceiptEmails(payload: BillingReceiptEmailPayload) {
  const appUrl = getConfiguredAppUrl();
  const branding = await getAppEmailBranding(appUrl);
  const smtp = await getAppSmtpSettings();
  const userEmail = payload.userEmail.trim().toLowerCase();
  const internalEmail = smtp.contactToEmail.trim().toLowerCase();
  const invoiceLabel = payload.invoiceNumber.trim() || payload.razorpayPaymentId;
  const formattedInvoiceDate = formatDate(payload.invoiceDate);
  const formattedRenewalDate = payload.renewsOn ? formatDate(payload.renewsOn) : "Manual renewal";
  const sourceEmail = payload.razorpayEmail?.trim().toLowerCase() || userEmail;
  const amountBreakdown = `${payload.displayAmount} (${payload.amountSubunits} ${payload.currency} subunits)`;

  const userDetails = [
    { label: "Invoice", value: invoiceLabel },
    { label: "Plan", value: payload.planName },
    { label: "Amount", value: payload.displayAmount },
    { label: "Paid On", value: formattedInvoiceDate },
    { label: "Next Renewal", value: formattedRenewalDate },
    { label: "Razorpay Payment", value: payload.razorpayPaymentId },
    { label: "Razorpay Order", value: payload.razorpayOrderId },
    { label: "Receipt", value: payload.receipt },
  ];

  const userTemplate = {
    eyebrow: "Payment Confirmed",
    title: `${payload.planName} is now active`,
    intro: `We confirmed your Razorpay payment and generated invoice ${invoiceLabel} for your workspace.`,
    details: userDetails,
    actionLabel: "Open Billing Settings",
    actionUrl: `${appUrl}/settings`,
    footer: "Keep this email for your records. The same invoice details are available in your billing history.",
  };

  const results = {
    user: userEmail
      ? await sendNotificationEmail({
          workspaceId: payload.workspaceId,
          eventKey: `billing-receipt:${invoiceLabel}:${payload.razorpayPaymentId}:user`,
          category: "billing-receipt",
          subject: `${branding.subjectPrefix} Invoice ${invoiceLabel} for ${payload.planName}`,
          to: {
            email: userEmail,
            name: payload.userName?.trim() || undefined,
          },
          html: await buildEmailFrame(userTemplate),
          text: buildEmailText(userTemplate),
          metadata: {
            invoiceNumber: invoiceLabel,
            razorpayOrderId: payload.razorpayOrderId,
            razorpayPaymentId: payload.razorpayPaymentId,
            planName: payload.planName,
          },
          preferenceKey: null,
          respectPreferences: false,
        })
      : { status: "skipped" as const, reason: "Missing user email." },
    internal: internalEmail
      ? await sendNotificationEmail({
          workspaceId: payload.workspaceId,
          eventKey: `billing-receipt:${invoiceLabel}:${payload.razorpayPaymentId}:internal`,
          category: "billing-receipt-internal",
          subject: `${branding.subjectPrefix} Billing received: ${payload.planName} ${payload.displayAmount}`,
          to: {
            email: internalEmail,
            name: branding.companyName,
          },
          html: await buildEmailFrame({
            eyebrow: "Billing Receipt",
            title: `Payment received for ${payload.planName}`,
            intro: `${payload.userName?.trim() || payload.userEmail} completed a Razorpay payment and the workspace plan has been activated.`,
            details: [
              { label: "Invoice", value: invoiceLabel },
              { label: "Customer Email", value: payload.userEmail },
              ...(sourceEmail !== userEmail ? [{ label: "Razorpay Email", value: sourceEmail }] : []),
              ...(payload.workspaceName?.trim() ? [{ label: "Workspace", value: payload.workspaceName.trim() }] : []),
              { label: "Amount", value: amountBreakdown },
              { label: "Paid On", value: formattedInvoiceDate },
              { label: "Next Renewal", value: formattedRenewalDate },
              { label: "Razorpay Payment", value: payload.razorpayPaymentId },
              { label: "Razorpay Order", value: payload.razorpayOrderId },
              { label: "Receipt", value: payload.receipt },
            ],
            actionLabel: "Open Admin Console",
            actionUrl: `${appUrl}/admin/super`,
            footer: "This internal copy was generated automatically after payment verification completed.",
          }),
          text: buildEmailText({
            eyebrow: "Billing Receipt",
            title: `Payment received for ${payload.planName}`,
            intro: `${payload.userName?.trim() || payload.userEmail} completed a Razorpay payment and the workspace plan has been activated.`,
            details: [
              { label: "Invoice", value: invoiceLabel },
              { label: "Customer Email", value: payload.userEmail },
              ...(sourceEmail !== userEmail ? [{ label: "Razorpay Email", value: sourceEmail }] : []),
              ...(payload.workspaceName?.trim() ? [{ label: "Workspace", value: payload.workspaceName.trim() }] : []),
              { label: "Amount", value: amountBreakdown },
              { label: "Paid On", value: formattedInvoiceDate },
              { label: "Next Renewal", value: formattedRenewalDate },
              { label: "Razorpay Payment", value: payload.razorpayPaymentId },
              { label: "Razorpay Order", value: payload.razorpayOrderId },
              { label: "Receipt", value: payload.receipt },
            ],
            actionLabel: "Open Admin Console",
            actionUrl: `${appUrl}/admin/super`,
            footer: "This internal copy was generated automatically after payment verification completed.",
          }),
          metadata: {
            invoiceNumber: invoiceLabel,
            razorpayOrderId: payload.razorpayOrderId,
            razorpayPaymentId: payload.razorpayPaymentId,
            planName: payload.planName,
            userEmail,
          },
          preferenceKey: null,
          respectPreferences: false,
        })
      : { status: "skipped" as const, reason: "Missing internal billing email." },
  };

  return results;
}
