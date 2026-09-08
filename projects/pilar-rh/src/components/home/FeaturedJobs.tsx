import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { ROUTES } from "@/lib/routes";
import { fetchJobs } from "@/services/jobs.service";
import type { Job } from "@/data/jobs.fallback";
import { MapPin, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((data) => setJobs(data.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="vagas" className="py-16 sm:py-24 bg-ivory">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="04 / OPORTUNIDADES ABERTAS" align="center" className="justify-center" />
          <SectionHeader heading="Encontre uma vaga compatível com seu momento profissional." />
        </div>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <Reveal key={job.id} delay={idx * 0.05}>
                <Link
                  to={ROUTES.jobDetail(job.slug)}
                  onClick={() => trackEvent("job_opened", { jobId: job.id })}
                  className="block bg-white rounded-xl border border-line p-6 hover:border-wine/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg font-bold text-ink group-hover:text-wine transition-colors">
                      {job.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.contract}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {job.modality}
                    </span>
                  </div>

                  <p className="text-sm text-ink-soft mb-4 line-clamp-2">
                    {job.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted">
                      {job.area} • {job.level}
                    </span>
                    <span className="inline-flex items-center gap-1 text-wine text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                      Ver detalhes
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to={ROUTES.jobs}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-wine text-wine font-semibold hover:bg-wine hover:text-white transition-all">
            Ver todas as vagas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-xs text-muted mt-8">
          Vagas demonstrativas. A listagem de produção deve ser alimentada pelo banco de dados.
        </p>
      </Container>
    </section>
  );
}
