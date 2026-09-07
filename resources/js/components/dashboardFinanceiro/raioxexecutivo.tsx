import React from 'react';

// 1. DADOS MOCADOS DO RAIO-X EXECUTIVO
const MOCK_RAIO_X = {
  textoAnalitico: "Atenção: nesta semana seus gastos com Alimentação subiram 20% em relação à sua média, impulsionados por dois pedidos de delivery no fim de semana[cite: 1]. Como suas contas fixas já foram quitadas, reduzir os gastos com lazer nos próximos 5 dias garantirá que você cumpra a sua meta de aporte do mês.",
  categoriaAlerta: "Alimentação (Delivery)",
  variacao: "+20%",
  sobraProjetada: "R$ 1.100,00",
  dataAtualizacao: "Atualizado hoje após leitura do OFX"
};

export default function RaioXExecutivoTopo({ data = MOCK_RAIO_X }) {
  return (
    <div style={styles.container}>
      {/* Cabeçalho do Card */}
      <div style={styles.header}>
        <div style={styles.badgeIa}>
          <span style={styles.sparkleIcon}>✨</span>
          <span style={styles.badgeText}>RAIO-X EXECUTIVO IA</span>
        </div>
        <span style={styles.updatedText}>{data.dataAtualizacao}</span>
      </div>

      {/* Parágrafo Analítico Principal */}
      <p style={styles.textoPrincipal}>
        "{data.textoAnalitico}"
      </p>

      {/* Mini Rodapé com Destaques Rápidos */}
      <div style={styles.footerMetrics}>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Ponto de Atenção:</span>
          <span style={styles.metricValueAlert}>
            {data.categoriaAlerta} <strong>({data.variacao})</strong>
          </span>
        </div>

        <div style={styles.divider} />

        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Sobra Estimada no Fim do Mês:</span>
          <span style={styles.metricValueSuccess}>{data.sobraProjetada}</span>
        </div>
      </div>
    </div>
  );
}

// 2. ESTILOS INLINE (Pronto para rodar em qualquer projeto React)
const styles = {
  container: {
    backgroundColor: '#0F172A', // Azul escuro executivo / Dark mode
    borderRadius: '16px',
    padding: '20px 24px',
    color: '#F8FAFC',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    border: '1px solid #1E293B',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  badgeIa: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // Roxo suave
    border: '1px solid rgba(99, 102, 241, 0.4)',
    borderRadius: '20px',
    padding: '4px 12px',
  },
  sparkleIcon: {
    fontSize: '12px',
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: '0.5px',
  },
  updatedText: {
    fontSize: '12px',
    color: '#64748B',
  },
  textoPrincipal: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#E2E8F0',
    margin: '0 0 16px 0',
    fontWeight: '400',
  },
  footerMetrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #1E293B',
    flexWrap: 'wrap',
  },
  metricBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  metricLabel: {
    color: '#94A3B8',
  },
  metricValueAlert: {
    color: '#FCA5A5', // Vermelho suave
  },
  metricValueSuccess: {
    color: '#86EFAC', // Verde suave
    fontWeight: '600',
  },
  divider: {
    width: '1px',
    height: '14px',
    backgroundColor: '#334155',
  }
};