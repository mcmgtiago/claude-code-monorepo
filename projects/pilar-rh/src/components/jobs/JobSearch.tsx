import { useState, useEffect } from "react";
import { JobFilters } from "./JobFilters";
import { JobCard } from "./JobCard";
import { EmptyState } from "@/components/common/EmptyState";
import { fetchJobs } from "@/services/jobs.service";
import type { JobFilters as Filters } from "@/services/jobs.service";
import type { Job } from "@/data/jobs.fallback";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    setLoading(true);
    fetchJobs(filters)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="space-y-6">
      <JobFilters onFilter={setFilters} currentFilters={filters} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-line p-6 animate-pulse">
              <div className="h-6 bg-paper-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-paper-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-paper-muted rounded w-2/3 mb-4" />
              <div className="h-16 bg-paper-muted rounded" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="Nenhuma vaga corresponde aos filtros selecionados."
          description="Tente remover algum filtro ou cadastrar seu currículo no banco de talentos."
          action={
            <div className="flex gap-3">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 rounded-lg border border-line text-sm font-medium text-ink hover:bg-paper-muted transition-colors">
                Limpar filtros
              </button>
              <Link
                to={ROUTES.candidates}
                className="px-4 py-2 rounded-lg bg-wine text-white text-sm font-medium hover:bg-wine-deep transition-colors">
                Cadastrar currículo
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-soft">
            {jobs.length} vaga{jobs.length !== 1 ? "s" : ""} encontrada{jobs.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}

      <p className="text-center text-xs text-muted mt-8">
        Vagas demonstrativas. A listagem de produção deve ser alimentada pelo banco de dados.
      </p>
    </div>
  );
}
