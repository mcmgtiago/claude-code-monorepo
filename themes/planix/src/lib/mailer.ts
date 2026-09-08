import nodemailer from "nodemailer";

import { getAppSmtpSettings } from "@/lib/app-config";

declare global {
  var __planixMailer: { key: string; transporter: nodemailer.Transporter } | undefined;
}

function buildMailerCacheKey(config: {
  host: string;
  port: number;
  user: string;
  pass: string;
}) {
  return JSON.stringify({
    host: config.host,
    port: config.port,
    user: config.user,
    pass: config.pass,
  });
}

export async function getMailer() {
  const config = await getAppSmtpSettings();
  const key = buildMailerCacheKey(config);

  if (!globalThis.__planixMailer || globalThis.__planixMailer.key !== key) {
    globalThis.__planixMailer = {
      key,
      transporter: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      }),
    };
  }

  return globalThis.__planixMailer.transporter;
}

export async function verifyMailerConnection() {
  const config = await getAppSmtpSettings();
  const transporter = await getMailer();
  await transporter.verify();

  return {
    host: config.host,
    port: config.port,
    user: config.user,
    from: config.from,
    to: config.contactToEmail,
  };
}
