// AI Engine server function — uses Claude Opus 4.8 via gateway
// Analyzes tenant data and generates actionable growth insights
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ANTHROPIC_BASE_URL = process.env["ANTHROPIC_BASE_URL"] || "https://avellogateway.online";
const ANTHROPIC_AUTH_TOKEN = process.env["ANTHROPIC_AUTH_TOKEN"] || "";

const inputSchema = z.object({
  companyName: z.string(),
  vertical: z.enum(["barbearia", "beleza", "estetica"]).default("barbearia"),
  metrics: z.object({
    totalClientes: z.number(),
    clientesInativos60d: z.number(),
    agendamentosMes: z.number(),
    cancelamentosMes: z.number(),
    noShowMes: z.number(),
    faturamentoMes: z.number(), // em centavos
    ticketMedio: z.number(), // em centavos
    profissionaisAtivos: z.number(),
    servicosMenosDemanda: z.array(z.object({ nome: z.string(), qtd: z.number() })),
    horariosVazios: z.array(z.string()).optional(),
  }),
  question: z.string().optional(), // pergunta aberta do usuário
});

export type AIInsightResponse = {
  insights: Array<{
    id: string;
    type: "reativacao" | "performance" | "demanda" | "ocupacao" | "financeiro" | "crescimento";
    priority: "alta" | "media" | "baixa";
    title: string;
    description: string;
    action_label: string;
    impact_estimate: number; // em centavos
  }>;
  summary: string;
  answer?: string; // resposta à pergunta aberta
};

export const generateAIInsights = createServerFn({ method: "POST" })
  .validator(inputSchema)
  .handler(async ({ data }): Promise<AIInsightResponse> => {
    if (!ANTHROPIC_AUTH_TOKEN) {
      console.warn("[AI] ANTHROPIC_AUTH_TOKEN not set — returning fallback insights");
      return fallbackInsights(data);
    }

    const systemPrompt = buildSystemPrompt(data.vertical);
    const userPrompt = buildUserPrompt(data);

    try {
      const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_AUTH_TOKEN,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-8",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[AI] API error:", response.status, errText);
        return fallbackInsights(data);
      }

      const result = await response.json();
      const text = result.content?.[0]?.text ?? "";

      // Parse JSON from response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) {
        console.error("[AI] Could not parse JSON from response");
        return fallbackInsights(data);
      }

      const parsed = JSON.parse(jsonMatch[1]) as AIInsightResponse;
      return parsed;
    } catch (err) {
      console.error("[AI] Error calling Opus:", err);
      return fallbackInsights(data);
    }
  });

// Chat with AI about the business
export const chatWithAI = createServerFn({ method: "POST" })
  .validator(z.object({
    companyName: z.string(),
    vertical: z.enum(["barbearia", "beleza", "estetica"]).default("barbearia"),
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })),
    context: z.string().optional(), // dados resumidos do tenant
  }))
  .handler(async ({ data }): Promise<{ reply: string }> => {
    if (!ANTHROPIC_AUTH_TOKEN) {
      return { reply: "IA não configurada. Defina ANTHROPIC_AUTH_TOKEN no .env para ativar." };
    }

    const systemPrompt = `Você é o assistente de crescimento IA da ${data.companyName}, um(a) ${data.vertical}.
Você ajuda o dono a tomar decisões de negócio, criar campanhas, analisar métricas e sugerir ações.
Responda sempre em pt-BR, de forma direta e prática. Foque em ações concretas com impacto mensurável.
${data.context ? `\nContexto atual do negócio:\n${data.context}` : ""}`;

    try {
      const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_AUTH_TOKEN,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-8",
          max_tokens: 1024,
          system: systemPrompt,
          messages: data.messages,
        }),
      });

      if (!response.ok) {
        return { reply: "Erro ao consultar IA. Tente novamente em alguns instantes." };
      }

      const result = await response.json();
      return { reply: result.content?.[0]?.text ?? "Sem resposta." };
    } catch {
      return { reply: "Erro de conexão com a IA. Verifique sua internet." };
    }
  });

