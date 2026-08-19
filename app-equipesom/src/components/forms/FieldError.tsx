import { CircleAlert } from 'lucide-react'

interface FieldErrorProps {
  id: string
  message?: string
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null

  return (
    <span className="field-error" id={id} role="alert">
      <CircleAlert size={14} aria-hidden="true" /> {message}
    </span>
  )
}
