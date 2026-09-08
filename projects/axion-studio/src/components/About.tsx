import { ArrowRight } from 'lucide-react'

const SMALL_IMG =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85'
const LARGE_IMG =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85'

const Badge = ({ num, label, border = 'border-gray-200' }: { num: string; label: string; border?: string }) => (
  <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold inline-flex items-center justify-center">
      {num}
    </span>
    <span
      className={`text-[12px] sm:text-[13px] font-medium border ${border} rounded-full px-3 sm:px-4 py-1 sm:py-1.5`}
    >
      {label}
    </span>
  </div>
)

const OrangeButton = ({ label }: { label: string }) => (
  <button className="group inline-flex items-center gap-2 pl-5 sm:pl-6 pr-2 py-2 bg-[#F26522] hover:bg-[#e05a1a] text-white text-[13px] sm:text-[14px] font-medium rounded-full transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
    <span className="relative overflow-hidden h-[20px] inline-block">
      <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
        <span className="leading-[20px]">{label}</span>
        <span className="leading-[20px]" aria-hidden="true">
          {label}
        </span>
      </span>
    </span>
    <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
      <ArrowRight size={14} className="text-[#F26522]" strokeWidth={2} />
    </span>
  </button>
)

const About = () => {
  return (
    <section id="studio" className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <Badge num="1" label="Introducing Axion" />

        <h2 className="px-5 sm:px-8 lg:px-12 text-gray-900 font-medium leading-[1.12] tracking-[-0.02em] text-[clamp(1.5rem,4vw,3.2rem)] mb-12 sm:mb-16 lg:mb-28">
          Strategy-led creatives, delivering
          <br />
          results in digital and beyond.
        </h2>

        {/* MOBILE / TABLET */}
        <div className="lg:hidden px-5 sm:px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <p className="text-[15px] sm:text-[17px] leading-[1.6] font-medium text-gray-900 max-w-xl">
              Through research, creative thinking and iteration we help growing
              brands realize their digital full potential.
            </p>
            <OrangeButton label="About our studio" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <img
              src={SMALL_IMG}
              alt="Studio detail"
              className="w-full sm:w-[45%] aspect-[438/346] rounded-xl sm:rounded-2xl object-cover"
            />
            <img
              src={LARGE_IMG}
              alt="Studio workspace"
              className="w-full sm:w-[55%] aspect-[900/600] rounded-xl sm:rounded-2xl object-cover"
            />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:grid grid-cols-[26%_1fr_48%] items-end gap-6 xl:gap-8 px-5 sm:px-8 lg:px-12">
          <img
            src={SMALL_IMG}
            alt="Studio detail"
            className="self-end aspect-[438/346] w-full rounded-2xl object-cover"
          />
          <div className="self-start flex flex-col items-end gap-8">
            <p className="text-[16px] xl:text-[18px] leading-[1.65] text-gray-900 whitespace-nowrap text-right">
              Through research, creative thinking <br />
              and iteration we help growing brands <br />
              realize their digital full potential.
            </p>
            <OrangeButton label="About our studio" />
          </div>
          <img
            src={LARGE_IMG}
            alt="Studio workspace"
            className="self-end aspect-[3/2] w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default About