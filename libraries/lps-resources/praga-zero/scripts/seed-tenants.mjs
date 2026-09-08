import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const tenantsDir = path.join(root, "config", "tenants");
const publicTenantsDir = path.join(root, "public", "tenants");
const base = JSON.parse(await readFile(path.join(tenantsDir, "praga-zero.json"), "utf8"));

const tenants = [
  {
    slug: "controle-total",
    label: "Controle Total Residencial",
    name: "Controle Total Dedetização",
    email: "contato@controletotal.com.br",
    instagram: "@controletotaldedetiza",
    facebook: "/controletotaldedetiza",
    theme: { primary: "#16A34A", danger: "#B91C1C", warning: "#F59E0B", bg: "#FFFFFF", text: "#13231A", muted: "#647067", surface: "#F4F8F5", radius: "1rem" },
    setId: "residencial-familiar",
    city: "Canoas",
    neighborhoods: ["Centro", "Marechal Rondon", "Niterói", "Igara", "Mathias Velho", "Estância Velha", "São José", "Harmonia"]
  },
  {
    slug: "blindagem-24h",
    label: "Blindagem 24h Emergência",
    name: "Blindagem 24h Controle de Pragas",
    email: "contato@blindagem24h.com.br",
    instagram: "@blindagem24h",
    facebook: "/blindagem24h",
    theme: { primary: "#22C55E", danger: "#EF4444", warning: "#FACC15", bg: "#080F0C", text: "#F8FAFC", muted: "#94A3B8", surface: "#111827", radius: "0.8rem" },
    setId: "emergencia-24h",
    city: "São Leopoldo",
    neighborhoods: ["Centro", "Scharlau", "Feitoria", "Campina", "Rio Branco", "Santos Dumont", "Vicentina", "Cristo Rei"]
  },
  {
    slug: "higieniza-pragas",
    label: "Higieniza Pragas Comercial",
    name: "Higieniza Pragas Urbanas",
    email: "comercial@higienizapragas.com.br",
    instagram: "@higienizapragas",
    facebook: "/higienizapragas",
    theme: { primary: "#0EA5E9", danger: "#DC2626", warning: "#FBBF24", bg: "#FFFFFF", text: "#0F172A", muted: "#64748B", surface: "#F1F5F9", radius: "0.7rem" },
    setId: "comercial-industrial",
    city: "Novo Hamburgo",
    neighborhoods: ["Centro", "Rondônia", "Canudos", "Ideal", "Rio Branco", "Pátria Nova", "Hamburgo Velho", "Vila Nova"]
  },
  {
    slug: "porto-pragas",
    label: "Porto Pragas Clean",
    name: "Porto Pragas Controle Seguro",
    email: "contato@portopragas.com.br",
    instagram: "@portopragas",
    facebook: "/portopragas",
    theme: { primary: "#14B8A6", danger: "#E11D48", warning: "#FDE047", bg: "#FCFFFE", text: "#12312E", muted: "#5F7974", surface: "#ECFDF5", radius: "1.2rem" },
    setId: "clean-saude",
    city: "Gravataí",
    neighborhoods: ["Centro", "Morada do Vale", "Cohab", "Neópolis", "Parque dos Anjos", "São Vicente", "Barnabé", "Passo das Pedras"]
  }
];

for (const item of tenants) {
  const tenant = structuredClone(base);
  tenant.slug = item.slug;
  tenant.label = item.label;
  tenant.company.name = item.name;
  tenant.company.email = item.email;
  tenant.company.instagram = item.instagram;
  tenant.company.facebook = item.facebook;
  tenant.company.logo = `/tenants/${item.slug}/logo.svg`;
  tenant.company.shortDescription = `Empresa especializada em dedetização premium, controle de pragas urbanas e atendimento rápido em ${item.city}.`;
  tenant.theme = item.theme;
  tenant.media = { ...tenant.media, setId: item.setId, gallery: [] };
  tenant.coverage.defaultCity = item.city;
  tenant.coverage.defaultState = "RS";
  tenant.coverage.neighborhoods = item.neighborhoods;
  tenant.coverage.regions = ["Centro", "Zona Norte", "Zona Sul", "Região Metropolitana", "Bairros próximos"];
  await mkdir(path.join(publicTenantsDir, item.slug), { recursive: true });
  await copyFile(path.join(root, "public", "logo.svg"), path.join(publicTenantsDir, item.slug, "logo.svg"));
  await writeFile(path.join(tenantsDir, `${item.slug}.json`), JSON.stringify(tenant, null, 2), "utf8");
}

console.log(`Tenants gerados: ${tenants.map((t) => t.slug).join(", ")}`);
