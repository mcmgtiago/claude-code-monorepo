import type {
  ClientEmployeeRecord,
  ClientOwnerOption,
  ClientRecord,
  CompanyProfile,
} from "@/data/clients";
import type {
  ClientPortalDashboard,
  ClientPortalDiscussion,
  ClientPortalFile,
  ClientPortalMember,
  ClientPortalProject,
  ClientPortalProjectDetail,
  ClientPortalTask,
} from "@/data/client-portal";
import type {
  ChatAttachment,
  ChatContact,
  ChatMeetingCandidate,
  ChatMeetingMessage,
  ChatMeetingParticipant,
  ChatMeetingSession,
  ChatMeetingSignalEnvelope,
  ChatMessage,
  ChatPreferences,
  ChatThread,
  MessagesPayload,
} from "@/data/chats";
import type { ActivityItem, AvatarTone } from "@/data/dashboard";
import type {
  DiscussionReaction,
  Integration,
  ProjectDocument,
  ProjectNotification,
  ProjectGoal,
  TeamMemberRecord,
  WorkspaceProject,
} from "@/data/project-board";
import type { WorkspacePeopleMember, WorkspaceTeamRecord } from "@/lib/people";
import { defaultProfile, type ProfileFormState } from "@/lib/profile";
import type { ProjectFileRecord } from "@/lib/project-files";
import { cloneDefaultIntegrations, type ProjectWorkspaceBundle } from "@/lib/project-workspace";
import {
  defaultNotificationPreferences,
  defaultPlanSettings,
  defaultSettingsBundle,
  type SavedDevice,
  type SettingsBundle,
} from "@/lib/settings";
import type { TimeTrackerDashboardPayload, TimeTrackerEntryRecord } from "@/lib/time-tracker";
import type { NotificationsCenterData } from "@/lib/notifications-db";

export type DemoTaskRecord = {
  id: number;
  title: string;
  description: string;
  status_id: string;
  tag: string;
  priority: "Normal" | "Medium" | "High" | "Done";
  assigned_to: string | null;
  due_date: string | null;
  reminder_at: string | null;
  reminder_date: string | null;
  created_by: string;
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
  notes: string[];
  links: Array<{ id: string; url: string }>;
  comments: Array<{ id: string; body: string }>;
  file_ids: string[];
  created_at: string;
  completed_at: string | null;
  project_ref: string;
  sort_order: number;
};

export type DemoDiscussionAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  kind: "image" | "file";
};

export type DemoDiscussionThread = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorInitials: string;
  authorTone: TeamMemberRecord["avatarTone"];
  createdAt: string;
  starred: boolean;
  reactions: DiscussionReaction[];
  attachments: DemoDiscussionAttachment[];
};

export type DemoDiscussionReply = {
  id: string;
  threadId: string;
  content: string;
  authorName: string;
  authorInitials: string;
  authorTone: TeamMemberRecord["avatarTone"];
  createdAt: string;
  reactions: DiscussionReaction[];
  attachments: DemoDiscussionAttachment[];
};

export type DemoDiscussionBucket = {
  threads: DemoDiscussionThread[];
  replies: DemoDiscussionReply[];
};

type DemoState = {
  clients: ClientRecord[];
  ownerOptions: ClientOwnerOption[];
  workspaceTeams: WorkspaceTeamRecord[];
  teamMembers: WorkspacePeopleMember[];
  projectWorkspaceBundle: ProjectWorkspaceBundle;
  tasksByProject: Record<string, DemoTaskRecord[]>;
  projectFilesByProject: Record<string, ProjectFileRecord[]>;
  discussionsByProject: Record<string, DemoDiscussionBucket>;
  portalMembersByClient: Record<string, ClientPortalMember[]>;
  messages: MessagesPayload;
  meetingSessions: Record<string, ChatMeetingSession>;
  meetingSignalsByContact: Record<string, ChatMeetingSignalEnvelope[]>;
  settings: SettingsBundle;
  profile: ProfileFormState;
  activity: ActivityItem[];
  snoozedNotifications: Record<string, boolean>;
  removedNotifications: Record<string, boolean>;
  timeEntries: TimeTrackerEntryRecord[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "NA";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function isoDaysAgo(daysAgo: number, hour = 10, minute = 0) {
  const date = new Date(Date.UTC(2026, 3, 8 - daysAgo, hour, minute, 0));
  return date.toISOString();
}

function isoToday(hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 3, 8, hour, minute, 0)).toISOString();
}

function isoMinutesAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function avatarTone(index: number): AvatarTone {
  const tones: AvatarTone[] = ["sand", "rose", "olive", "slate", "peach"];
  return tones[index % tones.length] ?? "sand";
}

function taskAssigneesToString(value: string[]) {
  return value.join(", ") || null;
}

const workspaceTeams: WorkspaceTeamRecord[] = [
  { id: "team-strategy", name: "Strategy", email: "strategy@planixdemo.com", createdAt: "Jan 3, 2026" },
  { id: "team-design", name: "Design", email: "design@planixdemo.com", createdAt: "Jan 3, 2026" },
  { id: "team-dev", name: "Development", email: "dev@planixdemo.com", createdAt: "Jan 3, 2026" },
  { id: "team-growth", name: "Growth", email: "growth@planixdemo.com", createdAt: "Jan 3, 2026" },
  { id: "team-ops", name: "Operations", email: "ops@planixdemo.com", createdAt: "Jan 3, 2026" },
];

const teamMembers: WorkspacePeopleMember[] = [
  {
    id: "member-1",
    name: "Ariana Cole",
    email: "ariana.cole@planixdemo.com",
    avatarInitials: "AC",
    avatarTone: "sand",
    dateAdded: "Jan 4, 2026",
    lastActive: "Active 5 min ago",
    teamId: "team-strategy",
    role: "Admin",
  },
  {
    id: "member-2",
    name: "Mason Reed",
    email: "mason.reed@planixdemo.com",
    avatarInitials: "MR",
    avatarTone: "olive",
    dateAdded: "Jan 4, 2026",
    lastActive: "In review",
    teamId: "team-dev",
    role: "User",
  },
  {
    id: "member-3",
    name: "Sofia Lin",
    email: "sofia.lin@planixdemo.com",
    avatarInitials: "SL",
    avatarTone: "peach",
    dateAdded: "Jan 5, 2026",
    lastActive: "Updated just now",
    teamId: "team-design",
    role: "User",
  },
  {
    id: "member-4",
    name: "Noah Kim",
    email: "noah.kim@planixdemo.com",
    avatarInitials: "NK",
    avatarTone: "rose",
    dateAdded: "Jan 5, 2026",
    lastActive: "Active 14 min ago",
    teamId: "team-growth",
    role: "User",
  },
  {
    id: "member-5",
    name: "Ivy Patel",
    email: "ivy.patel@planixdemo.com",
    avatarInitials: "IP",
    avatarTone: "slate",
    dateAdded: "Jan 6, 2026",
    lastActive: "Active 1 hour ago",
    teamId: "team-ops",
    role: "Viewer",
  },
];

const ownerOptions: ClientOwnerOption[] = teamMembers.map((member) => ({
  id: member.id,
  name: member.name,
  initials: member.avatarInitials,
  tone: member.avatarTone,
  role: member.role === "Admin" ? "Account Lead" : "Client Success",
  email: member.email,
}));

