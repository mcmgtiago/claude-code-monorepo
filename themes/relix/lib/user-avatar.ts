export type UserAvatarSource = {
  id: string;
  profileImageUrl?: string | null;
  profileImageAsset?: {
    updatedAt: Date | string | number;
  } | null;
};

export function buildWorkspaceUserAvatarUrl(userId: string, version: Date | string | number) {
  const value = version instanceof Date ? version.getTime() : version;
  return `/api/users/${encodeURIComponent(userId)}/profile-photo?v=${encodeURIComponent(String(value))}`;
}

export function getWorkspaceUserAvatarUrl(user: UserAvatarSource) {
  if (user.profileImageAsset?.updatedAt) {
    return buildWorkspaceUserAvatarUrl(user.id, user.profileImageAsset.updatedAt);
  }

  return user.profileImageUrl || null;
}
