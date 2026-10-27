type TimerRingProps = {
  fraction: number // 0 to 1: how much of the ring is still filled
  clock: string
  label: string
  tone: 'idle' | 'focus' | 'break' | 'paused'
}

function TimerRing({ fraction, clock, label, tone }: TimerRingProps) {
  const filled = Math.max(0, Math.min(1, fraction))

  return (
    <div
      className={`timer-ring timer-${tone}`}
      role="img"
      aria-label={`${label}, ${clock}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle
          className="timer-track"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="7"
        />
        <circle
          className="timer-bar"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - filled * 100}
          transform="rotate(-90 50 50)"
          style={{ opacity: filled === 0 ? 0 : 1 }}
        />
      </svg>
      <div className="timer-center" aria-hidden="true">
        <span className="timer-clock">{clock}</span>
        <span className="timer-label">{label}</span>
      </div>
    </div>
  )
}

export default TimerRing