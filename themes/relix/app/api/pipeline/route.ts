import { serializeLead } from "@/lib/lead-serializer";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({
    include: {
      companyRecord: { select: { id: true, name: true } },
      contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
      notes: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "desc" } }
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  const grouped = leads.map((lead) => serializeLead(lead)).reduce<Record<string, unknown[]>>((acc, lead) => {
    acc[String(lead.status)] = [...(acc[String(lead.status)] || []), lead];
    return acc;
  }, {});

  return Response.json(grouped);
}
