import { z } from "zod";
import { generateEmailAiResult } from "@/lib/email-ai";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";

const emailAiSchema = z
  .object({
    action: z.enum(["write", "rephrase", "analyze"]),
    to: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
    signatureEnabled: z.boolean().optional()
  })
  .superRefine((value, ctx) => {
    const message = value.message?.trim() || "";
    const subject = value.subject?.trim() || "";

    if (value.action === "write" && !message && !subject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "Add a subject or draft notes before using Write with AI."
      });
    }

    if ((value.action === "rephrase" || value.action === "analyze") && !message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: value.action === "rephrase" ? "Write something first so AI can rephrase it." : "Write something first so AI can analyze it."
      });
    }
  });

export async function POST(request: Request) {
  try {
    await requireWorkspaceContextForAnyRole();
    const raw = await request.json();
    const payload = emailAiSchema.parse(raw);
    const result = await generateEmailAiResult(payload);

    return Response.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message || "Invalid email AI request",
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to run Email AI" }, { status: 500 });
  }
}