// --- Helper functions ---

function buildSystemPrompt(vertical: string) {
  return `Você é um consultor de negócios IA especializado em ${vertical === "barbearia" ? "barbearias" : vertical === "beleza" ? "salões de beleza" : "clínicas de estética"}.

Analise os dados do estabelecimento e gere insights ACIONÁVEIS com estimativa de impacto financeiro.

REGRAS:
- Responda APENAS em JSON válido no formato especificado
- Priorize ações de alto impacto e baixo esforço
- Estimativas de impacto devem ser realistas (em centavos de R$)
- Máximo 5 insights, mínimo 2
- Inclua sempre um "summary" de 1 linha

Formato de resposta:
\`\`\`json
{
  "insights": [
    {
      "id": "unique_id",
      "type": "reativacao|performance|demanda|ocupacao|financeiro|crescimento",
      "priority": "alta|media|baixa",
      "title": "Título curto e impactante",
      "description": "Explicação prática de 2-3 frases",
      "action_label": "Texto do botão de ação",
      "impact_estimate": 15000
    }
  ],
  "summary": "Resumo geral em 1 frase"
}
\`\`\``;
}

function buildUserPrompt(data: z.infer<typeof inputSchema>) {
  const m = data.metrics;
  const faturamento = (m.faturamentoMes / 100).toFixed(2);
  const ticket = (m.ticketMedio / 100).toFixed(2);

  let prompt = `Dados do estabelecimento "${data.companyName}" (${data.vertical}):

- Total de clientes: ${m.totalClientes}
- Clientes inativos (>60 dias): ${m.clientesInativos60d}
- Agendamentos no mês: ${m.agendamentosMes}
- Cancelamentos: ${m.cancelamentosMes}
- No-shows: ${m.noShowMes}
- Faturamento do mês: R$ ${faturamento}
- Ticket médio: R$ ${ticket}
- Profissionais ativos: ${m.profissionaisAtivos}`;

  if (m.servicosMenosDemanda.length > 0) {
    prompt += `\n- Serviços com baixa demanda: ${m.servicosMenosDemanda.map(s => `${s.nome} (${s.qtd}x)`).join(", ")}`;
  }
  if (m.horariosVazios?.length) {
    prompt += `\n- Horários frequentemente vazios: ${m.horariosVazios.join(", ")}`;
  }
  if (data.question) {
    prompt += `\n\nPergunta do dono: ${data.question}`;
  }

  prompt += `\n\nGere insights práticos e acionáveis baseado nesses dados.`;
  return prompt;
}

function fallbackInsights(data: z.infer<typeof inputSchema>): AIInsightResponse {
  const m = data.metrics;
  const insights: AIInsightResponse["insights"] = [];

  if (m.clientesInativos60d > 0) {
    insights.push({
      id: "f1", type: "reativacao", priority: "alta",
      title: `${m.clientesInativos60d} clientes sem agendar há +60 dias`,
      description: "Envie uma mensagem de reativação oferecendo desconto especial para retorno.",
      action_label: "Criar campanha",
      impact_estimate: m.clientesInativos60d * 8000,
    });
  }

  if (m.cancelamentosMes > 0) {
    const rate = m.agendamentosMes > 0 ? m.cancelamentosMes / m.agendamentosMes : 0;
    insights.push({
      id: "f2", type: "performance", priority: rate > 0.15 ? "alta" : "media",
      title: `${m.cancelamentosMes} cancelamentos (${Math.round(rate * 100)}% do total)`,
      description: "Ative lembretes automáticos 24h antes para reduzir cancelamentos.",
      action_label: "Ativar lembretes",
      impact_estimate: m.cancelamentosMes * 5000,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "f3", type: "crescimento", priority: "media",
      title: "Aumente o ticket médio com combos",
      description: "Crie pacotes combinando serviços populares com 10-15% de desconto.",
      action_label: "Criar combo",
      impact_estimate: 20000,
    });
  }

  return {
    insights,
    summary: `${insights.length} oportunidade(s) identificada(s) para ${data.companyName}.`,
  };
}