const clients: ClientRecord[] = [
  {
    id: "client-google",
    company: "Google",
    contactName: "Maya Chen",
    contactRole: "Senior Growth Lead",
    email: "maya.chen@google-demo.com",
    location: "Mountain View, California",
    website: "google.com",
    logoUrl: "https://logo.clearbit.com/google.com",
    owner: { name: "Ariana Cole", initials: "AC", tone: "sand", id: "member-1", role: "Account Lead" },
    stage: "Expansion",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 1,
    arr: 420000,
    lastActivity: "Q2 media performance review completed 2 hours ago",
    nextRenewal: "2026-09-30",
    priority: true,
    employees: [
      {
        id: "google-1",
        name: "Maya Chen",
        role: "Senior Growth Lead",
        department: "Growth",
        email: "maya.chen@google-demo.com",
        location: "Mountain View",
        initials: "MC",
        tone: "sand",
        status: "active",
      },
      {
        id: "google-2",
        name: "Rohan Shah",
        role: "Marketing Ops Manager",
        department: "Marketing",
        email: "rohan.shah@google-demo.com",
        location: "New York",
        initials: "RS",
        tone: "olive",
        status: "review",
      },
    ],
  },
  {
    id: "client-apple",
    company: "Apple",
    contactName: "Elena Brooks",
    contactRole: "Product Marketing Director",
    email: "elena.brooks@apple-demo.com",
    location: "Cupertino, California",
    website: "apple.com",
    logoUrl: "https://logo.clearbit.com/apple.com",
    owner: { name: "Sofia Lin", initials: "SL", tone: "peach", id: "member-3", role: "Client Success" },
    stage: "Active",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 1,
    arr: 365000,
    lastActivity: "Prototype walkthrough shared yesterday",
    nextRenewal: "2026-11-12",
    priority: false,
    employees: [
      {
        id: "apple-1",
        name: "Elena Brooks",
        role: "Product Marketing Director",
        department: "Marketing",
        email: "elena.brooks@apple-demo.com",
        location: "Cupertino",
        initials: "EB",
        tone: "peach",
        status: "active",
      },
      {
        id: "apple-2",
        name: "Jude Mercer",
        role: "Retail Experience Manager",
        department: "Retail",
        email: "jude.mercer@apple-demo.com",
        location: "Austin",
        initials: "JM",
        tone: "rose",
        status: "active",
      },
    ],
  },
  {
    id: "client-nvidia",
    company: "NVIDIA",
    contactName: "Leo Vargas",
    contactRole: "AI Partnerships Director",
    email: "leo.vargas@nvidia-demo.com",
    location: "Santa Clara, California",
    website: "nvidia.com",
    logoUrl: "https://logo.clearbit.com/nvidia.com",
    owner: { name: "Mason Reed", initials: "MR", tone: "olive", id: "member-2", role: "Account Lead" },
    stage: "Active",
    health: "Watch",
    invoiceStatus: "Pending",
    activeProjects: 1,
    arr: 510000,
    lastActivity: "Infra scope update requested 4 hours ago",
    nextRenewal: "2026-08-18",
    priority: true,
    employees: [
      {
        id: "nvidia-1",
        name: "Leo Vargas",
        role: "AI Partnerships Director",
        department: "Enterprise",
        email: "leo.vargas@nvidia-demo.com",
        location: "Santa Clara",
        initials: "LV",
        tone: "olive",
        status: "active",
      },
      {
        id: "nvidia-2",
        name: "Nina Park",
        role: "Platform Marketing Lead",
        department: "Marketing",
        email: "nina.park@nvidia-demo.com",
        location: "Seattle",
        initials: "NP",
        tone: "slate",
        status: "review",
      },
      {
        id: "nvidia-3",
        name: "Tariq Owens",
        role: "Solutions Architect",
        department: "Solutions",
        email: "tariq.owens@nvidia-demo.com",
        location: "Remote",
        initials: "TO",
        tone: "sand",
        status: "active",
      },
    ],
  },
  {
    id: "client-figma",
    company: "Figma",
    contactName: "Zoey Hart",
    contactRole: "Design Systems Manager",
    email: "zoey.hart@figma-demo.com",
    location: "San Francisco, California",
    website: "figma.com",
    logoUrl: "https://logo.clearbit.com/figma.com",
    owner: { name: "Ivy Patel", initials: "IP", tone: "slate", id: "member-5", role: "Client Success" },
    stage: "Onboarding",
    health: "Healthy",
    invoiceStatus: "Pending",
    activeProjects: 1,
    arr: 248000,
    lastActivity: "Kickoff deck approved this morning",
    nextRenewal: "2026-12-20",
    priority: false,
    employees: [
      {
        id: "figma-1",
        name: "Zoey Hart",
        role: "Design Systems Manager",
        department: "Design",
        email: "zoey.hart@figma-demo.com",
        location: "San Francisco",
        initials: "ZH",
        tone: "slate",
        status: "active",
      },
    ],
  },
  {
    id: "client-stripe",
    company: "Stripe",
    contactName: "Caleb Ross",
    contactRole: "Partnerships Lead",
    email: "caleb.ross@stripe-demo.com",
    location: "South San Francisco, California",
    website: "stripe.com",
    logoUrl: "https://logo.clearbit.com/stripe.com",
    owner: { name: "Noah Kim", initials: "NK", tone: "rose", id: "member-4", role: "Account Lead" },
    stage: "Paused",
    health: "At Risk",
    invoiceStatus: "Overdue",
    activeProjects: 1,
    arr: 190000,
    lastActivity: "Budget hold flagged last week",
    nextRenewal: "2026-06-15",
    priority: true,
    employees: [
      {
        id: "stripe-1",
        name: "Caleb Ross",
        role: "Partnerships Lead",
        department: "Partnerships",
        email: "caleb.ross@stripe-demo.com",
        location: "South San Francisco",
        initials: "CR",
        tone: "rose",
        status: "offline",
      },
    ],
  },
  {
    id: "client-microsoft",
    company: "Microsoft",
    contactName: "Priya Nair",
    contactRole: "Commercial Marketing Lead",
    email: "priya.nair@microsoft-demo.com",
    location: "Redmond, Washington",
    website: "microsoft.com",
    logoUrl: "https://logo.clearbit.com/microsoft.com",
    owner: { name: "Ariana Cole", initials: "AC", tone: "sand", id: "member-1", role: "Account Lead" },
    stage: "Active",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 0,
    arr: 438000,
    lastActivity: "Executive roadmap sync wrapped this afternoon",
    nextRenewal: "2026-10-14",
    priority: true,
    employees: [
      {
        id: "microsoft-1",
        name: "Priya Nair",
        role: "Commercial Marketing Lead",
        department: "Commercial",
        email: "priya.nair@microsoft-demo.com",
        location: "Redmond",
        initials: "PN",
        tone: "sand",
        status: "active",
      },
      {
        id: "microsoft-2",
        name: "Marcus Bell",
        role: "Lifecycle Programs Manager",
        department: "CRM",
        email: "marcus.bell@microsoft-demo.com",
        location: "Chicago",
        initials: "MB",
        tone: "slate",
        status: "active",
      },
    ],
  },
  {
    id: "client-amazon",
    company: "Amazon",
    contactName: "Danielle Price",
    contactRole: "Retail Media Director",
    email: "danielle.price@amazon-demo.com",
    location: "Seattle, Washington",
    website: "amazon.com",
    logoUrl: "https://logo.clearbit.com/amazon.com",
    owner: { name: "Mason Reed", initials: "MR", tone: "olive", id: "member-2", role: "Account Lead" },
    stage: "Expansion",
    health: "Watch",
    invoiceStatus: "Pending",
    activeProjects: 0,
    arr: 392000,
    lastActivity: "Channel mix recommendations requested 3 hours ago",
    nextRenewal: "2026-08-29",
    priority: true,
    employees: [
      {
        id: "amazon-1",
        name: "Danielle Price",
        role: "Retail Media Director",
        department: "Media",
        email: "danielle.price@amazon-demo.com",
        location: "Seattle",
        initials: "DP",
        tone: "olive",
        status: "active",
      },
      {
        id: "amazon-2",
        name: "Neil Foster",
        role: "Category Insights Manager",
        department: "Insights",
        email: "neil.foster@amazon-demo.com",
        location: "Austin",
        initials: "NF",
        tone: "peach",
        status: "review",
      },
    ],
  },
  {
    id: "client-northstar",
    company: "Northstar Labs",
    contactName: "Sara Hwang",
    contactRole: "Product Growth Lead",
    email: "sara.hwang@northstar-demo.com",
    location: "San Francisco, California",
    website: "northstar-demo.com",
    logoUrl: "",
    owner: { name: "Sofia Lin", initials: "SL", tone: "peach", id: "member-3", role: "Client Success" },
    stage: "Onboarding",
    health: "Healthy",
    invoiceStatus: "Pending",
    activeProjects: 0,
    arr: 276000,
    lastActivity: "Discovery call notes shared this morning",
    nextRenewal: "2026-12-05",
    priority: false,
    employees: [
      {
        id: "northstar-1",
        name: "Sara Hwang",
        role: "Product Growth Lead",
        department: "Growth",
        email: "sara.hwang@northstar-demo.com",
        location: "San Francisco",
        initials: "SH",
        tone: "peach",
        status: "active",
      },
      {
        id: "northstar-2",
        name: "Victor Ames",
        role: "Lifecycle Designer",
        department: "Design",
        email: "victor.ames@northstar-demo.com",
        location: "Remote",
        initials: "VA",
        tone: "rose",
        status: "active",
      },
    ],
  },
  {
    id: "client-shopify",
    company: "Shopify",
    contactName: "Isabel Turner",
    contactRole: "Merchant Experience Manager",
    email: "isabel.turner@shopify-demo.com",
    location: "Toronto, Canada",
    website: "shopify.com",
    logoUrl: "https://logo.clearbit.com/shopify.com",
    owner: { name: "Noah Kim", initials: "NK", tone: "rose", id: "member-4", role: "Account Lead" },
    stage: "Active",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 0,
    arr: 214000,
    lastActivity: "Merchant funnel benchmark approved yesterday",
    nextRenewal: "2026-09-08",
    priority: false,
    employees: [
      {
        id: "shopify-1",
        name: "Isabel Turner",
        role: "Merchant Experience Manager",
        department: "Merchant Success",
        email: "isabel.turner@shopify-demo.com",
        location: "Toronto",
        initials: "IT",
        tone: "rose",
        status: "active",
      },
      {
        id: "shopify-2",
        name: "Owen Li",
        role: "Growth Analyst",
        department: "Growth",
        email: "owen.li@shopify-demo.com",
        location: "Vancouver",
        initials: "OL",
        tone: "olive",
        status: "review",
      },
    ],
  },
  {
    id: "client-adobe",
    company: "Adobe",
    contactName: "Nadia Flores",
    contactRole: "Creative Cloud Programs Director",
    email: "nadia.flores@adobe-demo.com",
    location: "San Jose, California",
    website: "adobe.com",
    logoUrl: "https://logo.clearbit.com/adobe.com",
    owner: { name: "Ivy Patel", initials: "IP", tone: "slate", id: "member-5", role: "Client Success" },
    stage: "Expansion",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 0,
    arr: 334000,
    lastActivity: "Creative ops audit delivered 1 day ago",
    nextRenewal: "2026-11-28",
    priority: false,
    employees: [
      {
        id: "adobe-1",
        name: "Nadia Flores",
        role: "Creative Cloud Programs Director",
        department: "Programs",
        email: "nadia.flores@adobe-demo.com",
        location: "San Jose",
        initials: "NF",
        tone: "slate",
        status: "active",
      },
      {
        id: "adobe-2",
        name: "Ethan Cole",
        role: "Enterprise Campaign Manager",
        department: "Enterprise",
        email: "ethan.cole@adobe-demo.com",
        location: "Remote",
        initials: "EC",
        tone: "sand",
        status: "active",
      },
    ],
  },
  {
    id: "client-hubspot",
    company: "HubSpot",
    contactName: "Clara Benson",
    contactRole: "Revenue Marketing Lead",
    email: "clara.benson@hubspot-demo.com",
    location: "Cambridge, Massachusetts",
    website: "hubspot.com",
    logoUrl: "https://logo.clearbit.com/hubspot.com",
    owner: { name: "Sofia Lin", initials: "SL", tone: "peach", id: "member-3", role: "Client Success" },
    stage: "Active",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 0,
    arr: 188000,
    lastActivity: "CRM adoption scorecard reviewed this week",
    nextRenewal: "2026-07-22",
    priority: false,
    employees: [
      {
        id: "hubspot-1",
        name: "Clara Benson",
        role: "Revenue Marketing Lead",
        department: "Revenue Marketing",
        email: "clara.benson@hubspot-demo.com",
        location: "Cambridge",
        initials: "CB",
        tone: "peach",
        status: "active",
      },
      {
        id: "hubspot-2",
        name: "Drew Patel",
        role: "Ops Strategist",
        department: "Operations",
        email: "drew.patel@hubspot-demo.com",
        location: "Remote",
        initials: "DP",
        tone: "olive",
        status: "offline",
      },
    ],
  },
  {
    id: "client-atlassian",
    company: "Atlassian",
    contactName: "Megan Walsh",
    contactRole: "Lifecycle Marketing Manager",
    email: "megan.walsh@atlassian-demo.com",
    location: "Sydney, Australia",
    website: "atlassian.com",
    logoUrl: "https://logo.clearbit.com/atlassian.com",
    owner: { name: "Noah Kim", initials: "NK", tone: "rose", id: "member-4", role: "Account Lead" },
    stage: "Active",
    health: "Watch",
    invoiceStatus: "Pending",
    activeProjects: 0,
    arr: 229000,
    lastActivity: "Journey mapping deck needs revisions",
    nextRenewal: "2026-08-11",
    priority: true,
    employees: [
      {
        id: "atlassian-1",
        name: "Megan Walsh",
        role: "Lifecycle Marketing Manager",
        department: "Lifecycle",
        email: "megan.walsh@atlassian-demo.com",
        location: "Sydney",
        initials: "MW",
        tone: "rose",
        status: "review",
      },
      {
        id: "atlassian-2",
        name: "Ben Ortega",
        role: "Product Education Lead",
        department: "Education",
        email: "ben.ortega@atlassian-demo.com",
        location: "Melbourne",
        initials: "BO",
        tone: "slate",
        status: "active",
      },
    ],
  },
  {
    id: "client-airbnb",
    company: "Airbnb",
    contactName: "Lena Ortiz",
    contactRole: "Host Growth Director",
    email: "lena.ortiz@airbnb-demo.com",
    location: "San Francisco, California",
    website: "airbnb.com",
    logoUrl: "https://logo.clearbit.com/airbnb.com",
    owner: { name: "Ivy Patel", initials: "IP", tone: "slate", id: "member-5", role: "Client Success" },
    stage: "Paused",
    health: "At Risk",
    invoiceStatus: "Overdue",
    activeProjects: 0,
    arr: 257000,
    lastActivity: "Resourcing decision delayed by finance",
    nextRenewal: "2026-06-28",
    priority: true,
    employees: [
      {
        id: "airbnb-1",
        name: "Lena Ortiz",
        role: "Host Growth Director",
        department: "Growth",
        email: "lena.ortiz@airbnb-demo.com",
        location: "San Francisco",
        initials: "LO",
        tone: "slate",
        status: "offline",
      },
      {
        id: "airbnb-2",
        name: "Kai Morgan",
        role: "Community Programs Manager",
        department: "Community",
        email: "kai.morgan@airbnb-demo.com",
        location: "Los Angeles",
        initials: "KM",
        tone: "peach",
        status: "review",
      },
    ],
  },
  {
    id: "client-slack",
    company: "Slack",
    contactName: "Trevor Mills",
    contactRole: "Enterprise Campaigns Lead",
    email: "trevor.mills@slack-demo.com",
    location: "Denver, Colorado",
    website: "slack.com",
    logoUrl: "https://logo.clearbit.com/slack.com",
    owner: { name: "Mason Reed", initials: "MR", tone: "olive", id: "member-2", role: "Account Lead" },
    stage: "Onboarding",
    health: "Healthy",
    invoiceStatus: "Pending",
    activeProjects: 0,
    arr: 167000,
    lastActivity: "Kickoff workshop booked for tomorrow",
    nextRenewal: "2026-12-16",
    priority: false,
    employees: [
      {
        id: "slack-1",
        name: "Trevor Mills",
        role: "Enterprise Campaigns Lead",
        department: "Enterprise Marketing",
        email: "trevor.mills@slack-demo.com",
        location: "Denver",
        initials: "TM",
        tone: "olive",
        status: "active",
      },
      {
        id: "slack-2",
        name: "Jia Sun",
        role: "Content Strategist",
        department: "Content",
        email: "jia.sun@slack-demo.com",
        location: "Remote",
        initials: "JS",
        tone: "sand",
        status: "active",
      },
    ],
  },
  {
    id: "client-notion",
    company: "Notion",
    contactName: "Ava Laurent",
    contactRole: "Brand Programs Manager",
    email: "ava.laurent@notion-demo.com",
    location: "New York, New York",
    website: "notion.so",
    logoUrl: "https://logo.clearbit.com/notion.so",
    owner: { name: "Ariana Cole", initials: "AC", tone: "sand", id: "member-1", role: "Account Lead" },
    stage: "Expansion",
    health: "Healthy",
    invoiceStatus: "Paid",
    activeProjects: 0,
    arr: 205000,
    lastActivity: "Brand narrative iteration approved today",
    nextRenewal: "2026-10-02",
    priority: false,
    employees: [
      {
        id: "notion-1",
        name: "Ava Laurent",
        role: "Brand Programs Manager",
        department: "Brand",
        email: "ava.laurent@notion-demo.com",
        location: "New York",
        initials: "AL",
        tone: "sand",
        status: "active",
      },
      {
        id: "notion-2",
        name: "Julian Park",
        role: "Web Experience Designer",
        department: "Web",
        email: "julian.park@notion-demo.com",
        location: "Remote",
        initials: "JP",
        tone: "slate",
        status: "active",
      },
    ],
  },
  {
    id: "client-salesforce",
    company: "Salesforce",
    contactName: "Erin Dalton",
    contactRole: "Demand Generation Director",
    email: "erin.dalton@salesforce-demo.com",
    location: "Chicago, Illinois",
    website: "salesforce.com",
    logoUrl: "https://logo.clearbit.com/salesforce.com",
    owner: { name: "Sofia Lin", initials: "SL", tone: "peach", id: "member-3", role: "Client Success" },
    stage: "Active",
    health: "Watch",
    invoiceStatus: "Pending",
    activeProjects: 0,
    arr: 346000,
    lastActivity: "Pipeline narrative requested by VP team",
    nextRenewal: "2026-09-19",
    priority: true,
    employees: [
      {
        id: "salesforce-1",
        name: "Erin Dalton",
        role: "Demand Generation Director",
        department: "Demand Gen",
        email: "erin.dalton@salesforce-demo.com",
        location: "Chicago",
        initials: "ED",
        tone: "peach",
        status: "active",
      },
      {
        id: "salesforce-2",
        name: "Rafael Costa",
        role: "Field Marketing Manager",
        department: "Field Marketing",
        email: "rafael.costa@salesforce-demo.com",
        location: "Miami",
        initials: "RC",
        tone: "olive",
        status: "review",
      },
    ],
  },
];

