import { enrichCompanyFromSource } from "@/lib/company-enrichment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const website = searchParams.get("website") || "";
  const linkedinUrl = searchParams.get("linkedinUrl") || "";

  if (!website.trim() && !linkedinUrl.trim()) {
    return Response.json({ error: "Provide a website or LinkedIn URL to enrich the company." }, { status: 400 });
  }

  const enrichment = await enrichCompanyFromSource(website, linkedinUrl);

  if (!enrichment) {
    return Response.json({ error: "Unable to enrich company details from the provided source." }, { status: 404 });
  }

  return Response.json(enrichment);
}
