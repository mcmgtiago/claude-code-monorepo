import { attachClientPortalAccessToUser, ensureClientPortalMembersForWorkspace } from "@/lib/client-portal-db";
import { getDbPool, ensureUserProfile } from "@/lib/db";
import type { PoolClient } from "pg";
import {
  type ChatAttachment,
  type ChatContact,
  type ChatMessage,
  type ChatPreferences,
  type ChatThread,
  type MessagesPayload,
  buildStructuredChatMessageContent,
  defaultChatPreferences,
  getChatMessagePreviewText,
  summarizeChatAttachments,
  parseStructuredChatMessageContent,
} from "@/data/chats";
import { getProjectWorkspaceBundle, getProjectWorkspaceBundleForWorkspace } from "@/lib/projects-db";
import {
  normalizeWorkspacePeopleMembers,
  normalizeWorkspaceTeams,
  type WorkspacePeopleMember,
  type WorkspaceTeamRecord,
} from "@/lib/people";
import { ensureUserProfileAndSelectedWorkspace, resolveWorkspaceSelectionState } from "@/lib/workspace-selection";

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

type AppChatThreadRow = {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_email: string | null;
  contact_initials: string;
  contact_tone: ChatContact["tone"];
  contact_role: string;
  contact_status: ChatContact["status"];
  last_message: string;
  last_message_time: string;
  unread_count: number;
  call_ended: boolean;
  pinned: boolean;
  muted: boolean;
  restricted: boolean;
  blocked: boolean;
  archived: boolean;
  hidden: boolean;
  reported: boolean;
  typing_active: boolean;
  contact_last_seen_at: string | null;
  contact_status_active: boolean;
  date_label: string;
  updated_at: string;
};

type AppChatMessageRow = {
  id: string;
  thread_id: string;
  content: string;
  sender: ChatMessage["sender"];
  time_label: string;
  reactions: string[] | null;
  type: ChatMessage["type"];
  sent_at: string;
  edited_at: string | null;
  shared_key: string | null;
};

type AppChatPreferencesRow = {
  active_status: boolean;
  notification_sound: boolean;
  do_not_disturb: boolean;
};

type WorkspaceContactRow = {
  contact_id: string;
  contact_name: string;
  contact_email: string | null;
  contact_role: string;
  contact_tone: string | null;
  contact_last_seen_at: string | null;
  contact_active_status: boolean | null;
};

type WorkspaceGroupParticipantRow = {
  user_id: string;
  display_name: string;
};

type WorkspaceActiveMemberRow = {
  user_id: string;
  email: string | null;
  display_name: string;
};

type ClientPortalMembershipRow = {
  workspace_id: string;
  client_id: string;
};

type AppChatGroupRow = {
  id: string;
  name: string;
  initials: string;
  tone: ChatContact["tone"];
  kind: "team" | "custom";
  team_id: string | null;
  member_count: number;
};

type ContactSeed = {
  contactId: string;
  contactName: string;
  contactInitials: string;
  contactTone: ChatContact["tone"];
  contactRole: string;
  contactStatus: ChatContact["status"];
  lastSeenAt: string | null;
};

const DEFAULT_PREFERENCES: ChatPreferences = defaultChatPreferences;
const SUPPORTED_AVATAR_TONES = new Set<ChatContact["tone"]>(["sand", "rose", "olive", "slate", "peach"]);
const TYPING_TTL_SECONDS = 12;
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const WORKSPACE_TEAM_CHAT_PREFIX = "workspace-team:";
const MANAGED_GROUP_CHAT_PREFIX = "group:";
const MAX_CHAT_ATTACHMENTS = 4;
const MAX_CHAT_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;

type Queryable = {
  query: PoolClient["query"];
};

