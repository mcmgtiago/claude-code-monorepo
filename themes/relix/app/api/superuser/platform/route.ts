import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";

const optionalPortSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = typeof value === "string" ? Number(value) : value;
  return numberValue;
}, z.number().int().min(1).max(65535).nullable());

const platformSchema = z
  .object({
    appName: z.string().optional().default(""),
    appDescription: z.string().optional().default(""),
    appUrl: z.string().optional().default(""),
    supportEmail: z.string().optional().default(""),
    smtpHost: z.string().optional().default(""),
    smtpPort: optionalPortSchema.optional().default(null),
    smtpUser: z.string().optional().default(""),
    smtpPass: z.string().optional().default(""),
    smtpFrom: z.string().optional().default(""),
    imapHost: z.string().optional().default(""),
    imapPort: optionalPortSchema.optional().default(null),
    imapUser: z.string().optional().default(""),
    imapPass: z.string().optional().default(""),
    imapSecure: z.boolean().optional().default(true),
    googleClientId: z.string().optional().default(""),
    googleClientSecret: z.string().optional().default(""),
    openAiApiKey: z.string().optional().default(""),
    openAiModel: z.string().optional().default(""),
    openTrackingEnabled: z.boolean().optional().default(true),
    clickTrackingEnabled: z.boolean().optional().default(true)
  })
  .superRefine((value, ctx) => {
    const smtpComplete = Boolean(value.smtpHost && value.smtpPort && value.smtpUser && value.smtpPass && value.smtpFrom);
    const smtpTouched = Boolean(value.smtpHost || value.smtpPort || value.smtpUser || value.smtpPass || value.smtpFrom);
    const imapComplete = Boolean(value.imapHost && value.imapPort && value.imapUser && value.imapPass);
    const imapTouched = Boolean(value.imapHost || value.imapPort || value.imapUser || value.imapPass);
    const googleComplete = Boolean(value.googleClientId && value.googleClientSecret);
    const googleTouched = Boolean(value.googleClientId || value.googleClientSecret);

    if (smtpTouched && !smtpComplete) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["smtpHost"], message: "SMTP settings must be fully filled or fully cleared." });
    }

    if (imapTouched && !imapComplete) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["imapHost"], message: "IMAP settings must be fully filled or fully cleared." });
    }

    if (googleTouched && !googleComplete) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["googleClientId"], message: "Google OAuth credentials must be fully filled or fully cleared." });
    }
  });

function sanitizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export async function GET() {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    return NextResponse.json(await getPlatformSettings());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load platform settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const payload = platformSchema.parse(await request.json());

    await prisma.platformSetting.upsert({
      where: { id: "platform" },
      update: {
        appName: sanitizeOptional(payload.appName),
        appDescription: sanitizeOptional(payload.appDescription),
        appUrl: sanitizeOptional(payload.appUrl),
        supportEmail: sanitizeOptional(payload.supportEmail),
        smtpHost: sanitizeOptional(payload.smtpHost),
        smtpPort: payload.smtpPort,
        smtpUser: sanitizeOptional(payload.smtpUser),
        smtpPass: sanitizeOptional(payload.smtpPass),
        smtpFrom: sanitizeOptional(payload.smtpFrom),
        imapHost: sanitizeOptional(payload.imapHost),
        imapPort: payload.imapPort,
        imapUser: sanitizeOptional(payload.imapUser),
        imapPass: sanitizeOptional(payload.imapPass),
        imapSecure: payload.imapSecure,
        googleClientId: sanitizeOptional(payload.googleClientId),
        googleClientSecret: sanitizeOptional(payload.googleClientSecret),
        openAiApiKey: sanitizeOptional(payload.openAiApiKey),
        openAiModel: sanitizeOptional(payload.openAiModel),
        openTrackingEnabled: payload.openTrackingEnabled,
        clickTrackingEnabled: payload.clickTrackingEnabled
      },
      create: {
        id: "platform",
        appName: sanitizeOptional(payload.appName),
        appDescription: sanitizeOptional(payload.appDescription),
        appUrl: sanitizeOptional(payload.appUrl),
        supportEmail: sanitizeOptional(payload.supportEmail),
        smtpHost: sanitizeOptional(payload.smtpHost),
        smtpPort: payload.smtpPort,
        smtpUser: sanitizeOptional(payload.smtpUser),
        smtpPass: sanitizeOptional(payload.smtpPass),
        smtpFrom: sanitizeOptional(payload.smtpFrom),
        imapHost: sanitizeOptional(payload.imapHost),
        imapPort: payload.imapPort,
        imapUser: sanitizeOptional(payload.imapUser),
        imapPass: sanitizeOptional(payload.imapPass),
        imapSecure: payload.imapSecure,
        googleClientId: sanitizeOptional(payload.googleClientId),
        googleClientSecret: sanitizeOptional(payload.googleClientSecret),
        openAiApiKey: sanitizeOptional(payload.openAiApiKey),
        openAiModel: sanitizeOptional(payload.openAiModel),
        openTrackingEnabled: payload.openTrackingEnabled,
        clickTrackingEnabled: payload.clickTrackingEnabled
      }
    });

    return NextResponse.json(await getPlatformSettings());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid platform settings payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update platform settings" }, { status: 500 });
  }
}
