import { useEffect } from "react";
import { Container } from "@/components/common/Container";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";

export default function HomePage() {
  useEffect(() => {
    document.title =
      "PILAR Recursos Humanos | Recrutamento, Temporários e Terceirização";
  }, []);

  return (
    <>
      <Hero />
      <TrustBar />
      <Container>
        <div className="py-12 text-center">
          <p className="text-muted font-mono text-xs">Mais seções em construção...</p>
        </div>
      </Container>
    </>
  );
}