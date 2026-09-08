import { getDbPool } from "@/lib/db";
import type { PoolClient } from "pg";

import type {
  ChatMeetingCandidate,
  ChatMeetingMessage,
  ChatMeetingParticipant,
  ChatMeetingSignalEnvelope,
  ChatMeetingSignalType,
  ChatMeetingSession,
} from "@/data/chats";
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

type WorkspaceMemberRow = {
  user_id: string;
  display_name: string;
  role_label: string;
  avatar_tone: string | null;
};

type MeetingRow = {
  id: string;
  title: string;
  status: "active" | "ended";
  started_at: string;
  ended_at: string | null;
};

type MeetingParticipantRow = {
  user_id: string;
  display_name: string;
  initials: string;
  tone: ChatMeetingParticipant["tone"];
  role_label: string;
  is_host: boolean;
  mic_enabled: boolean;
  camera_enabled: boolean;
  speaker_enabled: boolean;
  screen_sharing: boolean;
  joined_at: string;
  removed_by_host?: boolean;
};

type MeetingMessageRow = {
  id: string;
  sender_user_id: string;
  sender_name: string;
  sender_initials: string;
  sender_tone: ChatMeetingMessage["tone"];
  content: string;
  created_at: string;
};

type MeetingSignalRow = {
  id: string;
  meeting_id: string;
  sender_user_id: string;
  target_user_id: string;
  signal_type: ChatMeetingSignalType;
  payload: Record<string, unknown>;
  created_at: string;
};

type MeetingMemberSeed = {
  id: string;
  name: string;
  initials: string;
  tone: ChatMeetingParticipant["tone"];
  role: string;
};

type Queryable = {
  query: PoolClient["query"];
};

const SUPPORTED_AVATAR_TONES = new Set<ChatMeetingParticipant["tone"]>(["sand", "rose", "olive", "slate", "peach"]);

function normalizeTone(value: string | null | undefined): ChatMeetingParticipant["tone"] {
  return value && SUPPORTED_AVATAR_TONES.has(value as ChatMeetingParticipant["tone"])
    ? (value as ChatMeetingParticipant["tone"])
    : "sand";
}

function buildInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildSessionKey(userId: string, contactId: string) {
  return [userId, contactId].sort().join(":");
}

async function listWorkspaceMembers(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceMemberRow>(
    `
      select
        members.user_id::text as user_id,
        coalesce(
          nullif(trim(profiles.full_name), ''),
          nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
          split_part(coalesce(profiles.email, ''), '@', 1),
          'Team Member'
        ) as display_name,
        coalesce(
          nullif(trim(profiles.job_title), ''),
          case members.role
            when 'owner' then 'Owner'
            when 'member' then 'Member'
            else initcap(members.role)
          end,
          'Team Member'
        ) as role_label,
        profiles.avatar_tone
      from public.workspace_members members
      left join public.user_profiles profiles
        on profiles.id = members.user_id
      where members.workspace_id = $1
        and members.status in ('active', 'pending')
      order by members.created_at asc
    `,
    [workspaceId],
  );

  return result.rows.map((row) => ({
    id: row.user_id,
    name: row.display_name.trim() || "Team Member",
    initials: buildInitials(row.display_name),
    tone: normalizeTone(row.avatar_tone),
    role: row.role_label.trim() || "Team Member",
  })) satisfies MeetingMemberSeed[];
}

async function getMeetingContext(user: AuthLikeUser, contactId: string) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const members = await listWorkspaceMembers(workspaceId);
  const membersById = new Map(members.map((member) => [member.id, member]));
  const currentUser = membersById.get(user.id);
  const primaryContact = membersById.get(contactId);

  if (!currentUser) {
    throw new Error("Current workspace member profile not found.");
  }

  if (!primaryContact) {
    throw new Error("Meeting contact is not part of this workspace.");
  }

  return {
    workspaceId,
    sessionKey: buildSessionKey(user.id, contactId),
    members,
    membersById,
    currentUser,
    primaryContact,
  };
}

