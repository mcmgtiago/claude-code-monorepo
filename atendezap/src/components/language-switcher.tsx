import { useI18n, LANG_OPTIONS, type Lang } from "@/lib/i18n";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const current = LANG_OPTIONS.find((o) => o.value === lang) ?? LANG_OPTIONS[0];

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel-2)] transition-colors"
        title="Idioma / Language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && <span className="hidden sm:inline">{current.label.split(" ")[0]}</span>}
      </button>
      <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:flex flex-col w-36 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--panel)] shadow-lg overflow-hidden py-1">
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLang(opt.value as Lang)}
            className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors text-left ${
              lang === opt.value
                ? "text-foreground bg-[color:var(--brand-soft)]"
                : "text-muted-foreground hover:text-foreground hover:bg-[color:var(--panel-2)]"
            }`}
          >
            <span>{opt.flag}</span>
            <span>{opt.label}</span>
            {lang === opt.value && <span className="ml-auto text-[color:var(--brand)] text-[10px] font-bold">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
