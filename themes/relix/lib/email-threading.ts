type ParticipantMessage = {
  fromEmail: string;
  toEmail: string | null;
  ccEmail?: string | null;
  bccEmail?: string | null;
};

type ParticipantThread = {
  subject: string;
  fromEmail: string;
  toEmail: string | null;
  ccEmail?: string | null;
  bccEmail?: string | null;
  messages?: ParticipantMessage[];
};

export function normalizeEmail(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export function normalizeSubject(value: string) {
  let normalized = value.trim().toLowerCase();

  while (/^(re|fw|fwd)\s*:/i.test(normalized)) {
    normalized = normalized.replace(/^(re|fw|fwd)\s*:\s*/i, "").trim();
  }

  return normalized.replace(/\s+/g, " ") || "(no subject)";
}

export function extractEmailAddress(value: string | null | undefined) {
  const raw = value || "";
  const match = raw.match(/<([^>]+)>/);
  return normalizeEmail(match?.[1] || raw);
}

export function splitEmailList(value: string | null | undefined) {
  return Array.from(
    new Set(
      (value || "")
        .split(/[;,]/)
        .map((item) => extractEmailAddress(item))
        .filter(Boolean)
    )
  );
}

export function collectThreadParticipants(thread: ParticipantThread) {
  const participants = new Set<string>();

  if (thread.fromEmail) {
    participants.add(normalizeEmail(thread.fromEmail));
  }

  if (thread.toEmail) {
    splitEmailList(thread.toEmail).forEach((email) => participants.add(email));
  }

  splitEmailList(thread.ccEmail).forEach((email) => participants.add(email));
  splitEmailList(thread.bccEmail).forEach((email) => participants.add(email));

  for (const message of thread.messages || []) {
    participants.add(normalizeEmail(message.fromEmail));

    if (message.toEmail) {
      splitEmailList(message.toEmail).forEach((email) => participants.add(email));
    }

    splitEmailList(message.ccEmail).forEach((email) => participants.add(email));
    splitEmailList(message.bccEmail).forEach((email) => participants.add(email));
  }

  participants.delete("");
  return Array.from(participants);
}

export function matchesThreadByParticipants(
  thread: ParticipantThread,
  input: { subject: string; participantEmails: Array<string | null | undefined> }
) {
  const normalizedParticipants = input.participantEmails.flatMap((email) => splitEmailList(email)).filter(Boolean);

  if (!normalizedParticipants.length) {
    return false;
  }

  if (normalizeSubject(thread.subject) !== normalizeSubject(input.subject)) {
    return false;
  }

  const threadParticipants = collectThreadParticipants(thread);
  return normalizedParticipants.every((participant) => threadParticipants.includes(participant));
}

export function titleCaseFromEmail(email: string) {
  const [localPart] = normalizeEmail(email).split("@");

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
