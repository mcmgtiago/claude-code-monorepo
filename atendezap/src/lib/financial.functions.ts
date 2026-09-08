export type FinancialEntry = {
  id: string;
  company_id: string;
  type: "entrada" | "saida";
  category: string | null;
  description: string;
  amount: number;
  date: string;
  status: "confirmado" | "pendente" | "cancelado";
  reference_agendamento_id: string | null;
  reference_card_id: string | null;
  professional_id: string | null;
  created_at: string;
};

export const INCOME_CATEGORIES = [
  "Service completed",
  "Deposit / Down payment",
  "Final payment",
  "Tip",
  "Other",
];

export const EXPENSE_CATEGORIES = [
  "Materials",
  "Fuel",
  "Equipment",
  "Labor",
  "Marketing",
  "Software",
  "Other",
];
