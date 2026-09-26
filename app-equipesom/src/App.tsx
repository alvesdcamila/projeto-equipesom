import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { NewProposalPage } from './pages/NewProposalPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProposalsPage } from './pages/ProposalsPage'
import { ProposalDetailPage } from './pages/ProposalDetailPage'
import { EditProposalPage } from './pages/EditProposalPage'
import { ProposalPreviewPage } from './pages/ProposalPreviewPage'
import { LoginPage } from './pages/LoginPage'
import { PrototypeAccessBoundary } from './components/auth/PrototypeAccessBoundary'
import { CreateAccountPage } from './pages/CreateAccountPage'
import { B3LocalSessionProvider } from './components/auth/B3LocalSession'
import { B3LocalAccessBoundary } from './components/auth/B3LocalAccessBoundary'
import { B3LocalProposalsPage } from './pages/B3LocalProposalsPage'

export function App() {
  return (
    <B3LocalSessionProvider><Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="criar-conta" element={<CreateAccountPage />} />
      <Route element={<B3LocalAccessBoundary />}>
        <Route path="acesso-local/propostas" element={<B3LocalProposalsPage />} />
      </Route>
      <Route element={<PrototypeAccessBoundary />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="propostas" element={<ProposalsPage />} />
          <Route path="propostas/nova" element={<NewProposalPage />} />
          <Route path="propostas/:proposalId/editar" element={<EditProposalPage />} />
          <Route path="propostas/:proposalId/previa" element={<ProposalPreviewPage />} />
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
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes></B3LocalSessionProvider>
  )
}
