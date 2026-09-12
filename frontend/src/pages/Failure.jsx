import { useSearchParams, Link } from 'react-router-dom';

export default function Failure() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  const reasons = {
    expired:  { icon: '⏱️', title: 'Sessão Expirada',   text: 'O tempo para completar a verificação de identidade se esgotou. Sessões YaID têm validade limitada por segurança.' },
    rejected: { icon: '🚫', title: 'Verificação Recusada', text: 'A YaID não conseguiu validar os requisitos necessários (maioridade ou prova de humanidade) para este ingresso.' },
    cancelled:{ icon: '✖️', title: 'Verificação Cancelada', text: 'Você cancelou o processo de verificação. Para garantir seu ingresso, é necessário concluir a verificação de identidade.' },
  };

  const info = reasons[reason] || {
    icon: '❌',
    title: 'Verificação Recusada ou Expirada',
    text: 'Não foi possível confirmar sua identidade. Isso pode ocorrer por expiração da sessão, cancelamento, ou falha na verificação de maioridade.',
  };

  return (
    <main className="page bg-gradient" id="failure-page">
      <div className="bg-orb bg-orb--purple" style={{ opacity: 0.5 }} aria-hidden="true" />
      <div className="bg-orb bg-orb--pink" style={{ opacity: 0.5 }} aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px', maxWidth: 600 }}>
        <div className="card" style={{ padding: '52px 40px', textAlign: 'center', borderColor: 'rgba(255,75,110,0.25)' }}>

          {/* Icon */}
          <div className="icon-circle icon-circle--danger" aria-label={info.title}>
            {info.icon}
          </div>

          {/* Title */}
          <h1 className="heading-lg" style={{ marginBottom: 12, color: 'var(--color-danger)' }}>
            {info.title}
          </h1>

          {/* Description */}
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>
            {info.text}
          </p>

          {/* What to do next */}
          <div style={{
            background: 'rgba(255,75,110,0.05)',
            border: '1px solid rgba(255,75,110,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            marginBottom: 36,
            textAlign: 'left',
          }}>
            <p style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.875rem', color: 'var(--color-text)' }}>
              💡 O que fazer agora?
            </p>
            <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.9, paddingLeft: 20 }}>
              <li>Verifique se você possui credenciais válidas no aplicativo YaID.</li>
              <li>Certifique-se de que tem 18 anos ou mais.</li>
              <li>Tente novamente com uma nova sessão de verificação.</li>
              <li>Em caso de dúvida, consulte o suporte da YaID.</li>
            </ul>
          </div>

          {orderId && (
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', fontFamily: 'monospace', marginBottom: 24 }}>
              Pedido: {orderId.slice(0, 8).toUpperCase()}…
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              to="/"
              id="btn-tentar-novamente"
              className="btn btn--primary"
              style={{ justifyContent: 'center' }}
            >
              🔄 Tentar Novamente
            </Link>
            <a
              href="https://yaid.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
              style={{ justifyContent: 'center' }}
            >
              Saiba mais sobre a YaID ↗
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
          Verificação de identidade segura via{' '}
          <span style={{ color: 'var(--color-primary-2)' }}>YaID</span> — sem compartilhamento de dados pessoais.
        </p>
      </div>
    </main>
  );
}
