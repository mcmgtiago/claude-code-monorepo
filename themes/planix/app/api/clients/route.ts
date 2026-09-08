import { NextResponse } from "next/server";

import type { ClientEmployeeRecord, ClientHealth, ClientRecord, ClientStage, InvoiceStatus } from "@/data/clients";
import {
  createDemoClient,
  getDemoClients,
  getDemoOwnerOptions,
  getDemoPeopleBundle,
} from "@/lib/template-demo-store";

type ClientBody = {
  company?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  ownerId?: string;
  ownerName?: string;
  stage?: ClientStage;
  health?: ClientHealth;
  invoiceStatus?: InvoiceStatus;
  arr?: string | number;
  nextRenewal?: string;
  lastActivity?: string;
  priority?: boolean;
  archived?: boolean;
  employees?: ClientEmployeeRecord[];
};

function parseRevenue(value: string | number | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  }

  const digits = `${value ?? ""}`.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export async function GET() {
  const people = getDemoPeopleBundle();

  return NextResponse.json({
    ok: true,
    clients: getDemoClients(),
    ownerOptions: getDemoOwnerOptions(),
    teamOptions: people.teams,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ClientBody;
  const company = body.company?.trim() ?? "";
  const contactName = body.contactName?.trim() ?? "";
  const email = body.email?.trim() ?? "";

  if (!company || !contactName || !email) {
    return NextResponse.json({ error: "Company, contact name, and email are required." }, { status: 400 });
  }

  const owner = getDemoOwnerOptions().find((item) => item.id === body.ownerId || item.name === body.ownerName);

  if (!owner) {
    return NextResponse.json({ error: "Select a valid account owner." }, { status: 400 });
  }

  const client = createDemoClient({
    company,
    contactName,
    contactRole: body.contactRole?.trim() || "Primary Contact",
    email,
    location: body.location?.trim() || "Remote",
    website: body.website?.trim() || `${company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`,
    logoUrl: body.logoUrl?.trim() || undefined,
    owner,
    stage: body.stage || "Onboarding",
    health: body.health || "Healthy",
    invoiceStatus: body.invoiceStatus || "Pending",
    arr: parseRevenue(body.arr),
    nextRenewal: body.nextRenewal?.trim() || "2026-12-31",
    lastActivity: body.lastActivity?.trim() || "Client created just now",
    priority: Boolean(body.priority),
    archived: Boolean(body.archived),
    employees: body.employees ?? [],
  } satisfies Partial<ClientRecord>);

  return NextResponse.json({ ok: true, client }, { status: 201 });
}
