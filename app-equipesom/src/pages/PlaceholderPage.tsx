import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  eyebrow: string
  title: string
  description: string
}

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <div className="page standard-page">
      <section className="placeholder-card">
        <div className="placeholder-card__icon"><Compass size={28} /></div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="button button--secondary" to="/">
          <ArrowLeft size={18} /> Voltar ao início
        </Link>
      </section>
    </div>
  )
}
