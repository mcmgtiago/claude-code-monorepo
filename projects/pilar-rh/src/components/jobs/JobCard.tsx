import { Link } from "react-router-dom";
import { MapPin, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import type { Job } from "@/data/jobs.fallback";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
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
  );
}
