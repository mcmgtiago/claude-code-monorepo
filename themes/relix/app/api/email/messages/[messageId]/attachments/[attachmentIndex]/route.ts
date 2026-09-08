import { NextResponse } from "next/server";
import { readEmailMessageAttachment } from "@/lib/imap";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";

function buildContentDisposition(fileName: string, forceDownload: boolean) {
  const fallbackName = fileName.replace(/["\\]/g, "_").replace(/[^\x20-\x7E]+/g, "_") || "attachment";
  const encodedFileName = encodeURIComponent(fileName || "attachment");
  const dispositionType = forceDownload ? "attachment" : "inline";

  return `${dispositionType}; filename="${fallbackName}"; filename*=UTF-8''${encodedFileName}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ messageId: string; attachmentIndex: string }> }
) {
  const { user, workspace } = await requireWorkspaceContextForAnyRole();
  const { messageId, attachmentIndex } = await context.params;
  const parsedAttachmentIndex = Number.parseInt(attachmentIndex, 10);

  if (!Number.isInteger(parsedAttachmentIndex) || parsedAttachmentIndex < 0) {
    return NextResponse.json({ error: "Attachment index is invalid." }, { status: 400 });
  }

  try {
    const attachment = await readEmailMessageAttachment({
      userId: user.id,
      workspaceId: workspace.id,
      messageId,
      attachmentIndex: parsedAttachmentIndex
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
    }

    const searchParams = new URL(request.url).searchParams;
    const forceDownload = searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(attachment.content), {
      headers: {
        "content-type": attachment.contentType || "application/octet-stream",
        "content-length": String(attachment.content.length),
        "content-disposition": buildContentDisposition(attachment.fileName, forceDownload),
        "cache-control": "private, no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load the attachment."
      },
      { status: 500 }
    );
  }
}
