type ProgressRingProps = {
  value: number | null // 0 to 100, or null when there is nothing to show yet
  label: string
  size?: number
}

function ProgressRing({ value, label, size = 64 }: ProgressRingProps) {
  const stroke = 7
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const percent = value === null ? 0 : Math.max(0, Math.min(100, value))
  const tone =
    value === null ? 'none' : value >= 70 ? 'good' : value >= 50 ? 'ok' : 'low'

  return (
    <div
      className={`ring ring-${tone}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="ring-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-text">{value === null ? '—' : `${Math.round(percent)}%`}</span>
    </div>
  )
}

export default ProgressRing