const projects: WorkspaceProject[] = [
  {
    id: 101,
    name: "Search Growth Command Center",
    category: "Growth",
    projectType: "Growth Marketing",
    tone: "sand",
    initials: "GG",
    active: false,
    starred: true,
    clientId: "client-google",
    startDate: "2026-01-12",
    deadline: "2026-05-30",
    description: "A performance dashboard and executive reporting layer for Google’s media experimentation team.",
    members: [
      { name: "Ariana Cole", team: "Strategy", teamId: "team-strategy", email: "ariana.cole@planixdemo.com" },
      { name: "Noah Kim", team: "Growth", teamId: "team-growth", email: "noah.kim@planixdemo.com" },
      { name: "Maya Chen", team: "Client", email: "maya.chen@google-demo.com" },
    ],
    documents: [
      { id: "brief", title: "Project Brief", description: "Performance goals, audience mix, and stakeholder alignment." },
      { id: "invoice", title: "Client Invoice", description: "Current billing summary and payment notes." },
      { id: "design", title: "Design Requirements", description: "Dashboard modules, filtering logic, and chart direction." },
    ],
    goals: [
      { id: "goal-google-1", title: "Reduce reporting lag", description: "Move weekly reporting into an always-on view." },
      { id: "goal-google-2", title: "Improve experiment visibility", description: "Make active tests legible for leadership." },
    ],
  },
  {
    id: 102,
    name: "Retail Launch Experience",
    category: "Product Design",
    projectType: "UX/UI Design",
    tone: "peach",
    initials: "AP",
    active: false,
    starred: true,
    clientId: "client-apple",
    startDate: "2026-02-03",
    deadline: "2026-06-14",
    description: "Launch support flows and immersive product storytelling for Apple retail surfaces.",
    members: [
      { name: "Sofia Lin", team: "Design", teamId: "team-design", email: "sofia.lin@planixdemo.com" },
      { name: "Ariana Cole", team: "Strategy", teamId: "team-strategy", email: "ariana.cole@planixdemo.com" },
      { name: "Elena Brooks", team: "Client", email: "elena.brooks@apple-demo.com" },
    ],
    documents: [
      { id: "brief", title: "Project Brief", description: "Launch narrative, retail touchpoints, and campaign priorities." },
      { id: "invoice", title: "Client Invoice", description: "Retainer billing and upcoming scope change summary." },
      { id: "design", title: "Design Requirements", description: "Store module states and accessibility rules." },
    ],
    goals: [
      { id: "goal-apple-1", title: "Sharpen product storytelling", description: "Reduce friction between hero moments and specs." },
    ],
  },
  {
    id: 103,
    name: "Enterprise AI Microsite",
    category: "Web Experience",
    projectType: "Web Development",
    tone: "olive",
    initials: "NV",
    active: true,
    starred: true,
    clientId: "client-nvidia",
    startDate: "2026-01-20",
    deadline: "2026-04-28",
    description: "A high-conviction enterprise story for NVIDIA’s AI infrastructure and partner ecosystem.",
    members: [
      { name: "Mason Reed", team: "Development", teamId: "team-dev", email: "mason.reed@planixdemo.com" },
      { name: "Sofia Lin", team: "Design", teamId: "team-design", email: "sofia.lin@planixdemo.com" },
      { name: "Leo Vargas", team: "Client", email: "leo.vargas@nvidia-demo.com" },
    ],
    documents: [
      { id: "brief", title: "Project Brief", description: "Audience, GTM story, and conversion target." },
      { id: "invoice", title: "Client Invoice", description: "Milestone invoice and hosting expansion add-on." },
      { id: "design", title: "Design Requirements", description: "Motion, page density, and enterprise proof points." },
    ],
    goals: [
      { id: "goal-nvidia-1", title: "Clarify AI offer", description: "Frame value for enterprise buyers in under 30 seconds." },
      { id: "goal-nvidia-2", title: "Support partner handoff", description: "Drive qualified CTA clicks into sales follow-up." },
    ],
  },
  {
    id: 104,
    name: "Design Ops Resource Hub",
    category: "Knowledge System",
    projectType: "Design System",
    tone: "slate",
    initials: "FG",
    active: false,
    starred: false,
    clientId: "client-figma",
    startDate: "2026-03-01",
    deadline: "2026-06-01",
    description: "An onboarding hub for Figma’s enterprise design operations program.",
    members: [
      { name: "Ivy Patel", team: "Operations", teamId: "team-ops", email: "ivy.patel@planixdemo.com" },
      { name: "Sofia Lin", team: "Design", teamId: "team-design", email: "sofia.lin@planixdemo.com" },
      { name: "Zoey Hart", team: "Client", email: "zoey.hart@figma-demo.com" },
    ],
    documents: [
      { id: "brief", title: "Project Brief", description: "Enablement scope and internal rollout needs." },
      { id: "invoice", title: "Client Invoice", description: "Kickoff invoice and onboarding phase summary." },
      { id: "design", title: "Design Requirements", description: "Resource IA, templates, and governance notes." },
    ],
    goals: [
      { id: "goal-figma-1", title: "Make onboarding repeatable", description: "Turn one-off sessions into a reusable hub." },
    ],
  },
  {
    id: 105,
    name: "Partner Analytics Refresh",
    category: "Dashboard",
    projectType: "Analytics",
    tone: "rose",
    initials: "ST",
    active: false,
    starred: false,
    clientId: "client-stripe",
    startDate: "2026-01-08",
    deadline: "2026-03-25",
    description: "A paused analytics refresh for Stripe’s partner reporting workflow.",
    members: [
      { name: "Noah Kim", team: "Growth", teamId: "team-growth", email: "noah.kim@planixdemo.com" },
      { name: "Mason Reed", team: "Development", teamId: "team-dev", email: "mason.reed@planixdemo.com" },
      { name: "Caleb Ross", team: "Client", email: "caleb.ross@stripe-demo.com" },
    ],
    documents: [
      { id: "brief", title: "Project Brief", description: "Reporting goals, blocked dependencies, and next-step options." },
      { id: "invoice", title: "Client Invoice", description: "Outstanding invoice and project pause note." },
      { id: "design", title: "Design Requirements", description: "Widget priorities and comparative benchmark states." },
    ],
    goals: [
      { id: "goal-stripe-1", title: "Prepare restart path", description: "Keep architecture and content ready for restart." },
    ],
  },
];

