export type ServiceCategory = {
  id: string;
  company_id: string;
  name: string;
  sort_order: number;
  active: boolean;
};

export type Service = {
  id: string;
  company_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  active: boolean;
  featured: boolean;
};

export type Professional = {
  id: string;
  company_id: string;
  name: string;
  specialty: string | null;
  photo_url: string | null;
  commission_type: "percent" | "fixed";
  commission_value: number;
  work_schedule: Record<string, any>;
  active: boolean;
};