function createSharedMessageKey() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function normalizeChatAttachments(attachments: ChatAttachment[] | undefined) {
  const nextAttachments = attachments ?? [];

  if (nextAttachments.length > MAX_CHAT_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_CHAT_ATTACHMENTS} files per message.`);
  }

  return nextAttachments.map((attachment, index) => {
    const sizeBytes = Number.isFinite(attachment.sizeBytes) ? attachment.sizeBytes : 0;

    if (sizeBytes > MAX_CHAT_ATTACHMENT_SIZE_BYTES) {
      throw new Error(`${attachment.name || `Attachment ${index + 1}`} exceeds the 2 MB attachment limit.`);
    }

    if (!attachment.dataUrl?.startsWith("data:")) {
      throw new Error("Invalid attachment payload.");
    }

    return ({
    id: attachment.id?.trim() || `attachment-${Date.now()}-${index}`,
    name: attachment.name?.trim() || `Attachment ${index + 1}`,
    mimeType: attachment.mimeType?.trim() || "application/octet-stream",
    sizeBytes,
    dataUrl: attachment.dataUrl,
    kind: attachment.kind === "image" ? "image" as const : "file" as const,
    } satisfies ChatAttachment);
  });
}

function buildStoredAttachmentContent(text: string, attachments: ChatAttachment[]) {
  return buildStructuredChatMessageContent({
    text,
    attachments: normalizeChatAttachments(attachments),
  });
}

function getStoredMessageText(type: ChatMessage["type"], content: string) {
  if (type !== "attachment") {
    return content;
  }

  return parseStructuredChatMessageContent(content)?.text?.trim() ?? "";
}

function buildPreviewLabel(type: ChatMessage["type"], content: string, sender: ChatMessage["sender"]) {
  const preview = getChatMessagePreviewText(type, content);

  if (!preview) {
    return "No messages yet";
  }

  return sender === "me" ? `You: ${preview}` : preview;
}

function normalizeAvatarTone(value: string | null | undefined): ChatContact["tone"] {
  return value && SUPPORTED_AVATAR_TONES.has(value as ChatContact["tone"])
    ? (value as ChatContact["tone"])
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

function computeContactStatus(lastSeenAt: string | null, activeStatus = true): ChatContact["status"] {
  if (!activeStatus) {
    return "neutral";
  }

  if (!lastSeenAt) {
    return "neutral";
  }

  const time = new Date(lastSeenAt).getTime();

  if (Number.isNaN(time)) {
    return "neutral";
  }

  return Date.now() - time <= ONLINE_WINDOW_MS ? "online" : "neutral";
}

function createWorkspaceTeamChatId(workspaceId: string) {
  return `${WORKSPACE_TEAM_CHAT_PREFIX}${workspaceId}`;
}

function isWorkspaceTeamChatId(contactId: string) {
  return contactId.startsWith(WORKSPACE_TEAM_CHAT_PREFIX);
}

function getWorkspaceIdFromTeamChatId(contactId: string) {
  return isWorkspaceTeamChatId(contactId) ? contactId.slice(WORKSPACE_TEAM_CHAT_PREFIX.length) : null;
}

function createManagedGroupContactId(groupId: string) {
  return `${MANAGED_GROUP_CHAT_PREFIX}${groupId}`;
}

function isManagedGroupChatId(contactId: string) {
  return contactId.startsWith(MANAGED_GROUP_CHAT_PREFIX);
}

function getGroupIdFromContactId(contactId: string) {
  return isManagedGroupChatId(contactId) ? contactId.slice(MANAGED_GROUP_CHAT_PREFIX.length) : null;
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatThreadDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date).replace(",", " ·");
}

function mapPreferences(row: AppChatPreferencesRow | undefined): ChatPreferences {
  if (!row) {
    return DEFAULT_PREFERENCES;
  }

  return {
    activeStatus: row.active_status,
    notifSound: row.notification_sound,
    dnd: row.do_not_disturb,
  };
}

async function touchUserPresence(userId: string) {
  const pool = getDbPool();
  await pool.query(
    `
      update public.user_profiles
      set last_seen_at = now()
      where id = $1
    `,
    [userId],
  );
}

async function getChatPreferencesRow(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<AppChatPreferencesRow>(
    `
      select active_status, notification_sound, do_not_disturb
      from public.app_chat_preferences
      where user_id = $1
      limit 1
    `,
    [userId],
  );

  return result.rows[0];
}

async function touchUserPresenceIfVisible(userId: string) {
  const preferences = await getChatPreferencesRow(userId);

  if (!preferences || preferences.active_status) {
    await touchUserPresence(userId);
  }
}

async function listClientPortalMembershipRowsForUser(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<ClientPortalMembershipRow>(
    `
      select distinct
        workspace_id::text as workspace_id,
        client_id
      from public.app_client_portal_members
      where linked_user_id = $1::uuid
        and portal_enabled = true
      order by workspace_id asc, client_id asc
    `,
    [userId],
  );

  return result.rows;
}

function normalizeLookupValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

async function listClientVisibleWorkspaceMemberIds(workspaceId: string, clientId: string) {
  const [bundle, activeMembers] = await Promise.all([
    getProjectWorkspaceBundleForWorkspace(workspaceId),
    listActiveWorkspaceMembers(workspaceId),
  ]);
  const relevantProjects = bundle.projects.filter(
    (project) => !project.archived && !project.hidden && project.clientId === clientId,
  );

  if (relevantProjects.length === 0) {
    return [] as string[];
  }

  const activeMemberIds = new Set(activeMembers.map((member) => member.userId));
  const activeMembersByEmail = new Map(
    activeMembers
      .filter((member) => member.email)
      .map((member) => [member.email, member.userId] as const),
  );
  const activeMembersByName = new Map<string, string[]>();

  for (const member of activeMembers) {
    const key = normalizeLookupValue(member.displayName);

    if (!key) {
      continue;
    }

    const existingIds = activeMembersByName.get(key) ?? [];
    existingIds.push(member.userId);
    activeMembersByName.set(key, existingIds);
  }

  const workspaceMembersByEmail = new Map(
    bundle.teamMembers
      .filter((member) => member.email)
      .map((member) => [member.email, member.id] as const),
  );
  const workspaceMembersByNameAndTeam = new Map<string, string[]>();
  const workspaceMembersByName = new Map<string, string[]>();

  for (const member of bundle.teamMembers) {
    const nameKey = normalizeLookupValue(member.name);

    if (!nameKey) {
      continue;
    }

    const baseIds = workspaceMembersByName.get(nameKey) ?? [];
    baseIds.push(member.id);
    workspaceMembersByName.set(nameKey, baseIds);

    const teamKey = `${nameKey}::${member.teamId?.trim() || ""}`;
    const teamIds = workspaceMembersByNameAndTeam.get(teamKey) ?? [];
    teamIds.push(member.id);
    workspaceMembersByNameAndTeam.set(teamKey, teamIds);
  }

  const allowedIds = new Set<string>();

  for (const project of relevantProjects) {
    for (const member of project.members ?? []) {
      const memberEmail = normalizeLookupValue(member.email);

      if (memberEmail) {
        const workspaceMemberId = workspaceMembersByEmail.get(memberEmail) ?? activeMembersByEmail.get(memberEmail);

        if (workspaceMemberId && activeMemberIds.has(workspaceMemberId)) {
          allowedIds.add(workspaceMemberId);
          continue;
        }
      }

      const memberNameKey = normalizeLookupValue(member.name);

      if (!memberNameKey) {
        continue;
      }

      const candidateIds = [
        ...(workspaceMembersByNameAndTeam.get(`${memberNameKey}::${member.teamId?.trim() || ""}`) ?? []),
        ...(workspaceMembersByName.get(memberNameKey) ?? []),
        ...(activeMembersByName.get(memberNameKey) ?? []),
      ];

      for (const candidateId of candidateIds) {
        if (activeMemberIds.has(candidateId)) {
          allowedIds.add(candidateId);
        }
      }
    }
  }

  return Array.from(allowedIds);
}

async function ensureChatPreferences(user: AuthLikeUser) {
  await ensureUserProfile(user);
  await attachClientPortalAccessToUser(user);
  const pool = getDbPool();

  await pool.query(
    `
      insert into public.app_chat_preferences (user_id)
      values ($1)
      on conflict (user_id) do nothing
    `,
    [user.id],
  );
}

async function listWorkspaceContacts(userId: string) {
  const pool = getDbPool();
  const selectedWorkspaceId = (await resolveWorkspaceSelectionState(userId)).selectedWorkspaceId;
  const workspaceIds = selectedWorkspaceId ? [selectedWorkspaceId] : [];
  const clientMemberships = await listClientPortalMembershipRowsForUser(userId);
  const contactMap = new Map<string, ContactSeed>();

  function appendRow(row: WorkspaceContactRow, fallbackRole: string) {
    const contactId = row.contact_id?.trim();

    if (!contactId || contactId === userId || contactMap.has(contactId)) {
      return;
    }

    contactMap.set(contactId, {
      contactId,
      contactName: row.contact_name.trim() || "Team Member",
      contactInitials: buildInitials(row.contact_name),
      contactTone: normalizeAvatarTone(row.contact_tone),
      contactRole: row.contact_role.trim() || fallbackRole,
      contactStatus: computeContactStatus(row.contact_last_seen_at, row.contact_active_status ?? true),
      lastSeenAt: row.contact_last_seen_at,
    });
  }

  if (workspaceIds.length > 0) {
    for (const workspaceId of workspaceIds) {
      await ensureClientPortalMembersForWorkspace(workspaceId);
    }

    const workspaceContactsResult = await pool.query<WorkspaceContactRow>(
      `
        select distinct on (members.user_id)
          members.user_id::text as contact_id,
          coalesce(
            nullif(trim(profiles.full_name), ''),
            nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
            split_part(coalesce(profiles.email, ''), '@', 1),
            'Team Member'
          ) as contact_name,
          profiles.email as contact_email,
          coalesce(
            nullif(trim(profiles.job_title), ''),
            case members.role
              when 'owner' then 'Owner'
              when 'member' then 'Member'
              else initcap(members.role)
            end,
            'Team Member'
          ) as contact_role,
          profiles.avatar_tone as contact_tone,
          profiles.last_seen_at::text as contact_last_seen_at,
          preferences.active_status as contact_active_status
        from public.workspace_members members
        left join public.user_profiles profiles
          on profiles.id = members.user_id
        left join public.app_chat_preferences preferences
          on preferences.user_id = members.user_id
        where members.workspace_id = any($2::uuid[])
          and members.user_id <> $1
          and members.status = 'active'
        order by members.user_id, members.created_at asc
      `,
      [userId, workspaceIds],
    );

    workspaceContactsResult.rows.forEach((row) => appendRow(row, "Team Member"));

    const clientContactsResult = await pool.query<WorkspaceContactRow>(
      `
        select distinct on (portal.linked_user_id)
          portal.linked_user_id::text as contact_id,
          coalesce(
            nullif(trim(profiles.full_name), ''),
            nullif(trim(portal.member_name), ''),
            split_part(lower(portal.email), '@', 1),
            'Client Member'
          ) as contact_name,
          coalesce(profiles.email, portal.email) as contact_email,
          concat('Client · ', clients.company) as contact_role,
          profiles.avatar_tone as contact_tone,
          profiles.last_seen_at::text as contact_last_seen_at,
          preferences.active_status as contact_active_status
        from public.app_client_portal_members portal
        join public.app_clients clients
          on clients.workspace_id = portal.workspace_id
         and clients.id = portal.client_id
        left join public.user_profiles profiles
          on profiles.id = portal.linked_user_id
        left join public.app_chat_preferences preferences
          on preferences.user_id = portal.linked_user_id
        where portal.workspace_id = any($2::uuid[])
          and portal.portal_enabled = true
          and portal.can_message = true
          and portal.linked_user_id is not null
          and portal.linked_user_id <> $1::uuid
        order by portal.linked_user_id, portal.updated_at desc
      `,
      [userId, workspaceIds],
    );

    clientContactsResult.rows.forEach((row) => appendRow(row, "Client Member"));
  }

  for (const membership of clientMemberships) {
    const allowedWorkspaceMemberIds = await listClientVisibleWorkspaceMemberIds(
      membership.workspace_id,
      membership.client_id,
    );

    if (allowedWorkspaceMemberIds.length > 0) {
      const workspaceContactsResult = await pool.query<WorkspaceContactRow>(
        `
          select distinct on (members.user_id)
            members.user_id::text as contact_id,
            coalesce(
              nullif(trim(profiles.full_name), ''),
              nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
              split_part(coalesce(profiles.email, ''), '@', 1),
              'Team Member'
            ) as contact_name,
            profiles.email as contact_email,
            coalesce(
              nullif(trim(profiles.job_title), ''),
              case members.role
                when 'owner' then 'Owner'
                when 'member' then 'Member'
                else initcap(members.role)
              end,
              'Team Member'
            ) as contact_role,
            profiles.avatar_tone as contact_tone,
            profiles.last_seen_at::text as contact_last_seen_at,
            preferences.active_status as contact_active_status
          from public.workspace_members members
          left join public.user_profiles profiles
            on profiles.id = members.user_id
          left join public.app_chat_preferences preferences
            on preferences.user_id = members.user_id
          where members.workspace_id = $2::uuid
            and members.user_id = any($3::uuid[])
            and members.user_id <> $1
            and members.status = 'active'
          order by members.user_id, members.created_at asc
        `,
        [userId, membership.workspace_id, allowedWorkspaceMemberIds],
      );

      workspaceContactsResult.rows.forEach((row) => appendRow(row, "Team Member"));
    }

    const peerClientContactsResult = await pool.query<WorkspaceContactRow>(
      `
        select distinct on (portal.linked_user_id)
          portal.linked_user_id::text as contact_id,
          coalesce(
            nullif(trim(profiles.full_name), ''),
            nullif(trim(portal.member_name), ''),
            split_part(lower(portal.email), '@', 1),
            'Client Member'
          ) as contact_name,
          coalesce(profiles.email, portal.email) as contact_email,
          concat('Client · ', clients.company) as contact_role,
          profiles.avatar_tone as contact_tone,
          profiles.last_seen_at::text as contact_last_seen_at,
          preferences.active_status as contact_active_status
        from public.app_client_portal_members portal
        join public.app_clients clients
          on clients.workspace_id = portal.workspace_id
         and clients.id = portal.client_id
        left join public.user_profiles profiles
          on profiles.id = portal.linked_user_id
        left join public.app_chat_preferences preferences
          on preferences.user_id = portal.linked_user_id
        where portal.workspace_id = $2::uuid
          and portal.client_id = $3
          and portal.portal_enabled = true
          and portal.can_message = true
          and portal.linked_user_id is not null
          and portal.linked_user_id <> $1::uuid
        order by portal.linked_user_id, portal.updated_at desc
      `,
      [userId, membership.workspace_id, membership.client_id],
    );

    peerClientContactsResult.rows.forEach((row) => appendRow(row, "Client Member"));
  }

  return Array.from(contactMap.values());
}

async function listWorkspaceGroupParticipants(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceGroupParticipantRow>(
    `
      select
        members.user_id::text as user_id,
        coalesce(
          nullif(trim(profiles.full_name), ''),
          nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
          split_part(coalesce(profiles.email, ''), '@', 1),
          'Team Member'
        ) as display_name
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
    userId: row.user_id,
    displayName: row.display_name.trim() || "Team Member",
  }));
}