function createTask(
  id: number,
  projectRef: string,
  title: string,
  statusId: DemoTaskRecord["status_id"],
  priority: DemoTaskRecord["priority"],
  assignedTo: string[],
  dueDate: string | null,
  sortOrder: number,
  tag = "Product",
  description = "",
  checklistTitles: string[] = [],
): DemoTaskRecord {
  return {
    id,
    title,
    description,
    status_id: statusId,
    tag,
    priority,
    assigned_to: taskAssigneesToString(assignedTo),
    due_date: dueDate,
    reminder_at: dueDate ? `${dueDate}T10:00:00.000Z` : null,
    reminder_date: dueDate,
    created_by: "Planix Studio",
    subtasks: checklistTitles.map((item, index) => ({
      id: `subtask-${id}-${index + 1}`,
      title: item,
      completed: statusId === "completed" || statusId === "done",
    })),
    notes: description ? [description] : [],
    links: [{ id: `link-${id}`, url: "https://planix-template.demo/brief" }],
    comments: [{ id: `comment-${id}`, body: "Looks aligned with the current direction." }],
    file_ids: [],
    created_at: isoDaysAgo(6 - sortOrder, 9 + sortOrder, 15),
    completed_at: statusId === "completed" || statusId === "done" ? isoDaysAgo(1, 15, 20) : null,
    project_ref: projectRef,
    sort_order: sortOrder,
  };
}

const tasksByProject: Record<string, DemoTaskRecord[]> = {
  "101": [
    createTask(1011, "101", "Finalize KPI hierarchy", "review", "High", ["Ariana Cole", "Noah Kim"], "2026-04-12", 1, "Strategy", "Refine the summary card order and benchmark logic.", ["Align metrics", "Approve naming"]),
    createTask(1012, "101", "Ship audience filter states", "progress", "Medium", ["Mason Reed"], "2026-04-16", 2, "Build", "Implement filter persistence for regional views.", ["Desktop", "Tablet"]),
    createTask(1013, "101", "QA weekly report export", "open", "Normal", ["Ivy Patel"], "2026-04-18", 3, "Ops", "Validate PDF formatting across dashboard modules.", ["Run export", "Review layout"]),
    createTask(1014, "101", "Lock Q2 planning deck", "completed", "Done", ["Ariana Cole"], "2026-04-05", 4, "Planning", "Leadership-ready deck for expansion planning.", ["Review deck"]),
  ],
  "102": [
    createTask(1021, "102", "Polish launch hero motion", "progress", "High", ["Sofia Lin"], "2026-04-14", 1, "Design", "Tune motion timing for the launch sequence.", ["Hero", "Fallback state"]),
    createTask(1022, "102", "Review retail copy deck", "review", "Medium", ["Ariana Cole"], "2026-04-15", 2, "Content", "Legal-safe review for in-store messaging.", ["Hero copy", "CTA copy"]),
    createTask(1023, "102", "Prepare prototype handoff", "open", "Normal", ["Sofia Lin", "Mason Reed"], "2026-04-20", 3, "Handoff", "Bundle assets and interaction specs.", ["Frames", "Dev notes"]),
  ],
  "103": [
    createTask(1031, "103", "Refine enterprise value narrative", "review", "High", ["Ariana Cole", "Leo Vargas"], "2026-04-09", 1, "Strategy", "Tighten the opening story and buyer framing.", ["Headline", "Proof points"]),
    createTask(1032, "103", "Build partner ecosystem section", "progress", "High", ["Mason Reed"], "2026-04-10", 2, "Build", "Responsive module with logo rail and CTA states.", ["Desktop build", "Mobile build"]),
    createTask(1033, "103", "Design social proof block", "progress", "Medium", ["Sofia Lin"], "2026-04-11", 3, "Design", "Testimonials, analyst quotes, and GPU deployment metrics.", ["Cards", "Spacing"]),
    createTask(1034, "103", "QA animation performance", "open", "Medium", ["Ivy Patel"], "2026-04-15", 4, "QA", "Audit scroll motion on Chrome and Safari.", ["Desktop QA", "Mobile QA"]),
    createTask(1035, "103", "Finalize infrastructure diagram", "completed", "Done", ["Mason Reed"], "2026-04-06", 5, "Delivery", "Approved diagram for the architecture section.", ["Review with client"]),
  ],
  "104": [
    createTask(1041, "104", "Map onboarding content system", "progress", "Medium", ["Ivy Patel"], "2026-04-21", 1, "Ops", "Outline templates and permissions model.", ["Roles", "Templates"]),
    createTask(1042, "104", "Prepare kickoff workshop notes", "open", "Normal", ["Zoey Hart"], "2026-04-17", 2, "Client", "Capture initial workflow pain points.", ["Agenda", "Notes"]),
  ],
  "105": [
    createTask(1051, "105", "Package restart recommendation", "review", "High", ["Noah Kim"], "2026-04-18", 1, "Recovery", "Present restart pathways with lean and full scope options.", ["Budget note", "Schedule"]),
    createTask(1052, "105", "Archive exploratory widgets", "completed", "Done", ["Mason Reed"], "2026-04-02", 2, "Cleanup", "Freeze paused concepts for future retrieval.", ["Archive"]),
  ],
};

const projectNotificationsStore: Record<string, ProjectNotification[]> = {
  "101": [
    {
      id: "notif-101-1",
      title: "Stakeholder review moved to Thursday",
      time: "2h ago",
      body: "Google moved the KPI review to Thursday afternoon and requested final numbers.",
      kind: "meeting",
      group: "earlier",
      unread: true,
      targetTab: "Notifications",
      initials: "MC",
      avatarTone: "sand",
    },
  ],
  "102": [
    {
      id: "notif-102-1",
      title: "Prototype comments resolved",
      time: "Yesterday",
      body: "Apple approved the current motion direction and cleared the next prototype pass.",
      kind: "completed",
      group: "earlier",
      unread: false,
      targetTab: "Tasks",
    },
  ],
  "103": [
    {
      id: "notif-103-1",
      title: "Client added new proof points",
      time: "18m ago",
      body: "NVIDIA shared updated deployment metrics for the enterprise story block.",
      kind: "comment",
      group: "earlier",
      unread: true,
      targetTab: "Overview",
      initials: "LV",
      avatarTone: "olive",
    },
    {
      id: "notif-103-2",
      title: "Launch milestone approaching",
      time: "Today",
      body: "The microsite launch checkpoint is now 6 working days away.",
      kind: "deadline",
      group: "earlier",
      unread: true,
      targetTab: "Tasks",
    },
  ],
  "104": [],
  "105": [
    {
      id: "notif-105-1",
      title: "Invoice remains overdue",
      time: "3d ago",
      body: "Stripe’s paused project still has one overdue invoice in follow-up.",
      kind: "overdue",
      group: "earlier",
      unread: true,
      targetTab: "Notifications",
    },
  ],
};

function buildProjectFiles(projectRef: string, clientName: string): ProjectFileRecord[] {
  return [
    {
      id: `file-${projectRef}-1`,
      projectRef,
      documentId: "brief",
      name: `${clientName.toLowerCase()}-project-brief.pdf`,
      mimeType: "application/pdf",
      sizeBytes: 482000,
      url: "https://example.com/project-brief.pdf",
      createdAt: isoDaysAgo(7, 11, 0),
      updatedAt: isoDaysAgo(2, 16, 20),
    },
    {
      id: `file-${projectRef}-2`,
      projectRef,
      documentId: "design",
      name: `${clientName.toLowerCase()}-ui-specs.fig`,
      mimeType: "application/octet-stream",
      sizeBytes: 1382000,
      url: "https://example.com/ui-specs.fig",
      createdAt: isoDaysAgo(6, 15, 10),
      updatedAt: isoDaysAgo(1, 13, 50),
    },
  ];
}

const projectFilesByProject: Record<string, ProjectFileRecord[]> = {
  "101": buildProjectFiles("101", "google"),
  "102": buildProjectFiles("102", "apple"),
  "103": buildProjectFiles("103", "nvidia"),
  "104": buildProjectFiles("104", "figma"),
  "105": buildProjectFiles("105", "stripe"),
};

function baseReactions(): DiscussionReaction[] {
  return [
    { emoji: "🔥", count: 2 },
    { emoji: "👏", count: 1 },
  ];
}

const discussionsByProject: Record<string, DemoDiscussionBucket> = {
  "101": {
    threads: [
      {
        id: "thread-101-1",
        title: "Weekly scorecard framing",
        body: "Let’s keep the weekly snapshot focused on CAC, branded share, and regional lift so the leadership readout stays tight.",
        authorName: "Ariana Cole",
        authorInitials: "AC",
        authorTone: "sand",
        createdAt: isoDaysAgo(2, 14, 10),
        starred: true,
        reactions: baseReactions(),
        attachments: [],
      },
    ],
    replies: [
      {
        id: "reply-101-1",
        threadId: "thread-101-1",
        content: "Agreed. I’ll bring in the experiment deltas and annotate the main chart.",
        authorName: "Maya Chen",
        authorInitials: "MC",
        authorTone: "sand",
        createdAt: isoDaysAgo(1, 10, 20),
        reactions: [{ emoji: "✅", count: 1 }],
        attachments: [],
      },
    ],
  },
  "102": {
    threads: [
      {
        id: "thread-102-1",
        title: "Motion pacing for launch modules",
        body: "The hero reveal feels good, but the product strip still needs a slightly slower settle.",
        authorName: "Sofia Lin",
        authorInitials: "SL",
        authorTone: "peach",
        createdAt: isoDaysAgo(3, 9, 15),
        starred: false,
        reactions: [{ emoji: "🎯", count: 2 }],
        attachments: [],
      },
    ],
    replies: [],
  },
  "103": {
    threads: [
      {
        id: "thread-103-1",
        title: "Homepage proof-point hierarchy",
        body: "Recommend leading with enterprise deployment stats before the partner logos so the value lands faster.",
        authorName: "Leo Vargas",
        authorInitials: "LV",
        authorTone: "olive",
        createdAt: isoDaysAgo(1, 12, 0),
        starred: true,
        reactions: [{ emoji: "💡", count: 3 }],
        attachments: [],
      },
      {
        id: "thread-103-2",
        title: "Animation performance check",
        body: "Safari still drops frames on the GPU architecture sequence. We should trim one layer.",
        authorName: "Mason Reed",
        authorInitials: "MR",
        authorTone: "olive",
        createdAt: isoDaysAgo(1, 15, 45),
        starred: false,
        reactions: [{ emoji: "👀", count: 2 }],
        attachments: [],
      },
    ],
    replies: [
      {
        id: "reply-103-1",
        threadId: "thread-103-1",
        content: "Yes. I can move the metric stack above the logo rail in the next build.",
        authorName: "Sofia Lin",
        authorInitials: "SL",
        authorTone: "peach",
        createdAt: isoDaysAgo(1, 13, 10),
        reactions: [{ emoji: "✅", count: 1 }],
        attachments: [],
      },
    ],
  },
  "104": { threads: [], replies: [] },
  "105": {
    threads: [
      {
        id: "thread-105-1",
        title: "Pause comms draft",
        body: "Prepared a concise note that keeps the project warm without implying immediate restart.",
        authorName: "Noah Kim",
        authorInitials: "NK",
        authorTone: "rose",
        createdAt: isoDaysAgo(4, 11, 30),
        starred: false,
        reactions: [{ emoji: "👍", count: 1 }],
        attachments: [],
      },
    ],
    replies: [],
  },
};

