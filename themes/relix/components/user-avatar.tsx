"use client";

import { useState } from "react";
import { assigneeInitials } from "@/lib/team";

type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
  title?: string;
};

export function UserAvatar({
  name,
  imageUrl,
  className = "h-7 w-7",
  fallbackClassName = "bg-[#eef4ff] text-[#386df4]",
  alt,
  title
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const baseClassName = `shrink-0 overflow-hidden rounded-full ${className}`;
  const label = name || "User";

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={alt || label}
        title={title || label}
        className={`${baseClassName} object-cover`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span title={title || label} className={`${baseClassName} flex items-center justify-center font-semibold ${fallbackClassName}`}>
      {assigneeInitials(label) || "U"}
    </span>
  );
}
