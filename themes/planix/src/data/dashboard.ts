export type AvatarTone = "sand" | "rose" | "olive" | "slate" | "peach";

export type TeamMember = {
  name: string;
  initials: string;
  tone: AvatarTone;
};

export type TaskRow = {
  id: number;
  name: string;
  assignees: TeamMember[];
  dueLabel: string;
  tag: string;
  priority: "High";
};

export type NotificationItem = {
  id: number;
  title: string;
  time: string;
  body: string;
  kind: "avatar" | "calendar" | "check";
  tone: AvatarTone;
  initials: string;
};

export type ActivityItem = {
  id: number;
  name: string;
  time: string;
  action: string;
  detail?: string;
  tone: AvatarTone;
  initials: string;
  status: "online" | "busy" | "neutral";
};
