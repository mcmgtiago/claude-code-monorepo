"use client";

import { useState } from "react";
import type { SVGProps } from "react";

type AppLogoProps = SVGProps<SVGSVGElement> & { src?: string };

export function AppLogo({ className, src, ...props }: AppLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (src && !imageFailed) {
    return <img src={src} alt="App logo" className={className} style={{ objectFit: "contain" }} onError={() => setImageFailed(true)} />;
  }

  return (
    <svg width="775" height="775" viewBox="0 0 775 775" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true" {...props}>
      <g filter="url(#logo-filter0)">
        <g clipPath="url(#logo-clip0)">
          <rect width="775" height="775" rx="193.75" fill="url(#logo-paint0)" />
          <g filter="url(#logo-filter1)">
            <path d="M775.003 423.828L387.502 762.891L12.1094 508.596L290.625 0.000103381L581.251 7.79735e-05C688.256 6.86188e-05 775.001 86.7441 775.001 193.749L775.003 423.828Z" fill="url(#logo-paint1)" fillOpacity="0.5" />
          </g>
          <path d="M145.312 219.393H262.459L316.231 121.094H581.25L459.286 356.158L388.326 219.393H262.459L423.775 531.388H523.637L473.706 629.688H354.639L145.312 219.393Z" fill="url(#logo-paint2)" />
          <path d="M262.459 219.393H145.312L354.639 629.688H473.706L523.637 531.388H423.775L262.459 219.393ZM262.459 219.393L316.231 121.094H581.25L459.286 356.158L388.326 219.393H262.459Z" stroke="url(#logo-paint3)" strokeWidth="32.506" />
        </g>
        <rect x="12.1094" y="12.1094" width="750.781" height="750.781" rx="181.641" stroke="white" strokeOpacity="0.15" strokeWidth="24.2188" />
      </g>
      <defs>
        <filter id="logo-filter0" x="0" y="0" width="775" height="823.438" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="48.4375" />
          <feGaussianBlur stdDeviation="48.4375" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
        <filter id="logo-filter1" x="-87.8906" y="-100" width="962.893" height="962.891" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient id="logo-paint0" x1="387.5" y1="0" x2="387.5" y2="775" gradientUnits="userSpaceOnUse">
          <stop stopColor="#266DF0" />
          <stop offset="1" stopColor="#1A56C7" />
        </linearGradient>
        <radialGradient id="logo-paint1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(157.421 690.234) rotate(-51.7456) scale(801.875 1245.55)">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id="logo-paint2" x1="363.281" y1="121.094" x2="363.281" y2="629.688" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="logo-paint3" x1="363.281" y1="121.094" x2="363.281" y2="629.688" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0.5" />
        </linearGradient>
        <clipPath id="logo-clip0">
          <rect width="775" height="775" rx="193.75" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
