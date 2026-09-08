"use client";

import { AppSelect } from "@/components/app-select";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  AlignLeft,
  ArrowLeft,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Linkedin,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  Plane,
  UserRound
} from "lucide-react";
import { Card } from "@/components/card";
import { CompanyLogo } from "@/components/company-logo";
import { FeedbackToast } from "@/components/feedback-toast";
import { RelatedEmailModal } from "@/components/related-email-modal";
import { formatLocalizedCurrency, formatLocalizedDate, type WorkspaceLocalizationSettings } from "@/lib/localization";
import { leadStatusLabels, leadStatusTones, type LeadStatusValue } from "@/lib/crm";
import { contactStages, initials } from "@/lib/people";
import { normalizePeopleFieldValueForType, type PeopleFieldDefinition, type PeopleFieldValue, type PeopleFieldValues } from "@/lib/people-fields";

type CompanyOption = {
  id: string;
  name: string;
  companyType: string | null;
  website: string | null;
  phone: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  contactsCount: number;
};

type ContactDetail = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  stage: string | null;
  linkedinUrl: string | null;
  location: string | null;
  timeZone: string | null;
  customFields: PeopleFieldValues;
  createdAt: Date | string;
  company: {
    id: string;
    name: string;
    type: string | null;
    phone: string | null;
    logoUrl: string | null;
    website: string | null;
    industry: string | null;
    location: string | null;
    description: string | null;
    createdAt?: Date | string;
    contacts?: Array<{ id: string }>;
  } | null;
};

type RelatedContact = {
  id: string;
  fullName: string;
  title: string | null;
  email: string | null;
};

type LinkedLead = {
  id: string;
  name: string;
  status: LeadStatusValue;
  value: number;
  dueDate: string | Date | null;
  assignedUsers: string[];
  remindersCount: number;
};

type ContactDraft = {
  fullName: string;
  email: string;
  phone: string;
  title: string;
  stage: string;
  linkedinUrl: string;
  location: string;
  timeZone: string;
  companyId: string;
  companyName: string;
  companyType: string;
  companyPhone: string;
  companyWebsite: string;
  companyIndustry: string;
  companyLocation: string;
  companyDescription: string;
  customFields: PeopleFieldValues;
};

type CompanyPreview = {
  id: string;
  name: string;
  type: string | null;
  phone: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  contacts?: Array<{ id: string }>;
  contactsCount?: number;
};

const editInputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const editInputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const editIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4";