const messagesContacts: ChatContact[] = [
  {
    id: "contact-maya",
    name: "Maya Chen",
    email: "maya.chen@google-demo.com",
    initials: "MC",
    tone: "sand",
    role: "Google · Senior Growth Lead",
    status: "online",
    lastMessage: "Looks good from our side.",
    time: "9:42 AM",
    unread: 1,
    pinned: true,
    lastSeenAt: isoToday(9, 42),
  },
  {
    id: "contact-leo",
    name: "Leo Vargas",
    email: "leo.vargas@nvidia-demo.com",
    initials: "LV",
    tone: "olive",
    role: "NVIDIA · AI Partnerships Director",
    status: "busy",
    lastMessage: "Can we tighten the opening value prop?",
    time: "11:08 AM",
    unread: 2,
    pinned: true,
    lastSeenAt: isoToday(11, 8),
  },
  {
    id: "contact-elena",
    name: "Elena Brooks",
    email: "elena.brooks@apple-demo.com",
    initials: "EB",
    tone: "peach",
    role: "Apple · Product Marketing Director",
    status: "online",
    lastMessage: "Prototype feels great.",
    time: "Yesterday",
    unread: 0,
    lastSeenAt: isoDaysAgo(1, 18, 20),
  },
  {
    id: "group-studio",
    name: "Studio Delivery",
    initials: "SD",
    tone: "slate",
    role: "Internal Group",
    status: "online",
    lastMessage: "Sprint handoff posted.",
    time: "8:30 AM",
    isGroup: true,
    groupKind: "workspace",
    memberCount: 5,
    unread: 0,
    pinned: true,
    lastSeenAt: isoToday(8, 30),
  },
];

const messagesThreads: Record<string, ChatThread> = {
  "contact-maya": {
    contactId: "contact-maya",
    date: "08 April 2026 · 09:42",
    messages: [
      { id: "msg-maya-1", content: "We’ve approved the KPI order for the scorecard.", sender: "them", time: "9:12 AM", type: "text" },
      { id: "msg-maya-2", content: "Looks good from our side.", sender: "them", time: "9:42 AM", type: "text", reactions: ["👍"] },
    ],
  },
  "contact-leo": {
    contactId: "contact-leo",
    date: "08 April 2026 · 11:08",
    messages: [
      { id: "msg-leo-1", content: "The architecture section is close.", sender: "them", time: "10:47 AM", type: "text" },
      { id: "msg-leo-2", content: "Can we tighten the opening value prop?", sender: "them", time: "11:08 AM", type: "text" },
    ],
  },
  "contact-elena": {
    contactId: "contact-elena",
    date: "07 April 2026 · 18:20",
    messages: [
      { id: "msg-elena-1", content: "Prototype feels great.", sender: "them", time: "6:20 PM", type: "text", reactions: ["🔥"] },
    ],
  },
  "group-studio": {
    contactId: "group-studio",
    date: "08 April 2026 · 08:30",
    messages: [
      { id: "msg-group-1", content: "Sprint handoff posted.", sender: "them", time: "8:30 AM", type: "text" },
    ],
  },
};

const messagesPayload: MessagesPayload = {
  contacts: messagesContacts,
  threads: messagesThreads,
  preferences: {
    activeStatus: true,
    notifSound: false,
    dnd: false,
  } satisfies ChatPreferences,
};

function createMeetingCandidateFromMember(member: WorkspacePeopleMember): ChatMeetingCandidate {
  return {
    id: member.id,
    name: member.name,
    initials: member.avatarInitials,
    tone: member.avatarTone,
    role: member.role,
  };
}

function createMeetingSession(contactId: string, contactName: string, contactInitials: string, contactTone: AvatarTone): ChatMeetingSession {
  const participants: ChatMeetingParticipant[] = [
    {
      id: "participant-me",
      name: "Ariana Cole",
      initials: "AC",
      tone: "sand",
      role: "Host",
      isHost: true,
      isCurrentUser: true,
      micEnabled: true,
      cameraEnabled: true,
      speakerEnabled: true,
      screenSharing: false,
      joinedAt: isoToday(11, 0),
    },
    {
      id: `participant-${contactId}`,
      name: contactName,
      initials: contactInitials,
      tone: contactTone,
      role: "Guest",
      isHost: false,
      micEnabled: true,
      cameraEnabled: false,
      speakerEnabled: true,
      screenSharing: false,
      joinedAt: isoToday(11, 2),
    },
  ];

  return {
    id: `meeting-${contactId}`,
    title: `${contactName} sync`,
    status: "active",
    startedAt: isoToday(11, 0),
    participants,
    availableParticipants: teamMembers.map(createMeetingCandidateFromMember),
    messages: [
      {
        id: `meeting-message-${contactId}-1`,
        senderId: "participant-me",
        sender: "Ariana Cole",
        initials: "AC",
        tone: "sand",
        content: "Let’s align on the final launch blockers.",
        time: "11:03 AM",
        isMe: true,
      },
    ],
  };
}

const meetingSessions: Record<string, ChatMeetingSession> = {
  "contact-leo": createMeetingSession("contact-leo", "Leo Vargas", "LV", "olive"),
};

const portalMembersByClient: Record<string, ClientPortalMember[]> = Object.fromEntries(
  clients.map((client) => [
    client.id,
    (client.employees ?? []).map((employee, index) => ({
      id: `${client.id}-portal-${index + 1}`,
      workspaceId: "workspace-planix",
      clientId: client.id,
      clientMemberId: employee.id ?? `${client.id}-member-${index + 1}`,
      clientName: client.company,
      memberName: employee.name,
      memberRole: employee.role,
      email: employee.email ?? `${employee.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@${client.website}`,
      accessLevel: "viewer",
      portalEnabled: index === 0,
      canMessage: true,
      lastLoginAt: index === 0 ? isoDaysAgo(index, 10, 30) : null,
    })),
  ]),
);

const activity: ActivityItem[] = [
  { id: 1, name: "NVIDIA", time: "18m ago", action: "Updated proof points", detail: "Enterprise metrics were added to the homepage story.", tone: "olive", initials: "NV", status: "online" },
  { id: 2, name: "Google", time: "2h ago", action: "Approved KPI hierarchy", detail: "Leadership scorecard order is now locked.", tone: "sand", initials: "GO", status: "busy" },
  { id: 3, name: "Figma", time: "Today", action: "Started onboarding hub", detail: "Kickoff notes and content system map were added.", tone: "slate", initials: "FG", status: "neutral" },
];

const profile: ProfileFormState = {
  ...defaultProfile,
  fullName: "Ariana Cole",
  email: "ariana.cole@planixdemo.com",
  phone: "+1 415 555 0190",
  address: "890 Howard Street",
  city: "San Francisco, California",
  timezone: "Pacific Time (UTC-8)",
  jobTitle: "Account Director",
  department: "Strategy",
  yearsExperience: "8 Years",
  degree: "MBA, Marketing Strategy",
  website: "portfolio.planixdemo.com",
  bio: "I lead enterprise accounts across strategy, delivery, and cross-functional launch planning. My focus is turning complex stakeholder needs into crisp delivery systems that feel premium and easy to trust.",
  avatarTone: "sand",
  avatarUrl: "",
  coverUrl: "",
};

const devices: SavedDevice[] = [
  { id: "device-1", device: "MacBook Pro · Chrome", location: "San Francisco, CA", date: "Last active Apr 8, 2026, 10:12 AM", active: true },
  { id: "device-2", device: "iPhone 15 Pro · Safari", location: "San Francisco, CA", date: "Last active Apr 7, 2026, 8:34 PM", active: false },
];

const settings: SettingsBundle = {
  ...defaultSettingsBundle,
  workspace: {
    name: "Planix Studio",
    slug: "planix-studio",
    supportEmail: "support@planixdemo.com",
    timezone: "Pacific Time (UTC-8)",
    region: "United States",
    owner: "Ariana Cole",
    invitePolicy: "admins-only",
    approvalFlow: true,
    digest: true,
  },
  notifications: {
    ...defaultNotificationPreferences,
    sound: true,
    team: true,
  },
  plan: {
    ...defaultPlanSettings,
    name: "Growth Plan",
    priceMonthly: 599,
    renewsOn: "2026-09-30",
    teamMembersUsed: 5,
    teamMembersLimit: 50,
    projectsUsed: 5,
    projectsLimit: 30,
    storageUsedGb: 7,
    storageLimitGb: 50,
    billingHistory: [
      { id: "bill-1", date: "Mar 31, 2026", amount: "$599", status: "Paid", invoiceNumber: "INV-2026-031", planName: "Growth Plan" },
      { id: "bill-2", date: "Feb 29, 2026", amount: "$599", status: "Paid", invoiceNumber: "INV-2026-022", planName: "Growth Plan" },
    ],
  },
  devices,
  projectTypes: ["Growth Marketing", "UX/UI Design", "Web Development", "Design System", "Analytics"],
};

const timeEntries: TimeTrackerEntryRecord[] = [
  {
    id: "time-1",
    projectRef: "103",
    taskId: 1032,
    taskTitle: "Build partner ecosystem section",
    actorName: "Ariana Cole",
    startedAt: isoToday(9, 15),
    endedAt: isoToday(10, 10),
    totalMinutes: 55,
  },
  {
    id: "time-2",
    projectRef: "103",
    taskId: 1033,
    taskTitle: "Design social proof block",
    actorName: "Ariana Cole",
    startedAt: isoMinutesAgo(42),
    endedAt: null,
    totalMinutes: 0,
  },
  {
    id: "time-3",
    projectRef: "101",
    taskId: 1011,
    taskTitle: "Finalize KPI hierarchy",
    actorName: "Ariana Cole",
    startedAt: isoDaysAgo(1, 12, 0),
    endedAt: isoDaysAgo(1, 13, 25),
    totalMinutes: 85,
  },
  {
    id: "time-4",
    projectRef: "102",
    taskId: 1021,
    taskTitle: "Polish launch hero motion",
    actorName: "Ariana Cole",
    startedAt: isoDaysAgo(2, 14, 0),
    endedAt: isoDaysAgo(2, 15, 5),
    totalMinutes: 65,
  },
];

function buildIntegrationsStore(nextProjects: WorkspaceProject[]) {
  return Object.fromEntries(nextProjects.map((project) => [String(project.id), cloneDefaultIntegrations()])) as Record<string, Integration[]>;
}

const projectWorkspaceBundle: ProjectWorkspaceBundle = {
  projects,
  teamMembers: teamMembers.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    avatarInitials: member.avatarInitials,
    avatarTone: member.avatarTone,
    avatarImage: member.avatarImage,
    dateAdded: member.dateAdded,
    lastActive: member.lastActive,
    teamId: member.teamId,
    role: member.role,
  })),
  workspaceTeams,
  notifications: projectNotificationsStore,
  integrations: buildIntegrationsStore(projects),
};

function createInitialState(): DemoState {
  return {
    clients: clone(clients),
    ownerOptions: clone(ownerOptions),
    workspaceTeams: clone(workspaceTeams),
    teamMembers: clone(teamMembers),
    projectWorkspaceBundle: clone(projectWorkspaceBundle),
    tasksByProject: clone(tasksByProject),
    projectFilesByProject: clone(projectFilesByProject),
    discussionsByProject: clone(discussionsByProject),
    portalMembersByClient: clone(portalMembersByClient),
    messages: clone(messagesPayload),
    meetingSessions: clone(meetingSessions),
    meetingSignalsByContact: {},
    settings: clone(settings),
    profile: clone(profile),
    activity: clone(activity),
    snoozedNotifications: {},
    removedNotifications: {},
    timeEntries: clone(timeEntries),
  };
}

