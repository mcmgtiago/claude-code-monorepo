import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";

const optionalPortSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = typeof value === "string" ? Number(value) : value;
  return numberValue;
}, z.number().int().min(1).max(65535).nullable());

const essentialsSchema = z
  .object({
    workspaceId: z.string().cuid(),
    smtpHost: z.string().optional().default(""),
    smtpPort: optionalPortSchema.optional().default(null),
    smtpUser: z.string().optional().default(""),
    smtpPass: z.string().optional().default(""),
    smtpFrom: z.string().optional().default(""),
    openTrackingEnabled: z.boolean().optional().default(true),
    clickTrackingEnabled: z.boolean().optional().default(true),
    imapHost: z.string().optional().default(""),
    imapPort: optionalPortSchema.optional().default(null),
    imapUser: z.string().optional().default(""),
    imapPass: z.string().optional().default(""),
    imapSecure: z.boolean().optional().default(true),
    countryCode: z.string().min(2),
    timezone: z.string().min(1),
    currencyCode: z.string().min(3),
    locale: z.string().min(2),
    dateFormat: z.string().min(1),
    timeFormat: z.string().min(1),
    weekStartsOn: z.string().min(1)
  })
  .superRefine((value, ctx) => {
    const smtpComplete = Boolean(value.smtpHost && value.smtpPort && value.smtpUser && value.smtpPass && value.smtpFrom);
    const smtpTouched = Boolean(value.smtpHost || value.smtpPort || value.smtpUser || value.smtpPass || value.smtpFrom);
    const imapComplete = Boolean(value.imapHost && value.imapPort && value.imapUser && value.imapPass);
    const imapTouched = Boolean(value.imapHost || value.imapPort || value.imapUser || value.imapPass);

    if (smtpTouched && !smtpComplete) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["smtpHost"],
        message: "SMTP credentials must be fully filled or fully cleared."
      });
    }

    if (imapTouched && !imapComplete) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imapHost"],
        message: "IMAP credentials must be fully filled or fully cleared."
      });
    }
  });

function sanitizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function toResponse(settings: {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
  imapHost: string | null;
  imapPort: number | null;
  imapUser: string | null;
  imapPass: string | null;
  imapSecure: boolean;
  countryCode: string | null;
  timezone: string | null;
  currencyCode: string | null;
  locale: string | null;
  dateFormat: string | null;
  timeFormat: string | null;
  weekStartsOn: string | null;
}) {
  return {
    smtpHost: settings.smtpHost || "",
    smtpPort: settings.smtpPort ? String(settings.smtpPort) : "",
    smtpUser: settings.smtpUser || "",
    smtpPass: settings.smtpPass || "",
    smtpFrom: settings.smtpFrom || "",
    openTrackingEnabled: settings.openTrackingEnabled,
    clickTrackingEnabled: settings.clickTrackingEnabled,
    imapHost: settings.imapHost || "",
    imapPort: settings.imapPort ? String(settings.imapPort) : "",
    imapUser: settings.imapUser || "",
    imapPass: settings.imapPass || "",
    imapSecure: settings.imapSecure,
    countryCode: settings.countryCode || "IN",
    timezone: settings.timezone || "Asia/Kolkata",
    currencyCode: settings.currencyCode || "INR",
    locale: settings.locale || "en-IN",
    dateFormat: settings.dateFormat || "DD MMM YYYY",
    timeFormat: settings.timeFormat || "12h",
    weekStartsOn: settings.weekStartsOn || "Monday",
    smtpConfigured: Boolean(settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass && settings.smtpFrom),
    imapConfigured: Boolean(settings.imapHost && settings.imapPort && settings.imapUser && settings.imapPass)
  };
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const payload = essentialsSchema.parse(await request.json());
    const workspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
      select: { id: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const settings = await prisma.workspaceSetting.upsert({
      where: { workspaceId: payload.workspaceId },
      update: {
        smtpHost: sanitizeOptional(payload.smtpHost),
        smtpPort: payload.smtpPort,
        smtpUser: sanitizeOptional(payload.smtpUser),
        smtpPass: sanitizeOptional(payload.smtpPass),
        smtpFrom: sanitizeOptional(payload.smtpFrom),
        openTrackingEnabled: payload.openTrackingEnabled,
        clickTrackingEnabled: payload.clickTrackingEnabled,
        imapHost: sanitizeOptional(payload.imapHost),
        imapPort: payload.imapPort,
        imapUser: sanitizeOptional(payload.imapUser),
        imapPass: sanitizeOptional(payload.imapPass),
        imapSecure: payload.imapSecure,
        countryCode: payload.countryCode.trim().toUpperCase(),
        timezone: payload.timezone.trim(),
        currencyCode: payload.currencyCode.trim().toUpperCase(),
        locale: payload.locale.trim(),
        dateFormat: payload.dateFormat.trim(),
        timeFormat: payload.timeFormat.trim(),
        weekStartsOn: payload.weekStartsOn.trim()
      },
      create: {
        workspaceId: payload.workspaceId,
        smtpHost: sanitizeOptional(payload.smtpHost),
        smtpPort: payload.smtpPort,
        smtpUser: sanitizeOptional(payload.smtpUser),
        smtpPass: sanitizeOptional(payload.smtpPass),
        smtpFrom: sanitizeOptional(payload.smtpFrom),
        openTrackingEnabled: payload.openTrackingEnabled,
        clickTrackingEnabled: payload.clickTrackingEnabled,
        imapHost: sanitizeOptional(payload.imapHost),
        imapPort: payload.imapPort,
        imapUser: sanitizeOptional(payload.imapUser),
        imapPass: sanitizeOptional(payload.imapPass),
        imapSecure: payload.imapSecure,
        countryCode: payload.countryCode.trim().toUpperCase(),
        timezone: payload.timezone.trim(),
        currencyCode: payload.currencyCode.trim().toUpperCase(),
        locale: payload.locale.trim(),
        dateFormat: payload.dateFormat.trim(),
        timeFormat: payload.timeFormat.trim(),
        weekStartsOn: payload.weekStartsOn.trim()
      }
    });

    return NextResponse.json(toResponse(settings));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid essentials payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update essentials" }, { status: 500 });
  }
}