async function upsertMeetingParticipant(
  queryable: Queryable,
  meetingId: string,
  participant: MeetingMemberSeed,
  options?: {
    isHost?: boolean;
  },
) {
  await queryable.query(
    `
      insert into public.app_chat_meeting_participants (
        meeting_id,
        user_id,
        display_name,
        initials,
        tone,
        role_label,
        is_host,
        left_at
      )
      values ($1, $2::uuid, $3, $4, $5, $6, $7, null)
      on conflict (meeting_id, user_id)
      do update set
        display_name = excluded.display_name,
        initials = excluded.initials,
        tone = excluded.tone,
        role_label = excluded.role_label,
        is_host = public.app_chat_meeting_participants.is_host or excluded.is_host,
        left_at = null,
        removed_by_host = false
    `,
    [
      meetingId,
      participant.id,
      participant.name,
      participant.initials,
      participant.tone,
      participant.role,
      Boolean(options?.isHost),
    ],
  );
}

async function getMeetingRow(workspaceId: string, sessionKey: string) {
  const pool = getDbPool();
  const result = await pool.query<MeetingRow>(
    `
      select
        id,
        title,
        status,
        started_at::text,
        ended_at::text
      from public.app_chat_meetings
      where workspace_id = $1
        and session_key = $2
        and ended_at is null
      order by updated_at desc
      limit 1
    `,
    [workspaceId, sessionKey],
  );

  return result.rows[0] ?? null;
}

