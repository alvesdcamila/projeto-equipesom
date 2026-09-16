import { FormEvent, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { platformBrand } from '../config/platform'
import { runtimeEnvironment } from '../config/runtimeEnvironment'

export function CreateAccountPage() {
  const [showPrototypeNotice, setShowPrototypeNotice] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowPrototypeNotice(true)
  }

  return (
    <main className="login-page login-page--signup">
      <section className="login-page__story" aria-label="Formas de entrada na plataforma">
        <div className="login-page__story-inner">
          <img
            className="login-page__story-mark"
            src={platformBrand.mark}
            alt=""
            aria-hidden="true"
          />

          <div className="login-page__story-copy">
            <span className="login-page__story-kicker">Entrada controlada e rastreável</span>
            <h2>Dois caminhos para chegar ao ambiente certo.</h2>
            <p>
              Criar uma identidade não libera automaticamente dados de uma empresa. O acesso nasce
              de uma contratação ativa ou de um convite autorizado.
            </p>
          </div>

          <div className="signup-flows" aria-label="Caminhos de criação de acesso">
            <article className="signup-flow-card">
              <span><Mail size={19} /></span>
              <div>
                <strong>Convite por e-mail</strong>
                <p>A administração libera o endereço e envia um link individual para criação do acesso.</p>
              </div>
            </article>
            <article className="signup-flow-card">
              <span><BadgeCheck size={19} /></span>
              <div>
                <strong>Cadastro direto</strong>
                <p>A pessoa cria a conta e o uso da plataforma é ativado conforme a contratação.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="login-page__access">
        <div className="login-card">
          <header className="login-card__header login-card__header--signup">
            <img className="login-card__logo" src={platformBrand.logo} alt={platformBrand.name} />
            <div className="login-card__environment">
              <span className={`environment-dot environment-dot--${runtimeEnvironment.stage}`} />
              {runtimeEnvironment.label}
            </div>
          </header>

          <Link className="login-card__back" to="/login">
            <ArrowLeft size={17} aria-hidden="true" />
            Voltar ao login
          </Link>

          <div className="login-card__intro login-card__intro--signup">
            <span className="login-card__eyebrow">{platformBrand.hostname}</span>
            <h1>Crie sua conta</h1>
            <p>Informe seus dados para iniciar o cadastro da identidade e da empresa.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-form__field">
              <span>Seu nome</span>
              <div className="login-form__control">
                <UserRound size={19} aria-hidden="true" />
                <input name="name" autoComplete="name" placeholder="Nome completo" required />
              </div>
            </label>

            <label className="login-form__field">
              <span>E-mail</span>
              <div className="login-form__control">
                <Mail size={19} aria-hidden="true" />
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
              <span>Empresa</span>
              <div className="login-form__control">
                <Building2 size={19} aria-hidden="true" />
                <input
                  name="company"
                  autoComplete="organization"
                  placeholder="Nome da empresa"
                  required
                />
              </div>
            </label>

            <label className="login-form__field">
              <span>Crie uma senha</span>
              <div className="login-form__control">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder="Senha de acesso"
                  required
                />
              </div>
            </label>

            <button className="login-form__submit" type="submit">
              Criar conta
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </form>

          {showPrototypeNotice ? (
            <div className="login-card__notice" role="status">
              <ShieldCheck size={20} aria-hidden="true" />
              <p>
                <strong>Demonstração visual: nenhum cadastro foi enviado.</strong>
                Na versão funcional, a conta direta aguardará contratação e ativação antes de
                receber acesso a uma empresa.
              </p>
            </div>
          ) : null}

          <footer className="login-card__footer">
            <ShieldCheck size={16} aria-hidden="true" />
            Criar a conta não libera acesso sem vínculo autorizado.
          </footer>
        </div>
      </section>
    </main>
  )
}
