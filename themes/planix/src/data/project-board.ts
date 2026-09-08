import type { AvatarTone, TeamMember } from "@/data/dashboard";

export type TagDefinition = {
  id: string;
  label: string;
  color: string;
};

export type TaskPriority = "Normal" | "Medium" | "High" | "Done";

export type TaskLinkRecord = {
  id: string;
  url: string;
};

export type TaskCommentRecord = {
  id: string;
  body: string;
};

export type TaskChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type WorkspaceProject = {
  id: number;
  name: string;
  category: string;
  tone: AvatarTone;
  initials: string;
  active?: boolean;
  starred?: boolean;
  hidden?: boolean;
  archived?: boolean;
  completed?: boolean;
  clientId?: string;
  projectType?: string;
  startDate?: string;
  deadline?: string;
  description?: string;
  members?: { name: string; team: string; teamId?: string; email?: string }[];
  documents?: ProjectDocument[];
  goals?: ProjectGoal[];
};

export type BoardTask = {
  id: number;
  tag: string;
  tagTone: "rose" | "peach" | "blue" | "violet";
  priority: TaskPriority;
  title: string;
  description: string;
  checklist: TaskChecklistItem[];
  notes: string[];
  assignees: TeamMember[];
  attachments: number;
  attachmentFileIds: string[];
  comments: number;
  commentItems: TaskCommentRecord[];
  links: number;
  linkItems: TaskLinkRecord[];
  dueDate?: string;
  dueLabel?: string;
  reminderDate?: string;
  reminderLabel?: string;
  preview?: "landing" | "wireframe";
};

export type TaskColumn = {
  id: string;
  title: string;
  count: string;
  tasks: BoardTask[];
};

export type TimelineUser = {
  id: string;
  name: string;
  role: string;
  initials: string;
  tone: AvatarTone;
};

export type TimelineItem = {
  id: string;
  userId: string;
  title: string;
  startDay: number;
  span: number;
  tone: "blue" | "green" | "violet" | "peach" | "yellow";
};

export const workspaceProjects: WorkspaceProject[] = [];

export const boardMembers: TeamMember[] = [];

export const boardColumns: TaskColumn[] = [
  { id: "open", title: "Open", count: "00", tasks: [] },
  { id: "progress", title: "In Progress", count: "00", tasks: [] },
  { id: "review", title: "In Review", count: "00", tasks: [] },
  { id: "completed", title: "Completed", count: "00", tasks: [] },
];

export const topTabs = [
  { label: "Overview", badge: null, active: false },
  { label: "Tasks", badge: null, active: true },
  { label: "Discussions", badge: "3", active: false },
  { label: "Team Members", badge: null, active: false },
  { label: "Notifications", badge: "12", active: false },
  { label: "Files", badge: null, active: false },
  { label: "Integrations", badge: null, active: false },
] as const;

export const viewTabs = [
  { label: "Board View", active: true },
  { label: "List View", active: false },
  { label: "Timeline View", active: false },
] as const;

export const sortOptions = [
  "Task Name",
  "Assigned to",
  "Due Date",
  "Tags",
  "Priority",
  "By Dated Closed",
] as const;

export const timelineDays = Array.from({ length: 12 }, (_, index) => index + 1);

export const timelineUsers: TimelineUser[] = [];

export const timelineItems: TimelineItem[] = [];

export type ProjectNotification = {
  id: string;
  title: string;
  time: string;
  body: string;
  kind: "task" | "deadline" | "completed" | "milestone" | "comment" | "overdue" | "meeting";
  group: "earlier" | "2023";
  unread?: boolean;
  initials?: string;
  avatarTone?: AvatarTone;
  createdAt?: string;
  targetTab?: "Overview" | "Tasks" | "Team Members" | "Notifications" | "Files";
  targetTaskId?: number;
  targetColumnId?: string;
};

export type ProjectDocument = {
  id: string;
  title: string;
  description: string;
  linkedFileId?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  storageUrl?: string;
  updatedAt?: string;
  fileType?: "word" | "ppt" | "pdf" | "other";
};

export type ProjectGoal = {
  id: string;
  title: string;
  description: string;
};

