import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { JobFilters as Filters } from "@/services/jobs.service";

interface JobFiltersProps {
  onFilter: (filters: Filters) => void;
  currentFilters: Filters;
}

const areas = ["Logística", "Recursos Humanos", "Indústria", "Atendimento", "Comercial", "Administrativo"];
const contracts = ["CLT", "Temporário", "Estágio", "PJ"];
const modalities = ["Presencial", "Híbrido", "Remoto"];
const levels = ["Operacional", "Assistente", "Pleno", "Liderança", "Estágio"];

export function JobFilters({ onFilter, currentFilters }: JobFiltersProps) {
  const [keyword, setKeyword] = useState(currentFilters.keyword || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    trackEvent("job_search_used", { keyword });
    onFilter({ ...currentFilters, keyword });
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    trackEvent("job_filter_used", { filter: key, value });
    onFilter({ ...currentFilters, [key]: value || undefined });
  };

  const clearFilters = () => {
    setKeyword("");
    onFilter({});
  };

  const hasFilters = Object.values(currentFilters).some(Boolean);

  return (
    <div className="bg-white rounded-xl border border-line p-6">
      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Pesquisar por cargo, área ou cidade..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-line bg-paper text-ink placeholder:text-muted text-sm focus:outline-none focus:border-wine"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-3 rounded-lg bg-wine text-white font-medium text-sm hover:bg-wine-deep transition-colors">
          Buscar
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-3 rounded-lg border border-line text-ink-soft hover:bg-paper-muted transition-colors md:hidden"
          aria-label="Filtros">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showFilters ? '' : 'hidden md:grid'}`}>
        <select
          value={currentFilters.area || ""}
          onChange={(e) => handleFilterChange("area", e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-line bg-paper text-sm text-ink focus:outline-none focus:border-wine">
          <option value="">Área</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={currentFilters.contract || ""}
          onChange={(e) => handleFilterChange("contract", e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-line bg-paper text-sm text-ink focus:outline-none focus:border-wine">
          <option value="">Contrato</option>
          {contracts.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={currentFilters.modality || ""}
          onChange={(e) => handleFilterChange("modality", e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-line bg-paper text-sm text-ink focus:outline-none focus:border-wine">
          <option value="">Modalidade</option>
          {modalities.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <select
          value={currentFilters.level || ""}
          onChange={(e) => handleFilterChange("level", e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-line bg-paper text-sm text-ink focus:outline-none focus:border-wine">
          <option value="">Nível</option>
          {levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <div className="mt-3">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs text-wine font-medium hover:text-wine-deep">
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
