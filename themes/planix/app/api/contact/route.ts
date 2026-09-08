import { NextResponse } from "next/server";

import { getAppBrandingSettings, getAppSmtpSettings } from "@/lib/app-config";
import { getDbPool } from "@/lib/db";
import { getMailer } from "@/lib/mailer";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const subject = body.subject?.trim() ?? "Website contact";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const pool = getDbPool();

  await pool.query(
    `
      insert into public.app_contact_submissions (name, email, subject, message)
      values ($1, $2, $3, $4)
    `,
    [name, email, subject, message],
  );

  const transporter = await getMailer();
  const branding = await getAppBrandingSettings();
  const smtp = await getAppSmtpSettings();
  await transporter.sendMail({
    from: smtp.from,
    to: smtp.contactToEmail,
    replyTo: email,
    subject: `[${branding.appName} Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}