export const projectDescription = "";

export const projectDetails = {
  type: "",
  startDate: "",
  deadline: "",
};

export const projectDocuments: ProjectDocument[] = [];

export const projectGoals: ProjectGoal[] = [];

export const projectNotifications: ProjectNotification[] = [];

/* ─── Files ───────────────────────────────────────────────── */

export type ProjectFile = {
  id: string;
  name: string;
  dateUpload: string;
  lastUpdate: string;
  fileSize: string;
};

export const projectFiles: ProjectFile[] = [];

/* ─── Discussions ─────────────────────────────────────────── */

export type DiscussionLink = { label: string; url: string };
export type DiscussionReaction = { emoji: string; count: number };

export type DiscussionThread = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorTone: AvatarTone;
  timestamp: string;
  paragraphs: string[];
  links?: DiscussionLink[];
  sessionDetails?: { date: string; time: string; locationUrl: string };
  agenda?: string[];
  reactions: DiscussionReaction[];
  replyCount: number;
  lastReplyLabel: string;
  replyAvatars: { initials: string; tone: AvatarTone }[];
};

export type DiscussionReply = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorTone: AvatarTone;
  timestamp: string;
  content: string;
  reactions: DiscussionReaction[];
  replyCount: number;
  lastReplyLabel: string;
  replyAvatars: { initials: string; tone: AvatarTone }[];
};

export const discussionThreads: DiscussionThread[] = [];

export const discussionReplies: DiscussionReply[] = [];

/* ─── Client Contacts ─────────────────────────────────────── */

export type ClientContact = {
  id: string;
  name: string;
  role: string;
  email: string;
  company: string;
  avatarInitials: string;
  avatarTone: AvatarTone;
  joinedOn: string;
};

export const clientContacts: ClientContact[] = [];

/* ─── Team Members ────────────────────────────────────────── */

export type TeamMemberRecord = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarTone: AvatarTone;
  avatarImage?: string;
  dateAdded: string;
  lastActive: string;
  teamId?: string;
  role?: "Admin" | "User" | "Viewer";
};

export const teamMemberRecords: TeamMemberRecord[] = [];

/* ─── Integrations ────────────────────────────────────────── */

export type Integration = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: "Management" | "Communication";
  enabled: boolean;
  custom?: boolean;
};

export const integrations: Integration[] = [
  { id: "int-1", name: "GitHub",          url: "https://github.com",             category: "Management",    enabled: true,  description: "Sync code, pull requests, and delivery context with the project workspace." },
  { id: "int-2", name: "ClickUp",         url: "https://clickup.com",            category: "Management",    enabled: false, description: "Bring tasks, docs, and sprint execution into one connected workflow." },
  { id: "int-3", name: "Asana",           url: "https://asana.com",              category: "Management",    enabled: true,  description: "Coordinate plans, owners, and milestones across product and delivery teams." },
  { id: "int-4", name: "Jira Atlassian",  url: "https://www.atlassian.com/software/jira", category: "Management",    enabled: false, description: "Track tickets, releases, and engineering status alongside project activity." },
  { id: "int-5", name: "Wrike",           url: "https://www.wrike.com",          category: "Management",    enabled: false, description: "Connect campaign planning, timelines, and team collaboration to the project board." },
  { id: "int-6", name: "Slack",           url: "https://slack.com",              category: "Communication", enabled: true,  description: "Route project updates, discussions, and alerts into team channels." },
  { id: "int-7", name: "Telegram",        url: "https://telegram.org",           category: "Communication", enabled: false, description: "Send lightweight team updates and fast coordination messages from the workspace." },
  { id: "int-8", name: "WhatsApp",        url: "https://www.whatsapp.com",       category: "Communication", enabled: false, description: "Share quick status changes and customer-facing communication touchpoints." },
  { id: "int-9", name: "Microsoft Teams", url: "https://www.microsoft.com/microsoft-teams", category: "Communication", enabled: false, description: "Unify meetings, project chat, and shared docs inside the delivery flow." },
  { id: "int-10", name: "Discord",        url: "https://discord.com",            category: "Communication", enabled: false, description: "Keep community, support, or internal team communication tied to the project context." },
];
