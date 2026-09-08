import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const steps = [
  {
    number: "01",
    title: "Entender",
    description:
      "Alinhamos contexto, responsabilidades, rotina, requisitos e expectativas.",
  },
  {
    number: "02",
    title: "Buscar",
    description:
      "Selecionamos canais, bancos de talentos e estratégias adequadas ao perfil.",
  },
  {
    number: "03",
    title: "Avaliar",
    description:
      "Conduzimos triagens, entrevistas e avaliações compatíveis com a posição.",
  },
  {
    number: "04",
    title: "Apresentar",
    description:
      "Entregamos uma relação objetiva de candidatos, com informações relevantes para a decisão.",
  },
  {
    number: "05",
    title: "Acompanhar",
    description:
      "Mantemos contato com empresa e profissional durante a contratação e integração.",
  },
];

export function RecruitmentProcess() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-16 sm:py-24 bg-ivory">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="02 / UM PROCESSO CLARO PARA TODOS" align="center" className="justify-center" />
          <SectionHeader heading="Da definição da vaga ao acompanhamento da contratação." />
        </div>

        {/* Timeline Desktop */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Linha conectora */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-line" />

            {/* Steps */}
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, idx) => (
                <Reveal key={step.number} delay={idx * 0.1}>
                  <div className="relative pt-24">
                    {/* Circle */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-wine/10 border-2 border-wine flex items-center justify-center">
                      <span className="font-mono font-bold text-wine text-base">
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="text-center pt-8">
                      <h3 className="font-serif text-lg font-bold text-ink mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm text-ink-soft leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Mobile */}
        <div className="md:hidden space-y-8">
          {steps.map((step, idx) => (
            <Reveal key={step.number} delay={idx * 0.05}>
              <div className="flex gap-6">
                {/* Linha vertical */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-wine text-white flex items-center justify-center font-mono font-bold text-sm">
                    {step.number}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-line mt-3" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1.5">
                  <h3 className="font-serif text-lg font-bold text-ink mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-soft">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
