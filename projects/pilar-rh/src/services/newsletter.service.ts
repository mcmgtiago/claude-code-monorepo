import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function subscribeNewsletter(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Serviço temporariamente indisponível. Tente novamente em poucos momentos.",
    };
  }

  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert([{ email, consent: true }], { onConflict: "email" });

    if (error) throw error;

    return {
      success: true,
      message: "E-mail cadastrado com sucesso.",
    };
  } catch (error) {
    console.error("Error subscribing newsletter:", error);
    return {
      success: false,
      message:
        "Houve um erro ao realizar o cadastro. Tente novamente em poucos momentos.",
    };
  }
}
