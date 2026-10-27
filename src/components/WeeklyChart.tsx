import { todayIso } from '../lib/dates'
import { formatDuration } from '../lib/study'
import type { DayTotal } from '../lib/study'

type WeeklyChartProps = {
  days: DayTotal[]
}

function WeeklyChart({ days }: WeeklyChartProps) {
  const today = todayIso()
  const max = Math.max(...days.map((d) => d.seconds), 1)

  return (
    <ul className="week-chart">
      {days.map((d) => {
        const height =
          d.seconds === 0 ? 0 : Math.max(6, Math.round((d.seconds / max) * 100))
        const isToday = todayIso(d.date) === today

        return (
          <li key={d.label} className={isToday ? 'week-col is-today' : 'week-col'}>
            <span className="sr-only">
              {d.label}: {d.seconds === 0 ? 'no study time' : formatDuration(d.seconds)}
            </span>
            <span className="week-value" aria-hidden="true">
              {d.seconds === 0 ? '' : formatDuration(d.seconds)}
            </span>
            <div className="week-track" aria-hidden="true">
              <div className="week-bar" style={{ height: `${height}%` }} />
            </div>
            <span className="week-day" aria-hidden="true">
              {d.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default WeeklyChart