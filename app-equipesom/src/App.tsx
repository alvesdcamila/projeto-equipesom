import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { NewProposalPage } from './pages/NewProposalPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProposalsPage } from './pages/ProposalsPage'
import { ProposalDetailPage } from './pages/ProposalDetailPage'
import { EditProposalPage } from './pages/EditProposalPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="propostas" element={<ProposalsPage />} />
        <Route path="propostas/nova" element={<NewProposalPage />} />
        <Route path="propostas/:proposalId/editar" element={<EditProposalPage />} />
        <Route path="propostas/:proposalId" element={<ProposalDetailPage />} />
        <Route
          path="agenda"
          element={
            <PlaceholderPage
              eyebrow="Agenda"
              title="Eventos em um só lugar"
              description="A agenda completa será validada em uma etapa futura. Por enquanto, os eventos próximos aparecem no painel inicial."
            />
          }
        />
        <Route
          path="mais"
          element={
            <PlaceholderPage
              eyebrow="Configurações"
              title="Uma base pronta para crescer"
              description="Cadastros da empresa, modelos, preços, condições e permissões terão áreas separadas nas próximas etapas."
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
