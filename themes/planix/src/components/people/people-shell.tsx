"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Camera, ChevronDown, Edit, Mail, MessageSquareMore, Plus, Search, SlidersHorizontal, Trash2, UserRound, Users } from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { CompanyLogo } from "@/components/clients/company-logo";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { AppLoader } from "@/components/ui/app-loader";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import type { ClientRecord } from "@/data/clients";
import type { TeamMemberRecord, WorkspaceProject } from "@/data/project-board";
import { useHydrated } from "@/lib/use-hydrated";
import { usePersistentState } from "@/lib/use-persistent-state";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import { readJsonSafely } from "@/lib/settings-client";
import {
  DEFAULT_WORKSPACE_TEAMS,
  buildMemberInitials,
  normalizeWorkspacePeopleMembers,
  normalizeWorkspaceTeams,
  type WorkspaceMemberRole,
  type WorkspacePeopleMember,
  type WorkspaceTeamRecord,
} from "@/lib/people";
import type { WorkspaceTrashItem } from "@/lib/trash";
import { pushWorkspaceActivity, useWorkspaceActivityFeed } from "@/lib/workspace-activity";
import { buildMessagesHref } from "@/lib/messages-navigation";
import { cn } from "@/lib/utils";
import type { AvatarTone } from "@/data/dashboard";

type PeopleTeam = WorkspaceTeamRecord;
type MemberRole = WorkspaceMemberRole;
type PeopleMember = WorkspacePeopleMember;
type ClientContactRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  company: string;
  website: string;
  logoUrl?: string;
  department?: string;
  location?: string;
  status: string;
};

type TeamFormState = {
  name: string;
  email: string;
};

type TeamVisibilityFilter = "all" | "with-members" | "empty";
type DeleteTarget =
  | { kind: "team"; team: PeopleTeam }
  | { kind: "member"; member: PeopleMember }
  | { kind: "bulk-teams" }
  | { kind: "bulk-members" };

type MemberFormState = {
  name: string;
  email: string;
  teamId: string;
  role: MemberRole;
  avatarTone: AvatarTone;
  avatarImage?: string;
};

const PEOPLE_TEAM_STORAGE_KEY = "planix.people.teams";
const PEOPLE_MEMBER_STORAGE_KEY = "planix.project.team-members";
const PEOPLE_PROJECTS_STORAGE_KEY = "planix.workspace.projects";
const MEMBER_AVATAR_MAX_SIZE = 2 * 1024 * 1024;
const ROLE_OPTIONS: MemberRole[] = ["Admin", "User", "Viewer"];
const AVATAR_TONES: AvatarTone[] = ["sand", "slate", "peach", "rose", "olive"];
const PEOPLE_CACHE_KEY = "planix.cache.people";
const PEOPLE_CACHE_MAX_AGE_MS = 1000 * 60 * 10;
const CLIENTS_CACHE_KEY = "planix.cache.clients";
const CLIENTS_CACHE_MAX_AGE_MS = 1000 * 60 * 10;

