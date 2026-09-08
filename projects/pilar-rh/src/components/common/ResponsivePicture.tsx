import { ImgHTMLAttributes } from "react";

interface ResponsivePictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  srcWebp?: string;
  srcAvif?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

export function ResponsivePicture({
  src,
  alt,
  srcWebp,
  srcAvif,
  sizes,
  width,
  height,
  className = "",
  ...props
}: ResponsivePictureProps) {
  return (
    <picture>
      {srcAvif && (
        <source srcSet={srcAvif} type="image/avif" sizes={sizes} />
      )}
      {srcWebp && (
        <source srcSet={srcWebp} type="image/webp" sizes={sizes} />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        loading="lazy"
        {...props}
      />
    </picture>
  );
}
