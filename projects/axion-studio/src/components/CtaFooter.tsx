import { ArrowUpRight } from "lucide-react";
import HlsVideo from "./HlsVideo";

const videoUrl = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export default function CtaFooter() {
  return (
    <section id="book" className="relative overflow-hidden bg-black px-5 py-28 md:px-8 lg:px-16">
      <HlsVideo src={videoUrl} className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-5xl italic leading-[0.85] tracking-tight text-white md:text-6xl lg:text-7xl">
            Your next website starts here.
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-body text-sm font-light leading-relaxed text-white/60 md:text-base">
            Book a free strategy call. See what AI-powered design can do. No commitment, no pressure.
            Just possibilities.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@axion.studio"
              className="liquid-glass-strong inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-sm font-medium text-white"
            >
              Book a Call <ArrowUpRight size={16} />
            </a>
            <a
              id="pricing"
              href="#pricing"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 font-body text-sm font-medium text-black transition-transform hover:scale-[1.03]"
            >
              View Pricing
            </a>
          </div>
        </div>

        <footer className="mt-32 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="font-body text-xs text-white/40">(c) 2026 Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {[
              "Privacy",
              "Terms",
              "Contact",
            ].map((link) => (
              <a key={link} href="#" className="font-body text-xs text-white/40 transition-colors hover:text-white">
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