let state = createInitialState();

export function resetTemplateDemoStore() {
  state = createInitialState();
}

export function getDemoWorkspaceProjects() {
  return clone(state.projectWorkspaceBundle.projects);
}

export function getDemoProjectWorkspaceBundle() {
  return clone(state.projectWorkspaceBundle);
}

export function setDemoProjectWorkspaceBundle(input: Partial<ProjectWorkspaceBundle>) {
  state.projectWorkspaceBundle = {
    ...state.projectWorkspaceBundle,
    ...clone(input),
    projects: clone(input.projects ?? state.projectWorkspaceBundle.projects),
    teamMembers: clone(input.teamMembers ?? state.projectWorkspaceBundle.teamMembers),
    workspaceTeams: clone(input.workspaceTeams ?? state.projectWorkspaceBundle.workspaceTeams),
    notifications: clone(input.notifications ?? state.projectWorkspaceBundle.notifications),
    integrations: clone(input.integrations ?? state.projectWorkspaceBundle.integrations),
  };
  return getDemoProjectWorkspaceBundle();
}

export function deleteDemoProject(projectId: number) {
  const projectRef = String(projectId);
  const exists = state.projectWorkspaceBundle.projects.some((project) => project.id === projectId);

  if (!exists) {
    return null;
  }

  state.projectWorkspaceBundle.projects = state.projectWorkspaceBundle.projects.filter((project) => project.id !== projectId);
  delete state.projectWorkspaceBundle.notifications[projectRef];
  delete state.projectWorkspaceBundle.integrations[projectRef];
  delete state.tasksByProject[projectRef];
  delete state.projectFilesByProject[projectRef];
  delete state.discussionsByProject[projectRef];
  refreshClientProjectCounts();

  return getDemoProjectWorkspaceBundle();
}

export function getDemoPeopleBundle() {
  return {
    teams: clone(state.workspaceTeams),
    members: clone(state.teamMembers),
    projects: clone(state.projectWorkspaceBundle.projects),
  };
}

export function setDemoPeopleBundle(input: {
  teams: WorkspaceTeamRecord[];
  members: WorkspacePeopleMember[];
  projects: WorkspaceProject[];
}) {
  state.workspaceTeams = clone(input.teams);
  state.teamMembers = clone(input.members);
  state.projectWorkspaceBundle.workspaceTeams = clone(input.teams);
  state.projectWorkspaceBundle.teamMembers = input.members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    avatarInitials: member.avatarInitials,
    avatarTone: member.avatarTone,
    avatarImage: member.avatarImage,
    dateAdded: member.dateAdded,
    lastActive: member.lastActive,
    teamId: member.teamId,
    role: member.role,
  }));
  state.projectWorkspaceBundle.projects = clone(input.projects);
  state.projectWorkspaceBundle.integrations = buildIntegrationsStore(state.projectWorkspaceBundle.projects);
  return getDemoPeopleBundle();
}

export function getDemoClients() {
  return clone(state.clients);
}

export function getDemoOwnerOptions() {
  return clone(state.ownerOptions);
}

function refreshClientProjectCounts() {
  const counts = state.projectWorkspaceBundle.projects.reduce<Record<string, number>>((acc, project) => {
    if (project.clientId && !project.archived) {
      acc[project.clientId] = (acc[project.clientId] ?? 0) + 1;
    }
    return acc;
  }, {});

  state.clients = state.clients.map((client) => ({
    ...client,
    activeProjects: counts[client.id] ?? 0,
  }));
}

export function createDemoClient(input: Partial<ClientRecord>) {
  const client: ClientRecord = {
    id: input.id?.trim() || `client-${Date.now()}`,
    company: input.company?.trim() || "New Client",
    contactName: input.contactName?.trim() || "Primary Contact",
    contactRole: input.contactRole?.trim() || "Marketing Lead",
    email: input.email?.trim() || "contact@newclient.demo",
    location: input.location?.trim() || "Remote",
    website: input.website?.trim() || "newclient.demo",
    logoUrl: input.logoUrl?.trim() || undefined,
    owner: input.owner ?? clone(state.ownerOptions[0] ?? ownerOptions[0]),
    stage: input.stage ?? "Onboarding",
    health: input.health ?? "Healthy",
    invoiceStatus: input.invoiceStatus ?? "Pending",
    activeProjects: input.activeProjects ?? 0,
    arr: input.arr ?? 120000,
    lastActivity: input.lastActivity?.trim() || "Client created just now",
    nextRenewal: input.nextRenewal?.trim() || "2026-12-31",
    priority: input.priority ?? false,
    employees: clone(input.employees ?? []),
  };

  state.clients = [client, ...state.clients];
  return clone(client);
}

export function getDemoClientById(id: string) {
  const resolvedId = resolveDemoClientLookupId(id);
  const client = state.clients.find((item) => item.id === resolvedId);
  return client ? clone(client) : null;
}

function resolveDemoClientLookupId(id: string) {
  const normalizedId = id.trim();

  if (state.clients.some((item) => item.id === normalizedId)) {
    return normalizedId;
  }

  if (/^\d+$/.test(normalizedId)) {
    const legacyIndex = Number(normalizedId) - 1;
    const legacyClientId = state.clients[legacyIndex]?.id;

    if (legacyClientId) {
      return legacyClientId;
    }
  }

  return normalizedId;
}

export function updateDemoClient(id: string, patch: Partial<ClientRecord>) {
  const resolvedId = resolveDemoClientLookupId(id);
  const current = state.clients.find((item) => item.id === resolvedId);
  if (!current) return null;
  const next = {
    ...current,
    ...clone(patch),
    id: current.id,
    owner: patch.owner ? clone(patch.owner) : current.owner,
    employees: patch.employees ? clone(patch.employees) : current.employees,
  } satisfies ClientRecord;
  state.clients = state.clients.map((item) => (item.id === resolvedId ? next : item));
  refreshClientProjectCounts();
  return clone(next);
}

export function deleteDemoClient(id: string) {
  const resolvedId = resolveDemoClientLookupId(id);
  const exists = state.clients.some((item) => item.id === resolvedId);
  if (!exists) return false;
  state.clients = state.clients.filter((item) => item.id !== resolvedId);
  delete state.portalMembersByClient[resolvedId];
  return true;
}

export function getDemoPortalMembers(clientId: string) {
  const resolvedId = resolveDemoClientLookupId(clientId);
  return clone(state.portalMembersByClient[resolvedId] ?? []);
}

export function updateDemoPortalMember(clientId: string, memberId: string, patch: Partial<ClientPortalMember>) {
  const resolvedId = resolveDemoClientLookupId(clientId);
  const members = state.portalMembersByClient[resolvedId] ?? [];
  const member = members.find((item) => item.id === memberId);
  if (!member) return null;
  const next = { ...member, ...clone(patch) };
  state.portalMembersByClient[resolvedId] = members.map((item) => (item.id === memberId ? next : item));
  return clone(next);
}

export function getDemoTasks(projectRef: string) {
  return clone(state.tasksByProject[projectRef] ?? []);
}

function findTask(taskId: number) {
  for (const [projectRef, tasks] of Object.entries(state.tasksByProject)) {
    const task = tasks.find((item) => item.id === taskId);
    if (task) {
      return { projectRef, task };
    }
  }
  return null;
}

export function createDemoTask(input: Partial<DemoTaskRecord> & { project_ref: string; title: string }) {
  const projectRef = input.project_ref;
  const tasks = state.tasksByProject[projectRef] ?? [];
  const nextId = Math.max(1000, ...Object.values(state.tasksByProject).flat().map((item) => item.id)) + 1;
  const task: DemoTaskRecord = {
    id: nextId,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    status_id: input.status_id || "open",
    tag: input.tag?.trim() || "General",
    priority: input.priority || "Normal",
    assigned_to: typeof input.assigned_to === "string" ? input.assigned_to : null,
    due_date: input.due_date ?? null,
    reminder_at: input.reminder_at ?? null,
    reminder_date: input.reminder_date ?? null,
    created_by: input.created_by?.trim() || "Planix Studio",
    subtasks: clone(input.subtasks ?? []),
    notes: clone(input.notes ?? []),
    links: clone(input.links ?? []),
    comments: clone(input.comments ?? []),
    file_ids: clone(input.file_ids ?? []),
    created_at: isoToday(12, 0),
    completed_at: input.status_id === "completed" || input.status_id === "done" ? isoToday(12, 0) : null,
    project_ref: projectRef,
    sort_order: input.sort_order ?? tasks.length,
  };
  state.tasksByProject[projectRef] = [...tasks, task];
  return clone(task);
}

export function updateDemoTask(taskId: number, patch: Partial<DemoTaskRecord> & { projectRef?: string | null }) {
  const match = findTask(taskId);
  if (!match) return null;
  const targetProjectRef = patch.projectRef?.trim() || patch.project_ref?.trim() || match.projectRef;
  state.tasksByProject[match.projectRef] = state.tasksByProject[match.projectRef].filter((item) => item.id !== taskId);
  const nextTask: DemoTaskRecord = {
    ...match.task,
    ...clone(patch),
    project_ref: targetProjectRef,
    completed_at: (patch.status_id === "completed" || patch.status_id === "done")
      ? patch.completed_at ?? isoToday(12, 0)
      : patch.status_id && patch.status_id !== "completed" && patch.status_id !== "done"
        ? null
        : match.task.completed_at,
  };
  state.tasksByProject[targetProjectRef] = [...(state.tasksByProject[targetProjectRef] ?? []), nextTask]
    .sort((left, right) => left.sort_order - right.sort_order);
  return clone(nextTask);
}

export function deleteDemoTask(taskId: number) {
  const match = findTask(taskId);
  if (!match) return false;
  state.tasksByProject[match.projectRef] = state.tasksByProject[match.projectRef].filter((item) => item.id !== taskId);
  return true;
}

export function reorderDemoTasks(tasks: Array<{ id: number; statusId: string; sortOrder: number; projectRef: string }>) {
  tasks.forEach((task) => {
    updateDemoTask(task.id, {
      status_id: task.statusId,
      sort_order: task.sortOrder,
      project_ref: task.projectRef,
      projectRef: task.projectRef,
    });
  });
}

export function getDemoProjectFiles(projectRef: string) {
  return clone(state.projectFilesByProject[projectRef] ?? []);
}

export function setDemoProjectFiles(projectRef: string, files: ProjectFileRecord[]) {
  state.projectFilesByProject[projectRef] = clone(files);
  return getDemoProjectFiles(projectRef);
}

export function getDemoDiscussions(projectRef: string) {
  return clone(state.discussionsByProject[projectRef] ?? { threads: [], replies: [] });
}

export function setDemoDiscussions(projectRef: string, bucket: DemoDiscussionBucket) {
  state.discussionsByProject[projectRef] = clone(bucket);
  return getDemoDiscussions(projectRef);
}

export function getDemoMessagesPayload() {
  return clone(state.messages);
}

function syncContactPreview(contactId: string) {
  const thread = state.messages.threads[contactId];
  const lastMessage = thread?.messages[thread.messages.length - 1] ?? null;

  state.messages.contacts = state.messages.contacts.map((contact) => {
    if (contact.id !== contactId) {
      return contact;
    }

    if (!lastMessage) {
      return { ...contact, lastMessage: "", time: "" };
    }

    return {
      ...contact,
      lastMessage: lastMessage.sender === "me" ? `You: ${lastMessage.content}` : lastMessage.content,
      time: lastMessage.time,
      callEnded: false,
    };
  });
}

