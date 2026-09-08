import HlsVideo from "./HlsVideo";

const videoUrl = "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const stats = [
  ["200+", "Sites launched"],
  ["98%", "Client satisfaction"],
  ["3.2x", "More conversions"],
  ["5 days", "Average delivery"],
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-black px-5 py-32 md:px-8 lg:px-16">
      <HlsVideo
        src={videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(0)" }}
      />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="liquid-glass rounded-3xl p-12 md:p-16">
          <div className="relative z-10 grid grid-cols-1 gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label}>
                <div className="font-heading text-4xl italic leading-none text-white md:text-5xl lg:text-6xl">
                  {value}
                </div>
                <div className="mt-3 font-body text-sm font-light text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
