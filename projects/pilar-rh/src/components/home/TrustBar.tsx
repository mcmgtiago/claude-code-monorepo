export function TrustBar() {
  const companies = [
    "ALVORA",
    "NORTELOG",
    "CLÍNICA VIVA",
    "BRAVA VAREJO",
    "MONTESA",
    "CAMPO SUL",
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-line">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm font-mono tracking-widest text-ink-soft uppercase mb-8">
            Empresas de diferentes setores contam com processos conduzidos pela PILAR
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center justify-items-center">
            {companies.map((name) => (
              <div
                key={name}
                className="text-center text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
                {name}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-8">
            Marcas ilustrativas para demonstração da interface.
          </p>
        </div>
      </div>
    </section>
  );
}
