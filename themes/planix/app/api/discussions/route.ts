import { NextResponse } from "next/server";

import type { TeamMemberRecord } from "@/data/project-board";
import { getDemoDiscussions, setDemoDiscussions, type DemoDiscussionAttachment } from "@/lib/template-demo-store";

type DiscussionsPatchBody = {
  action?: "toggle-star" | "add-reaction";
  projectRef?: string;
  threadId?: string;
  starred?: boolean;
  targetType?: "thread" | "reply";
  targetId?: string;
  emoji?: string;
};

type DiscussionsDeleteBody = {
  projectRef?: string;
  targetType?: "thread" | "reply";
  targetId?: string;
};

async function attachmentFromFile(file: File, index: number): Promise<DemoDiscussionAttachment> {
  const dataUrl = `data:${file.type || "application/octet-stream"};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
  return {
    id: `attachment-${Date.now()}-${index + 1}`,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    dataUrl,
    kind: file.type.startsWith("image/") ? "image" : "file",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectRef = searchParams.get("projectRef")?.trim() ?? "";

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, discussions: getDemoDiscussions(projectRef), mode: "remote" });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "").trim();
  const projectRef = String(formData.get("projectRef") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim() || "Planix Studio";
  const authorInitials = String(formData.get("authorInitials") ?? "").trim() || "PS";
  const authorTone = (String(formData.get("authorTone") ?? "").trim() || "sand") as TeamMemberRecord["avatarTone"];
  const attachments = await Promise.all(
    formData.getAll("attachments").filter((entry): entry is File => entry instanceof File).map(attachmentFromFile),
  );

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  const bucket = getDemoDiscussions(projectRef);

  if (mode === "thread") {
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();

    if (!title || !body) {
      return NextResponse.json({ error: "Thread title and body are required." }, { status: 400 });
    }

    const threadId = `thread-${Date.now()}`;
    bucket.threads = [
      {
        id: threadId,
        title,
        body,
        authorName,
        authorInitials,
        authorTone,
        createdAt: new Date().toISOString(),
        starred: false,
        reactions: [],
        attachments,
      },
      ...bucket.threads,
    ];
    const discussions = setDemoDiscussions(projectRef, bucket);
    return NextResponse.json({ ok: true, threadId, discussions }, { status: 201 });
  }

  if (mode === "reply") {
    const threadId = String(formData.get("threadId") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    if (!threadId || !content) {
      return NextResponse.json({ error: "Thread id and reply content are required." }, { status: 400 });
    }

    const replyId = `reply-${Date.now()}`;
    bucket.replies = [
      {
        id: replyId,
        threadId,
        content,
        authorName,
        authorInitials,
        authorTone,
        createdAt: new Date().toISOString(),
        reactions: [],
        attachments,
      },
      ...bucket.replies,
    ];
    const discussions = setDemoDiscussions(projectRef, bucket);
    return NextResponse.json({ ok: true, replyId, discussions }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid discussion write mode." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as DiscussionsPatchBody;
  const projectRef = body.projectRef?.trim() ?? "";

  if (!projectRef) {
    return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
  }

  const bucket = getDemoDiscussions(projectRef);

  if (body.action === "toggle-star") {
    const threadId = body.threadId?.trim() ?? "";

    bucket.threads = bucket.threads.map((thread) =>
      thread.id === threadId ? { ...thread, starred: Boolean(body.starred) } : thread,
    );
    return NextResponse.json({ ok: true, discussions: setDemoDiscussions(projectRef, bucket) });
  }

  if (body.action === "add-reaction") {
    const targetId = body.targetId?.trim() ?? "";
    const emoji = body.emoji?.trim() ?? "";

    if (!body.targetType || !targetId || !emoji) {
      return NextResponse.json({ error: "Reaction update is missing required fields." }, { status: 400 });
    }

    const applyReaction = <T extends { id: string; reactions: Array<{ emoji: string; count: number }> }>(items: T[]) =>
      items.map((item) => {
        if (item.id !== targetId) return item;
        const existing = item.reactions.find((reaction) => reaction.emoji === emoji);
        return {
          ...item,
          reactions: existing
            ? item.reactions.map((reaction) => reaction.emoji === emoji ? { ...reaction, count: reaction.count + 1 } : reaction)
            : [...item.reactions, { emoji, count: 1 }],
        };
      });

    if (body.targetType === "thread") {
      bucket.threads = applyReaction(bucket.threads);
    } else {
      bucket.replies = applyReaction(bucket.replies);
    }

    return NextResponse.json({ ok: true, discussions: setDemoDiscussions(projectRef, bucket) });
  }

  return NextResponse.json({ error: "Invalid discussion update action." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as DiscussionsDeleteBody;
  const projectRef = body.projectRef?.trim() ?? "";
  const targetId = body.targetId?.trim() ?? "";

  if (!projectRef || !body.targetType || !targetId) {
    return NextResponse.json({ error: "Discussion delete request is missing required fields." }, { status: 400 });
  }

  const bucket = getDemoDiscussions(projectRef);

  if (body.targetType === "thread") {
    bucket.threads = bucket.threads.filter((thread) => thread.id !== targetId);
    bucket.replies = bucket.replies.filter((reply) => reply.threadId !== targetId);
  } else {
    bucket.replies = bucket.replies.filter((reply) => reply.id !== targetId);
  }

  return NextResponse.json({ ok: true, discussions: setDemoDiscussions(projectRef, bucket) });
}
