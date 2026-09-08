"use client";

import { AppCombobox } from "@/components/app-combobox";
import { useEffect, useState, useTransition } from "react";
import { X, User, Mail, Phone, Briefcase, Building2, MapPin, Link2, Globe } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { normalizePeopleFieldValueForType, type PeopleFieldDefinition, type PeopleFieldValue, type PeopleFieldValues } from "@/lib/people-fields";

type CompanyOption = {
  id: string;
  name: string;
  companyType?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  description?: string | null;
};

type ContactRecord = {
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
  company: {
    id: string;
    name: string;
    type: string | null;
    phone: string | null;
    logoUrl: string | null;
    website: string | null;
    industry: string | null;
  } | null;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

function emptyForm() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    companyId: "",
    companyName: "",
    companyType: "",
    companyWebsite: "",
    companyPhone: "",
    companyIndustry: "",
    companyLocation: "",
    companyDescription: "",
    linkedinUrl: "",
    location: "",
    timeZone: "",
    customFields: {} as PeopleFieldValues
  };
}

function customFieldInputValue(value: PeopleFieldValue) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value);
}

function applySelectedCompany(state: ReturnType<typeof emptyForm>, company: CompanyOption | null) {
  if (!company) {
    return {
      ...state,
      companyId: "",
      companyType: "",
      companyPhone: "",
      companyWebsite: "",
      companyIndustry: "",
      companyLocation: "",
      companyDescription: ""
    };
  }

  return {
    ...state,
    companyId: company.id,
    companyName: company.name,
    companyType: company.companyType || "",
    companyPhone: company.phone || "",
    companyWebsite: company.website || "",
    companyIndustry: company.industry || "",
    companyLocation: company.location || "",
    companyDescription: company.description || ""
  };
}

