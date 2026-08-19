import type { ReactNode } from 'react'

interface DetailSectionProps {
  title: string
  eyebrow: string
  icon: ReactNode
  children: ReactNode
}

export function DetailSection({ title, eyebrow, icon, children }: DetailSectionProps) {
  return (
    <section className="detail-section">
      <div className="detail-section__heading">
        <span className="detail-section__icon">{icon}</span>
        <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      </div>
      {children}
    </section>
  )
}
