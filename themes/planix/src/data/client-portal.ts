export type ClientPortalAccessLevel = "viewer";

export type ClientPortalMember = {
  id: string;
  workspaceId: string;
  clientId: string;
  clientMemberId: string;
  clientName: string;
  memberName: string;
  memberRole: string;
  email: string;
  accessLevel: ClientPortalAccessLevel;
  portalEnabled: boolean;
  canMessage: boolean;
  linkedUserId?: string;
  lastLoginAt?: string | null;
};

export type ClientPortalTask = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  statusId: string;
  priority: string;
  assignedTo: string;
  dueDate?: string | null;
  createdAt: string;
};

export type ClientPortalProject = {
  id: number;
  workspaceId: string;
  clientId: string;
  clientName: string;
  name: string;
  service: string;
  status: "Discovery" | "In Delivery" | "Review" | "Completed";
  progress: number;
  dueDate?: string;
  teamMembers: string[];
  taskCount: number;
  openTaskCount: number;
};

export type ClientPortalFile = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
};

export type ClientPortalDiscussion = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  replyCount: number;
  attachmentCount: number;
};

export type ClientPortalNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: string;
  unread: boolean;
};

export type ClientPortalAccount = {
  workspaceId: string;
  clientId: string;
  clientName: string;
  memberName: string;
  memberRole: string;
  canMessage: boolean;
  projects: ClientPortalProject[];
  tasks: ClientPortalTask[];
};

export type ClientPortalDashboard = {
  accounts: ClientPortalAccount[];
  totalProjects: number;
  totalTasks: number;
  openTasks: number;
  reviewTasks: number;
  completedTasks: number;
};

export type ClientPortalProjectDetail = {
  account: ClientPortalAccount;
  project: ClientPortalProject;
  tasks: ClientPortalTask[];
  files: ClientPortalFile[];
  discussions: ClientPortalDiscussion[];
  notifications: ClientPortalNotification[];
};
