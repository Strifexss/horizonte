import React, { useState, useMemo } from 'react';
import { defineChart, lineY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';

export default function AceleradorPatrimonio() {
  // ESTADOS CONFIGURÁVEIS (Valor Guardado e Porcentagem de Rendimento)
  const [valorGuardado, setValorGuardado] = useState(1100); // R$/mês
  const [taxaRendimento, setTaxaRendimento] = useState(0.8); // % a.m.

  // CÁLCULO DINÂMICO DE JUROS COMPOSTOS (Aportes Mensais)
  // FV = P * [((1 + i)^n - 1) / i]
  const calcularPatrimonio = (meses) => {
    const i = taxaRendimento / 100;
    if (i === 0) return valorGuardado * meses;
    return valorGuardado * ((Math.pow(1 + i, meses) - 1) / i);
  };

  // Valores dinâmicos recalculados em tempo real
  const patrimonio1Ano = useMemo(() => calcularPatrimonio(12), [valorGuardado, taxaRendimento]);
  const patrimonio2Anos = useMemo(() => calcularPatrimonio(24), [valorGuardado, taxaRendimento]);

  const rendaPassiva1Ano = useMemo(() => patrimonio1Ano * (taxaRendimento / 100), [patrimonio1Ano, taxaRendimento]);
  const rendaPassiva2Anos = useMemo(() => patrimonio2Anos * (taxaRendimento / 100), [patrimonio2Anos, taxaRendimento]);

  // Formatação em Moeda Real (BRL)
  const formatarBRL = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Dados dinâmicos para o gráfico da @tanstack/charts
  const curvaPatrimonio = useMemo(() => [
    { label: 'Hoje', valor: 0 },
    { label: '6m', valor: Math.round(calcularPatrimonio(6)) },
    { label: '12m', valor: Math.round(patrimonio1Ano) },
    { label: '18m', valor: Math.round(calcularPatrimonio(18)) },
    { label: '24m', valor: Math.round(patrimonio2Anos) },
  ], [valorGuardado, taxaRendimento, patrimonio1Ano, patrimonio2Anos]);

  // Instância do Gráfico @tanstack/charts
  const chart = useMemo(() => {
    return defineChart({
      marks: [
        lineY(curvaPatrimonio, {
          x: 'label',
          y: 'valor',
          stroke: '#6366F1',
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
  }, [curvaPatrimonio]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-slate-50 shadow-2xl border border-slate-800 font-sans mb-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 tracking-wider block mb-1 uppercase">
            Horizonte de Longo Prazo (1 e 2 Anos)
          </span>
          <h3 className="text-lg font-bold text-slate-50 m-0">
            Acelerador de Patrimônio & Renda Passiva
          </h3>
        </div>
        <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
          Simulador Interativo
        </span>
      </div>

      {/* PAINEL DE CONFIGURAÇÃO (Sliders & Controls) */}
      <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Configuração 1: Valor Guardado / Aporte Mensal */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <label htmlFor="valorGuardadoInput" className="font-semibold text-slate-300">Valor Guardado / Aporte Mensal:</label>
            <span className="font-bold text-indigo-400 text-sm">{formatarBRL(valorGuardado)}</span>
          </div>
          <input
            id="valorGuardadoInput"
            type="number"
            min="100"
            max="10000"
            step="100"
            value={valorGuardado}
            onChange={(e) => setValorGuardado(Number(e.target.value))}
            className="w-full bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Configuração 2: Porcentagem de Rendimento Estimado */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <label htmlFor="taxaRendimentoInput" className="font-semibold text-slate-300">Rendimento Estimado (% a.m.):</label>
            <span className="font-bold text-emerald-400 text-sm">{taxaRendimento.toFixed(1)}% a.m.</span>
          </div>
          <input
            id="taxaRendimentoInput"
            type="number"
            min="0.1"
            max="2.5"
            step="0.1"
            value={taxaRendimento}
            onChange={(e) => setTaxaRendimento(Number(e.target.value))}
            className="w-full bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid Principal: Métricas + TanStack Chart + Raio-X */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Lado Esquerdo: Projeção Numérica + TanStack Chart */}
        <div className="bg-[#162032] rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Em 12 Meses</span>
              <div className="text-lg font-extrabold text-slate-100 mt-0.5">{formatarBRL(patrimonio1Ano)}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                + {formatarBRL(rendaPassiva1Ano)}/mês <span className="text-slate-500 font-normal">(passivo)</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-indigo-300 block uppercase font-medium">Em 24 Meses</span>
              <div className="text-lg font-extrabold text-indigo-400 mt-0.5">{formatarBRL(patrimonio2Anos)}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                + {formatarBRL(rendaPassiva2Anos)}/mês <span className="text-slate-500 font-normal">(passivo)</span>
              </div>
            </div>
          </div>

          {/* Gráfico Dinâmico @tanstack/charts */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">
              Curva de Acúmulo de Patrimônio (Juros Compostos):
            </span>
            <div className="h-28 w-full">
              <Chart definition={chart} height={112} ariaLabel="Curva de Acúmulo de Patrimônio" />
            </div>
          </div>
        </div>

        {/* Lado Direito: Raio-X Executivo Adaptativo da IA */}
        <div className="bg-slate-800/60 rounded-xl p-4.5 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs">✨</span>
              <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase">
                Raio-X de Multiplicação de Renda
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic m-0 mb-4">
              "Aportando {formatarBRL(valorGuardado)}/mês com rendimento simulado de {taxaRendimento.toFixed(1)}% a.m., você acumula {formatarBRL(patrimonio2Anos)} em 2 anos. Esse montante passará a gerar {formatarBRL(rendaPassiva2Anos)} todos os meses sem que você precise trabalhar por esse dinheiro."
            </p>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <div>
                <div className="text-[11px] font-bold text-indigo-300">Gatilho de Aceleração</div>
                <div className="text-[10px] text-slate-400">+R$ 200/mês no aporte</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-extrabold text-indigo-300">
                +{formatarBRL(calcularPatrimonio(24) - patrimonio2Anos + (200 * 24))}
              </div>
              <div className="text-[9px] text-slate-400">em 24 meses</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}