async function listActiveWorkspaceMembers(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceActiveMemberRow>(
    `
      select
        members.user_id::text as user_id,
        profiles.email,
        coalesce(
          nullif(trim(profiles.full_name), ''),
          nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
          split_part(coalesce(profiles.email, ''), '@', 1),
          'Team Member'
        ) as display_name
      from public.workspace_members members
      left join public.user_profiles profiles
        on profiles.id = members.user_id
      where members.workspace_id = $1
        and members.status = 'active'
      order by members.created_at asc
    `,
    [workspaceId],
  );

  return result.rows.map((row) => ({
    userId: row.user_id,
    email: row.email?.trim().toLowerCase() || "",
    displayName: row.display_name.trim() || "Team Member",
  }));
}

async function listManagedGroupsForUser(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<AppChatGroupRow>(
    `
      select
        groups.id,
        groups.name,
        groups.initials,
        groups.tone,
        groups.kind,
        groups.team_id,
        count(members.user_id)::int as member_count
      from public.app_chat_group_members memberships
      join public.app_chat_groups groups
        on groups.id = memberships.group_id
      left join public.app_chat_group_members members
        on members.group_id = groups.id
      where memberships.user_id = $1
      group by groups.id, groups.name, groups.initials, groups.tone, groups.kind, groups.team_id
      order by groups.kind asc, groups.name asc
    `,
    [userId],
  );

  return result.rows;
}

async function getManagedGroupRow(groupId: string, queryable: Queryable = getDbPool()) {
  const result = await queryable.query<AppChatGroupRow>(
    `
      select
        groups.id,
        groups.name,
        groups.initials,
        groups.tone,
        groups.kind,
        groups.team_id,
        count(members.user_id)::int as member_count
      from public.app_chat_groups groups
      left join public.app_chat_group_members members
        on members.group_id = groups.id
      where groups.id = $1::uuid
      group by groups.id, groups.name, groups.initials, groups.tone, groups.kind, groups.team_id
      limit 1
    `,
    [groupId],
  );

  return result.rows[0] ?? null;
}

async function listManagedGroupMemberIds(groupId: string, queryable: Queryable = getDbPool()) {
  const result = await queryable.query<{ user_id: string }>(
    `
      select user_id::text as user_id
      from public.app_chat_group_members
      where group_id = $1::uuid
      order by created_at asc
    `,
    [groupId],
  );

  return result.rows.map((row) => row.user_id);
}

