import { z } from "zod";
import { sendTrackedEmail, getPreferredWorkspaceSenderUserId } from "@/lib/email";
import { buildReminderConfirmationEmail } from "@/lib/email-html";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { formatLocalizedDateTime, normalizeLocalizationSettings } from "@/lib/localization";
import { prisma } from "@/lib/prisma";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

const reminderSchema = z.object({
  title: z.string().min(1),
  remindAt: z.string().datetime()
});

export async function POST(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await context.params;

  try {
    const { user: currentUser, workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = reminderSchema.parse(raw);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        assignedUsersJson: true,
        company: true,
        companyRecord: { select: { name: true } }
      }
    });

    if (!lead || lead.workspaceId !== workspace.id) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!canControlLead(currentUser, workspace, { assignedUsersJson: lead.assignedUsersJson })) {
      return Response.json({ error: LEAD_CONTROL_DENIED_MESSAGE }, { status: 403 });
    }

    const reminder = await prisma.leadReminder.create({
      data: {
        leadId,
        title: payload.title.trim(),
        remindAt: new Date(payload.remindAt)
      }
    });

    // Send confirmation email to the user who set the reminder
    try {
      const [senderUserId, localization] = await Promise.all([
        getPreferredWorkspaceSenderUserId(workspace.id),
        getWorkspaceLocalizationSettings()
      ]);

      if (senderUserId) {
        const companyName = lead.companyRecord?.name || lead.company || null;
        const remindAtLabel = formatLocalizedDateTime(new Date(payload.remindAt), normalizeLocalizationSettings(localization));
        await sendTrackedEmail({
          userId: senderUserId,
          workspaceId: workspace.id,
          to: currentUser.email,
          subject: `Reminder set: ${payload.title.trim()}`,
          html: buildReminderConfirmationEmail({
            recipientName: currentUser.fullName,
            reminderTitle: payload.title.trim(),
            leadName: lead.name,
            companyName,
            scheduledFor: remindAtLabel
          })
        });
      }
    } catch {
      // Email failure should not block reminder creation
    }

    return Response.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid reminder payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create reminder" }, { status: 500 });
  }
}