export function updateDemoMessagePreferences(preferences: ChatPreferences) {
  state.messages.preferences = clone(preferences);
  return clone(state.messages.preferences);
}

export function appendDemoMessage(contactId: string, message: ChatMessage) {
  const thread = state.messages.threads[contactId] ?? { contactId, date: "08 April 2026 · 12:00", messages: [] };
  state.messages.threads[contactId] = {
    ...thread,
    messages: [...thread.messages, clone(message)],
  };
  syncContactPreview(contactId);
  return getDemoMessagesPayload();
}

export function updateDemoMessage(contactId: string, messageId: string, content: string) {
  const thread = state.messages.threads[contactId];
  if (!thread) return null;
  thread.messages = thread.messages.map((message) =>
    message.id === messageId ? { ...message, content, edited: true } : message,
  );
  syncContactPreview(contactId);
  return getDemoMessagesPayload();
}

export function deleteDemoMessage(contactId: string, messageId: string) {
  const thread = state.messages.threads[contactId];
  if (!thread) return null;
  thread.messages = thread.messages.filter((message) => message.id !== messageId);
  syncContactPreview(contactId);
  return getDemoMessagesPayload();
}

export function deleteDemoThread(contactId: string) {
  state.messages.contacts = state.messages.contacts.filter((contact) => contact.id !== contactId);
  delete state.messages.threads[contactId];
  delete state.meetingSessions[contactId];
}

export function updateDemoThreadContact(contactId: string, patch: Partial<ChatContact>) {
  const current = state.messages.contacts.find((contact) => contact.id === contactId);

  if (!current) {
    return null;
  }

  const next: ChatContact = {
    ...current,
    ...clone(patch),
    id: current.id,
    name: patch.name?.trim() || current.name,
    email: typeof patch.email === "string" ? patch.email.trim() || undefined : current.email,
    role: patch.role?.trim() || current.role,
    lastMessage: patch.lastMessage?.trim() || current.lastMessage,
    time: patch.time?.trim() || current.time,
  };

  state.messages.contacts = state.messages.contacts.map((contact) =>
    contact.id === contactId ? next : contact,
  );

  return clone(next);
}

export function createDemoGroupChat(name: string, memberIds: string[]) {
  const contactId = `group-${Date.now()}`;
  const contact: ChatContact = {
    id: contactId,
    name: name.trim(),
    initials: buildInitials(name),
    tone: avatarTone(state.messages.contacts.length),
    role: "Custom Group",
    status: "online",
    lastMessage: "Group created",
    time: "Now",
    isGroup: true,
    groupKind: "custom",
    memberCount: memberIds.length + 1,
    unread: 0,
  };

  state.messages.contacts = [contact, ...state.messages.contacts];
  state.messages.threads[contactId] = {
    contactId,
    date: "08 April 2026 · 12:00",
    messages: [
      {
        id: `msg-${contactId}-1`,
        content: "Group created",
        sender: "me",
        time: "12:00 PM",
        type: "text",
      },
    ],
  };

  return contactId;
}

export function getDemoMeetingSession(contactId: string) {
  const existing = state.meetingSessions[contactId];
  if (existing) return clone(existing);

  const contact = state.messages.contacts.find((item) => item.id === contactId);
  const next = createMeetingSession(contactId, contact?.name ?? "Client", contact?.initials ?? "CL", contact?.tone ?? "slate");
  state.meetingSessions[contactId] = next;
  return clone(next);
}

export function updateDemoMeetingSession(contactId: string, patch: Partial<ChatMeetingSession>) {
  const current = getDemoMeetingSession(contactId);
  const next = { ...current, ...clone(patch) };
  state.meetingSessions[contactId] = next;
  return clone(next);
}

export function addDemoMeetingMessage(contactId: string, content: string) {
  const meeting = getDemoMeetingSession(contactId);
  const nextMessage: ChatMeetingMessage = {
    id: `meeting-message-${Date.now()}`,
    senderId: "participant-me",
    sender: "Ariana Cole",
    initials: "AC",
    tone: "sand",
    content,
    time: "12:00 PM",
    isMe: true,
  };
  meeting.messages.push(nextMessage);
  state.meetingSessions[contactId] = meeting;
  return clone(meeting);
}

export function addDemoMeetingParticipant(contactId: string, participantId: string) {
  const meeting = getDemoMeetingSession(contactId);
  if (meeting.participants.some((item) => item.id === participantId)) {
    return clone(meeting);
  }
  const candidate = meeting.availableParticipants.find((item) => item.id === participantId);
  if (!candidate) {
    return clone(meeting);
  }
  meeting.participants.push({
    id: candidate.id,
    name: candidate.name,
    initials: candidate.initials,
    tone: candidate.tone,
    role: candidate.role,
    isHost: false,
    micEnabled: true,
    cameraEnabled: false,
    speakerEnabled: true,
    screenSharing: false,
    joinedAt: isoToday(12, 0),
  });
  state.meetingSessions[contactId] = meeting;
  return clone(meeting);
}

export function updateDemoMeetingParticipant(contactId: string, participantId: string, patch: { micEnabled?: boolean; kicked?: boolean }) {
  const meeting = getDemoMeetingSession(contactId);
  meeting.participants = meeting.participants
    .map((participant) => participant.id === participantId ? { ...participant, micEnabled: patch.micEnabled ?? participant.micEnabled } : participant)
    .filter((participant) => !(patch.kicked && participant.id === participantId));
  state.meetingSessions[contactId] = meeting;
  return clone(meeting);
}

export function updateDemoMeetingControls(contactId: string, patch: { micEnabled?: boolean; cameraEnabled?: boolean; speakerEnabled?: boolean; screenSharing?: boolean; ended?: boolean; left?: boolean }) {
  const meeting = getDemoMeetingSession(contactId);
  const current = meeting.participants.find((participant) => participant.isCurrentUser);
  if (current) {
    current.micEnabled = patch.micEnabled ?? current.micEnabled;
    current.cameraEnabled = patch.cameraEnabled ?? current.cameraEnabled;
    current.speakerEnabled = patch.speakerEnabled ?? current.speakerEnabled;
    current.screenSharing = patch.screenSharing ?? current.screenSharing;
  }
  if (patch.left && current) {
    meeting.participants = meeting.participants.filter((participant) => participant.id !== current.id);
  }
  if (patch.ended) {
    meeting.status = "ended";
    meeting.endedAt = isoToday(12, 5);
  }
  state.meetingSessions[contactId] = meeting;
  return clone(meeting);
}

export function listDemoMeetingSignals(contactId: string, after?: string | null) {
  const signals = state.meetingSignalsByContact[contactId] ?? [];
  if (!after) {
    return clone(signals);
  }
  return clone(signals.filter((signal) => signal.createdAt > after));
}