export function ContactFormModal({
  open,
  companies,
  customFields = [],
  defaultCompanyId,
  defaultCompanyName,
  onClose,
  onCreated
}: {
  open: boolean;
  companies: CompanyOption[];
  customFields?: PeopleFieldDefinition[];
  defaultCompanyId?: string | null;
  defaultCompanyName?: string | null;
  onClose: () => void;
  onCreated: (contact: ContactRecord) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resolvedCustomFields, setResolvedCustomFields] = useState<PeopleFieldDefinition[]>(customFields);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setFeedback(null);
      setResolvedCustomFields(customFields);
      return;
    }

    const selectedCompany =
      (defaultCompanyId ? companies.find((company) => company.id === defaultCompanyId) : null) ||
      (defaultCompanyName ? companies.find((company) => company.name.toLowerCase() === defaultCompanyName.toLowerCase()) : null) ||
      null;

    setForm((state) => ({
      ...applySelectedCompany(state, selectedCompany),
      companyId: defaultCompanyId || selectedCompany?.id || state.companyId,
      companyName: defaultCompanyName || selectedCompany?.name || state.companyName,
      timeZone: state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    }));
  }, [companies, defaultCompanyId, defaultCompanyName, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (customFields.length) {
      setResolvedCustomFields(customFields);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/contacts/fields");
        const payload = (await response.json().catch(() => null)) as
          | { globalFields?: PeopleFieldDefinition[]; privateFields?: PeopleFieldDefinition[]; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load custom fields");
        }

        if (!cancelled) {
          setResolvedCustomFields([...(payload?.globalFields || []), ...(payload?.privateFields || [])]);
        }
      } catch {
        if (!cancelled) {
          setResolvedCustomFields([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customFields, open]);

  if (!open) {
    return null;
  }

  const handleSave = () => {
    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const response = await fetch("/api/contacts", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form)
          });
          const payload = (await response.json().catch(() => null)) as ContactRecord | { error?: string } | null;

          if (!response.ok) {
            throw new Error((payload as { error?: string } | null)?.error || "Unable to create contact");
          }

          onCreated(payload as ContactRecord);
          onClose();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to create contact.");
        }
      })();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">Create new contact</h2>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          
          {/* section: personal info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User className="h-4 w-4 text-[#386df4]" />
              Personal Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">First name</label>
                <input className={inputClassName} placeholder="e.g. Jane" value={form.firstName} onChange={(event) => setForm((state) => ({ ...state, firstName: event.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Last name</label>
                <input className={inputClassName} placeholder="e.g. Doe" value={form.lastName} onChange={(event) => setForm((state) => ({ ...state, lastName: event.target.value }))} />
              </div>
            </div>
          </div>

          {/* section: professional info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Briefcase className="h-4 w-4 text-[#386df4]" />
              Professional Info
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Primary email</label>
                <div className="relative">
                  <Mail className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="jane@example.com" value={form.email} onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Phone number</label>
                <div className="relative">
                  <Phone className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="+1 (555) 000-0000" value={form.phone} onChange={(event) => setForm((state) => ({ ...state, phone: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Job title</label>
                <div className="relative">
                  <Briefcase className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="e.g. Software Engineer" value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company</label>
                <div className="relative">
                  <Building2 className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <AppCombobox
                    className={inputWithIconClassName}
                    placeholder="Enter company name"
                    value={form.companyName}
                    options={companies.map((company) => ({
                      id: company.id,
                      value: company.name,
                      label: company.name
                    }))}
                    onValueChange={(nextValue) => {
                      const company = companies.find((item) => item.name.toLowerCase() === nextValue.trim().toLowerCase());
                      setForm((state) => ({
                        ...(company ? applySelectedCompany(state, company) : applySelectedCompany(state, null)),
                        companyName: nextValue
                      }));
                    }}
                    onOptionSelect={(option) => {
                      const company = companies.find((item) => item.id === option.id) || null;
                      setForm((state) => applySelectedCompany(state, company));
                    }}
                    emptyLabel="No existing company. It will be created on save."
                  />
                </div>
              </div>
              
            </div>
          </div>

          {/* section: additional info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Globe className="h-4 w-4 text-[#386df4]" />
              Additional Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company phone</label>
                <div className="relative">
                  <Phone className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="Enter phone number" value={form.companyPhone} onChange={(event) => setForm((state) => ({ ...state, companyPhone: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company website</label>
                <div className="relative">
                  <Globe className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="e.g. company.com"
                    value={form.companyWebsite}
                    onChange={(event) => setForm((state) => ({ ...state, companyWebsite: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">LinkedIn URL</label>
                <div className="relative">
                  <Link2 className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="e.g. linkedin.com/in/jane" value={form.linkedinUrl} onChange={(event) => setForm((state) => ({ ...state, linkedinUrl: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Location</label>
                <div className="relative">
                  <MapPin className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="Location / Country" value={form.location} onChange={(event) => setForm((state) => ({ ...state, location: event.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {resolvedCustomFields.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Globe className="h-4 w-4 text-[#386df4]" />
                Custom Fields
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {resolvedCustomFields.map((field) => {
                  const value = form.customFields[field.id];

                  if (field.type === "checkbox") {
                    return (
                      <label key={field.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 md:col-span-2">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) =>
                            setForm((state) => ({
                              ...state,
                              customFields: {
                                ...state.customFields,
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
                            setForm((state) => ({
                              ...state,
                              customFields: {
                                ...state.customFields,
                                [field.id]: normalizePeopleFieldValueForType(field.type, event.target.value)
                              }
                            }))
                          }
                          className={inputClassName}
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
                      <div key={field.id} className="md:col-span-2">
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
                                    setForm((state) => {
                                      const current = Array.isArray(state.customFields[field.id]) ? (state.customFields[field.id] as string[]) : [];
                                      const next = event.target.checked ? [...current, option] : current.filter((item) => item !== option);

                                      return {
                                        ...state,
                                        customFields: {
                                          ...state.customFields,
                                          [field.id]: normalizePeopleFieldValueForType(field.type, next)
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

                  const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "dateTime" ? "datetime-local" : "text";
                  const stringValue = customFieldInputValue(value);

                  return (
                    <div key={field.id} className={field.type === "multiLineText" ? "md:col-span-2" : ""}>
                      <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{field.label}</label>
                      {field.type === "multiLineText" ? (
                        <textarea
                          value={typeof stringValue === "string" ? stringValue : ""}
                          onChange={(event) =>
                            setForm((state) => ({
                              ...state,
                              customFields: {
                                ...state.customFields,
                                [field.id]: normalizePeopleFieldValueForType(field.type, event.target.value)
                              }
                            }))
                          }
                          rows={4}
                          className={`${inputClassName} resize-none`}
                        />
                      ) : (
                        <input
                          type={inputType}
                          value={typeof stringValue === "string" ? stringValue : ""}
                          onChange={(event) =>
                            setForm((state) => ({
                              ...state,
                              customFields: {
                                ...state.customFields,
                                [field.id]: normalizePeopleFieldValueForType(field.type, event.target.value)
                              }
                            }))
                          }
                          className={inputClassName}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <p className="hidden text-[11px] leading-tight text-slate-400 sm:block max-w-[280px]">
            A new <span className="font-semibold text-slate-500">Company</span> profile will be generated automatically if the provided company does not exist.
          </p>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !form.firstName.trim() || !form.lastName.trim()}
              className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
