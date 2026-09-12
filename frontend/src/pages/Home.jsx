import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Dados do evento fictício
const EVENT = {
  name: 'Festa de Lançamento TCC',
  subtitle: 'A noite mais esperada do semestre',
  date: 'Sábado, 18 de Outubro de 2026',
  time: '22:00 — 06:00',
  location: 'Club D\'Or • São Paulo, SP',
  price: 'R$ 120,00',
  description:
    'Celebre a conclusão do TCC em grande estilo. Uma noite exclusiva com open bar premium, DJ set ao vivo e área VIP reservada. Vagas limitadas — verificação de identidade obrigatória.',
  features: [
    { icon: '🍾', label: 'Open Bar Premium' },
    { icon: '🎵', label: 'DJ ao Vivo' },
    { icon: '🛡️', label: 'Área VIP' },
    { icon: '✅', label: '+18 verificado via YaID' },
  ],
};

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuyTicket = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar checkout.');
      }

      // RF-FRONT-02: redireciona imediatamente para a URL da YaID
      window.location.href = data.verificationUrl;
    } catch (err) {
      console.error('[Checkout]', err);
      setError(err.message || 'Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <main className="page bg-gradient" id="home-page">
      {/* Background orbs */}
      <div className="bg-orb bg-orb--purple" aria-hidden="true" />
      <div className="bg-orb bg-orb--pink" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px' }}>
        {/* Header bar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎟️</span>
            <span style={{ fontFamily: 'var(--font-alt)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary-2)' }}>
              YaID Ingressos
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="badge badge--live">
              <span className="dot" aria-hidden="true" />
              Ingressos disponíveis
            </span>
          </div>
        </header>

        {/* Main layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)',
          gap: '48px',
          alignItems: 'start',
        }}
          className="home-grid"
        >
          {/* Left — Event info */}
          <section aria-labelledby="event-title">
            <span className="badge badge--vip" style={{ marginBottom: '20px' }}>
              ✦ VIP Exclusivo
            </span>

            <h1 id="event-title" className="heading-xl" style={{ marginBottom: '12px' }}>
              <span className="text-gradient">{EVENT.name}</span>
            </h1>
            <p className="heading-md text-muted" style={{ marginBottom: '32px', fontWeight: 400 }}>
              {EVENT.subtitle}
            </p>

            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.75, maxWidth: '520px', marginBottom: '40px' }}>
              {EVENT.description}
            </p>

            {/* Features grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '40px',
              maxWidth: '480px',
            }}>
              {EVENT.features.map((f) => (
                <div key={f.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.label}</span>
                </div>
              ))}
            </div>

            {/* YaID badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              background: 'rgba(130,80,255,0.07)',
              border: '1px solid rgba(130,80,255,0.2)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '480px',
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔐</span>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-2)', marginBottom: 2 }}>
                  Verificação de Identidade por YaID
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Comprove sua maioridade com privacidade total. Sem compartilhar dados pessoais.
                </p>
              </div>
            </div>
          </section>

          {/* Right — Ticket card */}
          <aside aria-label="Compra de ingresso">
            <div className="card" style={{ padding: '36px', borderColor: 'rgba(130,80,255,0.3)' }}>
              {/* Ticket header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--gradient-btn)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.75rem',
                  boxShadow: '0 0 30px rgba(130,80,255,0.5)',
                }}>
                  🎟️
                </div>
                <span className="badge badge--vip">Ingresso VIP</span>
              </div>

              <div className="divider" />

              {/* Info rows */}
              <div style={{ marginBottom: '24px' }}>
                <div className="info-row">
                  <span className="info-row__label">📅 Data</span>
                  <span className="info-row__value" style={{ fontSize: '0.875rem' }}>{EVENT.date}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">⏰ Horário</span>
                  <span className="info-row__value">{EVENT.time}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">📍 Local</span>
                  <span className="info-row__value" style={{ fontSize: '0.85rem', textAlign: 'right' }}>{EVENT.location}</span>
                </div>
              </div>

              <div className="divider" />

              {/* Price */}
              <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Valor por pessoa</p>
                <p className="text-gold" style={{ fontFamily: 'var(--font-alt)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                  {EVENT.price}
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  background: 'rgba(255,75,110,0.1)',
                  border: '1px solid rgba(255,75,110,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '0.875rem',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* CTA Button */}
              <button
                id="btn-comprar-ingresso"
                className="btn btn--primary btn--lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleBuyTicket}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    Iniciando verificação...
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    Garantir Ingresso VIP
                  </>
                )}
              </button>

              <p style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--color-text-faint)',
                marginTop: '16px',
                lineHeight: 1.6,
              }}>
                Você será redirecionado para a plataforma YaID para verificar sua identidade. Processo seguro e privado.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .home-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </main>
  );
}
