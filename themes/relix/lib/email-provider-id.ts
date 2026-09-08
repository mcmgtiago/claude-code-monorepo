export function buildMailboxScopedProviderId(mailboxUserId: string, providerId: string | null | undefined) {
  const normalized = providerId?.trim();

  if (!mailboxUserId || !normalized) {
    return null;
  }

  return `${mailboxUserId}::${normalized}`;
}

export function getMailboxProviderIdCandidates(mailboxUserId: string, providerId: string | null | undefined) {
  const normalized = providerId?.trim();

  if (!normalized) {
    return [];
  }

  const scoped = buildMailboxScopedProviderId(mailboxUserId, normalized);

  return scoped ? [scoped, normalized] : [normalized];
}
