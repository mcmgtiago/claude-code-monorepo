import { useVideoVisibility } from "@/hooks/useVideoVisibility";

interface VideoMediaProps {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  decorative?: boolean;
}

export function VideoMedia({
  src,
  poster,
  alt,
  className = "",
  decorative = false,
}: VideoMediaProps) {
  const { videoRef, reducedMotion } = useVideoVisibility();

  if (reducedMotion && decorative) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      data-decorative-video={decorative ? "true" : "false"}
      style={{ backgroundColor: "#f5f1e9" }}
    />
  );
}
