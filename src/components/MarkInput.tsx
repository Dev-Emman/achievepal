import { useState } from 'react'

type MarkInputProps = {
  value: number | null
  label: string
  onSave: (mark: number | null) => Promise<void>
}

// A number box that saves when you click away or press Enter
function MarkInput({ value, label, onSave }: MarkInputProps) {
  const [text, setText] = useState(value === null ? '' : String(value))
  const [error, setError] = useState('')

  async function commit() {
    const trimmed = text.trim()
    const next = trimmed === '' ? null : Number(trimmed)

    if (next !== null && (!Number.isFinite(next) || next < 0 || next > 100)) {
      setError('Enter 0 to 100')
      return
    }
    if (next === value) {
      setError('')
      return
    }

    try {
      await onSave(next)
      setError('')
    } catch (err) {
      setText(value === null ? '' : String(value))
      setError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <div className="mark-field">
      <input
        className="mark-input"
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step="any"
        value={text}
        placeholder="Mark"
        aria-label={label}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  )
}

export default MarkInput