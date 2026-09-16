import { useEffect, useRef, useState, type FocusEvent, type InputHTMLAttributes } from 'react'
import { normalizeEditableDecimal, parseEditableDecimal } from '../../utils/decimalInputValue'

interface DecimalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number | null
  onValueChange: (value: number | null) => void
  decimalPlaces?: number
  emptyValueOnBlur?: number
}

function formatEditableValue(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '' : String(value)
}

export function DecimalInput({
  value,
  onValueChange,
  decimalPlaces = 2,
  emptyValueOnBlur = 0,
  onFocus,
  onBlur,
  ...inputProps
}: DecimalInputProps) {
  const [rawValue, setRawValue] = useState(() => formatEditableValue(value))
  const focused = useRef(false)

  useEffect(() => {
    if (!focused.current) setRawValue(formatEditableValue(value))
  }, [value])

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    focused.current = true
    onFocus?.(event)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    focused.current = false
    if (parseEditableDecimal(rawValue) === null) {
      setRawValue(formatEditableValue(emptyValueOnBlur))
      onValueChange(emptyValueOnBlur)
    }
    onBlur?.(event)
  }

  return (
    <input
      {...inputProps}
      type="text"
      inputMode="decimal"
      value={rawValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={(event) => {
        const normalized = normalizeEditableDecimal(event.target.value, decimalPlaces)
        setRawValue(normalized)
        onValueChange(parseEditableDecimal(normalized))
      }}
    />
  )
}
