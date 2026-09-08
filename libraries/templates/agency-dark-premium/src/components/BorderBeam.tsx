/**
 * BorderBeam - animated gradient beam that travels around a container's border.
 * Wrap any element with position:relative and place this inside.
 */
export function BorderBeam({ duration = 6, size = 200, color = 'var(--accent)', className = '' }: {
  duration?: number
  size?: number
  color?: string
  className?: string
}) {
  return (
    <>
      <style>{`
        @keyframes beam-travel {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
      `}</style>
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
        style={{
          overflow: 'hidden',
          maskImage: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      >
        <div
          className="absolute"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            borderRadius: '50%',
            offsetPath: `rect(0% 100% 100% 0% round ${size / 4}px)`,
            animation: `beam-travel ${duration}s linear infinite`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </>
  )
}
