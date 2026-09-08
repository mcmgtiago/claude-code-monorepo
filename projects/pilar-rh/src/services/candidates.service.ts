import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Candidate } from "@/lib/validation";

export async function submitCandidate(
  candidate: Candidate,
  resumeFile?: File
): Promise<{
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
    let resumePath: string | null = null;

    // Upload currículo se fornecido
    if (resumeFile) {
      const fileName = `${Date.now()}-${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("curriculos")
        .upload(fileName, resumeFile, {
          cacheControl: "0",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      resumePath = fileName;
    }

    const { data, error } = await supabase
      .from("candidates")
      .insert([
        {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          city: candidate.city,
          state: candidate.state,
          area: candidate.area,
          experience_level: candidate.experienceLevel,
          linkedin: candidate.linkedin || null,
          resume_path: resumePath,
          consent: candidate.consent,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Cadastro realizado com sucesso.",
      id: data?.id,
    };
  } catch (error) {
    console.error("Error submitting candidate:", error);
    return {
      success: false,
      message:
        "Houve um erro ao enviar seu cadastro. Tente novamente em poucos momentos.",
    };
  }
}

export async function submitJobApplication(candidateId: string, jobId: string) {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Serviço temporariamente indisponível.",
    };
  }

  try {
    const { error } = await supabase
      .from("job_applications")
      .insert([{ job_id: jobId, candidate_id: candidateId }]);

    if (error) throw error;

    return {
      success: true,
      message: "Candidatura registrada com sucesso.",
    };
  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      message:
        "Houve um erro ao registrar sua candidatura. Tente novamente em poucos momentos.",
    };
  }
}