async function syncManagedGroupMembership(
  groupId: string,
  memberIds: string[],
  queryable: Queryable = getDbPool(),
) {
  const normalizedMemberIds = dedupeUserIds(memberIds).filter(isUuid);

  await queryable.query(
    `
      delete from public.app_chat_group_members
      where group_id = $1::uuid
        and user_id::text <> all($2::text[])
    `,
    [groupId, normalizedMemberIds.length > 0 ? normalizedMemberIds : [""]],
  );

  if (normalizedMemberIds.length > 0) {
    await queryable.query(
      `
        insert into public.app_chat_group_members (group_id, user_id)
        select $1::uuid, member_id::uuid
        from unnest($2::text[]) as member_id
        on conflict (group_id, user_id) do nothing
      `,
      [groupId, normalizedMemberIds],
    );
  }
}

async function ensureManagedGroupThreads(groupId: string, queryable: Queryable = getDbPool()) {
  const group = await getManagedGroupRow(groupId, queryable);

  if (!group) {
    return;
  }

  const memberIds = await listManagedGroupMemberIds(groupId, queryable);
  const contactSeed = buildManagedGroupContactSeed(group);

  for (const memberId of memberIds) {
    await ensureThreadRow(memberId, contactSeed, "", queryable);
  }

  await queryable.query(
    `
      delete from public.app_chat_threads
      where contact_id = $1
        and user_id::text <> all($2::text[])
    `,
    [createManagedGroupContactId(groupId), memberIds.length > 0 ? memberIds : [""]],
  );
}

