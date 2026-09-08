import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { cn } from "@/lib/utils";

export function BrandLogo({ src, name, className }: { src?: string; name?: string; className?: string }) {
  const logoSrc = src || "/logo.svg";
  const companyName = name || siteConfig.company.name;
  return (
    <span className="inline-flex items-center gap-2">
      <Image src={logoSrc} alt="" width={40} height={40} className={cn("h-8 w-8 rounded-lg object-contain", className)} />
      <span className="hidden sm:inline">{companyName}</span>
    </span>
  );
}
