import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { SectionHeader } from "../ui/SectionHeader";

export function Blog() {
  return (
    <section id="blog" className="section-pad bg-[var(--color-paper-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Knowledge Hub"
          title={
            <>
              Conteúdo que <span className="font-serif italic text-gradient">agrega</span>
            </>
          }
          description="Insights práticos para líderes que querem conectar cultura, estratégia e resultado."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {BLOG_POSTS.map((post, index) => (
            <FadeUp key={post.id} delay={index * 0.1}>
              <article className="group overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-soft transition-all hover:-translate-y-1">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-brand-blue)] backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs font-semibold text-[var(--color-ink-soft)]">
                    <span>{post.date}</span>
                    <span className="size-1 rounded-full bg-black/20" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {post.excerpt}
                  </p>
                  <a
                    href="#blog"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-purple)]"
                  >
                    Ler artigo
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}