export type MediaAsset = {
  id: string;
  provider: "pexels" | "pixabay" | "mixkit" | "coverr" | "local";
  type: "image" | "video";
  file: string;
  poster?: string;
  sourcePage?: string;
  author?: string;
  alt: string;
  width?: number;
  height?: number;
  focalPoint?: {
    x: number;
    y: number;
  };
  section:
    | "hero"
    | "services"
    | "companies"
    | "candidates"
    | "industries"
    | "training"
    | "about"
    | "cases";
};

// Placeholder — gerado pelo script media-ingest.mjs
// Executar: npm run media:fetch para popular com mídias reais
export const mediaAssets: MediaAsset[] = [
  {
    id: "hero-placeholder",
    provider: "local",
    type: "image",
    file: "/media/hero-placeholder.webp",
    alt: "Profissional em atendimento de recrutamento em escritório",
    width: 800,
    height: 1000,
    section: "hero",
    focalPoint: { x: 0.5, y: 0.35 },
  },
];
