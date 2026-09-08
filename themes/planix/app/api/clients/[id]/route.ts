import { NextResponse } from "next/server";

import type { ClientEmployeeRecord, ClientRecord } from "@/data/clients";
import {
  deleteDemoClient,
  getDemoClientById,
  getDemoOwnerOptions,
  updateDemoClient,
} from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ClientPatchBody = {
  company?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  ownerId?: string;
  ownerName?: string;
  stage?: ClientRecord["stage"];
  health?: ClientRecord["health"];
  invoiceStatus?: ClientRecord["invoiceStatus"];
  activeProjects?: number;
  arr?: string | number;
  lastActivity?: string;
  nextRenewal?: string;
  priority?: boolean;
  archived?: boolean;
  employees?: ClientEmployeeRecord[];
};

function parseRevenue(value: string | number | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = getDemoClientById(id);

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, client });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as ClientPatchBody;
  const owner = body.ownerId || body.ownerName
    ? getDemoOwnerOptions().find((item) => item.id === body.ownerId || item.name === body.ownerName)
    : undefined;

  if ((body.ownerId || body.ownerName) && !owner) {
    return NextResponse.json({ error: "Client owner not found." }, { status: 400 });
  }

  const client = updateDemoClient(id, {
    company: body.company?.trim(),
    contactName: body.contactName?.trim(),
    contactRole: body.contactRole?.trim(),
    email: body.email?.trim(),
    location: body.location?.trim(),
    website: body.website?.trim(),
    logoUrl: typeof body.logoUrl === "string" ? body.logoUrl.trim() || undefined : undefined,
    owner,
    stage: body.stage,
    health: body.health,
    invoiceStatus: body.invoiceStatus,
    activeProjects: body.activeProjects,
    arr: parseRevenue(body.arr),
    lastActivity: body.lastActivity?.trim(),
    nextRenewal: body.nextRenewal?.trim(),
    priority: typeof body.priority === "boolean" ? body.priority : undefined,
    archived: typeof body.archived === "boolean" ? body.archived : undefined,
    employees: body.employees,
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, client });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteDemoClient(id);

  if (!deleted) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
