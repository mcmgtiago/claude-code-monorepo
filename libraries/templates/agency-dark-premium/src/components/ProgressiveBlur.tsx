/**
 * Progressive blur — a div that applies increasing blur from top to bottom (or configurable direction).
 * Creates a premium "depth of field" effect on section transitions.
 */
export function ProgressiveBlur({ direction = 'bottom', className = '' }: { direction?: 'top' | 'bottom'; className?: string }) {
  const isBottom = direction === 'bottom'
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-10 ${isBottom ? 'bottom-0' : 'top-0'} h-32 sm:h-40 ${className}`}>
      <div
        className="h-full w-full"
        style={{
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
          maskImage: isBottom
            ? 'linear-gradient(to bottom, transparent 0%, black 100%)'
            : 'linear-gradient(to top, transparent 0%, black 100%)',
          WebkitMaskImage: isBottom
            ? 'linear-gradient(to bottom, transparent 0%, black 100%)'
            : 'linear-gradient(to top, transparent 0%, black 100%)',
        }}
      />
      {/* Layered blurs for progressive effect */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          maskImage: isBottom
            ? 'linear-gradient(to bottom, transparent 40%, black 100%)'
            : 'linear-gradient(to top, transparent 40%, black 100%)',
          WebkitMaskImage: isBottom
            ? 'linear-gradient(to bottom, transparent 40%, black 100%)'
            : 'linear-gradient(to top, transparent 40%, black 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          maskImage: isBottom
            ? 'linear-gradient(to bottom, transparent 70%, black 100%)'
            : 'linear-gradient(to top, transparent 70%, black 100%)',
          WebkitMaskImage: isBottom
            ? 'linear-gradient(to bottom, transparent 70%, black 100%)'
            : 'linear-gradient(to top, transparent 70%, black 100%)',
        }}
      />
    </div>
  )
}
