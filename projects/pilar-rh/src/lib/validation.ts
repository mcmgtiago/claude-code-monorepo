import { z } from "zod";

export const companyLeadSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().min(8, "Informe um telefone válido."),
  company: z.string().min(2, "Informe a empresa."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Selecione o estado."),
  companySize: z.string().min(1, "Selecione o tamanho da empresa."),
  service: z.string().min(1, "Selecione o serviço desejado."),
  urgency: z.string().min(1, "Selecione o prazo."),
  description: z
    .string()
    .min(20, "Conte um pouco mais sobre a necessidade."),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Você precisa concordar com o uso dos dados.",
    }),
  }),
});

export type CompanyLead = z.infer<typeof companyLeadSchema>;

export const candidateSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().min(8, "Informe um telefone válido."),
  city: z.string().min(2, "Informe sua cidade."),
  state: z.string().min(2, "Selecione seu estado."),
  area: z.string().min(1, "Selecione uma área de interesse."),
  experienceLevel: z.string().min(1, "Selecione seu nível de experiência."),
  linkedin: z
    .string()
    .url("Informe um endereço válido.")
    .optional()
    .or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Você precisa concordar com o uso dos dados.",
    }),
  }),
});

export type Candidate = z.infer<typeof candidateSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Você precisa concordar com o uso dos dados.",
    }),
  }),
});

export type Newsletter = z.infer<typeof newsletterSchema>;
