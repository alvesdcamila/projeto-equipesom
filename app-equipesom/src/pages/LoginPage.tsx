import { FormEvent, useState } from 'react'
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { platformBrand } from '../config/platform'
import { runtimeEnvironment } from '../config/runtimeEnvironment'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showPrototypeNotice, setShowPrototypeNotice] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowPrototypeNotice(true)
  }

  return (
    <main className="login-page">
      <section className="login-page__story" aria-label="Separação entre plataforma e empresa cliente">
        <div className="login-page__story-inner">
          <img
            className="login-page__story-mark"
            src={platformBrand.mark}
            alt=""
            aria-hidden="true"
          />

          <div className="login-page__story-copy">
            <span className="login-page__story-kicker">Uma plataforma. Cada empresa no seu espaço.</span>
            <h2>O acesso começa na Console Group e termina no ambiente certo.</h2>
            <p>
              A identidade é individual. Depois da entrada, os vínculos autorizados definem quais
              empresas, dados e permissões podem ser carregados.
            </p>
          </div>

          <div className="login-page__context-flow" aria-label="Exemplo de contexto de acesso">
            <div className="login-page__context-item">
              <span className="login-page__context-icon"><UserRound size={19} /></span>
              <span><small>Identidade</small><strong>Usuário individual</strong></span>
            </div>
            <span className="login-page__context-line" aria-hidden="true" />
            <div className="login-page__context-item">
              <span className="login-page__context-icon"><Building2 size={19} /></span>
              <span><small>Empresa cliente</small><strong>EQUIPESOM</strong></span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-page__access">
        <div className="login-card">
          <header className="login-card__header">
            <img className="login-card__logo" src={platformBrand.logo} alt={platformBrand.name} />
            <div className="login-card__environment">
              <span className={`environment-dot environment-dot--${runtimeEnvironment.stage}`} />
              {runtimeEnvironment.label}
            </div>
          </header>

          <div className="login-card__intro">
            <span className="login-card__eyebrow">{platformBrand.portalName}</span>
            <h1>Acesse sua conta</h1>
            <p>Use seu e-mail individual. A empresa será carregada a partir do seu vínculo autorizado.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-form__field">
              <span>E-mail</span>
              <div className="login-form__control">
                <UserRound size={19} aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com.br"
                  required
                />
              </div>
            </label>

            <label className="login-form__field">
              <span>Senha</span>
              <div className="login-form__control">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  className="login-form__password-toggle"
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            <button
              className="login-form__recovery"
              type="button"
              onClick={() => setShowPrototypeNotice(true)}
            >
              Esqueci minha senha
            </button>

            <button className="login-form__submit" type="submit">
              Entrar
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </form>

          <div className="login-card__signup">
            <span>Ainda não tem acesso?</span>
            <Link to="/criar-conta">Criar conta</Link>
          </div>

          {showPrototypeNotice ? (
            <div className="login-card__notice" role="status">
              <ShieldCheck size={20} aria-hidden="true" />
              <p>
                <strong>Interface pronta para validação visual.</strong>
                O acesso real será ativado somente após a escolha e a configuração segura do
                provedor de autenticação.
              </p>
            </div>
          ) : null}

          {runtimeEnvironment.isLocal ? (
            <div className="login-card__local-access">
              <p>O protótipo atual continua separado e usa somente dados demonstrativos deste navegador.</p>
              <Link to="/">Abrir protótipo local</Link>
            </div>
          ) : null}

          <footer className="login-card__footer">
            <ShieldCheck size={16} aria-hidden="true" />
            {platformBrand.hostname} · Nunca compartilhe sua senha.
          </footer>
        </div>
      </section>
    </main>
  )
}
