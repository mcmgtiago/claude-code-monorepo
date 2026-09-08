import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

interface FormSuccessProps {
  title: string;
  message: string;
  nextAction?: {
    label: string;
    href: string;
  };
}

export function FormSuccess({ title, message, nextAction }: FormSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        <CheckCircle className="w-16 h-16 text-success mx-auto" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-ink mb-2">{title}</h2>
      <p className="text-ink-soft mb-6 max-w-sm">{message}</p>
      <div className="flex gap-3 justify-center">
        <Link
          to={ROUTES.home}
          className="px-5 py-2.5 rounded-lg border border-line text-sm font-medium text-ink hover:bg-paper-muted transition-colors">
          Voltar ao início
        </Link>
        {nextAction && (
          <Link
            to={nextAction.href}
            className="px-5 py-2.5 rounded-lg bg-wine text-white text-sm font-medium hover:bg-wine-deep transition-colors">
            {nextAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}
