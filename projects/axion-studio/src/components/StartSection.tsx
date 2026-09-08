import { ArrowUpRight } from "lucide-react";
import HlsVideo from "./HlsVideo";

const videoUrl = "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

export default function StartSection() {
  return (
    <section id="services" className="relative overflow-hidden bg-black py-24">
      <HlsVideo src={videoUrl} className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 mx-auto flex min-h-[500px] max-w-5xl flex-col items-center justify-center px-5 text-center">
        <span className="liquid-glass rounded-full px-3.5 py-1 font-body text-xs font-medium text-white">
          How It Works
        </span>
        <h2 className="mt-6 max-w-3xl font-heading text-4xl italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
          You dream it. We ship it.
        </h2>
        <p className="mt-5 max-w-xl font-body text-sm font-light leading-relaxed text-white/60 md:text-base">
          Share your vision. Our AI handles the rest—wireframes, design, code, launch. All in days,
          not quarters.
        </p>
        <a
          href="#book"
          className="liquid-glass-strong mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-sm font-medium text-white"
        >
          Get Started <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
