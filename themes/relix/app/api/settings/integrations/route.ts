import { z } from "zod";
import { disconnectGoogleCalendarConnection, findGoogleCalendarConnectionByUserId, isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { comingSoonIntegrationIds, settingsIntegrationCatalog, type SettingsIntegrationId, type SettingsIntegrationItem } from "@/lib/settings-integrations";
import { maskSlackWebhookUrl, normalizeSlackWebhookUrl, sendSlackWebhookMessage } from "@/lib/slack";
import { requireWorkspaceContext } from "@/lib/workspace";

const integrationActionSchema = z
  .object({
    integrationId: z.enum(["google-meet", "slack"]),
    action: z.enum(["connect", "disconnect"]),
    webhookUrl: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (value.integrationId === "google-meet" && value.action !== "disconnect") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["action"],
        message: "Google Meet connect is handled through OAuth."
      });
    }

    if (value.integrationId === "slack" && value.action === "connect" && !value.webhookUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["webhookUrl"],
        message: "Slack webhook URL is required."
      });
    }
  });

async function buildIntegrations(userId: string, workspaceId: string): Promise<SettingsIntegrationItem[]> {
  const [googleConnection, googleConfigured, workspaceSettings] = await Promise.all([
    findGoogleCalendarConnectionByUserId(userId).catch(() => null),
    isGoogleCalendarConfigured(),
    prisma.workspaceSetting.findUnique({
      where: { workspaceId },
      select: {
        slackWebhookUrl: true,
        slackConnectedAt: true
      }
    })
  ]);

  const googleMeta = settingsIntegrationCatalog["google-meet"];
  const slackMeta = settingsIntegrationCatalog.slack;
  const connectedSlack = Boolean(workspaceSettings?.slackWebhookUrl);

  const items: SettingsIntegrationItem[] = [
    {
      ...googleMeta,
      description: googleConnection
        ? "Connected to Google Calendar. New meeting bookings can create real Google Meet links."
        : googleConfigured
          ? "Connect Google Calendar to create Google Meet links directly from your booking flows."
          : "Google client credentials are missing, so this integration cannot be connected yet.",
      availability: googleConnection ? "connected" : "available",
      connected: Boolean(googleConnection),
      setupMode: "google_oauth",
      actionLabel: googleConnection ? "Disconnect" : googleConfigured ? "Connect" : "Setup unavailable",
      actionVariant: googleConnection ? "secondary" : googleConfigured ? "primary" : "muted",
      disabled: !googleConnection && !googleConfigured,
      statusLabel: googleConnection ? "Connected" : googleConfigured ? "Ready" : "Unavailable",
      detail: googleConnection?.googleEmail || (!googleConfigured ? "Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET" : null)
    },
    {
      ...slackMeta,
      description: connectedSlack
        ? "Workspace alerts can be posted into Slack with the saved incoming webhook."
        : "Paste a Slack incoming webhook URL to send CRM notifications into a Slack channel.",
      availability: connectedSlack ? "connected" : "available",
      connected: connectedSlack,
      setupMode: "slack_webhook",
      actionLabel: connectedSlack ? "Disconnect" : "Configure",
      actionVariant: connectedSlack ? "secondary" : "primary",
      statusLabel: connectedSlack ? "Connected" : "Webhook setup",
      detail: connectedSlack ? maskSlackWebhookUrl(workspaceSettings?.slackWebhookUrl) : null
    }
  ];

  for (const integrationId of comingSoonIntegrationIds) {
    const meta = settingsIntegrationCatalog[integrationId];
    const descriptions: Record<(typeof comingSoonIntegrationIds)[number], string> = {
      zoom: "Zoom meeting links and event syncing are planned, but backend connection support is not implemented yet.",
      "microsoft-teams": "Microsoft Teams meeting links and event syncing are planned, but backend connection support is not implemented yet.",
      salesforce: "CRM sync for Salesforce is not wired yet, so this stays disabled until the backend is ready.",
      hubspot: "HubSpot sync is not wired yet, so this stays disabled until the backend is ready.",
      pipedrive: "Pipedrive sync is not wired yet, so this stays disabled until the backend is ready.",
      "hubspot-data-enrichment": "HubSpot data enrichment is not wired yet, so this stays disabled until the backend is ready."
    };

    items.push({
      ...meta,
      description: descriptions[integrationId],
      availability: "coming_soon",
      connected: false,
      setupMode: null,
      actionLabel: "Coming soon",
      actionVariant: "muted",
      disabled: true,
      statusLabel: "Coming soon",
      detail: null
    });
  }

  return items;
}

export async function GET() {
  try {
    const { user, workspace } = await requireWorkspaceContext();
    const integrations = await buildIntegrations(user.id, workspace.id);

    return Response.json({ integrations });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load integrations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = integrationActionSchema.parse(raw);

    if (payload.integrationId === "google-meet" && payload.action === "disconnect") {
      await disconnectGoogleCalendarConnection(user.id);
      await prisma.meetingPreference.updateMany({
        where: { workspaceId: workspace.id },
        data: { googleMeetConnected: false }
      });

      return Response.json({
        integrations: await buildIntegrations(user.id, workspace.id),
        feedback: "Google Meet disconnected."
      });
    }

    if (payload.integrationId === "slack" && payload.action === "disconnect") {
      await prisma.workspaceSetting.upsert({
        where: { workspaceId: workspace.id },
        update: {
          slackWebhookUrl: null,
          slackConnectedAt: null
        },
        create: {
          workspaceId: workspace.id
        }
      });

      return Response.json({
        integrations: await buildIntegrations(user.id, workspace.id),
        feedback: "Slack webhook disconnected."
      });
    }

    if (payload.integrationId === "slack" && payload.action === "connect") {
      const webhookUrl = normalizeSlackWebhookUrl(payload.webhookUrl || "");

      if (!webhookUrl) {
        return Response.json({ error: "Enter a valid Slack incoming webhook URL." }, { status: 400 });
      }

      await sendSlackWebhookMessage(webhookUrl, "Relix CRM Slack integration connected successfully.");

      await prisma.workspaceSetting.upsert({
        where: { workspaceId: workspace.id },
        update: {
          slackWebhookUrl: webhookUrl,
          slackConnectedAt: new Date()
        },
        create: {
          workspaceId: workspace.id,
          slackWebhookUrl: webhookUrl,
          slackConnectedAt: new Date()
        }
      });

      return Response.json({
        integrations: await buildIntegrations(user.id, workspace.id),
        feedback: "Slack webhook connected. A confirmation message was sent to Slack."
      });
    }

    return Response.json({ error: "Unsupported integration action." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid integration action", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update integration" }, { status: 500 });
  }
}
