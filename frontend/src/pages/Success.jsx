import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 60; // 3 min timeout

export default function Success() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [status, setStatus] = useState('polling'); // 'polling' | 'approved' | 'timeout' | 'error'
  const [pollCount, setPollCount] = useState(0);
  const [order, setOrder] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    // RF-FRONT-03: Polling a cada 3 segundos
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/order/${orderId}`);
        if (!res.ok) throw new Error('Pedido não encontrado');

        const data = await res.json();
        setOrder(data);
        setPollCount((c) => c + 1);

        if (data.status === 'approved') {
          clearInterval(intervalRef.current);
          setStatus('approved');
        } else if (data.status === 'rejected') {
          clearInterval(intervalRef.current);
          setStatus('rejected');
        } else if (pollCount >= MAX_POLLS) {
          clearInterval(intervalRef.current);
          setStatus('timeout');
        }
      } catch (err) {
        console.error('[Polling]', err);
      }
    };

    // Checa imediatamente e depois inicia intervalo
    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const progress = Math.min((pollCount / MAX_POLLS) * 100, 100);

  return (
    <main className="page bg-gradient" id="success-page">
      <div className="bg-orb bg-orb--purple" aria-hidden="true" />
      <div className="bg-orb bg-orb--pink" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px', maxWidth: 600 }}>
        <div className="card" style={{ padding: '52px 40px', textAlign: 'center' }}>

          {/* ── APPROVED ── */}
          {status === 'approved' && (
            <>
              <div className="icon-circle icon-circle--success" aria-label="Sucesso">
                🎉
              </div>

              <h1 className="heading-lg" style={{ marginBottom: 12 }}>
                <span style={{ color: 'var(--color-success)' }}>Ingresso Liberado!</span>
              </h1>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 36 }}>
                Sua identidade foi verificada com sucesso pela YaID. Seu ingresso VIP está confirmado.
              </p>

              <div style={{
                background: 'rgba(45,230,166,0.07)',
                border: '1px solid rgba(45,230,166,0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                marginBottom: 36,
                textAlign: 'left',
              }}>
                <div className="info-row">
                  <span className="info-row__label">🎟️ Pedido</span>
                  <span className="info-row__value" style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-primary-2)' }}>
                    {orderId?.slice(0, 8).toUpperCase()}…
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">✅ Status</span>
                  <span className="info-row__value" style={{ color: 'var(--color-success)' }}>Aprovado</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">🔐 Verificação</span>
                  <span className="info-row__value" style={{ color: 'var(--color-success)' }}>YaID ✓</span>
                </div>
              </div>

              <Link to="/" className="btn btn--outline" style={{ width: '100%' }}>
                ← Voltar à Vitrine
              </Link>
            </>
          )}

          {/* ── POLLING ── */}
          {status === 'polling' && (
            <>
              <div className="icon-circle icon-circle--waiting" aria-label="Aguardando verificação">
                🔐
              </div>

              <h1 className="heading-lg" style={{ marginBottom: 12 }}>
                Aguardando Verificação
              </h1>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
                Complete a verificação de identidade na plataforma YaID. Esta página será atualizada automaticamente assim que a confirmação for recebida.
              </p>

              <div style={{ marginBottom: 20 }}>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 8 }}>
                  Verificando a cada 3 segundos… ({pollCount}/{MAX_POLLS})
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <div className="spinner" />
              </div>

              {orderId && (
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>
                  Pedido: {orderId.slice(0, 8).toUpperCase()}…
                </p>
              )}
            </>
          )}

          {/* ── TIMEOUT ── */}
          {status === 'timeout' && (
            <>
              <div className="icon-circle icon-circle--danger" aria-label="Tempo expirado">
                ⏱️
              </div>

              <h1 className="heading-lg" style={{ marginBottom: 12 }}>
                <span style={{ color: 'var(--color-danger)' }}>Tempo Esgotado</span>
              </h1>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 36 }}>
                Não recebemos a confirmação da YaID dentro do tempo esperado. A verificação pode ter expirado.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/" className="btn btn--primary" style={{ justifyContent: 'center' }}>
                  Tentar Novamente
                </Link>
                <Link to="/failure" className="btn btn--outline" style={{ justifyContent: 'center' }}>
                  Ver Detalhes da Falha
                </Link>
              </div>
            </>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <>
              <div className="icon-circle icon-circle--danger" aria-label="Erro">
                ❌
              </div>
              <h1 className="heading-lg" style={{ marginBottom: 12 }}>
                <span style={{ color: 'var(--color-danger)' }}>Erro inesperado</span>
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
                ID de pedido não encontrado. Retorne à vitrine e tente novamente.
              </p>
              <Link to="/" className="btn btn--primary" style={{ justifyContent: 'center', display: 'flex' }}>
                Voltar à Vitrine
              </Link>
            </>
          )}

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
