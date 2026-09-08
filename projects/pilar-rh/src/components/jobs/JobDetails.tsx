import { Link } from "react-router-dom";
import { MapPin, Briefcase, Calendar, Clock, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { Container } from "@/components/common/Container";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import type { Job } from "@/data/jobs.fallback";
import { formatDate } from "@/lib/format";

interface JobDetailsProps {
  job: Job;
  onApply: () => void;
}

export function JobDetails({ job, onApply }: JobDetailsProps) {
  return (
    <Container>
      <Breadcrumbs
        items={[
          { label: "Vagas", href: ROUTES.jobs },
          { label: job.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-4">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              {job.contract}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {job.modality}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {job.level}
            </span>
          </div>

          {/* Description */}
          {job.description && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg text-ink mb-3">Descrição da vaga</h2>
              <p className="text-ink-soft leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg text-ink mb-3">Requisitos</h2>
              <ul className="space-y-2">
                {job.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-ink-soft">
                    <span className="text-wine mt-1 flex-shrink-0">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg text-ink mb-3">Benefícios</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-ink-soft">
                    <span className="text-success mt-1 flex-shrink-0">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-line p-6 space-y-4">
            <button
              onClick={onApply}
              className="w-full px-6 py-3 rounded-full bg-wine text-white font-semibold hover:bg-wine-deep transition-colors">
              Candidatar-se
            </button>

            <div className="space-y-3 pt-4 border-t border-line text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Área</span>
                <span className="text-ink font-medium">{job.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Contrato</span>
                <span className="text-ink font-medium">{job.contract}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Modalidade</span>
                <span className="text-ink font-medium">{job.modality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Nível</span>
                <span className="text-ink font-medium">{job.level}</span>
              </div>
              {job.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted">Publicada</span>
                  <span className="text-ink font-medium font-mono text-xs">
                    {formatDate(job.publishedAt)}
                  </span>
                </div>
              )}
            </div>

            <Link
              to={ROUTES.jobs}
              className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors mt-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar para vagas
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
