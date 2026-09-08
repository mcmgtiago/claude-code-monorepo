import type { Lead } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/card";
import { leadStatusLabels, leadStatusTones } from "@/lib/crm";
import { currency } from "@/lib/utils";

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <Card className="p-0">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Lead Snapshot</h3>
        <p className="mt-1 text-sm text-slate-500">The most recently touched opportunities across the workspace.</p>
      </div>
      <div className="w-full">
        <table className="min-w-full border border-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
              <th className="px-5 py-3 font-medium">Lead</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 font-medium">Value</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Last contact</th>
            </tr>
          </thead>
          <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
            {leads.map((lead) => (
              <tr key={lead.id} className="text-slate-700">
                <td className="px-5 py-4">
                  <div>
                    <div className="font-medium text-slate-900">{lead.name}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {lead.email || "No email"} {lead.company ? `· ${lead.company}` : ""}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${leadStatusTones[lead.status]}`}>
                    {leadStatusLabels[lead.status]}
                  </span>
                </td>
                <td className="px-5 py-4">{currency(lead.value)}</td>
                <td className="px-5 py-4">{lead.score}</td>
                <td className="px-5 py-4 text-slate-500">
                  {lead.lastContact ? formatDistanceToNow(lead.lastContact, { addSuffix: true }) : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
