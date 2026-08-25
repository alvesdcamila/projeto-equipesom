import { forwardRef, type ReactNode } from 'react'

interface HeaderPanelProps {
  children: ReactNode
  id: string
  labelledBy: string
}

export const HeaderPanel = forwardRef<HTMLDivElement, HeaderPanelProps>(function HeaderPanel(
  { children, id, labelledBy },
  ref,
) {
  return (
    <section
      aria-labelledby={labelledBy}
      className="header-panel"
      id={id}
      ref={ref}
      role="dialog"
      tabIndex={-1}
    >
      {children}
    </section>
  )
})
