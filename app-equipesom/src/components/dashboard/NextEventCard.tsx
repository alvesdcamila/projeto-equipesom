import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NextEventCard() {
  return (
    <article className="next-event-card">
      <div className="next-event-card__date" aria-label="23 de agosto">
        <span>AGO</span>
        <strong>23</strong>
      </div>
      <div className="next-event-card__content">
        <span className="eyebrow eyebrow--light">Próximo evento</span>
        <h2>Festival na Praia</h2>
        <p>
          <MapPin size={15} /> Praia da Joaquina · Florianópolis
        </p>
        <p>
          <CalendarDays size={15} /> Domingo · montagem às 7h
        </p>
      </div>
      <Link className="round-link" to="/agenda" aria-label="Ver detalhes do evento">
        <ArrowRight size={19} />
      </Link>
    </article>
  )
}
