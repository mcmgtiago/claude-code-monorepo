import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { fallbackJobs, type Job } from "@/data/jobs.fallback";

export interface JobFilters {
  keyword?: string;
  city?: string;
  state?: string;
  area?: string;
  contract?: string;
  modality?: string;
  level?: string;
}

export async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  if (!isSupabaseConfigured()) {
    return filterLocalJobs(fallbackJobs, filters);
  }

  try {
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("published_at", { ascending: false });

    if (filters?.area) query = query.eq("area", filters.area);
    if (filters?.contract) query = query.eq("contract", filters.contract);
    if (filters?.modality) query = query.eq("modality", filters.modality);
    if (filters?.level) query = query.eq("level", filters.level);
    if (filters?.state) query = query.eq("state", filters.state);
    if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
    if (filters?.keyword) {
      query = query.or(
        `title.ilike.%${filters.keyword}%,summary.ilike.%${filters.keyword}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map(mapDbJob);
  } catch {
    return filterLocalJobs(fallbackJobs, filters);
  }
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  if (!isSupabaseConfigured()) {
    return fallbackJobs.find((j) => j.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data ? mapDbJob(data) : null;
  } catch {
    return fallbackJobs.find((j) => j.slug === slug) || null;
  }
}

function filterLocalJobs(jobs: Job[], filters?: JobFilters): Job[] {
  if (!filters) return jobs;
  return jobs.filter((job) => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      if (
        !job.title.toLowerCase().includes(kw) &&
        !job.summary.toLowerCase().includes(kw)
      ) {
        return false;
      }
    }
    if (filters.area && job.area !== filters.area) return false;
    if (filters.contract && job.contract !== filters.contract) return false;
    if (filters.modality && job.modality !== filters.modality) return false;
    if (filters.level && job.level !== filters.level) return false;
    if (filters.state && job.state !== filters.state) return false;
    if (filters.city) {
      const c = filters.city.toLowerCase();
      if (!job.location.toLowerCase().includes(c)) return false;
    }
    return true;
  });
}

function mapDbJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    company: row.company as string | undefined,
    location: row.location as string,
    city: row.city as string | undefined,
    state: row.state as string | undefined,
    area: row.area as string,
    contract: row.contract as string,
    modality: row.modality as string,
    level: row.level as string,
    publishedAt: row.published_at as string,
    summary: row.summary as string,
    description: row.description as string | undefined,
    requirements: row.requirements as string[] | undefined,
    benefits: row.benefits as string[] | undefined,
    salaryMin: row.salary_min as number | undefined,
    salaryMax: row.salary_max as number | undefined,
    isConfidential: row.is_confidential as boolean | undefined,
  };
}
