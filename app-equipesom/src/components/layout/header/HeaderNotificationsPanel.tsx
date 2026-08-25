import { BellOff } from 'lucide-react'

export function HeaderNotificationsPanel() {
  return (
    <>
      <div className="header-panel__heading">
        <span className="eyebrow">Atualizações</span>
        <h2 id="header-notifications-title">Notificações</h2>
      </div>
      <div className="header-panel__empty">
        <BellOff aria-hidden="true" size={23} />
        <strong>Nenhuma notificação no momento.</strong>
        <p>Avisos de propostas, emissões e eventos aparecerão aqui quando esse recurso estiver conectado.</p>
      </div>
    </>
  )
}
