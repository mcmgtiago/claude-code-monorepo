import { getDbPool } from "@/lib/db";
import { type DiscussionReaction, type TeamMemberRecord } from "@/data/project-board";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

type AuthLikeUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  } | null;
};

export type DiscussionAttachmentRecord = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  kind: "image" | "file";
};

export type DiscussionThreadRecord = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorInitials: string;
  authorTone: TeamMemberRecord["avatarTone"];
  createdAt: string;
  starred: boolean;
  reactions: DiscussionReaction[];
  attachments: DiscussionAttachmentRecord[];
};

export type DiscussionReplyRecord = {
  id: string;
  threadId: string;
  content: string;
  authorName: string;
  authorInitials: string;
  authorTone: TeamMemberRecord["avatarTone"];
  createdAt: string;
  reactions: DiscussionReaction[];
  attachments: DiscussionAttachmentRecord[];
};

export type ProjectDiscussionsPayload = {
  threads: DiscussionThreadRecord[];
  replies: DiscussionReplyRecord[];
};

type DiscussionThreadRow = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  author_initials: string;
  author_tone: TeamMemberRecord["avatarTone"];
  created_at: string;
  starred: boolean;
  reactions: DiscussionReaction[] | null;
};

type DiscussionReplyRow = {
  id: string;
  thread_id: string;
  content: string;
  author_name: string;
  author_initials: string;
  author_tone: TeamMemberRecord["avatarTone"];
  created_at: string;
  reactions: DiscussionReaction[] | null;
};

type DiscussionAttachmentRow = {
  id: string;
  thread_id: string | null;
  reply_id: string | null;
  kind: "image" | "file";
  name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
};

type DiscussionAuthorInput = {
  name?: string | null;
  initials?: string | null;
  tone?: TeamMemberRecord["avatarTone"] | null;
};

type CreateDiscussionThreadInput = {
  projectRef: string;
  title: string;
  body: string;
  author: DiscussionAuthorInput;
  attachments: File[];
};

type CreateDiscussionReplyInput = {
  projectRef: string;
  threadId: string;
  content: string;
  author: DiscussionAuthorInput;
  attachments: File[];
};

const DISCUSSION_STORAGE_BUCKET = "project-discussions";
export const DISCUSSION_MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

let ensuredDiscussionBucket: Promise<void> | null = null;

function createDiscussionId(prefix: "thread" | "reply" | "attachment") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseReactions(value: DiscussionReaction[] | null | undefined) {
  if (!Array.isArray(value)) {
    return [] as DiscussionReaction[];
  }

  return value.flatMap((reaction) => {
    if (
      !reaction
      || typeof reaction.emoji !== "string"
      || typeof reaction.count !== "number"
      || !Number.isFinite(reaction.count)
    ) {
      return [];
    }

    return [{
      emoji: reaction.emoji,
      count: Math.max(0, Math.round(reaction.count)),
    }];
  });
}

function buildAuthor(user: AuthLikeUser, author: DiscussionAuthorInput) {
  const fullName = author.name?.trim()
    || user.user_metadata?.full_name?.trim()
    || [user.user_metadata?.first_name?.trim(), user.user_metadata?.last_name?.trim()].filter(Boolean).join(" ").trim()
    || user.email?.split("@")[0]?.trim()
    || "You";
  const initials = author.initials?.trim()
    || fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
    || "YO";

  return {
    name: fullName,
    initials,
    tone: author.tone ?? "sand",
  } as const;
}

function isImageFile(file: Pick<File, "name" | "type">) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
}

function sanitizeFileName(name: string) {
  const trimmed = name.trim().toLowerCase();
  const dotIndex = trimmed.lastIndexOf(".");
  const extension = dotIndex >= 0 ? trimmed.slice(dotIndex) : "";
  const baseName = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;

  return `${baseName.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "file"}${extension}`;
}

