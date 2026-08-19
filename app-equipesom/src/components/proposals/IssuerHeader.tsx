import { Building2, Mail, MapPin, Phone } from 'lucide-react'
import type { ProposalIssuerSnapshot } from '../../types/domain'
import { formatIssuerAddress } from '../../utils/issuerPresentation'

interface IssuerHeaderProps {
  issuer?: ProposalIssuerSnapshot
  compact?: boolean
}

export function IssuerHeader({ issuer, compact = false }: IssuerHeaderProps) {
  if (!issuer) {
    return (
      <section className="issuer-header issuer-header--unavailable" aria-label="Emissor">
        <span className="eyebrow">Emissor</span>
        <strong>Informações do emissor não disponíveis nesta versão.</strong>
      </section>
    )
  }

  return (
    <section className={compact ? 'issuer-header issuer-header--compact' : 'issuer-header'} aria-label="Emissor">
      <div className="issuer-header__brand">
        <span className="issuer-header__icon"><Building2 size={compact ? 18 : 21} /></span>
        <div>
          <span className="eyebrow">Emissor</span>
          <h2>{issuer.brandName}</h2>
        </div>
      </div>
      <div className="issuer-header__details">
        <strong>{issuer.legalName}</strong>
        <span>{issuer.document.type}: {issuer.document.number}</span>
        <span><MapPin size={14} /> {formatIssuerAddress(issuer)}</span>
        {issuer.phone?.trim() && <span><Phone size={14} /> {issuer.phone}</span>}
        {issuer.email?.trim() && <span><Mail size={14} /> {issuer.email}</span>}
      </div>
    </section>
  )
}
