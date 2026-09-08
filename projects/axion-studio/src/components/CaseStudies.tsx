import { ArrowRight } from 'lucide-react'

const NARRATIV_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4'
const LUMINAR_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4'

const LinkIcon = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Two-link "chain" arc icon, similar to lucide "link" */}
    <path d="M9 17H7a5 5 0 0 1 0-10h2" />
    <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

type CardProps = {
  video: string
  bg: string
  aspectClass: string
  description: string
  title: string
  variant: 'light' | 'dark'
}

const ProjectCard = ({ video, bg, aspectClass, description, title, variant }: CardProps) => {
  const isDark = variant === 'dark'
  return (
    <div>
      <div className={`relative group cursor-pointer ${aspectClass} rounded-2xl overflow-hidden ${bg}`}>
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4">
          <a
            href="#"
            className={`
              inline-flex items-center justify-center gap-2 h-9 w-9
              rounded-full overflow-hidden
              transition-all duration-300 ease-in-out
              ${isDark ? 'bg-gray-900' : 'bg-white'}
              ${isDark ? 'group-hover:w-[168px]' : 'group-hover:w-[148px]'}
            `}
          >
            <span
              className={`
                text-[13px] font-medium whitespace-nowrap
                transition-opacity duration-300 ease-in-out delay-100
                opacity-0 group-hover:opacity-100
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}
            >
              {isDark ? 'View case study' : 'Learn more'}
            </span>
            {isDark ? (
              <ArrowRight
                size={14}
                className={`text-white transition-transform duration-300 ease-in-out ${
                  isDark ? '-rotate-45 group-hover:rotate-0' : ''
                }`}
                strokeWidth={2}
              />
            ) : (
              <span
                className={`text-gray-900 transition-transform duration-300 ease-in-out -rotate-45 group-hover:rotate-0`}
              >
                <LinkIcon />
              </span>
            )}
          </a>
        </div>
      </div>
      <p className="mt-4 text-[13px] sm:text-[14px] text-gray-600 leading-relaxed">
        {description}
      </p>
      <h3 className="mt-1 text-[14px] sm:text-[15px] font-semibold text-gray-900">
        {title}
      </h3>
    </div>
  )
}

const CaseStudies = () => {
  return (
    <section id="projects" className="bg-[#F5F5F5] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28">
      <div className="max-w-[1440px] mx-auto">
        <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold inline-flex items-center justify-center">
            2
          </span>
          <span className="text-[12px] sm:text-[13px] font-medium border border-gray-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
            Featured client work
          </span>
        </div>

        <h2 className="px-5 sm:px-8 lg:px-12 text-gray-900 font-medium leading-[1.08] tracking-[-0.03em] text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)] mb-10 sm:mb-14 lg:mb-16">
          Our projects
        </h2>

        <div className="px-5 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7">
          <ProjectCard
            video={NARRATIV_VIDEO}
            bg="bg-[#1a1d2e]"
            aspectClass="aspect-[329/246]"
            description="Winner of Site of the Month 2025 - an interactive 3D showcase driving record engagement"
            title="Narrativ"
            variant="light"
          />
          <ProjectCard
            video={LUMINAR_VIDEO}
            bg="bg-[#6b6b6b]"
            aspectClass="aspect-square"
            description="Transforming a dated platform into a conversion-focused brand experience"
            title="Luminar"
            variant="dark"
          />
        </div>
      </div>
    </section>
  )
}

export default CaseStudies