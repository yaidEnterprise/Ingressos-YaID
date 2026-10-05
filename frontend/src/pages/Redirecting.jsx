import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

/**
 * Redirecting.jsx
 * Página intermediária exibida após o usuário clicar em "Garantir Ingresso".
 * Mostra uma animação enquanto aguarda o redirecionamento para a YaID.
 * Rota: /redirecting?url=<verificationUrl>&orderId=<orderId>
 */
export default function Redirecting() {
  const [searchParams] = useSearchParams();
  const verificationUrl = searchParams.get('url');
  const orderId = searchParams.get('orderId');

  const [countdown, setCountdown] = useState(3);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!verificationUrl) return;

    // Countdown 3 → 2 → 1 → redirecionar
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Redireciona após 3 segundos
    const redirect = setTimeout(() => {
      setRedirected(true);
      window.location.href = verificationUrl;
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [verificationUrl]);

  const handleRedirectNow = () => {
    setRedirected(true);
    window.location.href = verificationUrl;
  };

  // Sem URL de verificação — estado de erro
  if (!verificationUrl) {
    return (
      <main className="page bg-gradient" id="redirecting-page">
        <div className="bg-orb bg-orb--purple" aria-hidden="true" />
        <div className="bg-orb bg-orb--pink" aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px', maxWidth: 560 }}>
          <div className="card" style={{ padding: '52px 40px', textAlign: 'center' }}>
            <div className="icon-circle icon-circle--danger" aria-label="Erro">❌</div>
            <h1 className="heading-lg" style={{ marginBottom: 12, color: 'var(--color-danger)' }}>
              Link inválido
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
              Não foi possível obter o link de verificação. Tente novamente a partir da vitrine.
            </p>
            <Link to="/" className="btn btn--primary" style={{ justifyContent: 'center', display: 'flex' }}>
              ← Voltar à Vitrine
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page bg-gradient" id="redirecting-page">
      <div className="bg-orb bg-orb--purple" aria-hidden="true" />
      <div className="bg-orb bg-orb--pink" aria-hidden="true" />
      {/* Partículas decorativas */}
      <div className="redirect-particles" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`redirect-particle redirect-particle--${i + 1}`} />
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px', maxWidth: 580 }}>
        <div className="card" style={{ padding: '52px 40px', textAlign: 'center' }}>

          {/* Logo animado YaID */}
          <div className="redirect-logo-wrapper" aria-label="Redirecionando para YaID">
            <div className="redirect-logo-ring redirect-logo-ring--outer" />
            <div className="redirect-logo-ring redirect-logo-ring--inner" />
            <div className="redirect-logo-core">
              <span style={{ fontSize: '2.2rem' }}>🔐</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="heading-lg" style={{ marginBottom: 12, marginTop: 8 }}>
            {redirected ? (
              <span style={{ color: 'var(--color-success)' }}>Redirecionando…</span>
            ) : (
              <>
                Você será redirecionado para a{' '}
                <span className="text-gradient">YaID</span>
              </>
            )}
          </h1>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 32, fontSize: '0.95rem' }}>
            A <strong style={{ color: 'var(--color-primary-2)' }}>YaID</strong> é a plataforma de verificação de identidade digital utilizada para comprovar sua maioridade de forma{' '}
            <span style={{ color: 'var(--color-success)' }}>segura e privada</span> — sem compartilhar dados pessoais.
          </p>

          {/* Countdown */}
          {!redirected && (
            <div className="redirect-countdown" aria-live="polite">
              <div className="redirect-countdown__circle">
                <svg viewBox="0 0 80 80" className="redirect-countdown__svg" aria-hidden="true">
                  <circle cx="40" cy="40" r="34" className="redirect-countdown__track" />
                  <circle
                    cx="40" cy="40" r="34"
                    className="redirect-countdown__progress"
                    style={{ animationDuration: '3s' }}
                  />
                </svg>
                <span className="redirect-countdown__number" aria-label={`${countdown} segundos`}>
                  {countdown}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginTop: 12 }}>
                Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}…
              </p>
            </div>
          )}

          {/* Indicadores de segurança */}
          <div className="redirect-trust-row">
            <div className="redirect-trust-item">
              <span className="redirect-trust-icon">🛡️</span>
              <span>Conexão segura HTTPS</span>
            </div>
            <div className="redirect-trust-item">
              <span className="redirect-trust-icon">🔒</span>
              <span>Dados criptografados</span>
            </div>
            <div className="redirect-trust-item">
              <span className="redirect-trust-icon">🎭</span>
              <span>Sem compartilhamento de dados</span>
            </div>
          </div>

          <div className="divider" />

          {/* Botão para redirecionar imediatamente */}
          {!redirected ? (
            <button
              id="btn-redirect-now"
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
              onClick={handleRedirectNow}
            >
              <span>🚀</span>
              Ir para YaID agora
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '16px',
              background: 'rgba(45,230,166,0.07)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(45,230,166,0.2)',
              marginBottom: 12,
            }}>
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
              <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
                Abrindo YaID…
              </span>
            </div>
          )}

          {orderId && (
            <Link
              to={`/success?orderId=${orderId}`}
              className="btn btn--outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Já verifiquei — Ver status do pedido
            </Link>
          )}

          {/* Nota de rodapé */}
          <p style={{
            marginTop: 20,
            fontSize: '0.72rem',
            color: 'var(--color-text-faint)',
            lineHeight: 1.6,
          }}>
            Se o redirecionamento não ocorrer automaticamente,{' '}
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary-2)', textDecoration: 'underline' }}
            >
              clique aqui
            </a>
            .
          </p>
        </div>
      </div>

      {/* Estilos específicos desta página */}
      <style>{`
        /* ── Logo animada ── */
        .redirect-logo-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .redirect-logo-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid transparent;
        }

        .redirect-logo-ring--outer {
          inset: 0;
          border-color: rgba(130,80,255,0.4);
          border-top-color: var(--color-primary);
          animation: spin 2s linear infinite;
        }

        .redirect-logo-ring--inner {
          inset: 12px;
          border-color: rgba(255,60,172,0.3);
          border-bottom-color: var(--color-accent);
          animation: spin 1.4s linear infinite reverse;
        }

        .redirect-logo-core {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(130,80,255,0.25), rgba(255,60,172,0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(130,80,255,0.4);
          animation: pulse-core 2s ease-in-out infinite;
        }

        @keyframes pulse-core {
          0%, 100% { box-shadow: 0 0 30px rgba(130,80,255,0.4); }
          50%       { box-shadow: 0 0 50px rgba(130,80,255,0.7), 0 0 20px rgba(255,60,172,0.4); }
        }

        /* ── Countdown ── */
        .redirect-countdown {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
        }

        .redirect-countdown__circle {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .redirect-countdown__svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .redirect-countdown__track {
          fill: none;
          stroke: rgba(130,80,255,0.15);
          stroke-width: 4;
        }

        .redirect-countdown__progress {
          fill: none;
          stroke: var(--color-primary);
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 213.6;
          stroke-dashoffset: 0;
          animation: countdown-drain linear forwards;
        }

        @keyframes countdown-drain {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 213.6; }
        }

        .redirect-countdown__number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-alt);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-primary-2);
          animation: number-pulse 1s ease-in-out infinite;
        }

        @keyframes number-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }

        /* ── Trust row ── */
        .redirect-trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 28px;
        }

        .redirect-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          background: rgba(130,80,255,0.07);
          border: 1px solid rgba(130,80,255,0.18);
          border-radius: 999px;
          padding: 5px 12px;
        }

        .redirect-trust-icon {
          font-size: 0.9rem;
        }

        /* ── Partículas ── */
        .redirect-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .redirect-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--color-primary);
          animation: particle-float linear infinite;
          opacity: 0;
        }

        .redirect-particle--1 { left: 10%; animation-duration: 6s; animation-delay: 0s; }
        .redirect-particle--2 { left: 25%; animation-duration: 8s; animation-delay: 1.5s; background: var(--color-accent); }
        .redirect-particle--3 { left: 40%; animation-duration: 7s; animation-delay: 0.8s; }
        .redirect-particle--4 { left: 55%; animation-duration: 9s; animation-delay: 2s; background: var(--color-gold); }
        .redirect-particle--5 { left: 70%; animation-duration: 6.5s; animation-delay: 0.3s; background: var(--color-accent); }
        .redirect-particle--6 { left: 80%; animation-duration: 7.5s; animation-delay: 1s; }
        .redirect-particle--7 { left: 88%; animation-duration: 8.5s; animation-delay: 2.5s; background: var(--color-gold); }
        .redirect-particle--8 { left: 5%;  animation-duration: 7s;   animation-delay: 3s; background: var(--color-accent); }

        @keyframes particle-float {
          0%   { bottom: -10px; opacity: 0; transform: scale(0.5); }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.4; }
          100% { bottom: 110%; opacity: 0; transform: scale(1.5); }
        }

        @media (max-width: 640px) {
          .redirect-trust-row { flex-direction: column; align-items: center; }
        }
      `}</style>
    </main>
  );
}
