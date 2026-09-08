import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/siteConfig";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-center">
      <div>
        <img src="/logo.svg" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-6 text-4xl font-extrabold">Página não encontrada</h1>
        <p className="mt-3 text-muted">Volte para a landing page da {siteConfig.company.name}.</p>
        <Button asChild className="mt-8"><Link href="/">Voltar para o início</Link></Button>
      </div>
    </main>
  );
}