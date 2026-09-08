"use client";

import { AppSelect } from "@/components/app-select";
import { AppCombobox } from "@/components/app-combobox";
import { useEffect, useRef, useState, useTransition } from "react";
import { X, Building2, Globe, Phone, MapPin, Link2, List, Hash, AlignLeft, Briefcase, Target } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { companyIndustries } from "@/lib/people";

type CompanyRecord = {
  id: string | null;
  name: string;
  website: string | null;
  industry: string | null;
  type: string | null;
  phone: string | null;
  location: string | null;
  description: string | null;
  stage: string | null;
  linkedinUrl: string | null;
  lists: string[];
  keywords: string[];
};

type CompanyFormValue = {
  name: string;
  website: string;
  industry: string;
  phone: string;
  location: string;
  description: string;
  stage: string;
  linkedinUrl: string;
  lists: string;
  keywords: string;
};

type CompanyEnrichmentPayload = {
  matched: boolean;
  sourceLabel: string;
  company: Partial<{
    name: string;
    website: string;
    industry: string;
    phone: string;
    location: string;
    description: string;
    stage: string;
    linkedinUrl: string;
    lists: string[];
    keywords: string[];
  }>;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

const selectClassName = `${inputClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const companyStageOptions = ["Prospecting", "Engaged", "Qualified", "Monitoring", "Customer"];

function createEmptyForm(): CompanyFormValue {
  return {
    name: "",
    website: "",
    industry: "",
    phone: "",
    location: "",
    description: "",
    stage: "",
    linkedinUrl: "",
    lists: "",
    keywords: ""
  };
}

function formFromCompany(company: CompanyRecord): CompanyFormValue {
  return {
    name: company.name,
    website: company.website || "",
    industry: company.industry || "",
    phone: company.phone || "",
    location: company.location || "",
    description: company.description || "",
    stage: company.stage || "",
    linkedinUrl: company.linkedinUrl || "",
    lists: company.lists.join(", "),
    keywords: company.keywords.join(", ")
  };
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildEnrichmentQuery(form: CompanyFormValue) {
  const params = new URLSearchParams();

  if (form.website.trim()) {
    params.set("website", form.website.trim());
  }

  if (form.linkedinUrl.trim()) {
    params.set("linkedinUrl", form.linkedinUrl.trim());
  }

  return params.toString();
}

function toEnrichmentFormValue(payload: CompanyEnrichmentPayload["company"]): Partial<CompanyFormValue> {
  return {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.website ? { website: payload.website } : {}),
    ...(payload.industry ? { industry: payload.industry } : {}),
    ...(payload.phone ? { phone: payload.phone } : {}),
    ...(payload.location ? { location: payload.location } : {}),
    ...(payload.description ? { description: payload.description } : {}),
    ...(payload.stage ? { stage: payload.stage } : {}),
    ...(payload.linkedinUrl ? { linkedinUrl: payload.linkedinUrl } : {}),
    ...(payload.lists?.length ? { lists: payload.lists.join(", ") } : {}),
    ...(payload.keywords?.length ? { keywords: payload.keywords.join(", ") } : {})
  };
}

function mergeAutoFilledValues(
  current: CompanyFormValue,
  incoming: Partial<CompanyFormValue>,
  previousAutoFilled: Partial<CompanyFormValue>
) {
  const next = { ...current };

  (Object.entries(incoming) as Array<[keyof CompanyFormValue, string]>).forEach(([key, value]) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    const currentValue = current[key].trim();
    const previousValue = previousAutoFilled[key]?.trim() || "";

    if (!currentValue || currentValue === previousValue) {
      next[key] = value;
    }
  });

  return next;
}

export function CompanyFormModal({
  open,
  mode,
  company,
  titleOverride,
  submitLabelOverride,
  onClose,
  onSaved
}: {
  open: boolean;
  mode: "create" | "edit";
  company?: CompanyRecord | null;
  titleOverride?: string;
  submitLabelOverride?: string;
  onClose: () => void;
  onSaved: (company: CompanyRecord) => void;
}) {
  const [form, setForm] = useState<CompanyFormValue>(createEmptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastSourceQueryRef = useRef<string>("");
  const lastAutoFilledRef = useRef<Partial<CompanyFormValue>>({});

  useEffect(() => {
    if (!open) {
      setForm(createEmptyForm());
      setFeedback(null);
      setIsEnriching(false);
      lastSourceQueryRef.current = "";
      lastAutoFilledRef.current = {};
      return;
    }

    setForm(company ? formFromCompany(company) : createEmptyForm());
    setFeedback(null);
    setIsEnriching(false);
    lastSourceQueryRef.current = "";
    lastAutoFilledRef.current = {};
  }, [company, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = buildEnrichmentQuery(form);
    if (!query || query === lastSourceQueryRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        lastSourceQueryRef.current = query;
        setIsEnriching(true);

        try {
          const response = await fetch(`/api/companies/enrich?${query}`);
          const payload = (await response.json().catch(() => null)) as CompanyEnrichmentPayload | { error?: string } | null;

          if (!response.ok) {
            throw new Error((payload as { error?: string } | null)?.error || "Unable to auto-fill company details");
          }

          const enrichment = payload as CompanyEnrichmentPayload;
          const nextValues = toEnrichmentFormValue(enrichment.company);
          setForm((current) => mergeAutoFilledValues(current, nextValues, lastAutoFilledRef.current));
          lastAutoFilledRef.current = nextValues;
          setFeedback(`Auto-filled company details from ${enrichment.sourceLabel}.`);
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to auto-fill company details.");
        } finally {
          setIsEnriching(false);
        }
      })();
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [form.linkedinUrl, form.website, open]);

  if (!open) {
    return null;
  }

  const handleSave = () => {
    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const response = await fetch(mode === "create" ? "/api/companies" : `/api/companies/${company?.id || ""}`, {
            method: mode === "create" ? "POST" : "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              website: form.website,
              industry: form.industry,
              phone: form.phone,
              location: form.location,
              description: form.description,
              stage: form.stage,
              linkedinUrl: form.linkedinUrl,
              lists: parseTags(form.lists),
              keywords: parseTags(form.keywords)
            })
          });
          const payload = (await response.json().catch(() => null)) as CompanyRecord | { error?: string } | null;

          if (!response.ok) {
            throw new Error((payload as { error?: string } | null)?.error || `Unable to ${mode} company`);
          }

          onSaved(payload as CompanyRecord);
          onClose();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : `Unable to ${mode} company.`);
        }
      })();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">
            {titleOverride || (mode === "create" ? "Create new company" : "Edit company")}
          </h2>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          
          {/* section: company profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="h-4 w-4 text-[#386df4]" />
              Company Profile
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company name</label>
                <div className="relative">
                  <Building2 className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="Enter company name"
                    value={form.name}
                    onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Website</label>
                <div className="relative">
                  <Globe className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="company.com"
                    value={form.website}
                    onChange={(event) => setForm((state) => ({ ...state, website: event.target.value }))}
                  />
                </div>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
                  {isEnriching
                    ? "Looking up company details from the website or LinkedIn URL."
                    : "Paste a company website or LinkedIn URL and the rest of the profile will auto-fill where possible."}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Industry</label>
                <div className="relative">
                  <Briefcase className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <AppCombobox
                    className={inputWithIconClassName}
                    placeholder="Select or type an industry"
                    value={form.industry}
                    options={companyIndustries.map((industry) => ({
                      value: industry,
                      label: industry
                    }))}
                    onValueChange={(nextValue) => setForm((state) => ({ ...state, industry: nextValue }))}
                    emptyLabel="No saved industry. This value will be used."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Account stage</label>
                <div className="relative">
                  <Target className={`${inputIconWrapperClassName} h-4 w-4 z-10`} />
                  <AppSelect
                    className={`${selectClassName} pl-10`}
                    value={form.stage}
                    onChange={(event) => setForm((state) => ({ ...state, stage: event.target.value }))}
                  >
                    <option value="">Select stage</option>
                    {companyStageOptions.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
            </div>
          </div>
          {/* section: location and contact */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-[#386df4]" />
              Location & Contact
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Phone</label>
                <div className="relative">
                  <Phone className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(event) => setForm((state) => ({ ...state, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Location</label>
                <div className="relative">
                  <MapPin className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(event) => setForm((state) => ({ ...state, location: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* section: channels and additional details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <List className="h-4 w-4 text-[#386df4]" />
              Channels and Tags
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">LinkedIn URL</label>
                <div className="relative">
                  <Link2 className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="linkedin.com/company/company-name"
                    value={form.linkedinUrl}
                    onChange={(event) => setForm((state) => ({ ...state, linkedinUrl: event.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Lists</label>
                <div className="relative">
                  <List className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="Key Accounts, Enterprise"
                    value={form.lists}
                    onChange={(event) => setForm((state) => ({ ...state, lists: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Keywords</label>
                <div className="relative">
                  <Hash className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input
                    className={inputWithIconClassName}
                    placeholder="streaming, entertainment, subscription"
                    value={form.keywords}
                    onChange={(event) => setForm((state) => ({ ...state, keywords: event.target.value }))}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Description</label>
                <div className="relative">
                  <AlignLeft className={`absolute left-3.5 top-3.5 text-slate-400 pointer-events-none h-4 w-4`} />
                  <textarea
                    rows={4}
                    className={`${inputWithIconClassName} min-h-[112px] resize-none pt-3.5`}
                    placeholder="Add account context, positioning, and team notes."
                    value={form.description}
                    onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !form.name.trim()}
              className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : submitLabelOverride || (mode === "create" ? "Save company" : "Update company")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