async function syncWorkspaceTeamGroups(user: AuthLikeUser) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const bundle = await getProjectWorkspaceBundle(user);
  const workspaceTeams = normalizeWorkspaceTeams(bundle.workspaceTeams);
  const configuredMembers = normalizeWorkspacePeopleMembers(bundle.teamMembers, workspaceTeams);
  const activeMembers = await listActiveWorkspaceMembers(workspaceId);
  const configuredMembersById = new Map(configuredMembers.map((member) => [member.id, member]));
  const configuredMembersByEmail = new Map(
    configuredMembers.map((member) => [member.email.trim().toLowerCase(), member]),
  );
  const fallbackTeamId = workspaceTeams[0]?.id ?? "team-general";
  const teamMembers: WorkspacePeopleMember[] = activeMembers.map((member) => {
    const configuredMember = configuredMembersById.get(member.userId)
      ?? configuredMembersByEmail.get(member.email);

    return {
      id: member.userId,
      name: configuredMember?.name ?? member.displayName,
      email: member.email,
      avatarInitials: configuredMember?.avatarInitials ?? buildInitials(member.displayName),
      avatarTone: configuredMember?.avatarTone ?? "sand",
      avatarImage: configuredMember?.avatarImage,
      dateAdded: configuredMember?.dateAdded ?? "January 1, 2024",
      lastActive: configuredMember?.lastActive ?? "Updated just now",
      teamId: configuredMember?.teamId ?? fallbackTeamId,
      role: configuredMember?.role ?? "User",
    };
  });
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const existingGroupsResult = await client.query<{ id: string; team_id: string | null }>(
      `
        select id::text as id, team_id
        from public.app_chat_groups
        where workspace_id = $1
          and kind = 'team'
      `,
      [workspaceId],
    );

    const teamIds = workspaceTeams.map((team) => team.id);
    const removedGroupIds = existingGroupsResult.rows
      .filter((row) => !row.team_id || !teamIds.includes(row.team_id))
      .map((row) => row.id);

    if (teamIds.length > 0) {
      await client.query(
        `
          delete from public.app_chat_groups
          where workspace_id = $1
            and kind = 'team'
            and coalesce(team_id, '') <> all($2::text[])
        `,
        [workspaceId, teamIds],
      );
    } else {
      await client.query(
        `
          delete from public.app_chat_groups
          where workspace_id = $1
            and kind = 'team'
        `,
        [workspaceId],
      );
    }

    if (removedGroupIds.length > 0) {
      await client.query(
        `
          delete from public.app_chat_threads
          where contact_id = any($1::text[])
        `,
        [removedGroupIds.map((groupId) => createManagedGroupContactId(groupId))],
      );
    }

    const groupsByTeamId = new Map<string, string>(
      existingGroupsResult.rows
        .filter((row): row is { id: string; team_id: string } => Boolean(row.team_id))
        .map((row) => [row.team_id, row.id]),
    );

    for (const [index, team] of workspaceTeams.entries()) {
      const participantIds = dedupeUserIds(
        teamMembers
          .filter((member) => member.teamId === team.id && isUuid(member.id))
          .map((member) => member.id),
      );

      const upsertResult = await client.query<{ id: string }>(
        `
          insert into public.app_chat_groups (
            workspace_id,
            name,
            initials,
            tone,
            kind,
            team_id,
            created_by_user_id
          )
          values ($1, $2, $3, $4, 'team', $5, $6)
          on conflict (workspace_id, kind, team_id)
          do update set
            name = excluded.name,
            initials = excluded.initials,
            tone = excluded.tone
          returning id::text
        `,
        [workspaceId, team.name, buildInitials(team.name), pickGroupTone(index), team.id, user.id],
      );

      const groupId = upsertResult.rows[0]?.id ?? groupsByTeamId.get(team.id);

      if (!groupId) {
        continue;
      }

      await syncManagedGroupMembership(groupId, participantIds, client);
      await ensureManagedGroupThreads(groupId, client);
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

function buildWorkspaceTeamContactSeed(workspaceId: string, participantCount: number): ContactSeed {
  return {
    contactId: createWorkspaceTeamChatId(workspaceId),
    contactName: "Team Chat",
    contactInitials: "TC",
    contactTone: "olive",
    contactRole: `${participantCount} member${participantCount === 1 ? "" : "s"}`,
    contactStatus: "neutral",
    lastSeenAt: null,
  };
}

function buildManagedGroupContactSeed(group: AppChatGroupRow): ContactSeed {
  const memberLabel = `${group.member_count} member${group.member_count === 1 ? "" : "s"}`;
  const role = group.kind === "team" ? `${memberLabel} · Team` : memberLabel;

  return {
    contactId: createManagedGroupContactId(group.id),
    contactName: group.name,
    contactInitials: group.initials,
    contactTone: group.tone,
    contactRole: role,
    contactStatus: "neutral",
    lastSeenAt: null,
  };
}

function dedupeUserIds(userIds: string[]) {
  return Array.from(new Set(userIds.map((value) => value.trim()).filter(Boolean)));
}

function pickGroupTone(index = 0): ChatContact["tone"] {
  const tones: ChatContact["tone"][] = ["olive", "sand", "slate", "rose", "peach"];
  return tones[index % tones.length] ?? "olive";
}

async function ensureWorkspaceChatThreads(user: AuthLikeUser) {
  await attachClientPortalAccessToUser(user);
  const pool = getDbPool();
  const selection = await resolveWorkspaceSelectionState(user.id);
  const workspaceId = selection.selectedWorkspaceId;
  const contacts = await listWorkspaceContacts(user.id);

  if (contacts.length === 0) {
    if (!workspaceId) {
      return;
    }
  }

  for (const contact of contacts) {
    await pool.query(
      `
        insert into public.app_chat_threads (
          user_id,
          contact_id,
          contact_name,
          contact_initials,
          contact_tone,
          contact_role,
          contact_status,
          last_message,
          last_message_time,
          unread_count,
          call_ended,
          date_label
        )
        values ($1, $2, $3, $4, $5, $6, $7, 'No messages yet', '', 0, false, '')
        on conflict (user_id, contact_id)
        do update set
          contact_name = excluded.contact_name,
          contact_initials = excluded.contact_initials,
          contact_tone = excluded.contact_tone,
          contact_role = excluded.contact_role,
          contact_status = excluded.contact_status
      `,
      [
        user.id,
        contact.contactId,
        contact.contactName,
        contact.contactInitials,
        contact.contactTone,
        contact.contactRole,
        contact.contactStatus,
      ],
    );
  }

  if (!workspaceId) {
    return;
  }

  const groupParticipants = await listWorkspaceGroupParticipants(workspaceId);

  if (groupParticipants.length > 1) {
    const teamSeed = buildWorkspaceTeamContactSeed(workspaceId, groupParticipants.length);
    await ensureThreadRow(user.id, teamSeed);
  }

  await syncWorkspaceTeamGroups(user);

  const managedGroups = await listManagedGroupsForUser(user.id);

  for (const group of managedGroups) {
    await ensureThreadRow(user.id, buildManagedGroupContactSeed(group));
  }
}

async function listThreadRows(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<AppChatThreadRow>(
    `
      select
        threads.id,
        threads.contact_id,
        threads.contact_name,
        profiles.email as contact_email,
        threads.contact_initials,
        threads.contact_tone,
        threads.contact_role,
        threads.contact_status,
        threads.last_message,
        threads.last_message_time,
        threads.unread_count,
        threads.call_ended,
        threads.pinned,
        threads.muted,
        threads.restricted,
        threads.blocked,
        threads.archived,
        threads.hidden,
        threads.date_label,
        threads.updated_at::text,
        profiles.last_seen_at::text as contact_last_seen_at,
        coalesce(preferences.active_status, true) as contact_status_active,
        exists(
          select 1
          from public.app_chat_reports reports
          where reports.reporter_user_id = $1
            and reports.reported_contact_id = threads.contact_id
        ) as reported,
        exists(
          select 1
          from public.app_chat_typing_states typing
          where typing.user_id::text = threads.contact_id
            and typing.contact_id = $1::text
            and typing.is_typing = true
            and typing.updated_at >= now() - ($2::text || ' seconds')::interval
        ) as typing_active
      from public.app_chat_threads threads
      left join public.user_profiles profiles
        on profiles.id::text = threads.contact_id
      left join public.app_chat_preferences preferences
        on preferences.user_id::text = threads.contact_id
      where threads.user_id = $1
      order by threads.hidden asc, threads.blocked asc, threads.archived asc, threads.pinned desc, threads.updated_at desc
    `,
    [userId, String(TYPING_TTL_SECONDS)],
  );

  return result.rows;
}

async function listMessageRows(threadIds: string[]) {
  if (threadIds.length === 0) {
    return [] as AppChatMessageRow[];
  }

  const pool = getDbPool();
  const result = await pool.query<AppChatMessageRow>(
    `
      select
        id,
        thread_id,
        content,
        sender,
        time_label,
        reactions,
        type,
        sent_at::text,
        edited_at::text,
        shared_key
      from public.app_chat_messages
      where thread_id = any($1::uuid[])
      order by sent_at asc
    `,
    [threadIds],
  );

  return result.rows;
}

async function getContactSeedForUsers(ownerUserId: string, contactUserId: string) {
  const contacts = await listWorkspaceContacts(ownerUserId);
  return contacts.find((contact) => contact.contactId === contactUserId) ?? null;
}

async function ensureDirectRecipientUserId(userId: string, contactId: string) {
  if (!isUuid(contactId)) {
    return null;
  }

  const contacts = await listWorkspaceContacts(userId);
  return contacts.some((contact) => contact.contactId === contactId) ? contactId : null;
}

async function ensureThreadRow(
  userId: string,
  contact: ContactSeed,
  dateLabel = "",
  queryable: Queryable = getDbPool(),
) {
  const result = await queryable.query<{ id: string }>(
    `
      insert into public.app_chat_threads (
        user_id,
        contact_id,
        contact_name,
        contact_initials,
        contact_tone,
        contact_role,
        contact_status,
        last_message,
        last_message_time,
        unread_count,
        call_ended,
        date_label
      )
      values ($1, $2, $3, $4, $5, $6, $7, 'No messages yet', '', 0, false, $8)
      on conflict (user_id, contact_id)
      do update set
        contact_name = excluded.contact_name,
        contact_initials = excluded.contact_initials,
        contact_tone = excluded.contact_tone,
        contact_role = excluded.contact_role,
        contact_status = excluded.contact_status
      returning id
    `,
    [
      userId,
      contact.contactId,
      contact.contactName,
      contact.contactInitials,
      contact.contactTone,
      contact.contactRole,
      contact.contactStatus,
      dateLabel,
    ],
  );

  return result.rows[0]?.id ?? null;
}

async function syncThreadPreviewById(queryable: Queryable, threadId: string) {
  const latestResult = await queryable.query<{
    content: string;
    sender: ChatMessage["sender"];
    time_label: string;
    type: ChatMessage["type"];
  }>(
    `
      select content, sender, time_label, type
      from public.app_chat_messages
      where thread_id = $1
      order by sent_at desc
      limit 1
    `,
    [threadId],
  );

  const latest = latestResult.rows[0];
  const lastMessage = latest ? buildPreviewLabel(latest.type, latest.content, latest.sender) : "No messages yet";
  const lastMessageTime = latest?.time_label ?? "";
  const callEnded = latest?.type === "missed-call";

  await queryable.query(
    `
      update public.app_chat_threads
      set
        last_message = $2,
        last_message_time = $3,
        call_ended = $4,
        updated_at = now()
      where id = $1
    `,
    [threadId, lastMessage, lastMessageTime, callEnded],
  );
}

async function setChatReported(userId: string, contactId: string, reported: boolean) {
  const pool = getDbPool();

  if (reported) {
    await pool.query(
      `
        insert into public.app_chat_reports (reporter_user_id, reported_contact_id)
        values ($1, $2)
        on conflict (reporter_user_id, reported_contact_id) do nothing
      `,
      [userId, contactId],
    );
    return;
  }

  await pool.query(
    `
      delete from public.app_chat_reports
      where reporter_user_id = $1 and reported_contact_id = $2
    `,
    [userId, contactId],
  );
}

export async function setChatTypingState(userId: string, contactId: string, isTyping: boolean) {
  if (isWorkspaceTeamChatId(contactId) || isManagedGroupChatId(contactId)) {
    return;
  }

  const preferences = await getChatPreferencesRow(userId);
  const typingAllowed = Boolean(preferences?.active_status ?? true);
  await touchUserPresenceIfVisible(userId);
  const pool = getDbPool();

  await pool.query(
    `
      insert into public.app_chat_typing_states (user_id, contact_id, is_typing)
      values ($1, $2, $3)
      on conflict (user_id, contact_id)
      do update set
        is_typing = excluded.is_typing,
        updated_at = now()
    `,
    [userId, contactId, typingAllowed ? isTyping : false],
  );
}

export async function getMessagesPayload(user: AuthLikeUser): Promise<MessagesPayload> {
  await ensureChatPreferences(user);
  await touchUserPresenceIfVisible(user.id);
  await ensureWorkspaceChatThreads(user);

  const pool = getDbPool();
  const [threadRows, preferencesResult] = await Promise.all([
    listThreadRows(user.id),
    pool.query<AppChatPreferencesRow>(
      `
        select active_status, notification_sound, do_not_disturb
        from public.app_chat_preferences
        where user_id = $1
        limit 1
      `,
      [user.id],
    ),
  ]);
  const messageRows = await listMessageRows(threadRows.map((row) => row.id));

  const contacts: ChatContact[] = threadRows.map((row) => ({
    id: row.contact_id,
    name: row.contact_name,
    email: row.contact_email ?? undefined,
    initials: row.contact_initials,
    tone: row.contact_tone,
    role: row.contact_role,
    isGroup: isWorkspaceTeamChatId(row.contact_id) || isManagedGroupChatId(row.contact_id),
    groupKind: isWorkspaceTeamChatId(row.contact_id)
      ? "workspace"
      : isManagedGroupChatId(row.contact_id)
        ? row.contact_role.toLowerCase().includes("team")
          ? "team"
          : "custom"
        : undefined,
    memberCount: isWorkspaceTeamChatId(row.contact_id) || isManagedGroupChatId(row.contact_id)
      ? Number.parseInt(row.contact_role, 10) || undefined
      : undefined,
    status: computeContactStatus(row.contact_last_seen_at, row.contact_status_active),
    lastMessage: row.last_message,
    time: row.last_message_time,
    unread: row.unread_count,
    callEnded: row.call_ended,
    pinned: row.pinned,
    muted: row.muted,
    restricted: row.restricted,
    blocked: row.blocked,
    archived: row.archived,
    hidden: row.hidden,
    reported: row.reported,
    typing: row.typing_active,
    lastSeenAt: row.contact_last_seen_at,
  }));

  const threads = Object.fromEntries(
    threadRows.map((row) => [
      row.contact_id,
      {
        contactId: row.contact_id,
        date: row.date_label,
        messages: messageRows
          .filter((message) => message.thread_id === row.id)
          .map((message) => ({
            id: message.id,
            content: getStoredMessageText(message.type, message.content),
            sender: message.sender,
            time: message.time_label,
            reactions: message.reactions ?? [],
            type: message.type,
            edited: Boolean(message.edited_at),
            attachments: message.type === "attachment"
              ? parseStructuredChatMessageContent(message.content)?.attachments ?? []
              : [],
          })),
      } satisfies ChatThread,
    ]),
  ) satisfies Record<string, ChatThread>;

  return {
    contacts,
    threads,
    preferences: mapPreferences(preferencesResult.rows[0]),
  };
}

export async function updateChatPreferences(userId: string, preferences: ChatPreferences) {
  const pool = getDbPool();
  const result = await pool.query<AppChatPreferencesRow>(
    `
      insert into public.app_chat_preferences (
        user_id,
        active_status,
        notification_sound,
        do_not_disturb
      )
      values ($1, $2, $3, $4)
      on conflict (user_id)
      do update set
        active_status = excluded.active_status,
        notification_sound = excluded.notification_sound,
        do_not_disturb = excluded.do_not_disturb
      returning active_status, notification_sound, do_not_disturb
    `,
    [userId, preferences.activeStatus, preferences.notifSound, preferences.dnd],
  );

  if (preferences.activeStatus) {
    await touchUserPresence(userId);
  } else {
    await pool.query(
      `
        update public.app_chat_typing_states
        set
          is_typing = false,
          updated_at = now()
        where user_id = $1
      `,
      [userId],
    );
  }

  return mapPreferences(result.rows[0]);
}

type ThreadPatch = {
  pinned?: boolean;
  muted?: boolean;
  restricted?: boolean;
  blocked?: boolean;
  archived?: boolean;
  hidden?: boolean;
  unread?: number;
  contactStatus?: ChatContact["status"];
  reported?: boolean;
};

export async function updateChatThread(userId: string, contactId: string, patch: ThreadPatch) {
  await touchUserPresenceIfVisible(userId);
  if ((isWorkspaceTeamChatId(contactId) || isManagedGroupChatId(contactId)) && typeof patch.reported === "boolean") {
    throw new Error("Group chats cannot be reported.");
  }
  if ((isWorkspaceTeamChatId(contactId) || isManagedGroupChatId(contactId)) && typeof patch.blocked === "boolean") {
    throw new Error("Group chats cannot be blocked.");
  }
  const pool = getDbPool();
  await pool.query(
    `
      update public.app_chat_threads
      set
        pinned = coalesce($3, pinned),
        muted = coalesce($4, muted),
        restricted = coalesce($5, restricted),
        blocked = coalesce($6, blocked),
        archived = coalesce($7, archived),
        hidden = coalesce($8, hidden),
        unread_count = coalesce($9, unread_count),
        contact_status = coalesce($10, contact_status)
      where user_id = $1 and contact_id = $2
    `,
    [
      userId,
      contactId,
      typeof patch.pinned === "boolean" ? patch.pinned : null,
      typeof patch.muted === "boolean" ? patch.muted : null,
      typeof patch.restricted === "boolean" ? patch.restricted : null,
      typeof patch.blocked === "boolean" ? patch.blocked : null,
      typeof patch.archived === "boolean" ? patch.archived : null,
      typeof patch.hidden === "boolean" ? patch.hidden : null,
      typeof patch.unread === "number" ? patch.unread : null,
      patch.contactStatus ?? null,
    ],
  );

  if (typeof patch.reported === "boolean") {
    await setChatReported(userId, contactId, patch.reported);
  }
}

export async function appendChatMessage(
  userId: string,
  contactId: string,
  input: { content?: string; attachments?: ChatAttachment[] },
) {
  await touchUserPresenceIfVisible(userId);
  if (isWorkspaceTeamChatId(contactId)) {
    await appendWorkspaceTeamChatMessage(userId, contactId, input);
    return;
  }
  if (isManagedGroupChatId(contactId)) {
    await appendManagedGroupChatMessage(userId, contactId, input);
    return;
  }
  const pool = getDbPool();
  const trimmedContent = input.content?.trim() ?? "";
  const attachments = normalizeChatAttachments(input.attachments);
  const messageType: ChatMessage["type"] = attachments.length > 0 ? "attachment" : "text";
  const storedContent = messageType === "attachment"
    ? buildStoredAttachmentContent(trimmedContent, attachments)
    : trimmedContent;
  const previewText = trimmedContent || summarizeChatAttachments(attachments);

  if (!previewText) {
    throw new Error("Message content is required.");
  }

  const threadResult = await pool.query<{ id: string }>(
    `
      select id
      from public.app_chat_threads
      where user_id = $1 and contact_id = $2
      limit 1
    `,
    [userId, contactId],
  );

  const ownerThreadId = threadResult.rows[0]?.id;

  if (!ownerThreadId) {
    throw new Error("Thread not found.");
  }

  const now = new Date();
  const timeLabel = formatTimeLabel(now);
  const dateLabel = formatThreadDateLabel(now);
  const sharedKey = createSharedMessageKey();

  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      `
        insert into public.app_chat_messages (
          thread_id,
          content,
          sender,
          time_label,
          reactions,
          type,
          sent_at,
          shared_key
        )
        values ($1, $2, 'me', $3, '[]'::jsonb, $4, $5, $6)
      `,
      [ownerThreadId, storedContent, timeLabel, messageType, now.toISOString(), sharedKey],
    );

    await client.query(
      `
        update public.app_chat_threads
        set
          last_message = $2,
          last_message_time = $3,
          call_ended = false,
          archived = false,
          hidden = false,
          unread_count = 0,
          date_label = case when coalesce(date_label, '') = '' then $4 else date_label end,
          updated_at = now()
        where id = $1
      `,
      [ownerThreadId, `You: ${previewText}`, timeLabel, dateLabel],
    );

    const recipientUserId = await ensureDirectRecipientUserId(userId, contactId);

    if (recipientUserId) {
      const senderSeed = await getContactSeedForUsers(recipientUserId, userId);

      if (senderSeed) {
        const recipientThreadId = await ensureThreadRow(recipientUserId, senderSeed, dateLabel, client);

        if (recipientThreadId) {
          await client.query(
            `
              insert into public.app_chat_messages (
                thread_id,
                content,
                sender,
                time_label,
                reactions,
                type,
                sent_at,
                shared_key
              )
              values ($1, $2, 'them', $3, '[]'::jsonb, $4, $5, $6)
            `,
            [recipientThreadId, storedContent, timeLabel, messageType, now.toISOString(), sharedKey],
          );

          await client.query(
            `
              update public.app_chat_threads
              set
                last_message = $2,
                last_message_time = $3,
                call_ended = false,
                archived = false,
                hidden = false,
                unread_count = unread_count + 1,
                date_label = case when coalesce(date_label, '') = '' then $4 else date_label end,
                updated_at = now()
              where id = $1
            `,
            [recipientThreadId, previewText, timeLabel, dateLabel],
          );
        }
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  await setChatTypingState(userId, contactId, false);
}

async function appendWorkspaceTeamChatMessage(
  userId: string,
  contactId: string,
  input: { content?: string; attachments?: ChatAttachment[] },
) {
  const trimmedContent = input.content?.trim() ?? "";
  const attachments = normalizeChatAttachments(input.attachments);

  if (!trimmedContent && attachments.length === 0) {
    return;
  }

  const workspaceId = getWorkspaceIdFromTeamChatId(contactId);

  if (!workspaceId) {
    throw new Error("Invalid team chat thread.");
  }

  const pool = getDbPool();
  const membershipResult = await pool.query<{ user_id: string }>(
    `
      select user_id::text as user_id
      from public.workspace_members
      where workspace_id = $1
        and user_id = $2::uuid
        and status in ('active', 'pending')
      limit 1
    `,
    [workspaceId, userId],
  );

  if (!membershipResult.rows[0]) {
    throw new Error("Team chat is not available for this workspace.");
  }

  const participants = await listWorkspaceGroupParticipants(workspaceId);
  const senderParticipant = participants.find((participant) => participant.userId === userId);

  if (!senderParticipant) {
    throw new Error("Sender is not part of this workspace team chat.");
  }

  const teamSeed = buildWorkspaceTeamContactSeed(workspaceId, participants.length);
  const now = new Date();
  const timeLabel = formatTimeLabel(now);
  const dateLabel = formatThreadDateLabel(now);
  const sharedKey = createSharedMessageKey();
  const messageType: ChatMessage["type"] = attachments.length > 0 ? "attachment" : "text";
  const client = await pool.connect();

  try {
    await client.query("begin");

    for (const participant of participants) {
      const threadId = await ensureThreadRow(participant.userId, teamSeed, dateLabel, client);

      if (!threadId) {
        continue;
      }

      const isSender = participant.userId === userId;
      const recipientText = trimmedContent
        ? `${senderParticipant.displayName}: ${trimmedContent}`
        : `${senderParticipant.displayName} shared ${summarizeChatAttachments(attachments).toLowerCase()}`;
      const storedContent = messageType === "attachment"
        ? buildStoredAttachmentContent(isSender ? trimmedContent : recipientText, attachments)
        : isSender ? trimmedContent : recipientText;
      const previewBase = trimmedContent || summarizeChatAttachments(attachments);
      const previewContent = isSender ? `You: ${previewBase}` : `${senderParticipant.displayName}: ${previewBase}`;

      await client.query(
        `
          insert into public.app_chat_messages (
            thread_id,
            content,
            sender,
            time_label,
            reactions,
            type,
            sent_at,
            shared_key
          )
          values ($1, $2, $3, $4, '[]'::jsonb, $5, $6, $7)
        `,
        [threadId, storedContent, isSender ? "me" : "them", timeLabel, messageType, now.toISOString(), sharedKey],
      );

      await client.query(
        `
          update public.app_chat_threads
          set
            last_message = $2,
            last_message_time = $3,
            call_ended = false,
            archived = false,
            hidden = false,
            unread_count = case when $4 then 0 else unread_count + 1 end,
            date_label = case when coalesce(date_label, '') = '' then $5 else date_label end,
            updated_at = now()
          where id = $1
        `,
        [threadId, previewContent, timeLabel, isSender, dateLabel],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  await setChatTypingState(userId, contactId, false);
}

async function appendManagedGroupChatMessage(
  userId: string,
  contactId: string,
  input: { content?: string; attachments?: ChatAttachment[] },
) {
  const trimmedContent = input.content?.trim() ?? "";
  const attachments = normalizeChatAttachments(input.attachments);

  if (!trimmedContent && attachments.length === 0) {
    return;
  }

  const groupId = getGroupIdFromContactId(contactId);

  if (!groupId) {
    throw new Error("Invalid group chat thread.");
  }

  const pool = getDbPool();
  const group = await getManagedGroupRow(groupId);

  if (!group) {
    throw new Error("Group chat not found.");
  }

  const participantIds = dedupeUserIds((await listManagedGroupMemberIds(groupId)).filter(isUuid));

  if (!participantIds.includes(userId)) {
    throw new Error("You are not a member of this group chat.");
  }

  const senderIdentity = await getContactSeedForUsers(userId, userId);
  const senderName = senderIdentity?.contactName ?? "Team Member";
  const contactSeed = buildManagedGroupContactSeed(group);
  const now = new Date();
  const timeLabel = formatTimeLabel(now);
  const dateLabel = formatThreadDateLabel(now);
  const sharedKey = createSharedMessageKey();
  const messageType: ChatMessage["type"] = attachments.length > 0 ? "attachment" : "text";
  const client = await pool.connect();

  try {
    await client.query("begin");

    for (const participantId of participantIds) {
      const threadId = await ensureThreadRow(participantId, contactSeed, dateLabel, client);

      if (!threadId) {
        continue;
      }

      const isSender = participantId === userId;
      const recipientText = trimmedContent
        ? `${senderName}: ${trimmedContent}`
        : `${senderName} shared ${summarizeChatAttachments(attachments).toLowerCase()}`;
      const storedContent = messageType === "attachment"
        ? buildStoredAttachmentContent(isSender ? trimmedContent : recipientText, attachments)
        : isSender ? trimmedContent : recipientText;
      const previewBase = trimmedContent || summarizeChatAttachments(attachments);
      const previewContent = isSender ? `You: ${previewBase}` : `${senderName}: ${previewBase}`;

      await client.query(
        `
          insert into public.app_chat_messages (
            thread_id,
            content,
            sender,
            time_label,
            reactions,
            type,
            sent_at,
            shared_key
          )
          values ($1, $2, $3, $4, '[]'::jsonb, $5, $6, $7)
        `,
        [threadId, storedContent, isSender ? "me" : "them", timeLabel, messageType, now.toISOString(), sharedKey],
      );

      await client.query(
        `
          update public.app_chat_threads
          set
            last_message = $2,
            last_message_time = $3,
            call_ended = false,
            archived = false,
            hidden = false,
            unread_count = case when $4 then 0 else unread_count + 1 end,
            date_label = case when coalesce(date_label, '') = '' then $5 else date_label end,
            updated_at = now()
          where id = $1
        `,
        [threadId, previewContent, timeLabel, isSender, dateLabel],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  await setChatTypingState(userId, contactId, false);
}

async function getThreadMeta(userId: string, contactId: string) {
  const pool = getDbPool();
  const threadResult = await pool.query<{ id: string }>(
    `
      select id
      from public.app_chat_threads
      where user_id = $1 and contact_id = $2
      limit 1
    `,
    [userId, contactId],
  );

  return threadResult.rows[0] ?? null;
}

async function listWorkspaceMemberIdsForUser(userId: string, candidateIds: string[]) {
  const normalizedIds = dedupeUserIds(candidateIds).filter(isUuid);
  const workspaceId = (await resolveWorkspaceSelectionState(userId)).selectedWorkspaceId;

  if (normalizedIds.length === 0 || !workspaceId) {
    return [] as string[];
  }

  const pool = getDbPool();
  const result = await pool.query<{ user_id: string }>(
    `
      select contact.user_id::text as user_id
      from public.workspace_members owner
      join public.workspace_members contact
        on contact.workspace_id = owner.workspace_id
      where owner.user_id = $1
        and owner.workspace_id = $3::uuid
        and owner.status = 'active'
        and contact.user_id = any($2::uuid[])
        and contact.status = 'active'
    `,
    [userId, normalizedIds, workspaceId],
  );

  return dedupeUserIds(result.rows.map((row) => row.user_id));
}

export async function createChatGroup(user: AuthLikeUser, input: {
  name: string;
  memberIds: string[];
}) {
  const workspaceId = (await resolveWorkspaceSelectionState(user.id)).selectedWorkspaceId;
  await touchUserPresenceIfVisible(user.id);

  if (!workspaceId) {
    throw new Error("Group chats are available only for workspace members.");
  }

  const groupName = input.name.trim();

  if (!groupName) {
    throw new Error("Group name is required.");
  }

  const memberIds = dedupeUserIds([user.id, ...input.memberIds]);
  const validMemberIds = dedupeUserIds([user.id, ...(await listWorkspaceMemberIdsForUser(user.id, memberIds))]);

  if (validMemberIds.length < 2) {
    throw new Error("Choose at least one workspace member for the group.");
  }

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const groupResult = await client.query<{ id: string }>(
      `
        insert into public.app_chat_groups (
          workspace_id,
          name,
          initials,
          tone,
          kind,
          created_by_user_id
        )
        values ($1, $2, $3, $4, 'custom', $5)
        returning id::text
      `,
      [workspaceId, groupName, buildInitials(groupName), "olive", user.id],
    );

    const groupId = groupResult.rows[0]?.id;

    if (!groupId) {
      throw new Error("Group could not be created.");
    }

    await syncManagedGroupMembership(groupId, validMemberIds, client);
    await ensureManagedGroupThreads(groupId, client);
    await client.query("commit");

    return {
      groupId,
      contactId: createManagedGroupContactId(groupId),
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteChatThread(userId: string, contactId: string) {
  await touchUserPresenceIfVisible(userId);
  const pool = getDbPool();
  await pool.query(
    `
      update public.app_chat_threads
      set
        hidden = true,
        archived = false,
        unread_count = 0,
        updated_at = now()
      where user_id = $1 and contact_id = $2
    `,
    [userId, contactId],
  );
  await setChatTypingState(userId, contactId, false);
}

export async function updateChatMessage(userId: string, contactId: string, messageId: string, content: string) {
  await touchUserPresenceIfVisible(userId);
  const pool = getDbPool();
  const thread = await getThreadMeta(userId, contactId);

  if (!thread) {
    throw new Error("Thread not found.");
  }

  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await client.query<{ id: string; shared_key: string | null }>(
      `
        update public.app_chat_messages
        set
          content = $3,
          edited_at = now()
        where
          id = $1
          and thread_id = $2
          and sender = 'me'
          and type = 'text'
        returning id, shared_key
      `,
      [messageId, thread.id, content.trim()],
    );

    if (!result.rows[0]) {
      throw new Error("Message cannot be edited.");
    }

    const sharedKey = result.rows[0].shared_key;
    const threadIds = new Set<string>([thread.id]);

    if (sharedKey) {
      await client.query(
        `
          update public.app_chat_messages
          set
            content = $2,
            edited_at = now()
          where shared_key = $1
            and thread_id <> $3
        `,
        [sharedKey, content.trim(), thread.id],
      );

      const affectedThreads = await client.query<{ thread_id: string }>(
        `
          select distinct thread_id
          from public.app_chat_messages
          where shared_key = $1
        `,
        [sharedKey],
      );

      affectedThreads.rows.forEach((row) => threadIds.add(row.thread_id));
    }

    for (const threadId of threadIds) {
      await syncThreadPreviewById(client, threadId);
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteChatMessage(userId: string, contactId: string, messageId: string) {
  await touchUserPresenceIfVisible(userId);
  const pool = getDbPool();
  const thread = await getThreadMeta(userId, contactId);

  if (!thread) {
    throw new Error("Thread not found.");
  }

  const client = await pool.connect();

  try {
    await client.query("begin");
    const messageResult = await client.query<{ shared_key: string | null; thread_id: string }>(
      `
        select shared_key, thread_id
        from public.app_chat_messages
        where id = $1 and thread_id = $2
        limit 1
      `,
      [messageId, thread.id],
    );

    const message = messageResult.rows[0];

    if (!message) {
      throw new Error("Message not found.");
    }

    const threadIds = new Set<string>([thread.id]);

    if (message.shared_key) {
      const affectedThreads = await client.query<{ thread_id: string }>(
        `
          select distinct thread_id
          from public.app_chat_messages
          where shared_key = $1
        `,
        [message.shared_key],
      );

      affectedThreads.rows.forEach((row) => threadIds.add(row.thread_id));

      await client.query(
        `
          delete from public.app_chat_messages
          where shared_key = $1
        `,
        [message.shared_key],
      );
    } else {
      await client.query(
        `
          delete from public.app_chat_messages
          where id = $1 and thread_id = $2
        `,
        [messageId, thread.id],
      );
    }

    for (const threadId of threadIds) {
      await syncThreadPreviewById(client, threadId);
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