type PeopleCachePayload = {
  mode: Exclude<"loading" | "remote" | "demo" | "local", "loading">;
  teams: PeopleTeam[];
  members: PeopleMember[];
  projects: WorkspaceProject[];
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

const PEOPLE_ACTION_BUTTON_CLASS_NAME =
  "flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40";
const PEOPLE_ACTION_BUTTON_DANGER_CLASS_NAME =
  "flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--red)]/16 bg-[var(--red)]/10 text-[var(--red)] transition hover:bg-[var(--red)]/16 hover:text-[var(--red)]";
const PEOPLE_ACTION_ICON_CLASS_NAME = "h-4 w-4";

function getRandomAvatarTone() {
  return AVATAR_TONES[Math.floor(Math.random() * AVATAR_TONES.length)] ?? "sand";
}

function normalizeClientContacts(clients: ClientRecord[]) {
  const seen = new Set<string>();

  return clients.flatMap<ClientContactRow>((client) => {
    const rows: ClientContactRow[] = [];

    const pushRow = (candidate: Omit<ClientContactRow, "id">, keySeed: string) => {
      const normalizedEmail = candidate.email.trim().toLowerCase();
      const dedupeKey = normalizedEmail || `${client.id}:${keySeed.toLowerCase()}`;

      if (!candidate.name.trim() || seen.has(dedupeKey)) {
        return;
      }

      seen.add(dedupeKey);
      rows.push({
        id: `${client.id}:${keySeed}`,
        ...candidate,
      });
    };

    pushRow({
      name: client.contactName,
      role: client.contactRole || "Primary Contact",
      email: client.email,
      company: client.company,
      website: client.website,
      logoUrl: client.logoUrl,
      location: client.location,
      status: client.stage,
    }, "primary");

    (client.employees ?? []).forEach((employee, index) => {
      pushRow({
        name: employee.name ?? "",
        role: employee.role?.trim() || "Client Team",
        email: employee.email?.trim() || "",
        company: client.company,
        website: client.website,
        logoUrl: client.logoUrl,
        department: employee.department?.trim() || "",
        location: employee.location?.trim() || client.location,
        status: employee.status === "active"
          ? "Active"
          : employee.status === "review"
            ? "Needs review"
            : employee.status === "offline"
              ? "Offline"
              : "Client Team",
      }, `employee-${employee.id?.trim() || index + 1}`);
    });

    return rows;
  });
}

function canOpenMemberChat(member: Pick<PeopleMember, "email" | "lastActive">) {
  return Boolean(member.email.trim()) && member.lastActive !== "Invitation sent";
}

function teamFormFromRecord(team: PeopleTeam | null): TeamFormState {
  return {
    name: team?.name ?? "",
    email: team?.email ?? "",
  };
}

function memberFormFromRecord(member: PeopleMember | null, fallbackTeamId: string): MemberFormState {
  return {
    name: member?.name ?? "",
    email: member?.email ?? "",
    teamId: member?.teamId ?? fallbackTeamId,
    role: member?.role ?? "User",
    avatarTone: member?.avatarTone ?? getRandomAvatarTone(),
    avatarImage: member?.avatarImage,
  };
}

function TeamModal({
  open,
  mode,
  team,
  existingTeams,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  team: PeopleTeam | null;
  existingTeams: PeopleTeam[];
  onClose: () => void;
  onSubmit: (payload: TeamFormState) => void;
}) {
  const [form, setForm] = useState<TeamFormState>(() => teamFormFromRecord(team));
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(teamFormFromRecord(team));
    setNameError("");
    setEmailError("");
  }, [open, team]);

  if (!open) {
    return null;
  }

  const currentTeamId = team?.id;

  function handleSubmit() {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    const duplicateName = existingTeams.some(
      (existingTeam) =>
        existingTeam.id !== currentTeamId
        && existingTeam.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    const duplicateEmail = existingTeams.some(
      (existingTeam) =>
        existingTeam.id !== currentTeamId
        && existingTeam.email.trim().toLowerCase() === trimmedEmail.toLowerCase(),
    );

    let nextNameError = "";
    let nextEmailError = "";

    if (!trimmedName) {
      nextNameError = "Team name is required.";
    } else if (duplicateName) {
      nextNameError = "A team with this name already exists.";
    }

    if (!trimmedEmail) {
      nextEmailError = "Team email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextEmailError = "Enter a valid team email address.";
    } else if (duplicateEmail) {
      nextEmailError = "A team with this email already exists.";
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);

    if (nextNameError || nextEmailError) {
      return;
    }

    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
    });
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close team modal" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <Users className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">
          {mode === "create" ? "Create New Team" : "Edit Team"}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {mode === "create"
            ? "Create a team with a unique name and contact email."
            : "Update team details without affecting member assignments."}
        </p>

        <div className="mt-7 space-y-4">
          <div className="rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-5 py-4">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Team Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                if (nameError) {
                  setNameError("");
                }
              }}
              placeholder="Enter your team name"
              className={cn(
                "mt-3 w-full rounded-[var(--radius-lg)] border bg-transparent px-0 py-0 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
                nameError ? "border-[var(--red)]/35" : "border-transparent",
              )}
              autoFocus
            />
            {nameError && <p className="mt-2 text-[12px] text-[var(--red)]">{nameError}</p>}
          </div>

          <div className="rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-5 py-4">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Team Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                if (emailError) {
                  setEmailError("");
                }
              }}
              placeholder="team@company.com"
              className={cn(
                "mt-3 w-full rounded-[var(--radius-lg)] border bg-transparent px-0 py-0 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
                emailError ? "border-[var(--red)]/35" : "border-transparent",
              )}
            />
            {emailError && <p className="mt-2 text-[12px] text-[var(--red)]">{emailError}</p>}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
          >
            {mode === "create" ? "Create Team" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberModal({
  open,
  mode,
  member,
  teams,
  existingMembers,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  member: PeopleMember | null;
  teams: PeopleTeam[];
  existingMembers: PeopleMember[];
  onClose: () => void;
  onSubmit: (payload: MemberFormState) => void;
}) {
  const fallbackTeamId = teams[0]?.id ?? "";
  const [form, setForm] = useState<MemberFormState>(() => memberFormFromRecord(member, fallbackTeamId));
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(memberFormFromRecord(member, fallbackTeamId));
    setNameError("");
    setEmailError("");
    setTeamError("");
    setAvatarError("");
  }, [fallbackTeamId, member, open]);

  if (!open) {
    return null;
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Upload a valid image file.");
      return;
    }

    if (file.size > MEMBER_AVATAR_MAX_SIZE) {
      setAvatarError("Image size should be under 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageResult = reader.result;

      if (typeof imageResult !== "string") {
        setAvatarError("Could not read the selected image.");
        return;
      }

      setForm((current) => ({ ...current, avatarImage: imageResult }));
      setAvatarError("");
    };

    reader.onerror = () => {
      setAvatarError("Could not read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const duplicateEmail = existingMembers.some(
      (existingMember) =>
        existingMember.id !== member?.id
        && existingMember.email.trim().toLowerCase() === trimmedEmail.toLowerCase(),
    );

    let nextNameError = "";
    let nextEmailError = "";
    let nextTeamError = "";

    if (!trimmedName) {
      nextNameError = "Full name is required.";
    }

    if (!trimmedEmail) {
      nextEmailError = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextEmailError = "Enter a valid email address.";
    } else if (duplicateEmail) {
      nextEmailError = "Another member already uses this email.";
    }

    if (!form.teamId) {
      nextTeamError = "Assign a team to this member.";
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setTeamError(nextTeamError);

    if (nextNameError || nextEmailError || nextTeamError || avatarError) {
      return;
    }

    onSubmit({
      ...form,
      name: trimmedName,
      email: trimmedEmail,
    });
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div className="modal-surface modal-surface-scroll max-w-[560px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close member modal" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <UserRound className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">
          {mode === "create" ? "Add New Member" : "Edit Member"}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {mode === "create"
            ? "Add a member with a team assignment, role, and optional display photo."
            : "Update member details, team assignment, role, and avatar in one place."}
        </p>

        <div className="mt-6 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Avatar
                initials={buildMemberInitials(form.name)}
                tone={form.avatarTone}
                imageSrc={form.avatarImage}
                size="lg"
                shape="full"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Display Photo</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">Upload JPG, PNG, or WEBP up to 2 MB.</p>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-white/[0.07]">
                <Camera className="h-4 w-4 text-[var(--accent)]" />
                Upload Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              {form.avatarImage && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({ ...current, avatarImage: undefined }));
                    setAvatarError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.07] hover:text-[var(--text-primary)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {avatarError && <p className="mt-3 text-[12px] text-[var(--red)]">{avatarError}</p>}

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Full Name</p>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                if (nameError) {
                  setNameError("");
                }
              }}
              placeholder="e.g. Alex Carter"
              className={cn(
                "mt-2 w-full rounded-[var(--radius-lg)] border bg-white/[0.03] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
                nameError ? "border-[var(--red)]/35" : "border-white/8",
              )}
            />
            {nameError && <p className="mt-2 text-[12px] text-[var(--red)]">{nameError}</p>}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Email Address</p>
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                if (emailError) {
                  setEmailError("");
                }
              }}
              placeholder="alex@company.com"
              className={cn(
                "mt-2 w-full rounded-[var(--radius-lg)] border bg-white/[0.03] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
                emailError ? "border-[var(--red)]/35" : "border-white/8",
              )}
            />
            {emailError && <p className="mt-2 text-[12px] text-[var(--red)]">{emailError}</p>}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Team</p>
            <div className="relative mt-2">
              <select
                value={form.teamId}
                onChange={(event) => {
                  setForm((current) => ({ ...current, teamId: event.target.value }));
                  if (teamError) {
                    setTeamError("");
                  }
                }}
                className={cn(
                  "w-full appearance-none rounded-[var(--radius-lg)] border bg-white/[0.03] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] outline-none",
                  teamError ? "border-[var(--red)]/35" : "border-white/8",
                )}
              >
                <option value="" className="bg-[#1C1C1E] text-white">Select team</option>
                {teams.map((teamRecord) => (
                  <option key={teamRecord.id} value={teamRecord.id} className="bg-[#1C1C1E] text-white">
                    {teamRecord.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
            {teamError && <p className="mt-2 text-[12px] text-[var(--red)]">{teamError}</p>}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Role</p>
            <div className="relative mt-2">
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as MemberRole }))}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] outline-none"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role} className="bg-[#1C1C1E] text-white">
                    {role}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
          >
            {mode === "create" ? "Add Member" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function PeopleShell() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [, setWorkspaceActivity] = useWorkspaceActivityFeed();
  const cachedPeople = readMemoryCache<PeopleCachePayload>(PEOPLE_CACHE_KEY, PEOPLE_CACHE_MAX_AGE_MS);
  const cachedClients = readMemoryCache<ClientRecord[]>(CLIENTS_CACHE_KEY, CLIENTS_CACHE_MAX_AGE_MS);
  const [teams, setTeams] = usePersistentState<PeopleTeam[]>(
    PEOPLE_TEAM_STORAGE_KEY,
    cachedPeople?.teams ?? DEFAULT_WORKSPACE_TEAMS,
  );
  const [members, setMembers] = usePersistentState<PeopleMember[]>(
    PEOPLE_MEMBER_STORAGE_KEY,
    cachedPeople?.members ?? normalizeWorkspacePeopleMembers([], DEFAULT_WORKSPACE_TEAMS),
  );
  const [projects, setProjects] = usePersistentState<WorkspaceProject[]>(
    PEOPLE_PROJECTS_STORAGE_KEY,
    cachedPeople?.projects ?? [],
  );
  const [peopleMode, setPeopleMode] = useState<"loading" | "remote" | "demo" | "local">(cachedPeople?.mode ?? "loading");
  const [clients, setClients] = useState<ClientRecord[]>(cachedClients ?? []);
  const [teamSearch, setTeamSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<TeamVisibilityFilter>("all");
  const [memberRoleFilter, setMemberRoleFilter] = useState<MemberRole | "all">("all");
  const [memberTeamFilter, setMemberTeamFilter] = useState<string>("all");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [teamModalMode, setTeamModalMode] = useState<"create" | "edit">("create");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<PeopleTeam | null>(null);
  const [memberModalMode, setMemberModalMode] = useState<"create" | "edit">("create");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PeopleMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteBlockError, setDeleteBlockError] = useState("");
  const teamsRef = useRef(teams);
  const membersRef = useRef(members);
  const projectsRef = useRef(projects);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    if (!deleteBlockError) {
      return;
    }

    const timer = window.setTimeout(() => setDeleteBlockError(""), 3500);
    return () => window.clearTimeout(timer);
  }, [deleteBlockError]);

  useEffect(() => {
    if (peopleMode === "loading") {
      return;
    }

    writeMemoryCache<PeopleCachePayload>(PEOPLE_CACHE_KEY, {
      mode: peopleMode,
      teams,
      members,
      projects,
    });
  }, [members, peopleMode, projects, teams]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const normalizedTeams = normalizeWorkspaceTeams(teams);
    const teamsChanged = normalizedTeams.length !== teams.length
      || normalizedTeams.some((team, index) => {
        const current = teams[index];
        return !current
          || current.id !== team.id
          || current.name !== team.name
          || current.email !== team.email
          || current.createdAt !== team.createdAt;
      });

    if (teamsChanged) {
      teamsRef.current = normalizedTeams;
      setTeams(normalizedTeams);
    }
  }, [hydrated, setTeams, teams]);

  useEffect(() => {
    setMembers((currentMembers) => normalizeWorkspacePeopleMembers(currentMembers as TeamMemberRecord[], teams));
  }, [setMembers, teams]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadPeopleWorkspace() {
      try {
        const response = await fetch("/api/people", {
          cache: "no-store",
        });
        const result = await readJsonSafely<{
          bundle?: {
            teams: PeopleTeam[];
            members: PeopleMember[];
            projects: WorkspaceProject[];
          };
          mode?: "remote" | "demo";
          error?: string;
        }>(response);

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load people workspace.");
        }

        if (cancelled) {
          return;
        }

        if (result?.mode === "remote" && result.bundle) {
          const nextTeams = result.bundle.teams;
          const nextMembers = normalizeWorkspacePeopleMembers(result.bundle.members, nextTeams);
          teamsRef.current = nextTeams;
          membersRef.current = nextMembers;
          projectsRef.current = result.bundle.projects;
          setTeams(nextTeams);
          setMembers(nextMembers);
          setProjects(result.bundle.projects);
          setPeopleMode("remote");
          return;
        }

        setPeopleMode(result?.mode === "demo" ? "demo" : "local");
      } catch {
        if (!cancelled) {
          setPeopleMode("local");
        }
      }
    }

    void loadPeopleWorkspace();

    return () => {
      cancelled = true;
    };
  }, [hydrated, setMembers, setProjects, setTeams]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadClients() {
      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const result = await readJsonSafely<{ clients?: ClientRecord[]; error?: string }>(response);

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load clients.");
        }

        if (!cancelled) {
          setClients(Array.isArray(result?.clients) ? result.clients : []);
        }
      } catch {
        if (!cancelled) {
          setClients(cachedClients ?? []);
        }
      }
    }

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, [cachedClients, hydrated]);

  const teamsWithCounts = useMemo(
    () =>
      teams.map((team) => ({
        ...team,
        memberCount: members.filter((member) => member.teamId === team.id).length,
      })),
    [members, teams],
  );

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase();

    return teamsWithCounts.filter((team) => {
      if (teamFilter === "with-members" && team.memberCount === 0) {
        return false;
      }

      if (teamFilter === "empty" && team.memberCount > 0) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        team.name.toLowerCase().includes(query)
        || team.email.toLowerCase().includes(query)
        || team.createdAt.toLowerCase().includes(query)
      );
    });
  }, [teamFilter, teamSearch, teamsWithCounts]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    return members.filter((member) => {
      const memberTeam = teams.find((team) => team.id === member.teamId);

      if (memberRoleFilter !== "all" && member.role !== memberRoleFilter) {
        return false;
      }

      if (memberTeamFilter !== "all" && member.teamId !== memberTeamFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        member.name.toLowerCase().includes(query)
        || member.email.toLowerCase().includes(query)
        || member.role.toLowerCase().includes(query)
        || member.dateAdded.toLowerCase().includes(query)
        || (memberTeam?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [memberRoleFilter, memberSearch, memberTeamFilter, members, teams]);

  const clientContacts = useMemo(() => normalizeClientContacts(clients), [clients]);

  const filteredClientContacts = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    return clientContacts.filter((contact) => {
      if (!query) {
        return true;
      }

      return (
        contact.name.toLowerCase().includes(query)
        || contact.email.toLowerCase().includes(query)
        || contact.company.toLowerCase().includes(query)
        || contact.role.toLowerCase().includes(query)
        || (contact.department?.toLowerCase().includes(query) ?? false)
        || (contact.location?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [clientContacts, clientSearch]);

  const allFilteredTeamIds = filteredTeams.map((team) => team.id);
  const allFilteredMemberIds = filteredMembers.map((member) => member.id);
  const teamsSelectionAll = allFilteredTeamIds.length > 0 && allFilteredTeamIds.every((teamId) => selectedTeamIds.includes(teamId));
  const membersSelectionAll = allFilteredMemberIds.length > 0 && allFilteredMemberIds.every((memberId) => selectedMemberIds.includes(memberId));

  function persistPeopleWorkspace(nextState: {
    teams: PeopleTeam[];
    members: PeopleMember[];
    projects: WorkspaceProject[];
  }) {
    if (peopleMode !== "remote") {
      return Promise.resolve(null);
    }

    return fetch("/api/people", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(nextState),
    }).then(async (response) => {
      const result = await readJsonSafely<{
        bundle?: {
          teams: PeopleTeam[];
          members: PeopleMember[];
          projects: WorkspaceProject[];
        };
        error?: string;
      }>(response);

      if (!response.ok || !result?.bundle) {
        throw new Error(result?.error || "People workspace update failed.");
      }

      const nextTeams = result.bundle.teams;
      const nextMembers = normalizeWorkspacePeopleMembers(result.bundle.members, nextTeams);
      teamsRef.current = nextTeams;
      membersRef.current = nextMembers;
      projectsRef.current = result.bundle.projects;
      setTeams(nextTeams);
      setMembers(nextMembers);
      setProjects(result.bundle.projects);
      return result.bundle;
    });
  }

  function persistTrashItems(items: Array<{
    itemType: WorkspaceTrashItem["itemType"];
    itemKey: string;
    itemLabel: string;
    summary?: string;
    payload: WorkspaceTrashItem["payload"];
  }>) {
    if (peopleMode !== "remote" || items.length === 0) {
      return Promise.resolve(null);
    }

    return fetch("/api/settings/trash", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ items }),
    }).then(async (response) => {
      const result = await readJsonSafely<{ ok?: boolean; error?: string }>(response);

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Failed to update trash.");
      }
    });
  }

  function assignmentMatchesMember(
    assignment: NonNullable<WorkspaceProject["members"]>[number],
    member: Pick<PeopleMember, "name" | "email">,
  ) {
    return (
      (assignment.email?.trim().toLowerCase() || "") === member.email.trim().toLowerCase()
      || assignment.name.trim().toLowerCase() === member.name.trim().toLowerCase()
    );
  }

  function updateProjectsForMember(
    currentProjects: WorkspaceProject[],
    previousMember: Pick<PeopleMember, "name" | "email">,
    nextMember?: PeopleMember | null,
  ) {
    return currentProjects.map((project) => ({
      ...project,
      members: (project.members ?? [])
        .map((assignment) => {
          if (!assignmentMatchesMember(assignment, previousMember)) {
            return assignment;
          }

          if (!nextMember) {
            return null;
          }

          const assignedTeam = teamsRef.current.find((team) => team.id === nextMember.teamId);

          return {
            ...assignment,
            name: nextMember.name,
            email: nextMember.email,
            teamId: nextMember.teamId,
            team: assignedTeam?.name ?? assignment.team,
          };
        })
        .filter((assignment): assignment is NonNullable<WorkspaceProject["members"]>[number] => Boolean(assignment)),
    }));
  }

  function buildMemberAssignmentsSnapshot(
    currentProjects: WorkspaceProject[],
    member: Pick<PeopleMember, "name" | "email">,
  ) {
    return currentProjects
      .filter((project) => (project.members ?? []).some((assignment) => assignmentMatchesMember(assignment, member)))
      .map((project) => ({
        projectId: project.id,
        members: (project.members ?? []).map((assignment) => ({ ...assignment })),
      }));
  }

  function openCreateTeamModal() {
    setTeamModalMode("create");
    setEditingTeam(null);
    setTeamModalOpen(true);
  }

  function openEditTeamModal(team: PeopleTeam) {
    setTeamModalMode("edit");
    setEditingTeam(team);
    setTeamModalOpen(true);
  }

  function openCreateMemberModal() {
    setMemberModalMode("create");
    setEditingMember(null);
    setMemberModalOpen(true);
  }

  function openEditMemberModal(member: PeopleMember) {
    setMemberModalMode("edit");
    setEditingMember(member);
    setMemberModalOpen(true);
  }

  function openMemberChat(member: PeopleMember) {
    if (!canOpenMemberChat(member)) {
      return;
    }

    router.push(buildMessagesHref({
      id: isUuid(member.id) ? member.id : undefined,
      email: member.email,
      name: member.name,
    }));
  }

  function handleTeamSubmit(payload: TeamFormState) {
    const previousTeams = teamsRef.current;
    const previousMembers = membersRef.current;
    const previousProjects = projectsRef.current;

    if (teamModalMode === "create") {
      const nextTeam: PeopleTeam = {
        id: `team-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        createdAt: formatDateLabel(),
      };

      const nextTeams = [nextTeam, ...previousTeams];
      teamsRef.current = nextTeams;
      setTeams(nextTeams);
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: nextTeam.name,
          initials: buildMemberInitials(nextTeam.name),
          tone: "sand",
          status: "online",
          action: "Created a new team",
          detail: nextTeam.email,
        }),
      );

      if (peopleMode === "remote") {
        void persistPeopleWorkspace({
          teams: nextTeams,
          members: previousMembers,
          projects: previousProjects,
        }).catch((error) => {
          console.error("Failed to create team:", error);
          teamsRef.current = previousTeams;
          setTeams(previousTeams);
        });
      }
    } else if (editingTeam) {
      const nextTeams = previousTeams.map((team) =>
        team.id === editingTeam.id
          ? { ...team, name: payload.name, email: payload.email }
          : team,
      );
      const affectedMembers = previousMembers.filter((member) => member.teamId === editingTeam.id);
      const nextProjects = affectedMembers.length > 0
        ? previousProjects.map((project) => ({
          ...project,
          members: (project.members ?? []).map((assignment) => {
            const matchingMember = affectedMembers.find((member) => assignmentMatchesMember(assignment, member));

            return matchingMember
              ? {
                  ...assignment,
                  team: payload.name,
                }
              : assignment;
          }),
        }))
        : previousProjects;

      teamsRef.current = nextTeams;
      projectsRef.current = nextProjects;
      setTeams(nextTeams);
      setProjects(nextProjects);
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: payload.name,
          initials: buildMemberInitials(payload.name),
          tone: "sand",
          status: "neutral",
          action: "Updated team details",
          detail: payload.email,
        }),
      );

      if (peopleMode === "remote") {
        void persistPeopleWorkspace({
          teams: nextTeams,
          members: previousMembers,
          projects: nextProjects,
        }).catch((error) => {
          console.error("Failed to update team:", error);
          teamsRef.current = previousTeams;
          projectsRef.current = previousProjects;
          setTeams(previousTeams);
          setProjects(previousProjects);
        });
      }
    }

    setTeamModalOpen(false);
    setEditingTeam(null);
  }

  function handleMemberSubmit(payload: MemberFormState) {
    const assignedTeam = teams.find((team) => team.id === payload.teamId);
    const previousMembers = membersRef.current;
    const previousProjects = projectsRef.current;
    const previousMember = editingMember;

    if (memberModalMode === "create") {
      const nextMember: PeopleMember = {
        id: `people-member-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        avatarInitials: buildMemberInitials(payload.name),
        teamId: payload.teamId,
        role: payload.role,
        dateAdded: formatDateLabel(),
        avatarTone: payload.avatarTone,
        avatarImage: payload.avatarImage,
        lastActive: "Invitation sent",
      };

      const nextMembers = [nextMember, ...previousMembers];
      membersRef.current = nextMembers;
      setMembers(nextMembers);
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: nextMember.name,
          initials: buildMemberInitials(nextMember.name),
          tone: nextMember.avatarTone,
          status: "online",
          action: `Added to ${assignedTeam?.name ?? "the workspace"}`,
          detail: nextMember.role,
        }),
      );

      if (peopleMode === "remote") {
        void persistPeopleWorkspace({
          teams: teamsRef.current,
          members: nextMembers,
          projects: previousProjects,
        }).catch((error) => {
          console.error("Failed to create member:", error);
          membersRef.current = previousMembers;
          setMembers(previousMembers);
        });
      }
    } else if (editingMember) {
      const nextMember: PeopleMember = {
        ...editingMember,
        name: payload.name,
        email: payload.email,
        avatarInitials: buildMemberInitials(payload.name),
        teamId: payload.teamId,
        role: payload.role,
        avatarTone: payload.avatarTone,
        avatarImage: payload.avatarImage,
        lastActive: editingMember.lastActive === "Invitation sent" ? editingMember.lastActive : "Updated just now",
      };
      const nextMembers = previousMembers.map((member) =>
        member.id === editingMember.id
          ? nextMember
          : member,
      );
      const nextProjects = previousMember
        ? updateProjectsForMember(previousProjects, previousMember, nextMember)
        : previousProjects;

      membersRef.current = nextMembers;
      projectsRef.current = nextProjects;
      setMembers(nextMembers);
      setProjects(nextProjects);
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: payload.name,
          initials: buildMemberInitials(payload.name),
          tone: payload.avatarTone,
          status: "neutral",
          action: "Updated member profile",
          detail: `${assignedTeam?.name ?? "No team"} · ${payload.role}`,
        }),
      );

      if (peopleMode === "remote") {
        void persistPeopleWorkspace({
          teams: teamsRef.current,
          members: nextMembers,
          projects: nextProjects,
        }).catch((error) => {
          console.error("Failed to update member:", error);
          membersRef.current = previousMembers;
          projectsRef.current = previousProjects;
          setMembers(previousMembers);
          setProjects(previousProjects);
        });
      }
    }

    setMemberModalOpen(false);
    setEditingMember(null);
  }

  async function handleDeleteTeam(teamId: string) {
    const assignedMembers = membersRef.current.filter((member) => member.teamId === teamId);
    const teamToDelete = teamsRef.current.find((team) => team.id === teamId);

    if (assignedMembers.length > 0) {
      return;
    }

    const previousTeams = teamsRef.current;
    const nextTeams = previousTeams.filter((team) => team.id !== teamId);
    teamsRef.current = nextTeams;
    setTeams(nextTeams);
    setSelectedTeamIds((current) => current.filter((id) => id !== teamId));
    if (teamToDelete) {
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: teamToDelete.name,
          initials: buildMemberInitials(teamToDelete.name),
          tone: "rose",
          status: "neutral",
          action: "Removed from workspace teams",
          detail: teamToDelete.email,
        }),
      );
    }

    if (peopleMode === "remote") {
      try {
        await persistPeopleWorkspace({
          teams: nextTeams,
          members: membersRef.current,
          projects: projectsRef.current,
        });

        if (teamToDelete) {
          await persistTrashItems([{
            itemType: "team",
            itemKey: teamToDelete.id,
            itemLabel: teamToDelete.name,
            summary: teamToDelete.email,
            payload: {
              kind: "team",
              team: teamToDelete,
            },
          }]);
        }
      } catch (error) {
        console.error("Failed to delete team:", error);
        teamsRef.current = previousTeams;
        setTeams(previousTeams);
      }
    }
    setDeleteTarget(null);
  }

  async function handleDeleteMember(memberId: string) {
    const previousMembers = membersRef.current;
    const previousProjects = projectsRef.current;
    const memberToDelete = previousMembers.find((member) => member.id === memberId);
    const nextMembers = previousMembers.filter((member) => member.id !== memberId);
    const nextProjects = memberToDelete ? updateProjectsForMember(previousProjects, memberToDelete, null) : previousProjects;
    const memberAssignments = memberToDelete ? buildMemberAssignmentsSnapshot(previousProjects, memberToDelete) : [];

    membersRef.current = nextMembers;
    projectsRef.current = nextProjects;
    setMembers(nextMembers);
    setProjects(nextProjects);
    setSelectedMemberIds((current) => current.filter((id) => id !== memberId));
    if (memberToDelete) {
      const memberTeam = teamsRef.current.find((team) => team.id === memberToDelete.teamId);
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: memberToDelete.name,
          initials: buildMemberInitials(memberToDelete.name),
          tone: memberToDelete.avatarTone,
          status: "neutral",
          action: "Removed from workspace members",
          detail: memberTeam?.name,
        }),
      );
    }

    if (peopleMode === "remote") {
      try {
        await persistPeopleWorkspace({
          teams: teamsRef.current,
          members: nextMembers,
          projects: nextProjects,
        });

        if (memberToDelete) {
          await persistTrashItems([{
            itemType: "member",
            itemKey: memberToDelete.id,
            itemLabel: memberToDelete.name,
            summary: memberToDelete.email,
            payload: {
              kind: "member",
              member: memberToDelete,
              assignments: memberAssignments,
            },
          }]);
        }
      } catch (error) {
        console.error("Failed to delete member:", error);
        membersRef.current = previousMembers;
        projectsRef.current = previousProjects;
        setMembers(previousMembers);
        setProjects(previousProjects);
      }
    }
    setDeleteTarget(null);
  }

  function toggleTeamSelection(teamId: string) {
    setSelectedTeamIds((current) =>
      current.includes(teamId)
        ? current.filter((id) => id !== teamId)
        : [...current, teamId],
    );
  }

  function toggleMemberSelection(memberId: string) {
    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  function toggleAllTeams() {
    setSelectedTeamIds((current) =>
      teamsSelectionAll
        ? current.filter((id) => !allFilteredTeamIds.includes(id))
        : Array.from(new Set([...current, ...allFilteredTeamIds])),
    );
  }

  function toggleAllMembers() {
    setSelectedMemberIds((current) =>
      membersSelectionAll
        ? current.filter((id) => !allFilteredMemberIds.includes(id))
        : Array.from(new Set([...current, ...allFilteredMemberIds])),
    );
  }

  async function handleDeleteSelectedTeams() {
    const selectedTeams = teamsRef.current.filter((team) => selectedTeamIds.includes(team.id));
    const blockedTeam = selectedTeams.find((team) => membersRef.current.some((member) => member.teamId === team.id));

    if (blockedTeam) {
      return;
    }

    const previousTeams = teamsRef.current;
    const nextTeams = previousTeams.filter((team) => !selectedTeamIds.includes(team.id));
    teamsRef.current = nextTeams;
    setTeams(nextTeams);
    if (selectedTeams.length > 0) {
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "People",
          initials: "PP",
          tone: "rose",
          status: "neutral",
          action: `Deleted ${selectedTeams.length} team${selectedTeams.length === 1 ? "" : "s"}`,
          detail: selectedTeams.map((team) => team.name).join(", "),
        }),
      );
    }
    setSelectedTeamIds([]);

    if (peopleMode === "remote") {
      try {
        await persistPeopleWorkspace({
          teams: nextTeams,
          members: membersRef.current,
          projects: projectsRef.current,
        });

        await persistTrashItems(selectedTeams.map((team) => ({
          itemType: "team" as const,
          itemKey: team.id,
          itemLabel: team.name,
          summary: team.email,
          payload: {
            kind: "team" as const,
            team,
          },
        })));
      } catch (error) {
        console.error("Failed to delete teams:", error);
        teamsRef.current = previousTeams;
        setTeams(previousTeams);
      }
    }
    setDeleteTarget(null);
  }

  async function handleDeleteSelectedMembers() {
    const previousMembers = membersRef.current;
    const previousProjects = projectsRef.current;
    const removedMembers = previousMembers.filter((member) => selectedMemberIds.includes(member.id));
    const nextMembers = previousMembers.filter((member) => !selectedMemberIds.includes(member.id));
    const nextProjects = removedMembers.reduce(
      (currentProjects, member) => updateProjectsForMember(currentProjects, member, null),
      previousProjects,
    );

    membersRef.current = nextMembers;
    projectsRef.current = nextProjects;
    setMembers(nextMembers);
    setProjects(nextProjects);
    if (removedMembers.length > 0) {
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "People",
          initials: "PP",
          tone: "rose",
          status: "neutral",
          action: `Removed ${removedMembers.length} member${removedMembers.length === 1 ? "" : "s"}`,
          detail: removedMembers.map((member) => member.name).join(", "),
        }),
      );
    }
    setSelectedMemberIds([]);

    if (peopleMode === "remote") {
      try {
        await persistPeopleWorkspace({
          teams: teamsRef.current,
          members: nextMembers,
          projects: nextProjects,
        });

        await persistTrashItems(removedMembers.map((member) => ({
          itemType: "member" as const,
          itemKey: member.id,
          itemLabel: member.name,
          summary: member.email,
          payload: {
            kind: "member" as const,
            member,
            assignments: buildMemberAssignmentsSnapshot(previousProjects, member),
          },
        })));
      } catch (error) {
        console.error("Failed to delete members:", error);
        membersRef.current = previousMembers;
        projectsRef.current = previousProjects;
        setMembers(previousMembers);
        setProjects(previousProjects);
      }
    }
    setDeleteTarget(null);
  }

  if (!hydrated || peopleMode === "loading") {
    return (
      <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
        <div className="flex w-full flex-col lg:h-full lg:flex-row">
          <PrimarySidebar />
          <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
            <AppLoader
              fullscreen={false}
              compact
              label="Loading people workspace"
              detail="Preparing your latest teams and members"
              className="min-h-[calc(100vh-8rem)] w-full rounded-none border-0 lg:min-h-full"
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="type-page-title tracking-tight text-white">People</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <div className="w-full">
                <div className="mb-10">
                  <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Teams</h2>
                      <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
                        Create, edit, and organize your workspace teams from one place.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          value={teamSearch}
                          onChange={(event) => setTeamSearch(event.target.value)}
                          placeholder="Search teams"
                          className="w-[220px] border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                      <div className="relative">
                        <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <select
                          value={teamFilter}
                          onChange={(event) => setTeamFilter(event.target.value as TeamVisibilityFilter)}
                          className="appearance-none rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] py-3 pl-11 pr-10 text-sm text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--accent)]/40"
                        >
                          <option value="all" className="bg-[#1C1C1E] text-white">All teams</option>
                          <option value="with-members" className="bg-[#1C1C1E] text-white">With members</option>
                          <option value="empty" className="bg-[#1C1C1E] text-white">Empty teams</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>
                      <button
                        type="button"
                        onClick={openCreateTeamModal}
                        className="btn-base btn-primary type-ui shrink-0 flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 font-semibold"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        Create New Team
                      </button>
                    </div>
                  </div>

                  {deleteBlockError && (
                    <div className="mb-3 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/8 px-4 py-3 text-sm text-[var(--red)]">
                      {deleteBlockError}
                    </div>
                  )}

                  <div className="table-surface overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
                    {selectedTeamIds.length > 0 && (
                      <div className="flex items-center justify-between gap-4 border-b border-white/6 bg-[var(--accent)]/8 px-6 py-3">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {selectedTeamIds.length} team{selectedTeamIds.length === 1 ? "" : "s"} selected
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedTeamIds([])}
                            className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                          >
                            Clear selection
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const blockedTeam = teams
                                .filter((team) => selectedTeamIds.includes(team.id))
                                .find((team) => members.some((m) => m.teamId === team.id));
                              if (blockedTeam) {
                                setDeleteBlockError(`"${blockedTeam.name}" has members assigned. Reassign or remove them first.`);
                                return;
                              }
                              setDeleteTarget({ kind: "bulk-teams" });
                            }}
                            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-3 py-2 text-sm font-medium text-[var(--red)] transition hover:bg-[var(--red)]/16"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete selected
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="table-header-surface flex items-center gap-4 border-b border-white/5 px-6 py-4">
                      <div className="flex w-5 justify-center">
                        <input
                          type="checkbox"
                          checked={teamsSelectionAll}
                          onChange={toggleAllTeams}
                          className="table-checkbox"
                          aria-label="Select all teams"
                        />
                      </div>
                      <div className="min-w-[200px] flex-1 pl-2 text-sm font-medium tracking-wide text-[var(--text-primary)]">Name</div>
                      <div className="w-40 text-left text-sm font-medium tracking-wide text-[var(--text-primary)]">Creation Date</div>
                      <div className="w-32 text-left text-sm font-medium tracking-wide text-[var(--text-primary)]">Total Members</div>
                      <div className="w-32 text-right text-sm font-medium tracking-wide text-[var(--text-primary)]">Actions</div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {filteredTeams.length === 0 && (
                        <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                          No teams match your search.
                        </div>
                      )}

                      {filteredTeams.map((team) => (
                        <div
                          key={team.id}
                          className={cn(
                            "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]",
                            selectedTeamIds.includes(team.id) && "bg-[var(--accent)]/6",
                          )}
                        >
                          <div className="flex w-5 justify-center">
                            <input
                              type="checkbox"
                              checked={selectedTeamIds.includes(team.id)}
                              onChange={() => toggleTeamSelection(team.id)}
                              className="table-checkbox"
                              aria-label={`Select ${team.name}`}
                            />
                          </div>
                          <div className="flex min-w-[200px] flex-1 items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white shadow-sm">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{team.name}</p>
                              <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{team.email}</p>
                            </div>
                          </div>
                          <div className="w-40 text-left">
                            <span className="text-[14.5px] font-medium text-[var(--text-secondary)]">{team.createdAt}</span>
                          </div>
                          <div className="flex w-32 items-center justify-start text-left">
                            <span className="text-[15px] font-semibold text-[var(--text-primary)]">{team.memberCount}</span>
                            <span className="ml-1 text-[13px] font-medium text-[var(--text-muted)]">
                              {team.memberCount === 1 ? "member" : "members"}
                            </span>
                          </div>
                          <div className="flex w-32 items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditTeamModal(team)}
                              className={PEOPLE_ACTION_BUTTON_CLASS_NAME}
                              title={`Edit ${team.name}`}
                            >
                              <Edit className={PEOPLE_ACTION_ICON_CLASS_NAME} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (members.some((m) => m.teamId === team.id)) {
                                  setDeleteBlockError(`"${team.name}" has members assigned. Reassign or remove them first.`);
                                  return;
                                }
                                setDeleteTarget({ kind: "team", team });
                              }}
                              className={PEOPLE_ACTION_BUTTON_DANGER_CLASS_NAME}
                              title={`Delete ${team.name}`}
                            >
                              <Trash2 className={PEOPLE_ACTION_ICON_CLASS_NAME} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace Members</h2>
                      <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
                        Manage internal member profiles, team assignments, roles, and avatars.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          value={memberSearch}
                          onChange={(event) => setMemberSearch(event.target.value)}
                          placeholder="Search workspace members"
                          className="w-[220px] border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                      <div className="relative">
                        <select
                          value={memberTeamFilter}
                          onChange={(event) => setMemberTeamFilter(event.target.value)}
                          className="appearance-none rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] py-3 pl-4 pr-10 text-sm text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--accent)]/40"
                        >
                          <option value="all" className="bg-[#1C1C1E] text-white">All teams</option>
                          {teams.map((team) => (
                            <option key={team.id} value={team.id} className="bg-[#1C1C1E] text-white">
                              {team.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>
                      <div className="relative">
                        <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <select
                          value={memberRoleFilter}
                          onChange={(event) => setMemberRoleFilter(event.target.value as MemberRole | "all")}
                          className="appearance-none rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] py-3 pl-11 pr-10 text-sm text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--accent)]/40"
                        >
                          <option value="all" className="bg-[#1C1C1E] text-white">All roles</option>
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role} className="bg-[#1C1C1E] text-white">
                              {role}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>
                      <button
                        type="button"
                        onClick={openCreateMemberModal}
                        disabled={teams.length === 0}
                        className="btn-base btn-primary type-ui shrink-0 flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        Add New Member
                      </button>
                    </div>
                  </div>

                  <div className="table-surface overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
                    {selectedMemberIds.length > 0 && (
                      <div className="flex items-center justify-between gap-4 border-b border-white/6 bg-[var(--accent)]/8 px-6 py-3">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {selectedMemberIds.length} workspace member{selectedMemberIds.length === 1 ? "" : "s"} selected
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedMemberIds([])}
                            className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                          >
                            Clear selection
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: "bulk-members" })}
                            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-3 py-2 text-sm font-medium text-[var(--red)] transition hover:bg-[var(--red)]/16"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete selected
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="table-header-surface flex items-center gap-4 border-b border-white/5 px-6 py-4">
                      <div className="flex w-5 justify-center">
                        <input
                          type="checkbox"
                          checked={membersSelectionAll}
                          onChange={toggleAllMembers}
                          className="table-checkbox"
                          aria-label="Select all members"
                        />
                      </div>
                      <div className="min-w-[260px] flex-[1.2] pl-2 text-sm font-medium tracking-wide text-[var(--text-primary)]">Name</div>
                      <div className="w-52 text-left text-sm font-medium tracking-wide text-[var(--text-primary)]">Team</div>
                      <div className="w-32 text-left text-sm font-medium tracking-wide text-[var(--text-primary)]">Role</div>
                      <div className="w-32 text-left text-sm font-medium tracking-wide text-[var(--text-primary)]">Date Added</div>
                      <div className="w-32 text-right text-sm font-medium tracking-wide text-[var(--text-primary)]">Actions</div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {filteredMembers.length === 0 && (
                        <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                          No workspace members match your search.
                        </div>
                      )}

                      {filteredMembers.map((member) => {
                        const memberTeam = teams.find((team) => team.id === member.teamId);

                        return (
                          <div
                            key={member.id}
                            className={cn(
                              "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]",
                              selectedMemberIds.includes(member.id) && "bg-[var(--accent)]/6",
                            )}
                          >
                            <div className="flex w-5 justify-center">
                              <input
                                type="checkbox"
                                checked={selectedMemberIds.includes(member.id)}
                                onChange={() => toggleMemberSelection(member.id)}
                                className="table-checkbox"
                                aria-label={`Select ${member.name}`}
                              />
                            </div>
                            <div className="flex min-w-[260px] flex-[1.2] items-center gap-4">
                              <Avatar
                                initials={buildMemberInitials(member.name)}
                                tone={member.avatarTone}
                                imageSrc={member.avatarImage}
                                size="md"
                                shape="full"
                              />
                              <div>
                                <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{member.name}</p>
                                <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{member.email}</p>
                              </div>
                            </div>
                            <div className="w-52 text-left">
                              <div className="relative">
                                <select
                                  value={member.teamId}
                                  onChange={(event) => {
                                    const nextTeamId = event.target.value;
                                    const previousMembers = membersRef.current;
                                    const previousProjects = projectsRef.current;
                                    const nextTeam = teamsRef.current.find((team) => team.id === nextTeamId);
                                    const nextMembers = previousMembers.map((currentMember) =>
                                      currentMember.id === member.id
                                        ? {
                                            ...currentMember,
                                            teamId: nextTeamId,
                                            lastActive: currentMember.lastActive === "Invitation sent" ? currentMember.lastActive : "Updated just now",
                                          }
                                        : currentMember,
                                    );
                                    const nextMember = nextMembers.find((currentMember) => currentMember.id === member.id) ?? null;
                                    const nextProjects = nextMember
                                      ? updateProjectsForMember(previousProjects, member, nextMember)
                                      : previousProjects;

                                    membersRef.current = nextMembers;
                                    projectsRef.current = nextProjects;
                                    setMembers(nextMembers);
                                    setProjects(nextProjects);
                                    setWorkspaceActivity((current) =>
                                      pushWorkspaceActivity(current, {
                                        name: member.name,
                                        initials: buildMemberInitials(member.name),
                                        tone: member.avatarTone,
                                        status: "neutral",
                                        action: `Moved to ${nextTeam?.name ?? "another team"}`,
                                        detail: member.role,
                                      }),
                                    );

                                    if (peopleMode === "remote") {
                                      void persistPeopleWorkspace({
                                        teams: teamsRef.current,
                                        members: nextMembers,
                                        projects: nextProjects,
                                      }).catch((error) => {
                                        console.error("Failed to update member team:", error);
                                        membersRef.current = previousMembers;
                                        projectsRef.current = previousProjects;
                                        setMembers(previousMembers);
                                        setProjects(previousProjects);
                                      });
                                    }
                                  }}
                                  className="w-full appearance-none rounded-[var(--radius-md)] border border-white/10 bg-transparent px-4 py-2.5 pr-10 text-[14.5px] font-medium text-[var(--text-secondary)] outline-none transition-colors hover:border-[var(--accent)]"
                                >
                                  {teams.map((team) => (
                                    <option key={team.id} value={team.id} className="bg-[#1C1C1E] text-white">
                                      {team.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                              </div>
                            </div>
                            <div className="w-32 text-left">
                              <div className="relative">
                                <select
                                  value={member.role}
                                  onChange={(event) => {
                                    const nextRole = event.target.value as MemberRole;
                                    const previousMembers = membersRef.current;
                                    const nextMembers = previousMembers.map((currentMember) =>
                                      currentMember.id === member.id
                                        ? {
                                            ...currentMember,
                                            role: nextRole,
                                            lastActive: currentMember.lastActive === "Invitation sent" ? currentMember.lastActive : "Updated just now",
                                          }
                                        : currentMember,
                                    );

                                    membersRef.current = nextMembers;
                                    setMembers(nextMembers);
                                    setWorkspaceActivity((current) =>
                                      pushWorkspaceActivity(current, {
                                        name: member.name,
                                        initials: buildMemberInitials(member.name),
                                        tone: member.avatarTone,
                                        status: "neutral",
                                        action: `Role updated to ${nextRole}`,
                                        detail: teamsRef.current.find((team) => team.id === member.teamId)?.name,
                                      }),
                                    );

                                    if (peopleMode === "remote") {
                                      void persistPeopleWorkspace({
                                        teams: teamsRef.current,
                                        members: nextMembers,
                                        projects: projectsRef.current,
                                      }).catch((error) => {
                                        console.error("Failed to update member role:", error);
                                        membersRef.current = previousMembers;
                                        setMembers(previousMembers);
                                      });
                                    }
                                  }}
                                  className="w-full appearance-none rounded-[var(--radius-md)] border border-white/10 bg-transparent px-4 py-2.5 pr-10 text-[14.5px] font-medium text-[var(--text-secondary)] outline-none transition-colors hover:border-[var(--accent)]"
                                >
                                  {ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role} className="bg-[#1C1C1E] text-white">
                                      {role}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                              </div>
                            </div>
                            <div className="w-32 text-left">
                              <span className="text-[14.5px] font-medium text-[var(--text-secondary)]">{member.dateAdded}</span>
                              {!memberTeam && (
                                <p className="mt-1 text-[12px] text-[var(--red)]">Missing team</p>
                              )}
                            </div>
                            <div className="flex w-32 items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openMemberChat(member)}
                                disabled={!canOpenMemberChat(member)}
                                className={PEOPLE_ACTION_BUTTON_CLASS_NAME}
                                title={canOpenMemberChat(member) ? `Message ${member.name}` : `${member.name} is not available in messages yet`}
                              >
                                <MessageSquareMore className={PEOPLE_ACTION_ICON_CLASS_NAME} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditMemberModal(member)}
                                className={PEOPLE_ACTION_BUTTON_CLASS_NAME}
                                title={`Edit ${member.name}`}
                              >
                                <Edit className={PEOPLE_ACTION_ICON_CLASS_NAME} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ kind: "member", member })}
                                className={PEOPLE_ACTION_BUTTON_DANGER_CLASS_NAME}
                                title={`Delete ${member.name}`}
                              >
                                <Trash2 className={PEOPLE_ACTION_ICON_CLASS_NAME} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Client Contacts</h2>
                      <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
                        Keep client-side stakeholders and their team contacts separate from internal workspace members.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          value={clientSearch}
                          onChange={(event) => setClientSearch(event.target.value)}
                          placeholder="Search client contacts"
                          className="w-[220px] border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="table-surface overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
                    <div className="table-header-surface grid grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)_0.95fr_92px] gap-4 border-b border-white/5 px-6 py-4">
                      <div className="text-sm font-medium tracking-wide text-[var(--text-primary)]">Contact</div>
                      <div className="text-sm font-medium tracking-wide text-[var(--text-primary)]">Company</div>
                      <div className="text-sm font-medium tracking-wide text-[var(--text-primary)]">Role / Status</div>
                      <div className="text-right text-sm font-medium tracking-wide text-[var(--text-primary)]">Actions</div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {filteredClientContacts.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                          No client contacts match your search.
                        </div>
                      ) : (
                        filteredClientContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="grid grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)_0.95fr_92px] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03]">
                                  <UserRound className="h-4.5 w-4.5 text-[var(--text-secondary)]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{contact.name}</p>
                                  <p className="mt-0.5 truncate text-[13px] text-[var(--text-muted)]">{contact.email || "No email provided"}</p>
                                </div>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <CompanyLogo
                                  company={contact.company}
                                  website={contact.website}
                                  logoUrl={contact.logoUrl}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-[14.5px] font-medium text-[var(--text-secondary)]">{contact.company}</p>
                                  <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">
                                    {contact.department || contact.location || "Client account"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-[14.5px] font-medium text-[var(--text-secondary)]">{contact.role}</p>
                              <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{contact.status}</p>
                            </div>

                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (contact.email) {
                                    window.location.href = `mailto:${contact.email}`;
                                  }
                                }}
                                disabled={!contact.email}
                                className={PEOPLE_ACTION_BUTTON_CLASS_NAME}
                                title={contact.email ? `Email ${contact.name}` : "Email unavailable"}
                              >
                                <Mail className={PEOPLE_ACTION_ICON_CLASS_NAME} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TeamModal
        open={teamModalOpen}
        mode={teamModalMode}
        team={editingTeam}
        existingTeams={teams}
        onClose={() => {
          setTeamModalOpen(false);
          setEditingTeam(null);
        }}
        onSubmit={handleTeamSubmit}
      />

      <MemberModal
        open={memberModalOpen}
        mode={memberModalMode}
        member={editingMember}
        teams={teams}
        existingMembers={members}
        onClose={() => {
          setMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleMemberSubmit}
      />

      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === "team"
            ? "Delete team?"
            : deleteTarget?.kind === "member"
              ? "Delete member?"
              : deleteTarget?.kind === "bulk-teams"
                ? "Delete selected teams?"
                : "Delete selected members?"
        }
        description={
          deleteTarget?.kind === "team"
            ? `Delete "${deleteTarget.team.name}" from the People page?`
            : deleteTarget?.kind === "member"
              ? `Delete "${deleteTarget.member.name}" from the People page?`
              : deleteTarget?.kind === "bulk-teams"
                ? `Delete ${selectedTeamIds.length} selected team${selectedTeamIds.length === 1 ? "" : "s"}?`
                : `Delete ${selectedMemberIds.length} selected member${selectedMemberIds.length === 1 ? "" : "s"}?`
        }
        confirmLabel={
          deleteTarget?.kind === "team"
            ? "Delete team"
            : deleteTarget?.kind === "member"
              ? "Delete member"
              : deleteTarget?.kind === "bulk-teams"
                ? "Delete teams"
                : "Delete members"
        }
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }

          if (deleteTarget.kind === "team") {
            handleDeleteTeam(deleteTarget.team.id);
            return;
          }

          if (deleteTarget.kind === "member") {
            handleDeleteMember(deleteTarget.member.id);
            return;
          }

          if (deleteTarget.kind === "bulk-teams") {
            handleDeleteSelectedTeams();
            return;
          }

          handleDeleteSelectedMembers();
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}
