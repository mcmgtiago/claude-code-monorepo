export const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
)

export const Section = ({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) => (
  <section id={id} className={`relative z-10 py-12 md:py-20 lg:py-32 ${className}`}>
    {children}
  </section>
)
