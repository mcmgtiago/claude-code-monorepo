export type TenantCompany = {
  name: string;
  cnpj: string;
  cnae: string;
  phone: string;
  phoneFormatted: string;
  email: string;
  whatsappMessage: string;
  instagram: string;
  facebook: string;
  yearsExperience: number;
  googleRating: number;
  propertiesServed: number;
  shortDescription: string;
  logo: string;
};

export type TenantTheme = {
  primary: string;
  danger: string;
  warning: string;
  bg: string;
  text: string;
  muted: string;
  surface: string;
  radius?: string;
};

export type TenantMediaAsset = {
  src: string;
  alt: string;
  photographer?: string;
  href?: string;
};

export type TenantHeroMedia = {
  type: "image" | "video";
  src: string;
  poster: string;
  alt: string;
  photographer?: string;
  href?: string;
};

export type TenantCoverage = {
  defaultCity: string;
  defaultState: string;
  neighborhoods: string[];
  regions: string[];
};

export type TenantConfig = {
  slug: string;
  label: string;
  company: TenantCompany;
  theme: TenantTheme;
  media: {
    setId: string;
    hero: TenantHeroMedia;
    gallery: TenantMediaAsset[];
    og: TenantMediaAsset;
  };
  coverage: TenantCoverage;
  copyRef: "default";
  createdAt?: string;
};
