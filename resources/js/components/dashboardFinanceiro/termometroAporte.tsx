export default function TermometroAporte({
  rendaLiquida = 5000,
  custosFixos = 2800,
  gastosVariaveis = 1100,
}) {
  // Cálculo de Sobra e Percentual do Salário
  const sobraLivre = rendaLiquida - custosFixos - gastosVariaveis;
  const percentualSobra = Math.round((sobraLivre / rendaLiquida) * 100);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-slate-50 shadow-2xl border border-slate-800 font-sans mb-6">
      {/* 1. Cabeçalho & Destaque Principal (Direto ao ponto) */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block mb-1">
            Sobra Livre do Mês
          </span>
          <h2 className="text-3xl font-extrabold text-slate-50 m-0">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sobraLivre)}
          </h2>
          <p className="text-xs text-slate-400 mt-1 m-0">
            Você está guardando <strong className="text-emerald-400 font-bold">{percentualSobra}% do seu salário</strong> este mês.
          </p>
        </div>

        {/* Badge Status */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">
            Meta Atingida (&gt; 20% guardados)
          </span>
        </div>
      </div>

      {/* 2. Barra Visual Única e Limpa */}
      <div className="mb-6">
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentualSobra, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
          <span>0%</span>
          <span>Meta: 20%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 3. A Conta Mastigada (Linguagem Humanizada) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-[10px] font-medium text-slate-400 block">Sua Renda</span>
          <span className="text-sm font-bold text-slate-200">
            R$ {rendaLiquida.toLocaleString('pt-BR')}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-medium text-slate-400 block">(-) Contas Fixas</span>
          <span className="text-sm font-semibold text-rose-400">
            R$ {custosFixos.toLocaleString('pt-BR')}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-medium text-slate-400 block">(-) Gastos do Dia a Dia</span>
          <span className="text-sm font-semibold text-amber-400">
            R$ {gastosVariaveis.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="border-l border-slate-800 pl-3">
          <span className="text-[10px] font-medium text-emerald-400 block">(=) Sobra para Investir</span>
          <span className="text-sm font-extrabold text-emerald-400">
            R$ {sobraLivre.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}