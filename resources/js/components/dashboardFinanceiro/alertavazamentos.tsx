import React, { useMemo } from 'react';
import { defineChart, barY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';

// DADOS MOCADOS DE VAZAMENTOS E CUSTOS RECORRENTES
const MOCK_VAZAMENTOS = {
  impactoAnualTotal: "R$ 2.349,60",
  impactoMensalTotal: "R$ 195,80",
  quantidadeAssinaturas: 3,
  raioXTexto: "Identificamos 3 serviços recorrentes no seu extrato[cite: 1]. Cancelar os 2 itens com uso zerado ou baixo no último mês geraria uma economia imediata de R$ 85,80/mês[cite: 1], reduzindo seu custo anual e aumentando sua capacidade de aporte no termômetro em +4%[cite: 1].",
  comparativoGrafico: [
    { label: 'Atual', valor: 195.80 },
    { label: 'Otimizado', valor: 110.00 }
  ],
  itens: [
    {
      id: 1,
      nome: "Serviço de Streaming X",
      categoria: "Lazer / Entretenimento",
      valorMensal: "R$ 55,90",
      valorAnual: "R$ 670,80",
      alerta: "Uso Baixo (1 acesso/mês)"
    },
    {
      id: 2,
      nome: "Clube de Benefícios App",
      categoria: "Serviços Financeiros",
      valorMensal: "R$ 29,90",
      valorAnual: "R$ 358,80",
      alerta: "Sem uso nos últimos 60 dias"
    },
    {
      id: 3,
      nome: "Mensalidade Academia",
      categoria: "Saúde & Bem-Estar",
      valorMensal: "R$ 110,00",
      valorAnual: "R$ 1.320,00",
      alerta: "Frequente"
    }
  ]
};

export default function AlertaVazamentos({ data = MOCK_VAZAMENTOS }) {
  // Gráfico de Barras Comparativo via @tanstack/charts
  const chart = useMemo(() => {
    return defineChart({
      marks: [
        barY(data.comparativoGrafico, {
          x: 'label',
          y: 'valor',
          fill: 'label',
          fillColor: (d) => (d.label === 'Otimizado' ? '#22C55E' : '#EF4444'),
        }),
      ],
      scales: {
        x: { scale: scaleBand, padding: 0.2 },
        y: { scale: scaleLinear, nice: true, grid: true },
      },
      focus: 'group-x',
      tooltip: { use: tooltip, anchor: 'group-center', placement: ['top', 'right', 'left', 'bottom'] },
    });
  }, [data.comparativoGrafico]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-slate-50 shadow-2xl border border-slate-800 font-sans mb-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
        <div>
          <span className="text-[11px] font-bold text-rose-400 tracking-wider block mb-1 uppercase">
            Alerta de Vazamentos
          </span>
          <h3 className="text-lg font-bold text-slate-50 m-0">
            Custos Recorrentes & Assinaturas
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl">
          <span className="text-xs text-rose-300">Impacto Acumulado:</span>
          <span className="text-sm font-extrabold text-rose-400">
            {data.impactoAnualTotal} / ano
          </span>
        </div>
      </div>

      {/* Grid Principal: Lista + TanStack Chart + Raio-X */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Lado Esquerdo: Lista Enxuta de Assinaturas */}
        <div className="bg-[#162032] rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 mb-3 flex justify-between items-center">
            <span>Serviços Mapeados ({data.itens.length})</span>
            <span>Mensal / Anual</span>
          </div>

          <div className="space-y-2.5">
            {data.itens.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">{item.nome}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{item.categoria}</span>
                    {item.alerta.includes("Baixo") || item.alerta.includes("Sem uso") ? (
                      <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {item.alerta}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.alerta}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">
                    {item.valorMensal} <span className="text-[10px] font-normal text-slate-500">/mês</span>
                  </div>
                  <div className="text-[10px] text-rose-400/90 font-medium">{item.valorAnual} /ano</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Total Mensal Comprometido:</span>
            <span className="font-bold text-slate-200">{data.impactoMensalTotal}</span>
          </div>
        </div>

        {/* Lado Direito: TanStack Chart + Raio-X Executivo da IA */}
        <div className="bg-slate-800/60 rounded-xl p-4.5 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs">✨</span>
              <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase">
                Raio-X de Otimização de Custos
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic m-0 mb-4">
              "{data.raioXTexto}"
            </p>

            {/* Gráfico Comparativo @tanstack/charts */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 mb-4">
              <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                Comparativo Mensal (Atual vs. Otimizado):
              </span>
              <div className="h-20 w-full">
                <Chart definition={chart} height={80} ariaLabel="Comparativo Vazamentos" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <div>
                <div className="text-[11px] font-bold text-emerald-400">Oportunidade de Ganho</div>
                <div className="text-[10px] text-slate-400">Ao cancelar os 2 itens ociosos</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-extrabold text-emerald-400">+R$ 1.029,60</div>
              <div className="text-[9px] text-slate-400">poupados no ano</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}