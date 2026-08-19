import { FieldError } from '../../../components/forms/FieldError'
import type { ProposalStepProps } from '../types'

const eventTypes = [
  'Campeonato de surf',
  'Evento público',
  'Evento privado',
  'Evento corporativo',
  'Evento com banda',
  'Outro',
]

export function EventStep({ draft, onChange, errors }: ProposalStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <span className="eyebrow">Onde e quando?</span>
        <h2>Informações do evento</h2>
        <p>O tipo do evento serve apenas para sugerir perguntas e itens. Ele não limita a proposta.</p>
      </div>

      <div className="form-grid form-grid--two">
        <label className={`form-field form-field--full ${errors.eventName ? 'is-invalid' : ''}`} htmlFor="eventName">
          <span>Nome do evento <em>obrigatório</em></span>
          <input
            id="eventName"
            type="text"
            value={draft.eventName}
            onChange={(event) => onChange('eventName', event.target.value)}
            placeholder="Ex.: Circuito de Surf da Ilha"
            aria-invalid={Boolean(errors.eventName)}
            aria-describedby={errors.eventName ? 'eventName-error' : undefined}
          />
          <FieldError id="eventName-error" message={errors.eventName} />
        </label>
        <label className="form-field">
          <span>Tipo de evento</span>
          <select value={draft.eventType} onChange={(event) => onChange('eventType', event.target.value)}>
            {eventTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Público estimado</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.estimatedAudience}
            onChange={(event) => onChange('estimatedAudience', event.target.value)}
            placeholder="Ex.: 300"
          />
        </label>
        <label className={`form-field ${errors.startDate ? 'is-invalid' : ''}`} htmlFor="startDate">
          <span>Data inicial <em>obrigatório</em></span>
          <input id="startDate" type="date" value={draft.startDate} onChange={(event) => onChange('startDate', event.target.value)} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? 'startDate-error' : undefined} />
          <FieldError id="startDate-error" message={errors.startDate} />
        </label>
        <label className={`form-field ${errors.endDate ? 'is-invalid' : ''}`} htmlFor="endDate">
          <span>Data final <em>obrigatório</em></span>
          <input id="endDate" type="date" value={draft.endDate} onChange={(event) => onChange('endDate', event.target.value)} aria-invalid={Boolean(errors.endDate)} aria-describedby={errors.endDate ? 'endDate-error' : undefined} />
          <FieldError id="endDate-error" message={errors.endDate} />
        </label>
        <label className={`form-field ${errors.location ? 'is-invalid' : ''}`} htmlFor="location">
          <span>Local <em>obrigatório</em></span>
          <input
            id="location"
            type="text"
            value={draft.location}
            onChange={(event) => onChange('location', event.target.value)}
            placeholder="Praia, clube ou endereço"
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? 'location-error' : undefined}
          />
          <FieldError id="location-error" message={errors.location} />
        </label>
        <label className={`form-field ${errors.city ? 'is-invalid' : ''}`} htmlFor="city">
          <span>Cidade <em>obrigatório</em></span>
          <input id="city" type="text" value={draft.city} onChange={(event) => onChange('city', event.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'city-error' : undefined} />
          <FieldError id="city-error" message={errors.city} />
        </label>
      </div>
    </div>
  )
}
