export type Appointment = {
  id: string;
  company_id: string;
  card_id: string | null;
  titulo: string;
  inicio: string;
  fim: string;
  status: string;
  source: string;
  professional_id: string | null;
  service_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address: string | null;
  price: number | null;
  notes: string | null;
  updated_at?: string;
};
