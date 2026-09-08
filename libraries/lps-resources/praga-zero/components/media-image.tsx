import Image from "next/image";
import type { TenantMediaAsset } from "@/config/tenantTypes";
import { cn } from "@/lib/utils";

export function MediaImage({
  asset,
  priority = false,
  sizes,
  className,
}: {
  asset: TenantMediaAsset;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

export function MediaCredit({ asset, className }: { asset: TenantMediaAsset; className?: string }) {
  if (!asset.photographer) return null;
  return (
    <span className={cn("text-[10px] text-muted", className)}>
      Foto: {asset.photographer}
    </span>
  );
}
