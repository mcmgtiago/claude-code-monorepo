import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const localizationSchema = z.object({
  countryCode: z.string().min(2),
  timezone: z.string().min(1),
  currencyCode: z.string().min(3),
  locale: z.string().min(2),
  dateFormat: z.string().min(1),
  timeFormat: z.string().min(1),
  weekStartsOn: z.string().min(1)
});

const defaultLocalizationSettings = {
  countryCode: "IN",
  timezone: "Asia/Kolkata",
  currencyCode: "INR",
  locale: "en-IN",
  dateFormat: "DD MMM YYYY",
  timeFormat: "12h",
  weekStartsOn: "Monday"
};

function normalizeLocalizationSettings(
  settings:
    | {
        countryCode: string | null;
        timezone: string | null;
        currencyCode: string | null;
        locale: string | null;
        dateFormat: string | null;
        timeFormat: string | null;
        weekStartsOn: string | null;
      }
    | null
) {
  return {
    countryCode: settings?.countryCode || defaultLocalizationSettings.countryCode,
    timezone: settings?.timezone || defaultLocalizationSettings.timezone,
    currencyCode: settings?.currencyCode || defaultLocalizationSettings.currencyCode,
    locale: settings?.locale || defaultLocalizationSettings.locale,
    dateFormat: settings?.dateFormat || defaultLocalizationSettings.dateFormat,
    timeFormat: settings?.timeFormat || defaultLocalizationSettings.timeFormat,
    weekStartsOn: settings?.weekStartsOn || defaultLocalizationSettings.weekStartsOn
  };
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspace } = await requireWorkspaceContext();
    const settings = await prisma.workspaceSetting.findFirst({
      where: { workspaceId: workspace.id },
      select: {
        countryCode: true,
        timezone: true,
        currencyCode: true,
        locale: true,
        dateFormat: true,
        timeFormat: true,
        weekStartsOn: true
      }
    });

    return Response.json(normalizeLocalizationSettings(settings));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load localization settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = localizationSchema.parse(raw);

    const settings = await prisma.workspaceSetting.upsert({
      where: { workspaceId: workspace.id },
      update: {
        countryCode: payload.countryCode.trim().toUpperCase(),
        timezone: payload.timezone.trim(),
        currencyCode: payload.currencyCode.trim().toUpperCase(),
        locale: payload.locale.trim(),
        dateFormat: payload.dateFormat.trim(),
        timeFormat: payload.timeFormat.trim(),
        weekStartsOn: payload.weekStartsOn.trim()
      },
      create: {
        workspaceId: workspace.id,
        countryCode: payload.countryCode.trim().toUpperCase(),
        timezone: payload.timezone.trim(),
        currencyCode: payload.currencyCode.trim().toUpperCase(),
        locale: payload.locale.trim(),
        dateFormat: payload.dateFormat.trim(),
        timeFormat: payload.timeFormat.trim(),
        weekStartsOn: payload.weekStartsOn.trim()
      }
    });

    return Response.json(normalizeLocalizationSettings(settings));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid localization settings", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to save localization settings" }, { status: 500 });
  }
}
