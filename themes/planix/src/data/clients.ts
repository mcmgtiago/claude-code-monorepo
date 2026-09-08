import type { AvatarTone } from "@/data/dashboard";

export type ClientStage = "Onboarding" | "Active" | "Expansion" | "Paused";
export type ClientHealth = "Healthy" | "Watch" | "At Risk";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export type ClientOwner = {
  name: string;
  initials: string;
  tone: AvatarTone;
  id?: string;
  role?: string;
  email?: string;
};

export type ClientOwnerOption = {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  role: string;
  email?: string;
};

export type ClientEmployeeRecord = {
  id?: string;
  name: string;
  role: string;
  department?: string;
  email?: string;
  location?: string;
  initials?: string;
  tone?: AvatarTone;
  status?: "active" | "review" | "offline";
};

export type CompanyEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  location: string;
  initials: string;
  tone: AvatarTone;
  status: "active" | "review" | "offline";
};

export type CompanyProject = {
  id: string;
  name: string;
  service: string;
  status: "Discovery" | "In Delivery" | "Review" | "Completed";
  ownerName: string;
  dueDate: string;
  budget: number;
  progress: number;
};

export type CompanyProfile = {
  clientId: string;
  legalName: string;
  industry: string;
  companySize: string;
  headquarters: string;
  founded: string;
  timezone: string;
  overview: string;
  primaryGoal: string;
  contractModel: string;
  employees: CompanyEmployee[];
  projects: CompanyProject[];
};

export type ClientRecord = {
  id: string;
  company: string;
  contactName: string;
  contactRole: string;
  email: string;
  location: string;
  website: string;
  logoUrl?: string;
  owner: ClientOwner;
  stage: ClientStage;
  health: ClientHealth;
  invoiceStatus: InvoiceStatus;
  activeProjects: number;
  arr: number;
  lastActivity: string;
  nextRenewal: string;
  priority: boolean;
  archived?: boolean;
  employees?: ClientEmployeeRecord[];
};

export const clientStageOptions: ClientStage[] = ["Onboarding", "Active", "Expansion", "Paused"];
export const clientHealthOptions: ClientHealth[] = ["Healthy", "Watch", "At Risk"];
export const invoiceStatusOptions: InvoiceStatus[] = ["Paid", "Pending", "Overdue"];
export const clientSortOptions = ["Newest activity", "ARR high to low", "Renewal date", "Company name"] as const;
