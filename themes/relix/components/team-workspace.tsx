"use client";

import { AppSelect } from "@/components/app-select";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, Loader2, Mail, MailPlus, Search, ShieldCheck, Trash2, User, UserRoundCog, Users, X } from "lucide-react";
import { Card } from "@/components/card";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { useCommandKFocus } from "@/components/search-hotkey";
import { UserAvatar } from "@/components/user-avatar";
import { Topbar } from "@/components/topbar";
import {
  canInviteTeamRole,
  canManageTeam,
  canManageWorkspaceMember,
  getAccessRoleLabel,
  getMemberStatusLabel,
  listAssignableTeamRoles,
  teamStatusOptions
} from "@/lib/team";

type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  accessRole: string;
  status: string;
  createdAt: string | Date;
  lastActiveAt: string | Date | null;
  isWorkspaceOwner?: boolean;
};

type TeamInvite = {
  id: string;
  email: string;
  fullName: string | null;
  accessRole: string;
  status: string;
  createdAt: string | Date;
  expiresAt: string | Date;
  invitedBy: {
    fullName: string;
  };
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4";

const selectClassName = `${inputClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const selectWithIconClassName = `${inputWithIconClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

function roleTone(role: string) {
  if (role === "SUPERUSER") return "bg-[#edf7f3] text-[#0f8b5f]";
  if (role === "ADMIN") return "bg-[#eef4ff] text-[#386df4]";
  if (role === "MANAGER") return "bg-[#f7f1ff] text-[#6b4fe0]";
  return "bg-slate-100 text-slate-600";
}

function statusTone(status: string) {
  if (status === "ACTIVE") return "bg-[#eefbf5] text-[#1fa261]";
  if (status === "SUSPENDED") return "bg-[#fff4f0] text-[#d25d37]";
  if (status === "PENDING" || status === "INVITED") return "bg-[#fff7e8] text-[#c68a16]";
  return "bg-slate-100 text-slate-600";
}

function isValidInviteEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function TeamWorkspace({
  currentUser,
  members,
  invites,
  initialFeedback
}: {
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    accessRole: string;
    isWorkspaceOwner?: boolean;
  };
  members: TeamMember[];
  invites: TeamInvite[];
  initialFeedback?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const [feedback, setFeedback] = useState<string | null>(initialFeedback || null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [memberRows, setMemberRows] = useState(members);
  const [inviteRows, setInviteRows] = useState(invites);
  const canManage = canManageTeam(currentUser.accessRole);
  const teamActor = useMemo(
    () => ({
      id: currentUser.id,
      accessRole: currentUser.accessRole,
      isWorkspaceOwner: currentUser.isWorkspaceOwner
    }),
    [currentUser.accessRole, currentUser.id, currentUser.isWorkspaceOwner]
  );
  const assignableRoles = useMemo(() => listAssignableTeamRoles(teamActor), [teamActor]);
  const canInviteMembers = assignableRoles.length > 0;
  const deferredQuery = useDeferredValue(query);
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    setMemberRows(members);
  }, [members]);

  useEffect(() => {
    setInviteRows(invites);
  }, [invites]);

  useEffect(() => {
    if (!assignableRoles.length) {
      return;
    }

    if (!assignableRoles.includes(inviteRole as (typeof assignableRoles)[number])) {
      setInviteRole(assignableRoles[0]);
    }
  }, [assignableRoles, inviteRole]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const visibleMembers = useMemo(
    () =>
      normalizedQuery
        ? memberRows.filter((member) =>
            [member.fullName, member.email, getAccessRoleLabel(member.accessRole), getMemberStatusLabel(member.status)].some((value) =>
              value.toLowerCase().includes(normalizedQuery)
            )
          )
        : memberRows,
    [memberRows, normalizedQuery]
  );
  const visibleInvites = useMemo(
    () =>
      normalizedQuery
        ? inviteRows.filter((invite) =>
            [invite.fullName || "", invite.email, getAccessRoleLabel(invite.accessRole), invite.invitedBy.fullName].some((value) =>
              value.toLowerCase().includes(normalizedQuery)
            )
          )
        : inviteRows,
    [inviteRows, normalizedQuery]
  );

  const activeMembers = memberRows.filter((member) => member.status === "ACTIVE").length;
  const privilegedCount = memberRows.filter((member) => ["SUPERUSER", "ADMIN", "MANAGER"].includes(member.accessRole)).length;

  const roleDescription =
    inviteRole === "ADMIN"
      ? "Admin access. Workspace owner can still change admin access."
      : inviteRole === "MANAGER"
        ? "Can manage managers' daily workflow and member-level execution."
        : "Can work on assigned records and daily tasks.";

  const hierarchyMessage = currentUser.isWorkspaceOwner
    ? null
    : currentUser.accessRole === "ADMIN"
      ? "Admins can invite and manage managers and members. Admin access stays under the workspace owner."
      : currentUser.accessRole === "MANAGER"
        ? "Managers can invite and manage members only."
        : "You can view workspace members here.";
  const normalizedInviteEmail = inviteEmail.trim();
  const inviteEmailError = normalizedInviteEmail && !isValidInviteEmail(normalizedInviteEmail) ? "Enter a valid email address." : "";

  const runMemberUpdate = (memberId: string, payload: { accessRole?: string; status?: string }, successMessage: string) => {
    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/team/members/${memberId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = (await response.json().catch(() => null)) as { error?: string; member?: TeamMember } | null;

          if (!response.ok) {
            throw new Error(result?.error || "Unable to update member");
          }

          if (result?.member) {
            setMemberRows((current) => current.map((item) => (item.id === result.member?.id ? result.member : item)));
          }

          setFeedback(successMessage);
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update member");
        }
      })();
    });
  };

  const closeInviteModal = () => {
    if (isPending || isSendingInvite) {
      return;
    }

    setInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("MEMBER");
  };

  const sendInvite = () => {
    if (inviteEmailError) {
      setFeedback(inviteEmailError);
      return;
    }

    setFeedback(null);
    setPreviewLink(null);
    setIsSendingInvite(true);
    void (async () => {
      try {
        const response = await fetch("/api/team/invites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: inviteEmail, fullName: inviteName, accessRole: inviteRole })
        });
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          previewUrl?: string;
          warning?: string;
          invite?: TeamInvite;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to send invite");
        }

        if (payload?.invite) {
          setInviteRows((current) => [payload.invite!, ...current.filter((item) => item.email !== payload.invite!.email)]);
        }

        setInviteEmail("");
        setInviteName("");
        setInviteRole("MEMBER");
        setInviteModalOpen(false);
        setFeedback(payload?.warning || "Invite created.");
        setPreviewLink(payload?.previewUrl || null);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to send invite");
      } finally {
        setIsSendingInvite(false);
      }
    })();
  };

  const removeMember = (member: TeamMember) => {
    setFeedback(null);
    setPreviewLink(null);

    startTransition(() => {
      void (async () => {
        const confirmed = await requestConfirmation({
          title: "Remove member from workspace?",
          description: `${member.fullName} will lose access to this workspace immediately.`,
          confirmLabel: "Remove member",
          tone: "warning"
        });

        if (!confirmed) {
          return;
        }

        try {
          const response = await fetch(`/api/team/members/${member.id}`, { method: "DELETE" });
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;

          if (!response.ok) {
            throw new Error(payload?.error || "Unable to remove member");
          }

          setMemberRows((current) => current.filter((item) => item.id !== member.id));
          setFeedback(`${member.fullName} removed from the workspace.`);
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to remove member");
        }
      })();
    });
  };

  return (
    <div>
      <Topbar title="Team" subtitle="Internal users, roles, and access controls. People remains your CRM contact and client database." />

      {feedback ? <FeedbackToast message={feedback} position="top-right" className="max-w-[min(32rem,calc(100vw-3rem))]" /> : null}
      {previewLink ? <div className="mb-4 break-all rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{previewLink}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#386df4]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Members</div>
              <div className="text-2xl font-semibold text-slate-900">{memberRows.length}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eefbf5] p-3 text-[#1fa261]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Active</div>
              <div className="text-2xl font-semibold text-slate-900">{activeMembers}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#fff7e8] p-3 text-[#c68a16]">
              <MailPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Pending invites</div>
              <div className="text-2xl font-semibold text-slate-900">{inviteRows.length}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#f7f1ff] p-3 text-[#6b4fe0]">
              <UserRoundCog className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Admins / Managers</div>
              <div className="text-2xl font-semibold text-slate-900">{privilegedCount}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Members</h2>
              <div className="mt-1 text-sm text-slate-500">Internal users, invited teammates, and access controls in one place</div>
              {hierarchyMessage ? <div className="mt-2 text-sm text-slate-600">{hierarchyMessage}</div> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                disabled={!canInviteMembers || isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MailPlus className="h-4 w-4" />
                Invite member
              </button>
              <div className="relative min-w-[260px] lg:min-w-[320px]">
                <Search className={inputIconWrapperClassName} />
                <input ref={searchInputRef} className={inputWithIconClassName} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members or invites" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="overflow-x-auto">
            <table className="min-w-full w-full border border-slate-200 text-left text-sm" style={{ minWidth: "980px" }}>
              <thead className="bg-slate-50 text-slate-500">
                <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Member</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Email</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Role</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Status</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Added</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Activity</th>
                  <th className="px-3 py-3 text-right font-medium">Access controls</th>
                </tr>
              </thead>
              <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                {visibleMembers.length || visibleInvites.length ? (
                  <>
                    {visibleMembers.map((member) => {
                      const canEditMember = canManageWorkspaceMember(teamActor, {
                        id: member.id,
                        accessRole: member.accessRole,
                        isWorkspaceOwner: member.isWorkspaceOwner
                      });
                      const disableRoleSelect = isPending || !canEditMember || !assignableRoles.length;
                      const disableStatusSelect = isPending || !canEditMember;
                      const joinedLabel = formatDistanceToNow(new Date(member.createdAt), { addSuffix: true });
                      const activeLabel = member.lastActiveAt ? formatDistanceToNow(new Date(member.lastActiveAt), { addSuffix: true }) : "Not active yet";

                      return (
                        <tr key={member.id} className="text-slate-700 transition hover:bg-[#f8fbff]">
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <div className="flex min-w-[220px] items-center gap-3">
                              <UserAvatar
                                name={member.fullName}
                                imageUrl={member.avatarUrl}
                                className="h-8 w-8 text-xs"
                                fallbackClassName="bg-[linear-gradient(180deg,#f0f5ff,#dbe8ff)] text-[#386df4]"
                              />
                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="truncate font-medium text-slate-900">{member.fullName}</span>
                                  {member.id === currentUser.id ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">You</span> : null}
                                  {member.isWorkspaceOwner ? <span className="rounded-full bg-[#eef7ff] px-2.5 py-0.5 text-xs font-medium text-[#2757c7]">Workspace owner</span> : null}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <div className="max-w-[250px] truncate text-slate-600">{member.email}</div>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${roleTone(member.accessRole)}`}>
                              {getAccessRoleLabel(member.accessRole)}
                            </span>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusTone(member.status)}`}>
                              {getMemberStatusLabel(member.status)}
                            </span>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle text-slate-700">
                            <span className="whitespace-nowrap">{joinedLabel}</span>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle text-slate-700">
                            <span className="whitespace-nowrap">{activeLabel}</span>
                          </td>
                          <td className="px-3 py-4 align-middle">
                            {canEditMember ? (
                              <div className="ml-auto grid w-[360px] grid-cols-[1fr_1fr_auto] gap-2">
                                <AppSelect
                                  aria-label={`Role for ${member.fullName}`}
                                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                  value={member.accessRole}
                                  disabled={disableRoleSelect}
                                  onChange={(event) => runMemberUpdate(member.id, { accessRole: event.target.value }, "Member role updated.")}
                                >
                                  {assignableRoles.map((role) => (
                                    <option key={role} value={role}>
                                      {getAccessRoleLabel(role)}
                                    </option>
                                  ))}
                                </AppSelect>
                                <AppSelect
                                  aria-label={`Status for ${member.fullName}`}
                                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                  value={member.status}
                                  disabled={disableStatusSelect}
                                  onChange={(event) => runMemberUpdate(member.id, { status: event.target.value }, "Member status updated.")}
                                >
                                  {teamStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {getMemberStatusLabel(status)}
                                    </option>
                                  ))}
                                </AppSelect>
                                <button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => removeMember(member)}
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#ffd7ce] bg-white px-3 text-sm font-medium text-[#d25d37] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{getAccessRoleLabel(member.accessRole)}</span>
                                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{getMemberStatusLabel(member.status)}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {visibleInvites.map((invite) => {
                      const invitedLabel = formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true });
                      const expiresLabel = formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true });
                      const canManageInvite = canInviteTeamRole(teamActor, invite.accessRole);

                      return (
                        <tr key={`invite-${invite.id}`} className="text-slate-700 transition hover:bg-[#f8fbff]">
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <div className="flex min-w-[220px] items-center gap-3">
                              <UserAvatar
                                name={invite.fullName || invite.email}
                                className="h-8 w-8 text-xs"
                                fallbackClassName="bg-[linear-gradient(180deg,#fff8ed,#ffe6bc)] text-[#c68a16]"
                              />
                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="truncate font-medium text-slate-900">{invite.fullName || "Pending invite"}</span>
                                </div>
                                <div className="mt-1 text-xs text-slate-400">Invited by {invite.invitedBy.fullName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <div className="max-w-[250px] truncate text-slate-600">{invite.email}</div>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${roleTone(invite.accessRole)}`}>
                              {getAccessRoleLabel(invite.accessRole)}
                            </span>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle">
                            <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusTone("INVITED")}`}>Invited</span>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle text-slate-700">
                            <span className="whitespace-nowrap">{invitedLabel}</span>
                          </td>
                          <td className="border-r border-slate-200/80 px-3 py-4 align-middle text-slate-700">
                            <span className="whitespace-nowrap">Expires {expiresLabel}</span>
                          </td>
                          <td className="px-3 py-4 align-middle">
                            {canManage && canManageInvite ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isPending}
                                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  onClick={() => {
                                    setFeedback(null);
                                    setPreviewLink(null);
                                    startTransition(() => {
                                      void (async () => {
                                        try {
                                          const response = await fetch(`/api/team/invites/${invite.id}/resend`, { method: "POST" });
                                          const payload = (await response.json().catch(() => null)) as { error?: string; previewUrl?: string } | null;
                                          if (!response.ok) throw new Error(payload?.error || "Unable to resend invite");
                                          setFeedback("Invite resent.");
                                          setPreviewLink(payload?.previewUrl || null);
                                        } catch (error) {
                                          setFeedback(error instanceof Error ? error.message : "Unable to resend invite");
                                        }
                                      })();
                                    });
                                  }}
                                >
                                  Resend
                                </button>
                                <button
                                  type="button"
                                  disabled={isPending}
                                  className="h-9 rounded-lg border border-[#ffd7ce] bg-white px-3 text-sm font-medium text-[#d25d37] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:opacity-60"
                                  onClick={() => {
                                    startTransition(() => {
                                      void (async () => {
                                        const confirmed = await requestConfirmation({
                                          title: "Revoke invite?",
                                          description: `The pending invite for ${invite.email} will be cancelled immediately.`,
                                          confirmLabel: "Revoke invite",
                                          tone: "warning"
                                        });
                                        if (!confirmed) {
                                          return;
                                        }

                                        setFeedback(null);
                                        try {
                                          const response = await fetch(`/api/team/invites/${invite.id}`, { method: "DELETE" });
                                          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                                          if (!response.ok) throw new Error(payload?.error || "Unable to revoke invite");
                                          setInviteRows((current) => current.filter((item) => item.id !== invite.id));
                                          setFeedback("Invite revoked.");
                                        } catch (error) {
                                          setFeedback(error instanceof Error ? error.message : "Unable to revoke invite");
                                        }
                                      })();
                                    });
                                  }}
                                >
                                  Revoke
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{canManage ? "Owner required" : "Invited"}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                      {normalizedQuery ? "No members or invites match this search." : "No team members yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      {inviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
          <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">Invite member</h2>
                <p className="mt-1 text-sm text-slate-500">Invite an internal teammate with the right workspace access.</p>
              </div>
              <button type="button" aria-label="Close invite member modal" onClick={closeInviteModal} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MailPlus className="h-4 w-4 text-[#386df4]" />
                  Member Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Full name</label>
                    <div className="relative">
                      <User className={inputIconWrapperClassName} />
                      <input
                        className={inputWithIconClassName}
                        placeholder="e.g. Jane Doe"
                        value={inviteName}
                        onChange={(event) => setInviteName(event.target.value)}
                        disabled={!canInviteMembers || isSendingInvite}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Email address</label>
                    <div className="relative">
                      <Mail className={inputIconWrapperClassName} />
                      <input
                        type="email"
                        autoComplete="email"
                        className={inputWithIconClassName}
                        placeholder="email@company.com"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        disabled={!canInviteMembers || isSendingInvite}
                        aria-invalid={Boolean(inviteEmailError)}
                      />
                    </div>
                    {inviteEmailError ? <p className="mt-1.5 text-sm text-rose-600">{inviteEmailError}</p> : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Briefcase className="h-4 w-4 text-[#386df4]" />
                  Access Level
                </h3>
                <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Role</label>
                    <div className="relative">
                      <Briefcase className={`${inputIconWrapperClassName} z-10`} />
                      <AppSelect className={selectWithIconClassName} value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} disabled={!canInviteMembers || isSendingInvite}>
                        {assignableRoles.map((role) => (
                          <option key={role} value={role}>
                            {getAccessRoleLabel(role)}
                          </option>
                        ))}
                      </AppSelect>
                    </div>
                  </div>
                  <div className="self-end rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{roleDescription}</div>
                </div>
              </div>

              {!canInviteMembers ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">You can review members here, but this account cannot send new invites.</div> : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button type="button" onClick={closeInviteModal} disabled={isSendingInvite} className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button
                type="button"
                disabled={!canInviteMembers || isSendingInvite || !normalizedInviteEmail || Boolean(inviteEmailError)}
                onClick={sendInvite}
                aria-busy={isSendingInvite}
                className="h-12 min-w-[148px] rounded-2xl bg-[#386df4] px-4 text-sm font-semibold text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send invite"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {confirmationDialog}
    </div>
  );
}