function publicAttachmentUrl(storagePath: string) {
  const admin = createSupabaseAdminClient();
  return admin.storage.from(DISCUSSION_STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function ensureDiscussionStorageBucket() {
  if (!ensuredDiscussionBucket) {
    ensuredDiscussionBucket = (async () => {
      const admin = createSupabaseAdminClient();
      const { data: buckets, error } = await admin.storage.listBuckets();

      if (error) {
        throw error;
      }

      if (!buckets.some((bucket) => bucket.name === DISCUSSION_STORAGE_BUCKET)) {
        const { error: createError } = await admin.storage.createBucket(DISCUSSION_STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: `${Math.round(DISCUSSION_MAX_ATTACHMENT_BYTES / (1024 * 1024))}MB`,
        });

        if (createError && !String(createError.message).toLowerCase().includes("already exists")) {
          throw createError;
        }
      }
    })();
  }

  return ensuredDiscussionBucket;
}

async function uploadDiscussionAttachments(input: {
  workspaceId: string;
  projectRef: string;
  threadId?: string;
  replyId?: string;
  files: File[];
}) {
  if (input.files.length === 0) {
    return {
      records: [] as Array<{
        id: string;
        threadId: string | null;
        replyId: string | null;
        kind: "image" | "file";
        name: string;
        mimeType: string;
        sizeBytes: number;
        storagePath: string;
      }>,
      uploadedPaths: [] as string[],
    };
  }

  await ensureDiscussionStorageBucket();
  const admin = createSupabaseAdminClient();
  const uploadedPaths: string[] = [];
  const entityId = input.replyId ?? input.threadId ?? "entry";

  const records = [] as Array<{
    id: string;
    threadId: string | null;
    replyId: string | null;
    kind: "image" | "file";
    name: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
  }>;

  for (const file of input.files) {
    if (file.size > DISCUSSION_MAX_ATTACHMENT_BYTES) {
      throw new Error(`${file.name} exceeds the 50 MB attachment limit.`);
    }

    const attachmentId = createDiscussionId("attachment");
    const storagePath = `${input.workspaceId}/${input.projectRef}/${entityId}/${attachmentId}-${sanitizeFileName(file.name)}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(DISCUSSION_STORAGE_BUCKET).upload(storagePath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    uploadedPaths.push(storagePath);
    records.push({
      id: attachmentId,
      threadId: input.threadId ?? null,
      replyId: input.replyId ?? null,
      kind: isImageFile(file) ? "image" : "file",
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      storagePath,
    });
  }

  return { records, uploadedPaths };
}

async function removeDiscussionStorageFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  await ensureDiscussionStorageBucket();
  const admin = createSupabaseAdminClient();
  await admin.storage.from(DISCUSSION_STORAGE_BUCKET).remove(storagePaths);
}

async function fetchProjectDiscussions(workspaceId: string, projectRef: string): Promise<ProjectDiscussionsPayload> {
  const pool = getDbPool();
  const [threadResult, replyResult, attachmentResult] = await Promise.all([
    pool.query<DiscussionThreadRow>(
      `
        select
          id,
          title,
          body,
          author_name,
          author_initials,
          author_tone,
          created_at::text,
          starred,
          reactions
        from public.app_discussion_threads
        where workspace_id = $1
          and project_ref = $2
        order by starred desc, created_at desc
      `,
      [workspaceId, projectRef],
    ),
    pool.query<DiscussionReplyRow>(
      `
        select
          id,
          thread_id,
          content,
          author_name,
          author_initials,
          author_tone,
          created_at::text,
          reactions
        from public.app_discussion_replies
        where workspace_id = $1
          and project_ref = $2
        order by created_at asc
      `,
      [workspaceId, projectRef],
    ),
    pool.query<DiscussionAttachmentRow>(
      `
        select
          id,
          thread_id,
          reply_id,
          kind,
          name,
          mime_type,
          size_bytes,
          storage_path
        from public.app_discussion_attachments
        where workspace_id = $1
          and project_ref = $2
        order by created_at asc
      `,
      [workspaceId, projectRef],
    ),
  ]);

  const attachmentsByThreadId = new Map<string, DiscussionAttachmentRecord[]>();
  const attachmentsByReplyId = new Map<string, DiscussionAttachmentRecord[]>();

  attachmentResult.rows.forEach((row) => {
    const attachment: DiscussionAttachmentRecord = {
      id: row.id,
      name: row.name,
      mimeType: row.mime_type,
      sizeBytes: Number(row.size_bytes),
      dataUrl: publicAttachmentUrl(row.storage_path),
      kind: row.kind,
    };

    if (row.thread_id) {
      attachmentsByThreadId.set(row.thread_id, [...(attachmentsByThreadId.get(row.thread_id) ?? []), attachment]);
    }

    if (row.reply_id) {
      attachmentsByReplyId.set(row.reply_id, [...(attachmentsByReplyId.get(row.reply_id) ?? []), attachment]);
    }
  });

  return {
    threads: threadResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      authorName: row.author_name,
      authorInitials: row.author_initials,
      authorTone: row.author_tone,
      createdAt: row.created_at,
      starred: row.starred,
      reactions: parseReactions(row.reactions),
      attachments: attachmentsByThreadId.get(row.id) ?? [],
    })),
    replies: replyResult.rows.map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      content: row.content,
      authorName: row.author_name,
      authorInitials: row.author_initials,
      authorTone: row.author_tone,
      createdAt: row.created_at,
      reactions: parseReactions(row.reactions),
      attachments: attachmentsByReplyId.get(row.id) ?? [],
    })),
  };
}

export async function getProjectDiscussions(user: AuthLikeUser, projectRef: string) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  return fetchProjectDiscussions(workspaceId, projectRef);
}

export async function createDiscussionThread(user: AuthLikeUser, input: CreateDiscussionThreadInput) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const author = buildAuthor(user, input.author);
  const threadId = createDiscussionId("thread");
  let uploadedPaths: string[] = [];
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      `
        insert into public.app_discussion_threads (
          id,
          workspace_id,
          project_ref,
          author_user_id,
          author_name,
          author_initials,
          author_tone,
          title,
          body
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        threadId,
        workspaceId,
        input.projectRef,
        user.id,
        author.name,
        author.initials,
        author.tone,
        input.title.trim(),
        input.body.trim(),
      ],
    );

    const uploadResult = await uploadDiscussionAttachments({
      workspaceId,
      projectRef: input.projectRef,
      threadId,
      files: input.attachments,
    });

    uploadedPaths = uploadResult.uploadedPaths;

    for (const attachment of uploadResult.records) {
      await client.query(
        `
          insert into public.app_discussion_attachments (
            id,
            workspace_id,
            project_ref,
            thread_id,
            kind,
            name,
            mime_type,
            size_bytes,
            storage_path
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          attachment.id,
          workspaceId,
          input.projectRef,
          attachment.threadId,
          attachment.kind,
          attachment.name,
          attachment.mimeType,
          attachment.sizeBytes,
          attachment.storagePath,
        ],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    await removeDiscussionStorageFiles(uploadedPaths);
    throw error;
  } finally {
    client.release();
  }

  return {
    threadId,
    discussions: await fetchProjectDiscussions(workspaceId, input.projectRef),
  };
}

export async function createDiscussionReply(user: AuthLikeUser, input: CreateDiscussionReplyInput) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const author = buildAuthor(user, input.author);
  const replyId = createDiscussionId("reply");
  let uploadedPaths: string[] = [];
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const threadResult = await client.query<{ id: string }>(
      `
        select id
        from public.app_discussion_threads
        where id = $1
          and workspace_id = $2
          and project_ref = $3
        limit 1
      `,
      [input.threadId, workspaceId, input.projectRef],
    );

    if (!threadResult.rows[0]) {
      throw new Error("Discussion thread not found.");
    }

    await client.query(
      `
        insert into public.app_discussion_replies (
          id,
          thread_id,
          workspace_id,
          project_ref,
          author_user_id,
          author_name,
          author_initials,
          author_tone,
          content
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        replyId,
        input.threadId,
        workspaceId,
        input.projectRef,
        user.id,
        author.name,
        author.initials,
        author.tone,
        input.content.trim(),
      ],
    );

    const uploadResult = await uploadDiscussionAttachments({
      workspaceId,
      projectRef: input.projectRef,
      replyId,
      files: input.attachments,
    });

    uploadedPaths = uploadResult.uploadedPaths;

    for (const attachment of uploadResult.records) {
      await client.query(
        `
          insert into public.app_discussion_attachments (
            id,
            workspace_id,
            project_ref,
            reply_id,
            kind,
            name,
            mime_type,
            size_bytes,
            storage_path
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          attachment.id,
          workspaceId,
          input.projectRef,
          attachment.replyId,
          attachment.kind,
          attachment.name,
          attachment.mimeType,
          attachment.sizeBytes,
          attachment.storagePath,
        ],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    await removeDiscussionStorageFiles(uploadedPaths);
    throw error;
  } finally {
    client.release();
  }

  return {
    replyId,
    discussions: await fetchProjectDiscussions(workspaceId, input.projectRef),
  };
}

export async function toggleDiscussionThreadStar(user: AuthLikeUser, projectRef: string, threadId: string, starred: boolean) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const pool = getDbPool();
  await pool.query(
    `
      update public.app_discussion_threads
      set starred = $4
      where id = $1
        and workspace_id = $2
        and project_ref = $3
    `,
    [threadId, workspaceId, projectRef, starred],
  );

  return fetchProjectDiscussions(workspaceId, projectRef);
}

export async function addDiscussionReaction(
  user: AuthLikeUser,
  input: {
    projectRef: string;
    targetType: "thread" | "reply";
    targetId: string;
    emoji: string;
  },
) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const emoji = input.emoji.trim();

  if (!emoji) {
    throw new Error("Reaction emoji is required.");
  }

  const tableName = input.targetType === "thread" ? "public.app_discussion_threads" : "public.app_discussion_replies";
  const pool = getDbPool();
  const result = await pool.query<{ reactions: DiscussionReaction[] | null }>(
    `
      select reactions
      from ${tableName}
      where id = $1
        and workspace_id = $2
        and project_ref = $3
      limit 1
    `,
    [input.targetId, workspaceId, input.projectRef],
  );

  const currentReactions = parseReactions(result.rows[0]?.reactions);
  const existingReaction = currentReactions.find((reaction) => reaction.emoji === emoji);
  const nextReactions = existingReaction
    ? currentReactions.map((reaction) =>
      reaction.emoji === emoji ? { ...reaction, count: reaction.count + 1 } : reaction,
    )
    : [...currentReactions, { emoji, count: 1 }];

  await pool.query(
    `
      update ${tableName}
      set reactions = $4::jsonb
      where id = $1
        and workspace_id = $2
        and project_ref = $3
    `,
    [input.targetId, workspaceId, input.projectRef, JSON.stringify(nextReactions)],
  );

  return fetchProjectDiscussions(workspaceId, input.projectRef);
}

export async function deleteDiscussionEntry(
  user: AuthLikeUser,
  input: {
    projectRef: string;
    targetType: "thread" | "reply";
    targetId: string;
  },
) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const pool = getDbPool();
  const attachmentResult = await pool.query<{ storage_path: string }>(
    input.targetType === "thread"
      ? `
          select storage_path
          from public.app_discussion_attachments
          where workspace_id = $1
            and project_ref = $2
            and thread_id = $3
        `
      : `
          select storage_path
          from public.app_discussion_attachments
          where workspace_id = $1
            and project_ref = $2
            and reply_id = $3
        `,
    [workspaceId, input.projectRef, input.targetId],
  );

  await pool.query(
    input.targetType === "thread"
      ? `
          delete from public.app_discussion_threads
          where id = $1
            and workspace_id = $2
            and project_ref = $3
        `
      : `
          delete from public.app_discussion_replies
          where id = $1
            and workspace_id = $2
            and project_ref = $3
        `,
    [input.targetId, workspaceId, input.projectRef],
  );

  await removeDiscussionStorageFiles(attachmentResult.rows.map((row) => row.storage_path));

  return fetchProjectDiscussions(workspaceId, input.projectRef);
}

export async function deleteProjectDiscussionsForWorkspace(workspaceId: string, projectRef: string) {
  const pool = getDbPool();
  const attachmentResult = await pool.query<{ storage_path: string }>(
    `
      delete from public.app_discussion_attachments
      where workspace_id = $1
        and project_ref = $2
      returning storage_path
    `,
    [workspaceId, projectRef],
  );

  await pool.query(
    `
      delete from public.app_discussion_threads
      where workspace_id = $1
        and project_ref = $2
    `,
    [workspaceId, projectRef],
  );

  await removeDiscussionStorageFiles(attachmentResult.rows.map((row) => row.storage_path));
}