export function appendDemoMeetingSignal(contactId: string, signal: Omit<ChatMeetingSignalEnvelope, "id" | "createdAt">) {
  const nextSignal: ChatMeetingSignalEnvelope = {
    ...clone(signal),
    id: `signal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  state.meetingSignalsByContact[contactId] = [...(state.meetingSignalsByContact[contactId] ?? []), nextSignal];
  return clone(nextSignal);
}

export function getDemoSettings() {
  return clone(state.settings);
}

export function updateDemoSettings(patch: Partial<SettingsBundle>) {
  state.settings = {
    ...state.settings,
    ...clone(patch),
    workspace: clone(patch.workspace ?? state.settings.workspace),
    notifications: clone(patch.notifications ?? state.settings.notifications),
    plan: clone(patch.plan ?? state.settings.plan),
    devices: clone(patch.devices ?? state.settings.devices),
    projectTags: clone(patch.projectTags ?? state.settings.projectTags),
    projectTypes: clone(patch.projectTypes ?? state.settings.projectTypes),
  };
  return getDemoSettings();
}

export function getDemoProfile() {
  return clone(state.profile);
}

export function updateDemoProfile(patch: Partial<ProfileFormState>) {
  state.profile = { ...state.profile, ...clone(patch) };
  return getDemoProfile();
}

export function getDemoActivity() {
  const unique = Array.from(
    new Map(state.activity.map((item) => [String(item.id), item])).values(),
  );

  state.activity = unique;
  return clone(unique);
}

export function appendDemoActivity(item: ActivityItem) {
  state.activity = Array.from(
    new Map([clone(item), ...state.activity].map((entry) => [String(entry.id), entry])).values(),
  ).slice(0, 50);
  return getDemoActivity();
}

export function getDemoNotificationsData(): NotificationsCenterData {
  const projectNotificationsStore = Object.fromEntries(
    Object.entries(state.projectWorkspaceBundle.notifications).map(([projectRef, notifications]) => [
      projectRef,
      notifications.flatMap((notification) => {
        const compositeId = `${projectRef}::${notification.id}`;
        if (state.removedNotifications[compositeId]) {
          return [];
        }
        return [clone(notification)];
      }),
    ]),
  );

  return {
    workspaceProjects: clone(state.projectWorkspaceBundle.projects),
    projectNotificationsStore,
    snoozedNotifications: clone(state.snoozedNotifications),
  };
}

export function markDemoNotificationRead(projectRef: string, notificationId: string, unread: boolean) {
  state.projectWorkspaceBundle.notifications[projectRef] = (state.projectWorkspaceBundle.notifications[projectRef] ?? []).map((notification) =>
    notification.id === notificationId ? { ...notification, unread } : notification,
  );
  return getDemoNotificationsData();
}

export function snoozeDemoNotification(projectRef: string, notificationId: string, snoozed: boolean) {
  const compositeId = `${projectRef}::${notificationId}`;
  if (snoozed) {
    state.snoozedNotifications[compositeId] = true;
  } else {
    delete state.snoozedNotifications[compositeId];
  }
  return getDemoNotificationsData();
}

export function removeDemoNotification(projectRef: string, notificationId: string) {
  state.removedNotifications[`${projectRef}::${notificationId}`] = true;
  return getDemoNotificationsData();
}

export function markAllDemoNotificationsRead() {
  state.projectWorkspaceBundle.notifications = Object.fromEntries(
    Object.entries(state.projectWorkspaceBundle.notifications).map(([projectRef, notifications]) => [
      projectRef,
      notifications.map((notification) => ({ ...notification, unread: false })),
    ]),
  );
  return getDemoNotificationsData();
}

function resolveTaskTitle(projectRef: string, taskId: number | null) {
  if (taskId == null) return null;
  return state.tasksByProject[projectRef]?.find((task) => task.id === taskId)?.title ?? null;
}

export function getDemoTimeTrackerDashboard(actorName = "Ariana Cole"): TimeTrackerDashboardPayload {
  const entries = state.timeEntries.filter((entry) => entry.actorName === actorName);
  const activeEntries = entries.filter((entry) => !entry.endedAt);
  const now = Date.now();
  const totalMinutes = entries.reduce((sum, entry) => {
    if (entry.endedAt) return sum + entry.totalMinutes;
    const started = new Date(entry.startedAt).getTime();
    return sum + Math.max(0, Math.round((now - started) / 60_000));
  }, 0);
  const todayMinutes = totalMinutes;
  const previousPeriodMinutes: number = 165;
  const byProject = new Map<string, { totalMinutes: number; entryCount: number; taskIds: Set<number> }>();
  const byTask = new Map<string, { projectRef: string; taskId: number | null; title: string; totalMinutes: number }>();

  entries.forEach((entry) => {
    const minutes = entry.endedAt
      ? entry.totalMinutes
      : Math.max(0, Math.round((now - new Date(entry.startedAt).getTime()) / 60_000));
    const projectRecord = byProject.get(entry.projectRef) ?? { totalMinutes: 0, entryCount: 0, taskIds: new Set<number>() };
    projectRecord.totalMinutes += minutes;
    projectRecord.entryCount += 1;
    if (entry.taskId != null) {
      projectRecord.taskIds.add(entry.taskId);
    }
    byProject.set(entry.projectRef, projectRecord);

    const taskKey = `${entry.projectRef}:${entry.taskId ?? "general"}`;
    const taskRecord = byTask.get(taskKey) ?? {
      projectRef: entry.projectRef,
      taskId: entry.taskId,
      title: entry.taskTitle ?? resolveTaskTitle(entry.projectRef, entry.taskId) ?? "General work",
      totalMinutes: 0,
    };
    taskRecord.totalMinutes += minutes;
    byTask.set(taskKey, taskRecord);
  });

  return {
    activeEntry: activeEntries[0] ? clone({
      ...activeEntries[0],
      taskTitle: activeEntries[0].taskTitle ?? resolveTaskTitle(activeEntries[0].projectRef, activeEntries[0].taskId),
    }) : null,
    activeEntries: clone(activeEntries),
    summary: {
      totalMinutes,
      todayMinutes,
      previousPeriodMinutes,
      trendPercent: previousPeriodMinutes === 0 ? null : Math.round(((todayMinutes - previousPeriodMinutes) / previousPeriodMinutes) * 100),
      daily: [
        { date: "2026-04-02", label: "Apr 2", totalMinutes: 140 },
        { date: "2026-04-03", label: "Apr 3", totalMinutes: 165 },
        { date: "2026-04-04", label: "Apr 4", totalMinutes: 98 },
        { date: "2026-04-05", label: "Apr 5", totalMinutes: 180 },
        { date: "2026-04-06", label: "Apr 6", totalMinutes: 155 },
        { date: "2026-04-07", label: "Apr 7", totalMinutes: 85 },
        { date: "2026-04-08", label: "Apr 8", totalMinutes: todayMinutes },
      ],
    },
    projectBreakdown: Array.from(byProject.entries()).map(([projectRef, value]) => ({
      projectRef,
      totalMinutes: value.totalMinutes,
      entryCount: value.entryCount,
      taskCount: value.taskIds.size,
    })),
    taskBreakdown: Array.from(byTask.values()).map((item) => ({
      taskId: item.taskId,
      projectRef: item.projectRef,
      title: item.title,
      totalMinutes: item.totalMinutes,
      sharePercent: totalMinutes > 0 ? Math.round((item.totalMinutes / totalMinutes) * 100) : 0,
    })),
  };
}

export function startDemoTimer(projectRef: string, taskId: number | null, actorName: string) {
  state.timeEntries.push({
    id: `time-${Date.now()}`,
    projectRef,
    taskId,
    taskTitle: resolveTaskTitle(projectRef, taskId),
    actorName,
    startedAt: new Date().toISOString(),
    endedAt: null,
    totalMinutes: 0,
  });
  return getDemoTimeTrackerDashboard(actorName);
}

export function stopDemoTimer(entryId: string | null, actorName: string) {
  const activeEntry = state.timeEntries.find((entry) =>
    entry.actorName === actorName && !entry.endedAt && (!entryId || entry.id === entryId),
  );
  if (activeEntry) {
    const endedAt = new Date().toISOString();
    const totalMinutes = Math.max(1, Math.round((new Date(endedAt).getTime() - new Date(activeEntry.startedAt).getTime()) / 60_000));
    activeEntry.endedAt = endedAt;
    activeEntry.totalMinutes = totalMinutes;
  }
  return getDemoTimeTrackerDashboard(actorName);
}

export function buildDemoCompanyProfile(clientId: string): CompanyProfile | null {
  const resolvedId = resolveDemoClientLookupId(clientId);
  const client = state.clients.find((item) => item.id === resolvedId);
  if (!client) return null;
  const relatedProjects = state.projectWorkspaceBundle.projects.filter((project) => project.clientId === resolvedId);
  const projectSummaries = relatedProjects.map((project) => {
    const tasks = state.tasksByProject[String(project.id)] ?? [];
    const doneCount = tasks.filter((task) => task.status_id === "completed" || task.status_id === "done").length;
    const reviewCount = tasks.filter((task) => task.status_id === "review").length;
    const progressCount = tasks.filter((task) => task.status_id === "progress").length;
    const status = doneCount === tasks.length && tasks.length > 0
      ? "Completed"
      : reviewCount > 0
        ? "Review"
        : progressCount > 0
          ? "In Delivery"
          : "Discovery";

    return {
      id: String(project.id),
      name: project.name,
      service: project.projectType?.trim() || project.category,
      status,
      ownerName: project.members?.[0]?.name ?? client.owner.name,
      dueDate: project.deadline || client.nextRenewal,
      budget: Math.round(client.arr / Math.max(1, client.activeProjects || 1)),
      progress: tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 12,
    } satisfies CompanyProfile["projects"][number];
  });

  return {
    clientId: client.id,
    legalName: `${client.company} Innovation Group`,
    industry: `${client.company} Enterprise`,
    companySize: `${Math.max(24, (client.employees?.length ?? 1) * 18)} employees`,
    headquarters: client.location,
    founded: "2012",
    timezone: "Pacific Time (UTC-8)",
    overview: `${client.company} is represented in this template as a premium enterprise account with an active delivery motion, key stakeholders, and a polished project relationship overview.`,
    primaryGoal: client.stage === "Expansion"
      ? "Scale the current engagement without losing executive clarity."
      : client.stage === "Paused"
        ? "Keep context clean and ready for restart."
        : "Keep momentum high across design, build, and stakeholder reviews.",
    contractModel: client.invoiceStatus === "Paid" ? "Monthly retainer" : "Milestone-based engagement",
    employees: (client.employees ?? []).map((employee, index) => ({
      id: employee.id ?? `${client.id}-employee-${index + 1}`,
      name: employee.name,
      role: employee.role,
      department: employee.department ?? "Client Team",
      email: employee.email ?? `${employee.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@${client.website}`,
      location: employee.location ?? client.location,
      initials: employee.initials ?? buildInitials(employee.name),
      tone: employee.tone ?? avatarTone(index),
      status: employee.status ?? "active",
    })),
    projects: projectSummaries,
  };
}

function buildPortalProject(project: WorkspaceProject, client: ClientRecord): ClientPortalProject {
  const tasks = state.tasksByProject[String(project.id)] ?? [];
  const openTaskCount = tasks.filter((task) => task.status_id !== "completed" && task.status_id !== "done").length;
  return {
    id: project.id,
    workspaceId: "workspace-planix",
    clientId: client.id,
    clientName: client.company,
    name: project.name,
    service: project.projectType?.trim() || project.category,
    status: openTaskCount === 0 ? "Completed" : tasks.some((task) => task.status_id === "review") ? "Review" : tasks.some((task) => task.status_id === "progress") ? "In Delivery" : "Discovery",
    progress: tasks.length > 0 ? Math.round((tasks.filter((task) => task.status_id === "completed" || task.status_id === "done").length / tasks.length) * 100) : 10,
    dueDate: project.deadline,
    teamMembers: (project.members ?? []).map((member) => member.name),
    taskCount: tasks.length,
    openTaskCount,
  };
}

function buildPortalTask(project: WorkspaceProject, client: ClientRecord, task: DemoTaskRecord): ClientPortalTask {
  return {
    id: task.id,
    projectId: project.id,
    projectName: project.name,
    title: task.title,
    description: task.description,
    statusId: task.status_id,
    priority: task.priority,
    assignedTo: task.assigned_to ?? "",
    dueDate: task.due_date,
    createdAt: task.created_at,
  };
}

export function getDemoPortalDashboard(): ClientPortalDashboard {
  const accounts = state.clients.slice(0, 3).map((client) => {
    const member = (state.portalMembersByClient[client.id] ?? []).find((item) => item.portalEnabled) ?? state.portalMembersByClient[client.id]?.[0];
    const clientProjects = state.projectWorkspaceBundle.projects.filter((project) => project.clientId === client.id);
    const projects = clientProjects.map((project) => buildPortalProject(project, client));
    const tasks = clientProjects.flatMap((project) =>
      (state.tasksByProject[String(project.id)] ?? []).map((task) => buildPortalTask(project, client, task)),
    );

    return {
      workspaceId: "workspace-planix",
      clientId: client.id,
      clientName: client.company,
      memberName: member?.memberName ?? client.contactName,
      memberRole: member?.memberRole ?? client.contactRole,
      canMessage: member?.canMessage ?? true,
      projects,
      tasks,
    };
  });

  const allTasks = accounts.flatMap((account) => account.tasks);
  return {
    accounts,
    totalProjects: accounts.reduce((sum, account) => sum + account.projects.length, 0),
    totalTasks: allTasks.length,
    openTasks: allTasks.filter((task) => task.statusId === "open" || task.statusId === "progress").length,
    reviewTasks: allTasks.filter((task) => task.statusId === "review").length,
    completedTasks: allTasks.filter((task) => task.statusId === "completed" || task.statusId === "done").length,
  };
}

export function getDemoPortalProjectDetail(projectId: number): ClientPortalProjectDetail | null {
  const project = state.projectWorkspaceBundle.projects.find((item) => item.id === projectId);
  if (!project || !project.clientId) return null;
  const client = state.clients.find((item) => item.id === project.clientId);
  if (!client) return null;
  const dashboard = getDemoPortalDashboard();
  const account = dashboard.accounts.find((item) => item.clientId === client.id);
  const portalProject = buildPortalProject(project, client);
  const tasks = (state.tasksByProject[String(project.id)] ?? []).map((task) => buildPortalTask(project, client, task));
  const files: ClientPortalFile[] = (state.projectFilesByProject[String(project.id)] ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    url: file.url,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    updatedAt: file.updatedAt,
  }));
  const discussions: ClientPortalDiscussion[] = (state.discussionsByProject[String(project.id)]?.threads ?? []).map((thread) => ({
    id: thread.id,
    title: thread.title,
    body: thread.body,
    authorName: thread.authorName,
    createdAt: thread.createdAt,
    replyCount: (state.discussionsByProject[String(project.id)]?.replies ?? []).filter((reply) => reply.threadId === thread.id).length,
    attachmentCount: thread.attachments.length,
  }));
  const notifications = (state.projectWorkspaceBundle.notifications[String(project.id)] ?? []).map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    time: notification.time,
    kind: notification.kind,
    unread: Boolean(notification.unread),
  }));

  if (!account) {
    return null;
  }

  return {
    account,
    project: portalProject,
    tasks,
    files,
    discussions,
    notifications,
  };
}
