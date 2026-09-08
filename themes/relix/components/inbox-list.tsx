import { EmailThread } from "@prisma/client";
import { format } from "date-fns";
import { Card } from "@/components/card";
export function InboxList({ threads }: { threads: EmailThread[] }) {
  return <Card className="p-0"><div className="border-b border-white/10 px-5 py-4"><h3 className="text-lg font-semibold text-white">Tracked Conversations</h3></div><div className="divide-y divide-white/5">{threads.map((thread)=><div key={thread.id} className="px-5 py-4 transition hover:bg-white/5"><div className="flex items-start justify-between gap-4"><div><div className="font-medium text-white">{thread.subject}</div><div className="mt-1 text-sm text-white/50">{thread.fromName ? `${thread.fromName} · ` : ""}{thread.fromEmail}</div><p className="mt-2 text-sm leading-6 text-white/70">{thread.snippet}</p></div><div className="text-xs text-white/40">{format(thread.lastMessageAt, "MMM d, yyyy h:mm a")}</div></div></div>)}</div></Card>;
}
