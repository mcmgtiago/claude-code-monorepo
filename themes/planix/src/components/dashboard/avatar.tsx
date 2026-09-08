import { cn } from "@/lib/utils";
import type { AvatarTone } from "@/data/dashboard";

const toneClasses: Record<AvatarTone, string> = {
  sand: "bg-[#b89e7a] text-[#2a2018]",
  rose: "bg-[#c88475] text-[#241713]",
  olive: "bg-[#8fa07a] text-[#18210f]",
  slate: "bg-[#8d839d] text-[#17151f]",
  peach: "bg-[#d89a7d] text-[#2d170f]",
};

type AvatarSize = "sm" | "md" | "lg";
type AvatarShape = "full" | "soft";

const sizeClasses: Record<
  AvatarSize,
  {
    wrapper: string;
    text: string;
    dot: string;
  }
> = {
  sm: {
    wrapper: "h-9 w-9",
    text: "text-[0.56rem] tracking-[0.1em]",
    dot: "h-3 w-3 border-2",
  },
  md: {
    wrapper: "h-11 w-11",
    text: "text-[0.68rem] tracking-[0.12em]",
    dot: "h-3.5 w-3.5 border-2",
  },
  lg: {
    wrapper: "h-14 w-14",
    text: "text-[0.78rem] tracking-[0.12em]",
    dot: "h-4 w-4 border-2",
  },
};

type AvatarProps = {
  initials: string;
  tone: AvatarTone;
  imageSrc?: string;
  className?: string;
  status?: "online" | "busy" | "neutral";
  size?: AvatarSize;
  shape?: AvatarShape;
};

export function Avatar({
  initials,
  tone,
  imageSrc,
  className,
  status,
  size = "sm",
  shape = "full",
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0",
        shape === "full" ? "rounded-full" : "rounded-[var(--radius-lg)]",
        sizeClasses[size].wrapper,
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center overflow-hidden font-bold uppercase",
          shape === "full" ? "rounded-full" : "rounded-[var(--radius-lg)]",
          sizeClasses[size].text,
          imageSrc ? "bg-[#0f1012]" : toneClasses[tone],
        )}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          initials
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[var(--panel)]",
            sizeClasses[size].dot,
            status === "online" && "bg-[var(--green)]",
            status === "busy" && "bg-[var(--red)]",
            status === "neutral" && "bg-[var(--panel-soft)]",
          )}
        />
      )}
    </div>
  );
}

type AvatarClusterProps = {
  members: { initials: string; tone: AvatarTone; imageSrc?: string }[];
  size?: AvatarSize;
};

export function AvatarCluster({ members, size = "sm" }: AvatarClusterProps) {
  return (
    <div className="flex items-center">
      {members.map((member, index) => (
        <Avatar
          key={`${member.initials}-${index}`}
          initials={member.initials}
          tone={member.tone}
          imageSrc={member.imageSrc}
          size={size}
          className={cn("-ml-2 first:ml-0 rounded-full", index > 0 && "ring-2 ring-[var(--panel)]")}
        />
      ))}
    </div>
  );
}
