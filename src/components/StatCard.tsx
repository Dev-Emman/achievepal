import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone: 'lavender' | 'mint' | 'peach' | 'sky'
}

function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <div className={`stat-tile tone-${tone}`}>
      <span className="stat-icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div>
        <p className="tile-label">{label}</p>
        <p className="tile-value">{value}</p>
        {hint && <p className="tile-hint">{hint}</p>}
      </div>
    </div>
  )
}

export default StatCard