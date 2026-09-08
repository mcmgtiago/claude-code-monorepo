import { createServerFn } from "@tanstack/react-start";

/**
 * Resolve um identificador de login (e-mail, nome de usuário ou — futuramente —
 * telefone) para o e-mail real da conta, que é o que o Supabase Auth usa.
 *
 * Público de propósito (roda antes do login). Usa service role só para ler o
 * mapeamento e devolve apenas o e-mail — nada sensível.
 *
 * Hoje o username fica em user_metadata.username (sem migração de schema).
 * Quando houver uma coluna `username` indexada em profiles, dá pra trocar a
 * varredura por um SELECT direto.
 */
export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { identifier: string }) => ({ identifier: String(d.identifier ?? "").trim() }))
  .handler(async ({ data }): Promise<{ email: string | null }> => {
    const id = data.identifier;
    if (!id) return { email: null };

    // Já é e-mail → usa direto
    if (id.includes("@")) return { email: id.toLowerCase() };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const needle = id.toLowerCase();
    const onlyDigits = id.replace(/\D/g, "");
    const looksLikePhone = onlyDigits.length >= 8 && /^[+\d\s()-]+$/.test(id);

    // Caminho rápido: coluna username em profiles (se a migração já foi aplicada).
    try {
      const { data: prof, error } = await supabaseAdmin
        .from("profiles").select("email").eq("username", needle).maybeSingle();
      if (!error && prof?.email) return { email: prof.email };
    } catch {
      // coluna ainda não existe — cai no fallback de varredura abaixo
    }

    for (let page = 1; page <= 25; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const users = list?.users ?? [];
      const hit = users.find((u) => {
        const m = (u.user_metadata ?? {}) as Record<string, unknown>;
        const uname = String(m.username ?? "").toLowerCase();
        if (uname && uname === needle) return true;
        if (looksLikePhone) {
          const uphone = String(u.phone ?? m.phone ?? "").replace(/\D/g, "");
          if (uphone && uphone.endsWith(onlyDigits)) return true;
        }
        return false;
      });
      if (hit?.email) return { email: hit.email };
      if (users.length < 200) break;
    }

    return { email: null };
  });
