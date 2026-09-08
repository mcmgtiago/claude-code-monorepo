import { ArrowRight } from 'lucide-react'

type Props = {
  label: string
  variant?: 'dark' | 'orange'
  size?: 'sm' | 'md'
}

const TextRollButton = ({ label, variant = 'dark', size = 'md' }: Props) => {
  const baseBg = variant === 'dark' ? 'bg-gray-900' : 'bg-[#F26522] hover:bg-[#e05a1a]'
  const circleSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7 sm:w-8 sm:h-8'
  const padding = size === 'sm' ? 'pl-5 pr-2 py-2' : 'pl-5 sm:pl-6 pr-2 py-2'
  const arrowColor = variant === 'dark' ? 'text-gray-900' : 'text-[#F26522]'
  const arrowSize = size === 'sm' ? 12 : 14

  return (
    <button
      className={`group relative inline-flex items-center gap-2 ${padding} ${baseBg} text-white text-[13px] sm:text-[14px] font-medium rounded-full overflow-hidden transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
    >
      <span className="relative overflow-hidden h-[20px] inline-block">
        <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
          <span className="leading-[20px]">{label}</span>
          <span className="leading-[20px]" aria-hidden="true">
            {label}
          </span>
        </span>
      </span>
      <span
        className={`inline-flex items-center justify-center ${circleSize} bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45`}
      >
        <ArrowRight size={arrowSize} className={arrowColor} strokeWidth={2} />
      </span>
    </button>
  )
}

export default TextRollButton