const editSelectClassName = `${editInputClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

function normalizeExternalUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

function composePipelineHref(contact: ContactDetail) {
  const params = new URLSearchParams({
    createLead: "1",
    contactId: contact.id
  });

  return `/pipeline?${params.toString()}`;
}

function companyNarrative(contact: ContactDetail) {
  if (!contact.company) {
    return "This person is currently tracked independently. Link a company when the account is verified.";
  }

  if (contact.company.website) {
    return `${contact.company.name} is the linked account for this contact. Use the company record for verified account details and the rest of the team.`;
  }

  return `${contact.company.name} is the linked account for this contact. Complete the company record when verified details are available.`;
}

function metadataRows(contact: ContactDetail) {
  return [
    {
      label: "Primary email",
      value: contact.email || "Not available",
      icon: Mail,
      href: contact.email
        ? `/inbox?${new URLSearchParams({
            compose: "new",
            to: contact.email,
            subject: `Follow up with ${contact.fullName}`
          }).toString()}`
        : undefined
    },
    { label: "Phone number", value: contact.phone || "Not available", icon: Phone, href: contact.phone ? `tel:${contact.phone}` : undefined },
    { label: "Job title", value: contact.title || "Not set", icon: BriefcaseBusiness },
    { label: "Location", value: contact.location || "Not set", icon: MapPin },
    { label: "Stage", value: contact.stage || "Lead", icon: CheckCircle2 },
    { label: "Time zone", value: contact.timeZone || "Not set", icon: CalendarDays },
    {
      label: "LinkedIn",
      value: contact.linkedinUrl ? "Open profile" : "Not attached",
      icon: Linkedin,
      href: contact.linkedinUrl ? normalizeExternalUrl(contact.linkedinUrl) : undefined
    }
  ];
}

function customFieldDisplayValue(value: PeopleFieldValue) {
  if (value === null || value === undefined) {
    return "Not set";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not set";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function draftFromContact(contact: ContactDetail): ContactDraft {
  return {
    fullName: contact.fullName || "",
    email: contact.email || "",
    phone: contact.phone || "",
    title: contact.title || "",
    stage: contact.stage || "",
    linkedinUrl: contact.linkedinUrl || "",
    location: contact.location || "",
    timeZone: contact.timeZone || "",
    companyId: contact.company?.id || "",
    companyName: contact.company?.name || "",
    companyType: contact.company?.type || "",
    companyPhone: contact.company?.phone || "",
    companyWebsite: contact.company?.website || "",
    companyIndustry: contact.company?.industry || "",
    companyLocation: contact.company?.location || "",
    companyDescription: contact.company?.description || "",
    customFields: contact.customFields || {}
  };
}

function mergeSelectedCompanyIntoDraft(current: ContactDraft, company: CompanyOption | null) {
  if (!company) {
    return current;
  }

  return {
    ...current,
    companyId: current.companyId || company.id,
    companyName: current.companyName || company.name,
    companyType: current.companyType || company.companyType || "",
    companyPhone: current.companyPhone || company.phone || "",
    companyWebsite: current.companyWebsite || company.website || "",
    companyIndustry: current.companyIndustry || company.industry || "",
    companyLocation: current.companyLocation || company.location || "",
    companyDescription: current.companyDescription || company.description || ""
  };
}

export function ContactProfileView({
  contact,
  companies,
  customFields,
  relatedContacts,
  linkedLeads,
  localization
}: {
  contact: ContactDetail;
  companies: CompanyOption[];
  customFields: PeopleFieldDefinition[];
  relatedContacts: RelatedContact[];
  linkedLeads: LinkedLead[];
  localization: WorkspaceLocalizationSettings;
}) {
  const [profile, setProfile] = useState(contact);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => draftFromContact(contact));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showRelatedEmailModal, setShowRelatedEmailModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const selectedCompany =
      (draft.companyId ? companies.find((company) => company.id === draft.companyId) : null) ||
      (draft.companyName ? companies.find((company) => company.name.toLowerCase() === draft.companyName.toLowerCase()) : null) ||
      null;

    if (!selectedCompany) {
      return;
    }

    setDraft((current) => {
      const next = mergeSelectedCompanyIntoDraft(current, selectedCompany);

      if (JSON.stringify(next) === JSON.stringify(current)) {
        return current;
      }

      return next;
    });
  }, [companies, draft.companyId, draft.companyName, isEditing]);

  const saveProfile = () => {
    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const response = await fetch(`/api/contacts/${profile.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(draft)
          });
          const payload = (await response.json().catch(() => null)) as ContactDetail | { error?: string } | null;

          if (!response.ok) {
            throw new Error((payload as { error?: string } | null)?.error || "Unable to update contact");
          }

          setProfile(payload as ContactDetail);
          setDraft(draftFromContact(payload as ContactDetail));
          setIsEditing(false);
          setFeedback("Profile updated.");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update contact.");
        }
      })();
    });
  };

  const hasCompanyDraft = Boolean(draft.companyId || draft.companyName || profile.company);
  const selectedCompanyOption = draft.companyId ? companies.find((company) => company.id === draft.companyId) || null : null;
  const companyPreview: CompanyPreview | null =
    isEditing && hasCompanyDraft
      ? {
          id: draft.companyId || profile.company?.id || "",
          name: draft.companyName || selectedCompanyOption?.name || profile.company?.name || "",
          type: draft.companyType || selectedCompanyOption?.companyType || profile.company?.type || null,
          phone: draft.companyPhone || selectedCompanyOption?.phone || profile.company?.phone || null,
          logoUrl: selectedCompanyOption?.logoUrl || profile.company?.logoUrl || null,
          website: draft.companyWebsite || selectedCompanyOption?.website || profile.company?.website || null,
          industry: draft.companyIndustry || selectedCompanyOption?.industry || profile.company?.industry || null,
          location: draft.companyLocation || selectedCompanyOption?.location || profile.company?.location || null,
          description: draft.companyDescription || selectedCompanyOption?.description || profile.company?.description || null,
          contacts: profile.company?.contacts,
          contactsCount: selectedCompanyOption?.contactsCount ?? profile.company?.contacts?.length ?? 0
        }
      : profile.company;
  const companyContactCount = companyPreview?.contactsCount ?? companyPreview?.contacts?.length ?? 0;
  const companyPeopleCount = Math.max(companyContactCount - 1, 0);
  const composeEmailHref = (
    profile.email
      ? `/inbox?${new URLSearchParams({
          compose: "new",
          to: profile.email,
          subject: `Follow up with ${profile.fullName}`
        }).toString()}`
      : "/inbox"
  ) as Route;
  const companyHref = companyPreview?.id ? (`/companies/${companyPreview.id}` as Route) : null;
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href="/contacts" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/contacts" className="font-medium text-slate-400 hover:text-slate-700">
              People
            </Link>
            <span>›</span>
            <span className="text-base font-semibold text-slate-900">{profile.fullName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={composeEmailHref} className="crm-btn crm-btn-secondary">
            <Mail className="h-4 w-4" />
            Send email
          </Link>
          <button
            type="button"
            onClick={() => setShowRelatedEmailModal(true)}
            className="crm-btn crm-btn-secondary"
          >
            <MessagesSquare className="h-4 w-4" />
            View email history
          </button>
          {profile.phone ? (
            <a href={`tel:${profile.phone}`} className="crm-btn crm-btn-secondary">
              <Phone className="h-4 w-4" />
              Call
            </a>
          ) : null}
          {companyHref ? (
            <Link href={companyHref} className="crm-btn crm-btn-secondary">
              <Building2 className="h-4 w-4" />
              Open company
            </Link>
          ) : null}
          <Link href={composePipelineHref(profile) as Route} className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]">
            <Plane className="h-4 w-4" />
            Add to pipeline
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className="mx-3 mt-3 rounded-2xl border border-[#dbe5fb] bg-[radial-gradient(circle_at_top_left,rgba(56,109,244,0.1),transparent_36%),radial-gradient(circle_at_top_right,rgba(56,109,244,0.08),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#eff4ff,#dce7ff)] text-lg font-semibold text-[#386df4] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                {initials(profile.fullName)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[1.9rem] font-semibold tracking-tight text-slate-900">{profile.fullName}</h1>
                  <span className="rounded-full border border-[#cfe0ff] bg-white/90 px-3 py-1 text-xs font-semibold text-[#386df4]">
                    {profile.stage || "Lead"}
                  </span>
                  {profile.company ? (
                    <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
                      {profile.company.name}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span>{profile.title || "Contact profile"}</span>
                  {profile.company ? <span>{profile.company.name}</span> : <span>Independent contact</span>}
                  <span>{profile.location || "Location not set"}</span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {profile.company
                    ? `Contact linked to ${profile.company.name}. Keep account details current here so the company record, people list, and pipeline stay aligned.`
                    : "Track direct outreach, qualification, and account assignment from one place."}
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-4">
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Contact information</h2>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setDraft(draftFromContact(profile));
                          setIsEditing(false);
                          setFeedback(null);
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        disabled={isPending || !draft.fullName.trim()}
                        className="rounded-xl bg-[#386df4] px-3 py-2 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending ? "Saving..." : "Save"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setDraft(draftFromContact(profile));
                        setIsEditing(true);
                        setFeedback(null);
                      }}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Edit profile
                    </button>
                  )}
                </div>
              </div>

              <div className="px-5 py-5">
                <div className={isEditing ? "space-y-4" : "grid gap-4 md:grid-cols-2"}>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <UserRound className="h-4 w-4 text-[#386df4]" />
                          Contact profile
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {[
                            { key: "fullName", label: "Full name", type: "text", icon: UserRound, placeholder: "Ava Stone", className: "md:col-span-2" },
                            { key: "email", label: "Primary email", type: "email", icon: Mail, placeholder: "name@company.com", className: "md:col-span-2" },
                            { key: "phone", label: "Phone number", type: "text", icon: Phone, placeholder: "+91 98765 43210" },
                            { key: "title", label: "Job title", type: "text", icon: BriefcaseBusiness, placeholder: "Account Executive" },
                            { key: "location", label: "Location", type: "text", icon: MapPin, placeholder: "City, Country" },
                            { key: "linkedinUrl", label: "LinkedIn URL", type: "text", icon: Linkedin, placeholder: "linkedin.com/in/name", className: "md:col-span-2" },
                            { key: "timeZone", label: "Time zone", type: "text", icon: CalendarDays, placeholder: "Asia/Kolkata" }
                          ].map((field) => (
                            <div key={field.key} className={field.className || ""}>
                              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{field.label}</label>
                              <div className="relative">
                                <field.icon className={editIconWrapperClassName} />
                                <input
                                  type={field.type}
                                  value={String(draft[field.key as keyof ContactDraft] || "")}
                                  onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                  placeholder={field.placeholder}
                                  className={editInputWithIconClassName}
                                />
                              </div>
                            </div>
                          ))}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Stage</label>
                            <div className="relative">
                              <CheckCircle2 className={editIconWrapperClassName} />
                              <AppSelect
                                value={draft.stage}
                                onChange={(event) => setDraft((current) => ({ ...current, stage: event.target.value }))}
                                className={`${editSelectClassName} pl-10`}
                              >
                                <option value="">Select stage</option>
                                {contactStages.map((stage) => (
                                  <option key={stage} value={stage}>
                                    {stage}
                                  </option>
                                ))}
                              </AppSelect>
                            </div>
                          </div>
                          <div className="xl:col-span-1">
                            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company</label>
                            <div className="relative">
                              <Building2 className={editIconWrapperClassName} />
                              <AppSelect
                                value={draft.companyId || draft.companyName || ""}
                                onChange={(event) => {
                                  const selectedCompany = companies.find((company) => company.id === event.target.value);
                                  setDraft((current) => ({
                                    ...current,
                                    companyId: selectedCompany?.id || "",
                                    companyName: selectedCompany?.name || "",
                                    companyType: selectedCompany?.companyType || "",
                                    companyPhone: selectedCompany?.phone || "",
                                    companyWebsite: selectedCompany?.website || "",
                                    companyIndustry: selectedCompany?.industry || "",
                                    companyLocation: selectedCompany?.location || "",
                                    companyDescription: selectedCompany?.description || ""
                                  }));
                                }}
                                className={`${editSelectClassName} pl-10`}
                              >
                                <option value="">Independent</option>
                                {companies.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </AppSelect>
                            </div>
                          </div>
                        </div>
                      </div>

                      {hasCompanyDraft ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Building2 className="h-4 w-4 text-[#386df4]" />
                            Company details
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {[
                              { key: "companyWebsite", label: "Company website", type: "text", icon: Globe2, placeholder: "company.com", className: "md:col-span-2" },
                              { key: "companyPhone", label: "Company phone", type: "text", icon: Phone, placeholder: "+1 (555) 000-0000" },
                              { key: "companyIndustry", label: "Industry", type: "text", icon: BriefcaseBusiness, placeholder: "Software, Manufacturing" },
                              { key: "companyLocation", label: "Company location", type: "text", icon: MapPin, placeholder: "City, Country" },
                              { key: "companyType", label: "Company type", type: "text", icon: Building2, placeholder: "Enterprise, Startup" },
                              { key: "companyDescription", label: "Company description", type: "text", icon: AlignLeft, placeholder: "Add account context, positioning, and team notes.", className: "md:col-span-2 xl:col-span-3" }
                            ].map((field) => (
                              <div key={field.key} className={field.className || ""}>
                                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{field.label}</label>
                                {field.key === "companyDescription" ? (
                                  <div className="relative">
                                    <field.icon className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <textarea
                                      value={String(draft[field.key as keyof ContactDraft] || "")}
                                      onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                      placeholder={field.placeholder}
                                      className={`${editInputWithIconClassName} min-h-[112px] resize-none pt-3.5`}
                                    />
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <field.icon className={editIconWrapperClassName} />
                                    <input
                                      type={field.type}
                                      value={String(draft[field.key as keyof ContactDraft] || "")}
                                      onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                      placeholder={field.placeholder}
                                      className={editInputWithIconClassName}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {customFields.length ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <AlignLeft className="h-4 w-4 text-[#386df4]" />
                            Custom fields
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {customFields.map((field) => {
                              const value = draft.customFields[field.id];

                              if (field.type === "checkbox") {
                                return (
                                  <label key={field.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 xl:col-span-3">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(value)}
                                      onChange={(event) =>
                                        setDraft((current) => ({
                                          ...current,
                                          customFields: {
                                            ...current.customFields,
                                            [field.id]: normalizePeopleFieldValueForType(field.type, event.target.checked)
                                          }
                                        }))
                                      }
                                      className="h-4 w-4 rounded border-slate-300 text-[#386df4]"
                                    />
                                    <span>{field.label}</span>
                                  </label>
                                );
                              }

                              if ((field.type === "singleSelect" || field.type === "userLookup") && field.options?.length) {
                                return (
                                  <div key={field.id}>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{field.label}</label>
                                    <select
                                      value={typeof value === "string" ? value : ""}
                                      onChange={(event) =>
                                        setDraft((current) => ({
                                          ...current,
                                          customFields: {
                                            ...current.customFields,
                                            [field.id]: normalizePeopleFieldValueForType(field.type, event.target.value)
                                          }
                                        }))
                                      }
                                      className={editInputClassName}
                                    >
                                      <option value="">Select</option>
                                      {field.options.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              }

                              if (field.type === "multiPicklist" && field.options?.length) {
                                const selectedValues = Array.isArray(value) ? value : [];

                                return (
                                  <div key={field.id} className="md:col-span-2 xl:col-span-3">
                                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{field.label}</label>
                                    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 px-4 py-3">
                                      {field.options.map((option) => {
                                        const checked = selectedValues.includes(option);
                                        return (
                                          <label key={option} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={(event) =>
                                                setDraft((current) => {
                                                  const currentValues = Array.isArray(current.customFields[field.id]) ? (current.customFields[field.id] as string[]) : [];
                                                  const nextValues = event.target.checked
                                                    ? [...currentValues, option]
                                                    : currentValues.filter((item) => item !== option);

                                                  return {
                                                    ...current,
                                                    customFields: {
                                                      ...current.customFields,
                                                      [field.id]: normalizePeopleFieldValueForType(field.type, nextValues)
                                                    }
                                                  };
                                                })
                                              }
                                              className="h-4 w-4 rounded border-slate-300 text-[#386df4]"
                                            />
                                            {option}
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }

                              const inputType =
                                field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "dateTime" ? "datetime-local" : "text";
                              const normalizedValue = value === null || value === undefined || Array.isArray(value) || typeof value === "boolean" ? "" : String(value);

                              return (
                                <div key={field.id} className={field.type === "multiLineText" ? "md:col-span-2 xl:col-span-3" : ""}>
                                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{field.label}</label>
                                  {field.type === "multiLineText" ? (
                                    <textarea
                                      value={normalizedValue}
                                      onChange={(event) =>
                                        setDraft((current) => ({
                                          ...current,
                                          customFields: {
                                            ...current.customFields,
                                            [field.id]: normalizePeopleFieldValueForType(field.type, event.target.value)
                                          }
                                        }))
                                      }
                                      rows={4}
                                      className={`${editInputClassName} resize-none`}
                                    />
                                  ) : (
                                    <input
                                      type={inputType}
                                      value={normalizedValue}
                                      onChange={(event) =>
                                        setDraft((current) => ({
                                          ...current,
                                          customFields: {
                                            ...current.customFields,
                                            [field.id]: normalizePeopleFieldValueForType(field.type, event.target.value)
                                          }
                                        }))
                                      }
                                      className={editInputClassName}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {metadataRows(profile).map((row) => {
                        const content = (
                          <>
                            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                              <row.icon className="h-4 w-4" />
                              {row.label}
                            </div>
                            <div className="text-sm font-medium text-slate-800">{row.value}</div>
                          </>
                        );

                        return (
                          <div key={row.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                            {row.href ? (
                              row.href.startsWith("/inbox") ? (
                                <Link href={row.href as Route} className="block hover:text-[#386df4]">
                                  {content}
                                </Link>
                              ) : (
                                <a href={row.href} className="block hover:text-[#386df4]">
                                  {content}
                                </a>
                              )
                            ) : (
                              content
                            )}
                          </div>
                        );
                      })}
                      {customFields.map((field) => (
                        <div key={field.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div className="mb-2 text-sm text-slate-400">{field.label}</div>
                          <div className="text-sm font-medium text-slate-800">{customFieldDisplayValue(profile.customFields[field.id] ?? null)}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
            </Card>

            <Card className="p-0">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Company overview</h2>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-[26px] border border-[#dbe5fb] bg-[radial-gradient(circle_at_top_left,rgba(56,109,244,0.08),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-5">
                    <div className="shrink-0">
                      {companyPreview ? (
                        <CompanyLogo
                          name={companyPreview.name}
                          logoUrl={companyPreview.logoUrl}
                          className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-contain p-2.5 shadow-sm md:h-full md:min-h-[92px] md:w-[84px]"
                          fallbackClassName="flex items-center justify-center rounded-[26px] bg-[#eef4ff] text-[1.4rem] font-semibold text-[#386df4]"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef4ff] text-[1.05rem] font-semibold text-[#386df4] md:h-full md:min-h-[92px] md:w-[84px]">
                          ?
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="text-[1.38rem] font-semibold tracking-tight text-slate-900">{companyPreview?.name || "Independent contact"}</div>
                        {companyPreview?.type ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                            {companyPreview.type}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {companyPreview?.description || companyNarrative({ ...profile, company: companyPreview })}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 md:w-[170px] md:justify-start">
                      {companyHref ? (
                        <Link
                          href={companyHref}
                          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Building2 className="h-4 w-4" />
                          Open account
                        </Link>
                      ) : null}
                      {companyPreview?.website ? (
                        <a
                          href={normalizeExternalUrl(companyPreview.website)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Globe2 className="h-4 w-4" />
                          Visit website
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                      <Building2 className="h-4 w-4" />
                      Company
                    </div>
                    <div className="text-sm font-medium text-slate-900">{companyPreview?.name || "Independent"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                      <Globe2 className="h-4 w-4" />
                      Website
                    </div>
                    {companyPreview?.website ? (
                      <a
                        href={normalizeExternalUrl(companyPreview.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-sm font-medium text-[#386df4] hover:text-[#2d5de0]"
                      >
                        {companyPreview.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <div className="text-sm font-medium text-slate-900">Not set</div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="h-4 w-4" />
                      Company phone
                    </div>
                    {companyPreview?.phone ? (
                      <a href={`tel:${companyPreview.phone}`} className="text-sm font-medium text-slate-900 hover:text-[#386df4]">
                        {companyPreview.phone}
                      </a>
                    ) : (
                      <div className="text-sm font-medium text-slate-900">Not available</div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                      <BriefcaseBusiness className="h-4 w-4" />
                      Industry
                    </div>
                    <div className="text-sm font-medium text-slate-900">{companyPreview?.industry || "Not set"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <div className="text-sm font-medium text-slate-900">{companyPreview?.location || "Not set"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                      <UserRound className="h-4 w-4" />
                      People at company
                    </div>
                    <div className="text-sm font-medium text-slate-900">{companyContactCount}</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Linked pipeline</h2>
                <Link href="/pipeline" className="text-sm font-medium text-[#386df4] hover:text-[#2d5de0]">
                  Open pipeline
                </Link>
              </div>

              <div className="space-y-3">
                {linkedLeads.length ? (
                  linkedLeads.map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{lead.name}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${leadStatusTones[lead.status]}`}>
                              {leadStatusLabels[lead.status]}
                            </span>
                            <span className="text-sm font-medium text-slate-900">{formatLocalizedCurrency(lead.value, localization)}</span>
                            <span className="text-sm text-slate-400">
                              {lead.dueDate ? `Due ${formatLocalizedDate(lead.dueDate, localization, "monthDay")}` : "No due date"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          <div>{lead.assignedUsers.length ? lead.assignedUsers.join(", ") : "Unassigned"}</div>
                          <div className="mt-1">{lead.remindersCount} active reminders</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                    No pipeline records are linked to this contact yet.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Related people at company</h2>
                <span className="text-sm text-slate-400">{relatedContacts.length}</span>
              </div>

              <div className="space-y-3">
                {relatedContacts.length ? (
                  relatedContacts.map((person) => (
                    <div key={person.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f9fd] text-sm font-semibold text-slate-700">
                          {initials(person.fullName)}
                        </div>
                        <div>
                          <Link href={`/contacts/${person.id}` as Route} className="font-medium text-slate-900 hover:text-[#386df4]">
                            {person.fullName}
                          </Link>
                          <div className="mt-1 text-sm text-slate-400">{person.title || "Team contact"}</div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">{person.email || "No email"}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                    No additional contacts are linked to this company yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
              <div className="mt-4 space-y-3">
                <Link href={composeEmailHref} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                  <span>Send email</span>
                  <Mail className="h-4 w-4 text-slate-400" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowRelatedEmailModal(true)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <span>Open email history</span>
                  <MessagesSquare className="h-4 w-4 text-slate-400" />
                </button>
                <Link href={composePipelineHref(profile) as Route} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                  <span>Add or update pipeline record</span>
                  <Plane className="h-4 w-4 text-slate-400" />
                </Link>
                {profile.phone ? (
                  <a href={`tel:${profile.phone}`} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                    <span>Call contact</span>
                    <Phone className="h-4 w-4 text-slate-400" />
                  </a>
                ) : null}
                {companyHref ? (
                  <Link href={companyHref} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                    <span>Open company record</span>
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </Link>
                ) : null}
                {profile.linkedinUrl ? (
                  <a
                    href={normalizeExternalUrl(profile.linkedinUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>Open LinkedIn profile</span>
                    <Linkedin className="h-4 w-4 text-slate-400" />
                  </a>
                ) : null}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">CRM overview</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-4">
                  <div className="text-sm text-slate-400">Contact stage</div>
                  <div className="mt-1 font-medium text-slate-800">{profile.stage || "Lead"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-4">
                  <div className="text-sm text-slate-400">Time zone</div>
                  <div className="mt-1 font-medium text-slate-800">{profile.timeZone || "Not set"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-4">
                  <div className="text-sm text-slate-400">Linked deals</div>
                  <div className="mt-1 font-medium text-slate-800">{linkedLeads.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-4">
                  <div className="text-sm text-slate-400">People at same company</div>
                  <div className="mt-1 font-medium text-slate-800">{companyPeopleCount}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-4">
                  <div className="text-sm text-slate-400">Created in CRM</div>
                  <div className="mt-1 font-medium text-slate-800">{formatLocalizedDate(profile.createdAt, localization)}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
      <RelatedEmailModal
        open={showRelatedEmailModal}
        onClose={() => setShowRelatedEmailModal(false)}
        contactId={profile.id}
        email={profile.email}
        title={`${profile.fullName} email history`}
        subtitle="See synced outreach, replies, and thread activity linked to this contact in one place."
        composeHref={composeEmailHref}
      />
    </div>
  );
}