async function ensureMeetingSession(user: AuthLikeUser, contactId: string) {
  const context = await getMeetingContext(user, contactId);
  const existingMeeting = await getMeetingRow(context.workspaceId, context.sessionKey);

  if (existingMeeting) {
    const currentParticipantState = await getMeetingParticipantState(existingMeeting.id, user.id);

    if (currentParticipantState?.removed_by_host) {
      throw new Error("You were removed from this meeting.");
    }

    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query("begin");
      await upsertMeetingParticipant(client, existingMeeting.id, context.currentUser);
      await upsertMeetingParticipant(client, existingMeeting.id, context.primaryContact);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return {
      ...context,
      meetingId: existingMeeting.id,
    };
  }

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await client.query<{ id: string }>(
      `
        insert into public.app_chat_meetings (
          workspace_id,
          session_key,
          created_by_user_id,
          primary_contact_id,
          title
        )
        values ($1, $2, $3, $4, $5)
        returning id
      `,
      [
        context.workspaceId,
        context.sessionKey,
        user.id,
        contactId,
        `${context.currentUser.name} + ${context.primaryContact.name}`,
      ],
    );

    const meetingId = result.rows[0]?.id;

    if (!meetingId) {
      throw new Error("Failed to create the meeting session.");
    }

    await upsertMeetingParticipant(client, meetingId, context.currentUser, { isHost: true });
    await upsertMeetingParticipant(client, meetingId, context.primaryContact);
    await client.query("commit");

    return {
      ...context,
      meetingId,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function listMeetingParticipants(meetingId: string) {
  const pool = getDbPool();
  const result = await pool.query<MeetingParticipantRow>(
    `
      select
        user_id::text as user_id,
        display_name,
        initials,
        tone,
        role_label,
        is_host,
        mic_enabled,
        camera_enabled,
        speaker_enabled,
        screen_sharing,
        joined_at::text,
        removed_by_host
      from public.app_chat_meeting_participants
      where meeting_id = $1
        and left_at is null
      order by is_host desc, joined_at asc
    `,
    [meetingId],
  );

  return result.rows;
}

type MeetingParticipantStateRow = {
  user_id: string;
  is_host: boolean;
  left_at: string | null;
  removed_by_host: boolean;
};

async function getMeetingParticipantState(meetingId: string, userId: string) {
  const pool = getDbPool();
  const result = await pool.query<MeetingParticipantStateRow>(
    `
      select
        user_id::text as user_id,
        is_host,
        left_at::text,
        removed_by_host
      from public.app_chat_meeting_participants
      where meeting_id = $1
        and user_id = $2::uuid
      limit 1
    `,
    [meetingId, userId],
  );

  return result.rows[0] ?? null;
}

async function requireMeetingHost(meetingId: string, userId: string) {
  const participantState = await getMeetingParticipantState(meetingId, userId);

  if (!participantState || participantState.left_at || !participantState.is_host) {
    throw new Error("Only the meeting host can perform this action.");
  }

  return participantState;
}

async function listMeetingMessages(meetingId: string) {
  const pool = getDbPool();
  const result = await pool.query<MeetingMessageRow>(
    `
      select
        id,
        sender_user_id::text as sender_user_id,
        sender_name,
        sender_initials,
        sender_tone,
        content,
        created_at::text
      from public.app_chat_meeting_messages
      where meeting_id = $1
      order by created_at asc
    `,
    [meetingId],
  );

  return result.rows;
}

function serializeMeetingSession(
  userId: string,
  meeting: MeetingRow,
  participants: MeetingParticipantRow[],
  messages: MeetingMessageRow[],
  availableParticipants: ChatMeetingCandidate[],
): ChatMeetingSession {
  return {
    id: meeting.id,
    title: meeting.title,
    status: meeting.status,
    startedAt: meeting.started_at,
    endedAt: meeting.ended_at,
    participants: participants.map((participant) => ({
      id: participant.user_id,
      name: participant.display_name,
      initials: participant.initials,
      tone: participant.tone,
      role: participant.role_label,
      isHost: participant.is_host,
      isCurrentUser: participant.user_id === userId,
      micEnabled: participant.mic_enabled,
      cameraEnabled: participant.camera_enabled,
      speakerEnabled: participant.speaker_enabled,
      screenSharing: participant.screen_sharing,
      joinedAt: participant.joined_at,
    })),
    availableParticipants,
    messages: messages.map((message) => ({
      id: message.id,
      senderId: message.sender_user_id,
      sender: message.sender_name,
      initials: message.sender_initials,
      tone: message.sender_tone,
      content: message.content,
      time: formatTimeLabel(new Date(message.created_at)),
      isMe: message.sender_user_id === userId,
    })),
  };
}

async function loadMeetingState(user: AuthLikeUser, contactId: string) {
  const context = await ensureMeetingSession(user, contactId);
  const meeting = await getMeetingRow(context.workspaceId, context.sessionKey);

  if (!meeting) {
    throw new Error("Meeting session could not be found.");
  }

  const [participants, messages] = await Promise.all([
    listMeetingParticipants(meeting.id),
    listMeetingMessages(meeting.id),
  ]);

  const participantIds = new Set(participants.map((participant) => participant.user_id));
  const availableParticipants = context.members
    .filter((member) => member.id !== user.id && !participantIds.has(member.id))
    .map((member) => ({
      id: member.id,
      name: member.name,
      initials: member.initials,
      tone: member.tone,
      role: member.role,
    })) satisfies ChatMeetingCandidate[];

  return serializeMeetingSession(user.id, meeting, participants, messages, availableParticipants);
}

async function resolveExistingMeetingTransportContext(user: AuthLikeUser, contactId: string) {
  const context = await getMeetingContext(user, contactId);
  const meeting = await getMeetingRow(context.workspaceId, context.sessionKey);

  if (!meeting) {
    throw new Error("Meeting session could not be found.");
  }

  const participantState = await getMeetingParticipantState(meeting.id, user.id);

  if (participantState?.removed_by_host) {
    throw new Error("You were removed from this meeting.");
  }

  if (!participantState || participantState.left_at) {
    throw new Error("You must be in the meeting to use call transport.");
  }

  return {
    ...context,
    meetingId: meeting.id,
  };
}

export async function getMeetingSession(user: AuthLikeUser, contactId: string) {
  return loadMeetingState(user, contactId);
}

export async function addMeetingParticipant(user: AuthLikeUser, contactId: string, participantId: string) {
  const context = await ensureMeetingSession(user, contactId);
  const participant = context.membersById.get(participantId);

  if (!participant) {
    throw new Error("Selected participant is not part of this workspace.");
  }

  await requireMeetingHost(context.meetingId, user.id);

  const pool = getDbPool();
  await upsertMeetingParticipant(pool, context.meetingId, participant);

  return loadMeetingState(user, contactId);
}

export async function updateOwnMeetingControls(
  user: AuthLikeUser,
  contactId: string,
  patch: {
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    speakerEnabled?: boolean;
    screenSharing?: boolean;
  },
) {
  const context = await ensureMeetingSession(user, contactId);
  const pool = getDbPool();

  await pool.query(
    `
      update public.app_chat_meeting_participants
      set
        mic_enabled = coalesce($3, mic_enabled),
        camera_enabled = coalesce($4, camera_enabled),
        speaker_enabled = coalesce($5, speaker_enabled),
        screen_sharing = coalesce($6, screen_sharing),
        left_at = null
      where meeting_id = $1 and user_id = $2
    `,
    [
      context.meetingId,
      user.id,
      typeof patch.micEnabled === "boolean" ? patch.micEnabled : null,
      typeof patch.cameraEnabled === "boolean" ? patch.cameraEnabled : null,
      typeof patch.speakerEnabled === "boolean" ? patch.speakerEnabled : null,
      typeof patch.screenSharing === "boolean" ? patch.screenSharing : null,
    ],
  );

  return loadMeetingState(user, contactId);
}

export async function updateMeetingParticipant(
  user: AuthLikeUser,
  contactId: string,
  participantId: string,
  patch: {
    micEnabled?: boolean;
    kicked?: boolean;
  },
) {
  const context = await ensureMeetingSession(user, contactId);
  const pool = getDbPool();

  await requireMeetingHost(context.meetingId, user.id);

  if (participantId === user.id && patch.kicked) {
    throw new Error("The meeting host cannot remove themselves from the call.");
  }

  await pool.query(
    `
      update public.app_chat_meeting_participants
      set
        mic_enabled = coalesce($3, mic_enabled),
        left_at = case
          when $4 = true then now()
          else left_at
        end,
        removed_by_host = case
          when $4 = true then true
          else removed_by_host
        end
      where meeting_id = $1 and user_id = $2::uuid
    `,
    [
      context.meetingId,
      participantId,
      typeof patch.micEnabled === "boolean" ? patch.micEnabled : null,
      patch.kicked === true,
    ],
  );

  return loadMeetingState(user, contactId);
}

export async function appendMeetingMessage(user: AuthLikeUser, contactId: string, content: string) {
  const context = await ensureMeetingSession(user, contactId);
  const pool = getDbPool();
  const message = content.trim();
  const participantState = await getMeetingParticipantState(context.meetingId, user.id);

  if (!message) {
    throw new Error("Meeting message content is required.");
  }

  if (!participantState || participantState.left_at) {
    throw new Error("You must be in the meeting to send room messages.");
  }

  await pool.query(
    `
      insert into public.app_chat_meeting_messages (
        meeting_id,
        sender_user_id,
        sender_name,
        sender_initials,
        sender_tone,
        content
      )
      values ($1, $2, $3, $4, $5, $6)
    `,
    [
      context.meetingId,
      user.id,
      context.currentUser.name,
      context.currentUser.initials,
      context.currentUser.tone,
      message,
    ],
  );

  await pool.query(
    `
      update public.app_chat_meetings
      set updated_at = now()
      where id = $1
    `,
    [context.meetingId],
  );

  return loadMeetingState(user, contactId);
}

export async function endMeetingSession(user: AuthLikeUser, contactId: string) {
  const context = await ensureMeetingSession(user, contactId);
  const pool = getDbPool();

  await requireMeetingHost(context.meetingId, user.id);

  await pool.query(
    `
      update public.app_chat_meetings
      set
        status = 'ended',
        ended_at = now(),
        updated_at = now()
      where id = $1
    `,
    [context.meetingId],
  );

  await pool.query(
    `
      update public.app_chat_meeting_participants
      set
        left_at = now(),
        screen_sharing = false
      where meeting_id = $1 and left_at is null
    `,
    [context.meetingId],
  );
}

export async function leaveMeetingSession(user: AuthLikeUser, contactId: string) {
  const context = await ensureMeetingSession(user, contactId);
  const pool = getDbPool();
  const participantState = await getMeetingParticipantState(context.meetingId, user.id);

  if (participantState?.is_host) {
    throw new Error("Meeting host must end the call for everyone.");
  }

  await pool.query(
    `
      update public.app_chat_meeting_participants
      set
        left_at = now(),
        screen_sharing = false,
        camera_enabled = false,
        speaker_enabled = false
      where meeting_id = $1
        and user_id = $2::uuid
        and left_at is null
    `,
    [context.meetingId, user.id],
  );

  const activeParticipantsResult = await pool.query<{ count: string }>(
    `
      select count(*)::text as count
      from public.app_chat_meeting_participants
      where meeting_id = $1
        and left_at is null
    `,
    [context.meetingId],
  );
  const activeParticipants = Number.parseInt(activeParticipantsResult.rows[0]?.count ?? "0", 10);

  if (!Number.isFinite(activeParticipants) || activeParticipants <= 0) {
    await pool.query(
      `
        update public.app_chat_meetings
        set
          status = 'ended',
          ended_at = now(),
          updated_at = now()
        where id = $1
      `,
      [context.meetingId],
    );
  }
}

function normalizeSignalPayload(payload: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

async function pruneStaleMeetingSignals() {
  const pool = getDbPool();
  await pool.query(
    `
      delete from public.app_chat_meeting_signals
      where created_at < now() - interval '1 day'
    `,
  );
}

export async function sendMeetingSignal(
  user: AuthLikeUser,
  contactId: string,
  input: {
    targetUserId: string;
    type: ChatMeetingSignalType;
    payload: Record<string, unknown>;
  },
) {
  const context = await resolveExistingMeetingTransportContext(user, contactId);
  const targetParticipantState = await getMeetingParticipantState(context.meetingId, input.targetUserId);

  if (!targetParticipantState || targetParticipantState.left_at || targetParticipantState.removed_by_host) {
    throw new Error("Meeting participant could not be found.");
  }

  const pool = getDbPool();
  await pool.query(
    `
      insert into public.app_chat_meeting_signals (
        meeting_id,
        sender_user_id,
        target_user_id,
        signal_type,
        payload
      )
      values ($1, $2::uuid, $3::uuid, $4, $5::jsonb)
    `,
    [
      context.meetingId,
      user.id,
      input.targetUserId,
      input.type,
      JSON.stringify(normalizeSignalPayload(input.payload)),
    ],
  );

  await pruneStaleMeetingSignals();
}

export async function listMeetingSignals(
  user: AuthLikeUser,
  contactId: string,
  options?: {
    after?: string | null;
  },
) {
  const context = await resolveExistingMeetingTransportContext(user, contactId);
  const pool = getDbPool();
  const result = await pool.query<MeetingSignalRow>(
    `
      select
        id::text,
        meeting_id::text,
        sender_user_id::text,
        target_user_id::text,
        signal_type,
        payload,
        created_at::text
      from public.app_chat_meeting_signals
      where meeting_id = $1
        and target_user_id = $2::uuid
        and (
          $3::timestamptz is null
          or created_at > $3::timestamptz
        )
        and created_at >= now() - interval '1 hour'
      order by created_at asc
      limit 250
    `,
    [
      context.meetingId,
      user.id,
      options?.after?.trim() ? options.after.trim() : null,
    ],
  );

  return result.rows.map((row) => ({
    id: row.id,
    meetingId: row.meeting_id,
    senderUserId: row.sender_user_id,
    targetUserId: row.target_user_id,
    type: row.signal_type,
    payload: normalizeSignalPayload(row.payload),
    createdAt: row.created_at,
  })) satisfies ChatMeetingSignalEnvelope[];
}
