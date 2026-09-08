import type { ClientRecord } from "@/data/clients";
import type { Integration, ProjectNotification, WorkspaceProject } from "@/data/project-board";
import type { WorkspacePeopleMember, WorkspaceTeamRecord } from "@/lib/people";

export type TrashItemType = "task" | "project" | "client" | "member" | "team";

export type TrashTaskRecord = {
  id: number;
  title: string;
  description: string;
  status_id: string;
  tag: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  reminder_at: string | null;
  reminder_date: string | null;
  created_by: string;
  subtasks: unknown;
  notes: string[] | null;
  links: { id: string; url: string }[] | null;
  comments: { id: string; body: string }[] | null;
  file_ids: string[] | null;
  created_at: string;
  completed_at: string | null;
  project_ref: string;
  sort_order: number;
};

export type TrashProjectPayload = {
  project: WorkspaceProject;
  notifications: ProjectNotification[];
  integrations: Integration[];
};

export type TrashMemberAssignment = {
  projectId: number;
  members: NonNullable<WorkspaceProject["members"]>;
};

export type TrashPayload =
  | { kind: "task"; task: TrashTaskRecord }
  | { kind: "project"; project: TrashProjectPayload }
  | { kind: "client"; client: ClientRecord }
  | { kind: "member"; member: WorkspacePeopleMember; assignments: TrashMemberAssignment[] }
  | { kind: "team"; team: WorkspaceTeamRecord };

export type WorkspaceTrashItem = {
  id: string;
  workspaceId: string | null;
  itemType: TrashItemType;
  itemKey: string;
  itemLabel: string;
  summary: string;
  deletedAt: string;
  payload: TrashPayload;
};

export type CreateTrashItemInput = {
  workspaceId: string | null;
  deletedByUserId?: string | null;
  itemType: TrashItemType;
  itemKey: string;
  itemLabel: string;
  summary?: string;
  payload: TrashPayload;
};
