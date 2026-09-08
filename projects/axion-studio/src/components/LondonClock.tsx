import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

const formatLondonTime = (date: Date) => {
  return date.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

type Props = { showIcon?: boolean; prefix?: string }

const LondonClock = ({ showIcon = true, prefix = 'in London' }: Props) => {
  const [time, setTime] = useState(() => formatLondonTime(new Date()))

  useEffect(() => {
    const tick = () => setTime(formatLondonTime(new Date()))
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-600">
      {showIcon && <Clock size={14} strokeWidth={1.75} />}
      <span>
        {time} {prefix}
      </span>
    </span>
  )
}

export default LondonClock