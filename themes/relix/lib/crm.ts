export const leadStatuses = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;

export type LeadStatusValue = (typeof leadStatuses)[number];

export const leadStatusLabels: Record<LeadStatusValue, string> = {
  NEW: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost"
};

export const leadStatusTones: Record<LeadStatusValue, string> = {
  NEW: "border-slate-200 bg-slate-100 text-slate-600",
  QUALIFIED: "border-cyan-100 bg-cyan-50 text-cyan-700",
  PROPOSAL: "border-indigo-100 bg-indigo-50 text-indigo-700",
  NEGOTIATION: "border-amber-100 bg-amber-50 text-amber-700",
  WON: "border-emerald-100 bg-emerald-50 text-emerald-700",
  LOST: "border-rose-100 bg-rose-50 text-rose-700"
};
