'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface VoteData {
  lula: number;
  flavio: number;
  total: number;
  hasVoted: boolean;
  votedFor: 'lula' | 'flavio' | null;
}

const WHATSAPP_LINK =
  'https://wa.me/55119275454319?text=Ol%C3%A1!%20Tenho%20interesse%20em%20anunciar%20no%20espa%C3%A7o%20publicit%C3%A1rio%20do%20site%20de%20vota%C3%A7%C3%A3o%20online.';

export default function Home() {
  const [data, setData] = useState<VoteData>({
    lula: 0,
    flavio: 0,
    total: 0,
    hasVoted: false,
    votedFor: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Busca votos e atualiza em tempo real
  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch('/api/votes', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        // Bloqueio extra persistente no aparelho do eleitor (localStorage)
        const localFlag =
          typeof window !== 'undefined'
            ? (localStorage.getItem('voto_registrado') as 'lula' | 'flavio' | null)
            : null;
        if (localFlag && !json.hasVoted) {
          json.hasVoted = true;
          json.votedFor = localFlag;
        }
        setData(json);
      }
    } catch (err) {
      console.error('Erro ao buscar votos:', err);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const res = await fetch('/api/votes', { cache: 'no-store' });
        if (res.ok && active) {
          const json = await res.json();
          const localFlag =
            typeof window !== 'undefined'
              ? (localStorage.getItem('voto_registrado') as 'lula' | 'flavio' | null)
              : null;
          if (localFlag && !json.hasVoted) {
            json.hasVoted = true;
            json.votedFor = localFlag;
          }
          setData(json);
        }
      } catch (err) {
        console.error('Erro ao buscar votos:', err);
      }
    };

    run();
    // Atualiza automaticamente a cada 30 segundos (30.000 ms)
    const THIRTY_SECONDS = 30 * 1000;
    const interval = setInterval(run, THIRTY_SECONDS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleVote = async (candidate: 'lula' | 'flavio') => {
    if (data.hasVoted || loading) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || 'Erro ao votar.');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('voto_registrado', candidate);
        }
        // Atualiza a tela imediatamente com os novos números retornados
        setData({
          lula: result.lula ?? data.lula,
          flavio: result.flavio ?? data.flavio,
          total: result.total ?? data.total,
          hasVoted: true,
          votedFor: candidate,
        });
        setMessage('Voto computado com sucesso!');
        await fetchVotes();
      }
    } catch {
      setMessage('Erro de conexão ao enviar voto.');
    } finally {
      setLoading(false);
    }
  };

  const lulaPct = data.total > 0 ? ((data.lula / data.total) * 100).toFixed(1) : '0.0';
  const flavioPct = data.total > 0 ? ((data.flavio / data.total) * 100).toFixed(1) : '0.0';

  return (
    <main className="container">
      {/* Top Header */}
      <header className="header">
        <div className="header-badge-row">
          <Image
            src="/bandeira-brasil.svg"
            alt="Bandeira do Brasil"
            width={28}
            height={20}
            className="header-flag"
            priority
          />
          <span className="live-badge">● AO VIVO</span>
          <Image
            src="/bandeira-brasil.svg"
            alt="Bandeira do Brasil"
            width={28}
            height={20}
            className="header-flag"
            priority
          />
        </div>
        <h1>Eleição Online: Lula 13 vs Flávio Bolsonaro 22</h1>
        <p className="total-votes">
          Total de votos contabilizados: <strong>{data.total}</strong>
        </p>
      </header>

      {/* 1. BANNER SUPERIOR DE PUBLICIDADE (COMPACTO) */}
      <section className="banner-ad banner-ad-top">
        <div className="banner-ad-left">
          <span className="ad-badge-pulse">ANUNCIE AQUI</span>
          <p className="banner-ad-text">
            <strong>Banner Topo Disponível:</strong> Destaque sua empresa para milhares de eleitores em tempo real.
          </p>
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp-ad"
        >
          <span>💬 Quero Anunciar</span>
          <span className="btn-phone">(11) 9 2754-54319</span>
        </a>
      </section>

      {/* GRID PRINCIPAL: ESQUERDA (ANÚNCIOS) | CENTRO (VOTAÇÃO) | DIREITA (ANÚNCIOS) */}
      <div className="layout-3cols">
        {/* COLUNA ESQUERDA: Caixinha Patrocinada + Caixinha Anuncie */}
        <aside className="ad-col ad-col-left">
          <a
            href="https://meli.la/2ZjbUNv"
            target="_blank"
            rel="noopener noreferrer"
            className="ad-box ad-box-sponsor"
            title="Camiseta do Brasil - Vista essa Paixão | Compre no Mercado Livre"
          >
            <div className="ad-badge-meli">PATROCINADO</div>
            <div className="ad-img-box">
              <Image
                src="/anuncio-camiseta-brasil.jpg"
                alt="Camiseta do Brasil - Vista essa Paixão - Compre Agora"
                width={1024}
                height={512}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '2 / 1',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '6px',
                }}
                priority
              />
            </div>
            <div className="ad-box-body">
              <p className="ad-box-headline">Camiseta do Brasil</p>
              <p className="ad-box-sub">Vista essa paixão • Oficial</p>
              <div className="ad-action-pill ad-action-meli">
                <span>Comprar Agora</span>
                <span>➔</span>
              </div>
            </div>
            <div className="ad-contact">Mercado Livre Oficial</div>
          </a>

          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="ad-box">
            <div className="ad-badge">ANUNCIE AQUI</div>
            <div className="ad-box-body">
              <span className="ad-icon">⭐</span>
              <p className="ad-box-headline">Espaço Marca #2</p>
              <p className="ad-box-sub">Divulgue sua marca</p>
              <div className="ad-action-pill">
                <span>Anunciar</span>
                <span>→</span>
              </div>
            </div>
            <div className="ad-contact">(11) 9 2754-54319</div>
          </a>
        </aside>

        {/* COLUNA CENTRAL: Área Principal de Votação */}
        <section className="voting-main">
          {message && <div className="alert">{message}</div>}

          {/* Barra de porcentagem simples */}
          <div className="bar-wrapper">
            <div className="bar-track">
              <div
                className="bar-lula"
                style={{
                  width: `${data.total === 0 ? 50 : Math.max(5, Math.min(95, Number(lulaPct)))}%`,
                }}
              >
                Lula {lulaPct}%
              </div>
              <div
                className="bar-flavio"
                style={{
                  width: `${data.total === 0 ? 50 : Math.max(5, Math.min(95, Number(flavioPct)))}%`,
                }}
              >
                Flávio {flavioPct}%
              </div>
            </div>
          </div>

          {/* Cards dos Candidatos */}
          <div className="cards-grid">
            {/* Card Lula */}
            <div
              className={`card card-lula ${data.votedFor === 'lula' ? 'card-voted-active' : ''}`}
            >
              <div className="photo-box">
                <Image
                  src="/lula.jpg"
                  alt="Lula 13"
                  width={140}
                  height={140}
                  className="photo"
                  priority
                />
                <span className="badge-num lula-num">13</span>
              </div>
              <h2>Luiz Inácio Lula da Silva</h2>
              <span className="party">PT - Partido dos Trabalhadores</span>

              <div className="votes-counter">
                <span className="count-label">Votos contabilizados:</span>
                <span className="count-number lula-color">{data.lula}</span>
                <span className="count-pct">({lulaPct}%)</span>
              </div>

              {!data.hasVoted && (
                <button
                  onClick={() => handleVote('lula')}
                  disabled={loading}
                  className="btn-vote btn-lula"
                >
                  {loading ? 'Gravando...' : 'VOTAR NO LULA 13'}
                </button>
              )}
            </div>

            {/* Card Flávio Bolsonaro */}
            <div
              className={`card card-flavio ${data.votedFor === 'flavio' ? 'card-voted-active' : ''}`}
            >
              <div className="photo-box">
                <Image
                  src="/flavio.jpg"
                  alt="Flávio Bolsonaro 22"
                  width={140}
                  height={140}
                  className="photo"
                  priority
                />
                <span className="badge-num flavio-num">22</span>
              </div>
              <h2>Flávio Bolsonaro</h2>
              <span className="party">PL - Partido Liberal</span>

              <div className="votes-counter">
                <span className="count-label">Votos contabilizados:</span>
                <span className="count-number flavio-color">{data.flavio}</span>
                <span className="count-pct">({flavioPct}%)</span>
              </div>

              {!data.hasVoted && (
                <button
                  onClick={() => handleVote('flavio')}
                  disabled={loading}
                  className="btn-vote btn-flavio"
                >
                  {loading ? 'Gravando...' : 'VOTAR NO FLÁVIO 22'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* COLUNA DIREITA: 2 Caixinhas de Anúncios */}
        <aside className="ad-col ad-col-right">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="ad-box">
            <div className="ad-badge">ANUNCIE AQUI</div>
            <div className="ad-box-body">
              <span className="ad-icon">🚀</span>
              <p className="ad-box-headline">Espaço Marca #3</p>
              <p className="ad-box-sub">Alcance todo o Brasil</p>
              <div className="ad-action-pill">
                <span>Anunciar</span>
                <span>→</span>
              </div>
            </div>
            <div className="ad-contact">(11) 9 2754-54319</div>
          </a>

          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="ad-box">
            <div className="ad-badge">ANUNCIE AQUI</div>
            <div className="ad-box-body">
              <span className="ad-icon">💼</span>
              <p className="ad-box-headline">Espaço Marca #4</p>
              <p className="ad-box-sub">Seja nosso patrocinador</p>
              <div className="ad-action-pill">
                <span>Anunciar</span>
                <span>→</span>
              </div>
            </div>
            <div className="ad-contact">(11) 9 2754-54319</div>
          </a>
        </aside>
      </div>

      {/* 2. BANNER INFERIOR DE PUBLICIDADE */}
      <section className="banner-ad banner-ad-bottom">
        <div className="banner-ad-left">
          <span className="ad-badge-pulse">ANUNCIE AQUI</span>
          <p className="banner-ad-text">
            <strong>Banner Rodapé Disponível:</strong> Divulgue seus produtos e serviços na página de maior engajamento político online.
          </p>
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp-ad"
        >
          <span>💬 Quero Anunciar</span>
          <span className="btn-phone">(11) 9 2754-54319</span>
        </a>
      </section>

      <style jsx>{`
        .container {
          max-width: 1340px;
          margin: 0 auto;
          padding: 24px 16px 40px;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #f1f5f9;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        .header-badge-row {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .header-flag {
          border-radius: 3px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
          display: block;
        }

        .live-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }

        h1 {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .total-votes {
          font-size: 17px;
          color: #94a3b8;
        }

        .total-votes strong {
          color: #ffffff;
          font-size: 22px;
        }

        /* Banners Horizontais (Topo e Rodapé) */
        .banner-ad {
          background: linear-gradient(135deg, #131b2e 0%, #0d1322 100%);
          border: 2px dashed rgba(56, 189, 248, 0.4);
          border-radius: 12px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          transition: border-color 0.2s, transform 0.2s;
        }

        .banner-ad:hover {
          border-color: #38bdf8;
        }

        .banner-ad-top {
          margin-bottom: 20px;
        }

        .banner-ad-bottom {
          margin-top: 26px;
        }

        .banner-ad-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ad-badge-pulse {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.18);
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .banner-ad-text {
          font-size: 13px;
          color: #cbd5e1;
        }

        .btn-whatsapp-ad {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #25d366;
          color: #052e16;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.15s;
          box-shadow: 0 3px 10px rgba(37, 211, 102, 0.3);
          flex-shrink: 0;
        }

        .btn-whatsapp-ad:hover {
          background: #22c55e;
          transform: translateY(-2px);
        }

        .btn-phone {
          font-size: 12px;
          font-weight: 700;
          opacity: 0.9;
        }

        /* Layout 3 Colunas: Esquerda | Votação | Direita */
        .layout-3cols {
          display: grid;
          grid-template-columns: 220px 1fr 220px;
          gap: 18px;
          align-items: start;
        }

        /* Colunas de Anúncios */
        .ad-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ad-box {
          display: flex;
          flex-direction: column;
          background: linear-gradient(145deg, #131b2e 0%, #0d1322 100%);
          border: 2px dashed rgba(56, 189, 248, 0.4);
          border-radius: 14px;
          padding: 16px 14px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .ad-box:hover {
          transform: translateY(-3px);
          border-color: #38bdf8;
          box-shadow: 0 8px 20px -4px rgba(56, 189, 248, 0.3);
        }

        .ad-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.35);
          padding: 3px 8px;
          border-radius: 5px;
          width: fit-content;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .ad-box-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4px 0;
          gap: 4px;
        }

        .ad-icon {
          font-size: 24px;
          margin-bottom: 2px;
        }

        .ad-box-headline {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
        }

        .ad-box-sub {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .ad-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #25d366;
          color: #052e16;
          font-size: 11px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 16px;
          box-shadow: 0 2px 6px rgba(37, 211, 102, 0.3);
        }

        .ad-box:hover .ad-action-pill {
          background: #22c55e;
        }

        .ad-contact {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-align: center;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Área Central de Votação */
        .voting-main {
          display: flex;
          flex-direction: column;
          width:100%;
        }

        .voted-alert {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid #22c55e;
          color: #86efac;
          padding: 14px 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          font-size: 14px;
          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.15);
        }

        .voted-icon {
          font-size: 20px;
          font-weight: 900;
          color: #22c55e;
          flex-shrink: 0;
        }

        .voted-text {
          line-height: 1.4;
        }

        .voted-name {
          color: #ffffff;
          font-weight: 800;
          text-decoration: underline;
        }

        .alert {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 18px;
          font-weight: 600;
        }

        .bar-wrapper {
          margin-bottom: 20px;
        }

        .bar-track {
          display: flex;
          height: 36px;
          border-radius: 18px;
          overflow: hidden;
          background: #1e293b;
          font-weight: 700;
          font-size: 13px;
        }

        .bar-lula {
          background: #e11d48;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.4s ease;
        }

        .bar-flavio {
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.4s ease;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .card {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 16px;
          padding: 20px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.2s;
        }

        .card-voted-active {
          border-color: #22c55e;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }

        .card-lula {
          border-top: 4px solid #e11d48;
        }

        .card-flavio {
          border-top: 4px solid #2563eb;
        }

        .photo-box {
          position: relative;
          margin-bottom: 12px;
        }

        .photo {
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #374151;
        }

        .badge-num {
          position: absolute;
          bottom: 0;
          right: 0;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 13px;
          color: #ffffff;
        }

        .lula-num {
          background: #e11d48;
        }

        .flavio-num {
          background: #2563eb;
        }

        h2 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .party {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .votes-counter {
          background: #1f2937;
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .count-label {
          font-size: 11px;
          color: #94a3b8;
        }

        .count-number {
          font-size: 28px;
          font-weight: 900;
        }

        .lula-color {
          color: #fb7185;
        }

        .flavio-color {
          color: #60a5fa;
        }

        .count-pct {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
        }

        .btn-vote {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }

        .btn-lula {
          background: #e11d48;
        }

        .btn-flavio {
          background: #2563eb;
        }

        .btn-vote:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-vote:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* Caixinha Lateral Patrocinada (Camiseta do Brasil) */
        .ad-box-sponsor {
          display: flex;
          flex-direction: column;
          background: linear-gradient(145deg, #101c33 0%, #070e1b 100%);
          border: 2px solid #eab308;
          border-radius: 14px;
          padding: 12px 12px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 14px rgba(234, 179, 8, 0.15);
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .ad-box-sponsor:hover {
          transform: translateY(-3px);
          border-color: #facc15;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5), 0 0 22px rgba(250, 204, 21, 0.3);
        }

        .ad-badge-meli {
          display: inline-block;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #fef08a;
          background: rgba(234, 179, 8, 0.2);
          border: 1px solid rgba(234, 179, 8, 0.45);
          padding: 2px 7px;
          border-radius: 4px;
          width: fit-content;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .ad-img-box {
          width: 100%;
          border-radius: 6px;
          overflow: hidden;
          line-height: 0;
          margin: 2px 0 6px;
          border: 1px solid rgba(250, 204, 21, 0.25);
          background: #000;
        }

        .ad-action-meli {
          background: #ffe600;
          color: #1e293b;
          font-weight: 900;
          box-shadow: 0 2px 8px rgba(255, 230, 0, 0.35);
        }

        .ad-box-sponsor:hover .ad-action-meli {
          background: #facc15;
        }

        /* Responsividade */
        @media (max-width: 1120px) {
          .layout-3cols {
            grid-template-columns: 200px 1fr 200px;
          }
        }

        /* Responsividade: No Celular (<= 960px) exibe SOMENTE 2 PUBLICIDADES (Banner Topo e Anúncio Patrocinado) */
        @media (max-width: 960px) {
          .container {
            padding: 16px 12px 30px;
          }

          .header {
            margin-bottom: 14px;
          }

          h1 {
            font-size: 20px;
            line-height: 1.3;
          }

          .total-votes {
            font-size: 14px;
          }

          .total-votes strong {
            font-size: 18px;
          }

          /* Corrige o Banner Superior para empilhar verticalmente e não espremer o texto */
          .banner-ad {
            flex-direction: column !important;
            align-items: stretch !important;
            text-align: center !important;
            padding: 14px 16px !important;
            gap: 12px !important;
            box-sizing: border-box !important;
            width: 100% !important;
          }

          .banner-ad-left {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 8px !important;
            width: 100% !important;
          }

          .banner-ad-text {
            font-size: 13px !important;
            line-height: 1.4 !important;
            text-align: center !important;
            margin: 0 !important;
          }

          .btn-whatsapp-ad {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            font-size: 13px !important;
            box-sizing: border-box !important;
          }

          .layout-3cols {
            display: flex !important;
            flex-direction: column !important;
            gap: 18px !important;
          }

          .voting-main {
            order: 1 !important; /* Votação aparece PRIMEIRO no celular */
          }

          .ad-col-left {
            order: 2 !important; /* Anúncio patrocinado fica ABAIXO da votação */
            display: block !important;
            width: 100% !important;
            max-width: 360px !important;
            margin: 0 auto !important;
          }

          .ad-col-right {
            display: none !important;
          }

          .banner-ad-bottom {
            display: none !important;
          }

          .ad-box:not(.ad-box-sponsor) {
            display: none !important; /* Esconde placeholders no celular */
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .card {
            padding: 16px 14px;
          }

          .photo {
            width: 110px !important;
            height: 110px !important;
          }
        }
      `}</style>
    </main>
  );
}
