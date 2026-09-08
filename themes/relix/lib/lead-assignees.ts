export type AssignedUserEntry = {
  id: string | null;
  fullName: string;
};

type TeamMemberIdentity = {
  id: string;
  fullName: string;
};

function normalizeString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function dedupeAssignedUserEntries(entries: AssignedUserEntry[]) {
  const seen = new Set<string>();
  const unique: AssignedUserEntry[] = [];

  for (const entry of entries) {
    const key = `${entry.id || ""}::${entry.fullName.toLowerCase()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(entry);
  }

  return unique;
}

export function parseAssignedUserEntries(value: string | null | undefined) {
  if (!value) {
    return [] as AssignedUserEntry[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as AssignedUserEntry[];
    }

    const entries = parsed.flatMap((item) => {
      if (typeof item === "string") {
        const fullName = normalizeString(item);
        return fullName ? [{ id: null, fullName }] : [];
      }

      if (!item || typeof item !== "object") {
        return [];
      }

      const candidate = item as { id?: unknown; fullName?: unknown; name?: unknown };
      const id = normalizeString(typeof candidate.id === "string" ? candidate.id : null);
      const fullName = normalizeString(
        typeof candidate.fullName === "string" ? candidate.fullName : typeof candidate.name === "string" ? candidate.name : null
      );

      if (!id && !fullName) {
        return [];
      }

      return [{ id, fullName: fullName || id! }];
    });

    return dedupeAssignedUserEntries(entries);
  } catch {
    return [] as AssignedUserEntry[];
  }
}

export function serializeAssignedUserEntries(entries: Array<TeamMemberIdentity | AssignedUserEntry>) {
  const normalized = dedupeAssignedUserEntries(
    entries.flatMap((entry) => {
      const id = normalizeString(entry.id);
      const fullName = normalizeString(entry.fullName);

      return id && fullName ? [{ id, fullName }] : [];
    })
  );

  return normalized.length ? JSON.stringify(normalized) : null;
}

export function getAssignedUserNames(entries: AssignedUserEntry[]) {
  return Array.from(new Set(entries.map((entry) => entry.fullName.trim()).filter(Boolean)));
}

export function getAssignedUserIds(entries: AssignedUserEntry[]) {
  return Array.from(new Set(entries.map((entry) => entry.id?.trim() || "").filter(Boolean)));
}

export function sanitizeAssignedUserIds(
  assignedUserIds: string[] | null | undefined,
  activeMembers: TeamMemberIdentity[],
  fallbackUserId?: string | null
) {
  const validIds = new Set(activeMembers.map((member) => member.id));
  const unique = Array.from(new Set((assignedUserIds || []).map((id) => id.trim()).filter(Boolean)));
  const filtered = unique.filter((id) => validIds.has(id));

  if (filtered.length) {
    return filtered;
  }

  return fallbackUserId && validIds.has(fallbackUserId) ? [fallbackUserId] : [];
}

export function resolveAssignedUsersFromIds(
  assignedUserIds: string[] | null | undefined,
  activeMembers: TeamMemberIdentity[]
) {
  const memberById = new Map(activeMembers.map((member) => [member.id, member]));
  return dedupeAssignedUserEntries(
    (assignedUserIds || []).flatMap((id) => {
      const member = memberById.get(id);
      return member ? [{ id: member.id, fullName: member.fullName }] : [];
    })
  );
}

export function resolveAssignedUsersFromInput(
  assignedUsers: string[] | null | undefined,
  activeMembers: TeamMemberIdentity[],
  fallbackUserId?: string | null
) {
  const memberById = new Map(activeMembers.map((member) => [member.id, member]));
  const memberByName = new Map(activeMembers.map((member) => [member.fullName.trim().toLowerCase(), member]));
  const uniqueValues = Array.from(new Set((assignedUsers || []).map((value) => value.trim()).filter(Boolean)));

  const resolved = dedupeAssignedUserEntries(
    uniqueValues.flatMap((value) => {
      const byId = memberById.get(value);

      if (byId) {
        return [{ id: byId.id, fullName: byId.fullName }];
      }

      const byName = memberByName.get(value.toLowerCase());
      return byName ? [{ id: byName.id, fullName: byName.fullName }] : [];
    })
  );

  if (resolved.length) {
    return resolved;
  }

  const fallbackMember = fallbackUserId ? memberById.get(fallbackUserId) : null;
  return fallbackMember ? [{ id: fallbackMember.id, fullName: fallbackMember.fullName }] : [];
}
