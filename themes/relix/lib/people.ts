export const contactStages = ["Lead", "Qualified", "Customer", "Evangelist"] as const;
export const companyTypes = ["Enterprise", "Mid-market", "SMB", "Startup"] as const;
export const companyIndustries = [
  "Advertising",
  "Aerospace",
  "Agriculture",
  "Artificial Intelligence",
  "Automotive",
  "Banking",
  "Biotechnology",
  "Cloud Computing",
  "Collaboration Software",
  "Commerce Platform",
  "Construction",
  "Consulting",
  "Consumer Electronics",
  "Cybersecurity",
  "Defense",
  "E-commerce",
  "Education",
  "Energy",
  "Enterprise SaaS",
  "Entertainment",
  "FinTech",
  "Food & Beverage",
  "Government",
  "Healthcare",
  "Hospitality",
  "HR Tech",
  "Industrial Manufacturing",
  "Infrastructure",
  "Insurance",
  "Internet Services",
  "Legal Tech",
  "Logistics",
  "Manufacturing",
  "Marketing Automation",
  "Media & Entertainment",
  "Payments",
  "Pharmaceuticals",
  "Productivity",
  "PropTech",
  "Real Estate",
  "Retail",
  "Robotics",
  "SaaS",
  "Shipping",
  "Software",
  "Streaming",
  "Supply Chain",
  "Telecommunications",
  "Travel",
  "Video Conferencing"
] as const;

export function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}
