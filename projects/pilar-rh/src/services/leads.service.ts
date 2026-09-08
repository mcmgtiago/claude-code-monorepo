import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { CompanyLead } from "@/lib/validation";

export async function submitCompanyLead(lead: CompanyLead): Promise<{
  success: boolean;
  message: string;
  id?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Serviço temporariamente indisponível. Tente novamente em poucos momentos.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("company_leads")
      .insert([
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          city: lead.city,
          state: lead.state,
          company_size: lead.companySize,
          service: lead.service,
          urgency: lead.urgency,
          description: lead.description,
          consent: lead.consent,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Proposta recebida com sucesso.",
      id: data?.id,
    };
  } catch (error) {
    console.error("Error submitting company lead:", error);
    return {
      success: false,
      message:
        "Houve um erro ao enviar sua proposta. Tente novamente em poucos momentos.",
    };
  }
}
