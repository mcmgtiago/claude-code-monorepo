import { z } from "zod";
import { getCompanyLogoUrl } from "@/lib/company-logo";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { deleteLeadWithCleanup } from "@/lib/lead-lifecycle";
import { prisma } from "@/lib/prisma";
import { serializeCompany } from "@/lib/company-serializer";
import { archiveCompany } from "@/lib/trash";
import { requireWorkspaceContext } from "@/lib/workspace";

const companyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
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

export async function GET(_request: Request, context: { params: Promise<{ companyId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { companyId } = await context.params;

  const company = await prisma.company.findFirst({
    where: { id: companyId, workspaceId: workspace.id },
    include: { contacts: true }
  });

  if (!company) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }

  return Response.json(serializeCompany(company));
}

export async function PATCH(request: Request, context: { params: Promise<{ companyId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { companyId } = await context.params;

  try {
    const raw = await request.json();
    const payload = companyUpdateSchema.parse(raw);

    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, workspaceId: true }
    });

    if (!currentCompany || currentCompany.workspaceId !== workspace.id) {
      return Response.json({ error: "Company not found" }, { status: 404 });
    }

    const company = await prisma.$transaction(async (tx) => {
      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.website !== undefined
            ? {
                website: payload.website || null,
                logoUrl: getCompanyLogoUrl(payload.website) || null
              }
            : {}),
          ...(payload.industry !== undefined ? { industry: payload.industry || null } : {}),
          ...(payload.type !== undefined ? { type: payload.type || null } : {}),
          ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
          ...(payload.location !== undefined ? { location: payload.location || null } : {}),
          ...(payload.description !== undefined ? { description: payload.description || null } : {}),
          ...(payload.stage !== undefined ? { stage: payload.stage || null } : {}),
          ...(payload.employeeCount !== undefined ? { employeeCount: payload.employeeCount ?? null } : {}),
          ...(payload.foundedYear !== undefined ? { foundedYear: payload.foundedYear ?? null } : {}),
          ...(payload.revenueLabel !== undefined ? { revenueLabel: payload.revenueLabel || null } : {}),
          ...(payload.marketCapLabel !== undefined ? { marketCapLabel: payload.marketCapLabel || null } : {}),
          ...(payload.linkedinUrl !== undefined ? { linkedinUrl: payload.linkedinUrl || null } : {}),
          ...(payload.facebookUrl !== undefined ? { facebookUrl: payload.facebookUrl || null } : {}),
          ...(payload.xUrl !== undefined ? { xUrl: payload.xUrl || null } : {}),
          ...(payload.lists !== undefined ? { listsJson: payload.lists.length ? JSON.stringify(payload.lists) : null } : {}),
          ...(payload.keywords !== undefined ? { keywordsJson: payload.keywords.length ? JSON.stringify(payload.keywords) : null } : {})
        }
      });

      if (payload.name && payload.name !== currentCompany.name) {
        await tx.lead.updateMany({
          where: {
            workspaceId: workspace.id,
            OR: [{ companyId }, { company: currentCompany.name }]
          },
          data: { company: payload.name }
        });
      }

      return updatedCompany;
    });

    revalidateCrmDataPaths(`/companies/${companyId}`);

    return Response.json(serializeCompany(company));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid company update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update company" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ companyId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { companyId } = await context.params;

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, workspaceId: true }
    });

    if (!company || company.workspaceId !== workspace.id) {
      return Response.json({ error: "Company not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await archiveCompany(tx, companyId);

      await tx.contact.updateMany({
        where: { companyId, workspaceId: workspace.id },
        data: { companyId: null }
      });

      await tx.task.updateMany({
        where: { companyId, workspaceId: workspace.id },
        data: { companyId: null, associateCompany: null }
      });

      const linkedLeads = await tx.lead.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [{ companyId }, { company: company.name }]
        },
        select: {
          id: true,
          contactId: true
        }
      });

      for (const lead of linkedLeads) {
        if (lead.contactId) {
          await tx.lead.update({
            where: { id: lead.id },
            data: { companyId: null, company: null }
          });
        } else {
          await deleteLeadWithCleanup(tx, lead.id);
        }
      }

      await tx.company.delete({
        where: { id: companyId }
      });
    });

    revalidateCrmDataPaths(`/companies/${companyId}`);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete company" }, { status: 500 });
  }
}
