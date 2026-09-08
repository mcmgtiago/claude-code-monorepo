import { z } from "zod";
import { getCompanyLogoUrl } from "@/lib/company-logo";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { prisma } from "@/lib/prisma";
import { serializeCompany } from "@/lib/company-serializer";
import { requireWorkspaceContext } from "@/lib/workspace";

const companySchema = z.object({
  name: z.string().min(1),
  website: z.string().optional().or(z.literal("")),
  industry: z.string().optional(),
  type: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  stage: z.string().optional(),
  employeeCount: z.number().int().nonnegative().nullable().optional(),
  foundedYear: z.number().int().min(1800).max(2100).nullable().optional(),
  revenueLabel: z.string().optional(),
  marketCapLabel: z.string().optional(),
  linkedinUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  xUrl: z.string().optional().or(z.literal("")),
  lists: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional()
});

export async function GET() {
  const { workspace } = await requireWorkspaceContext();
  const companies = await prisma.company.findMany({
    where: { workspaceId: workspace.id },
    include: { contacts: true },
    orderBy: { name: "asc" }
  });

  return Response.json(companies.map((company) => serializeCompany(company)));
}

export async function POST(request: Request) {
  try {
    const { workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = companySchema.parse(raw);

    const existing = await prisma.company.findFirst({
      where: { workspaceId: workspace.id, name: payload.name }
    });

    if (existing) {
      return Response.json({ error: "A company with this name already exists" }, { status: 409 });
    }

    const company = await prisma.company.create({
      data: {
        workspaceId: workspace.id,
        name: payload.name,
        website: payload.website || null,
        logoUrl: getCompanyLogoUrl(payload.website) || null,
        industry: payload.industry || null,
        type: payload.type || null,
        phone: payload.phone || null,
        location: payload.location || null,
        description: payload.description || null,
        stage: payload.stage || null,
        employeeCount: payload.employeeCount ?? null,
        foundedYear: payload.foundedYear ?? null,
        revenueLabel: payload.revenueLabel || null,
        marketCapLabel: payload.marketCapLabel || null,
        linkedinUrl: payload.linkedinUrl || null,
        facebookUrl: payload.facebookUrl || null,
        xUrl: payload.xUrl || null,
        listsJson: payload.lists?.length ? JSON.stringify(payload.lists) : null,
        keywordsJson: payload.keywords?.length ? JSON.stringify(payload.keywords) : null
      }
    });

    revalidateCrmDataPaths(`/companies/${company.id}`);

    return Response.json(serializeCompany(company), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid company payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create company" }, { status: 500 });
  }
}
