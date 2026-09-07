import React, { useMemo } from 'react';
import { defineChart, lineY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';

// DADOS MOCADOS DA PROJEÇÃO DE SOBRA (FIM DO MÊS)
const MOCK_PROJECAO_SOBRA = {
  sobraProjetada: "R$ 1.100,00",
  dataPagamento: "05/10",
  diasRestantes: 14,
  metaAporte: "R$ 1.000,00",
  diferencaMeta: "+R$ 100,00",
  statusRitmo: "FAVORAVEL",
  raioXTexto: "Neste mês, seu ritmo de consumo está 12% abaixo da sua média histórica. Cruzando a entrada do seu salário com as contas fixas já agendadas e a média de despesas variáveis, a sobra estimada garante o cumprimento integral da sua meta de aporte.",
  pontosCurva: [
    { label: 'Hoje', valor: 3800 },
    { label: '+7d', valor: 2900 },
    { label: '+15d', valor: 2100 },
    { label: '+22d', valor: 1600 },
    { label: 'Fim Mês', valor: 1100 }
  ]
};

export default function ProjecaoSobraFimMes({ data = MOCK_PROJECAO_SOBRA }) {
  // Configuração da curva do gráfico via TanStack Charts
  const chart = useMemo(() => {
    return defineChart({
      marks: [
        lineY(data.pontosCurva, {
          x: 'label',
          y: 'valor',
          key: 'projecao-sobra',
          stroke: '#22C55E',
          strokeWidth: 3,
        }),
      ],
      scales: {
        x: { scale: scaleBand, padding: 0.2 },
        y: { scale: scaleLinear, nice: true, grid: true },
      },
      focus: 'group-x',
      tooltip: { use: tooltip, anchor: 'group-center', placement: ['top', 'right', 'left', 'bottom'] },
    });
  }, [data.pontosCurva]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-slate-50 shadow-2xl border border-slate-800 font-sans mb-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
        <div>
          <span className="text-[11px] font-bold text-indigo-300 tracking-wider block mb-1 uppercase">
            Projeção de Fim de Mês
          </span>
          <h3 className="text-lg font-bold text-slate-50 m-0">
            Sobra Estimada no Dia do Pagamento
          </h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
          Previsto para {data.dataPagamento} ({data.diasRestantes} dias)
        </span>
      </div>

      {/* Grid Principal: Gráfico + Raio-X */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Lado Esquerdo: Card Numérico + TanStack Chart */}
        <div className="bg-[#162032] rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start mb-2">
            <div>
              <span className="text-xs text-slate-400 block">Sobra Líquida Projetada</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {data.sobraProjetada}
              </div>
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0 flex flex-col md:items-end bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400">Meta: {data.metaAporte}</span>
              <span className="text-xs font-bold text-emerald-400">{data.diferencaMeta}</span>
            </div>
          </div>

          {/* Gráfico Renderizado pelo TanStack Charts */}
          <div className="h-28 w-full mt-2">
            <Chart definition={chart} height={112} ariaLabel="Projeção de Sobra" />
          </div>
        </div>

        {/* Lado Direito: Raio-X Executivo da IA */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs">✨</span>
              <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase">
                Raio-X Executivo da Sobra
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic m-0 mb-4">
              "{data.raioXTexto}"
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 border-t border-slate-700/80 pt-3">
            <span className="text-[10px]">●</span>
            <span>Ritmo de Gastos: <strong className="font-semibold">Favorável para Meta</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}