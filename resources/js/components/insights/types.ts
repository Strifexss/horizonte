export type TipoInsight = 'crescimento' | 'lucro' | 'custos' | 'alerta' | 'positivo';

export type PrioridadeInsight = 'alta' | 'media' | 'baixa' | 'acompanhar';

export type AcaoInsight = 'feito' | 'dispensado';

export type MotivoDispensa = 'ja_sei' | 'nao_se_aplica' | 'numero_errado';

export type Insight = {
    chave: string;
    tipo: TipoInsight;
    prioridade: PrioridadeInsight;
    titulo: string;
    explicacao: string;
    impacto_rotulo: string;
    impacto_valor: number;
    acao: string;
    base: string;
    acao_usuario: AcaoInsight | null;
    motivo_usuario: MotivoDispensa | null;
};

export type ResultadoAcao = {
    titulo: string;
    situacao: 'melhorou' | 'piorou' | 'sem_mudanca' | 'sem_dados';
    explicacao: string;
};

export type StatusAnalise = 'processando' | 'concluida' | 'falhou';

export type AnaliseDashboard = {
    id: number;
    ano: number;
    mes: number;
    status: StatusAnalise;
    erro: string | null;
    gerada_em: string | null;
    resumo: string;
    resultados_acoes: ResultadoAcao[];
    insights: Insight[];
};

export type FiltroInsight = 'todos' | TipoInsight | 'lista';

export const TIPOS: Record<TipoInsight, { nome: string; filtro: string; selo: string; impacto: string }> = {
    crescimento: {
        nome: 'Crescimento',
        filtro: 'Crescimento',
        selo: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
        impacto: 'text-green-700 dark:text-green-300',
    },
    lucro: {
        nome: 'Lucro',
        filtro: 'Lucro',
        selo: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        impacto: 'text-amber-700 dark:text-amber-300',
    },
    custos: {
        nome: 'Custos',
        filtro: 'Custos',
        selo: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        impacto: 'text-blue-700 dark:text-blue-300',
    },
    alerta: {
        nome: 'Alerta',
        filtro: 'Alertas',
        selo: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        impacto: 'text-red-700 dark:text-red-300',
    },
    positivo: {
        nome: 'Sinal positivo',
        filtro: 'Sinais positivos',
        selo: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
        impacto: 'text-teal-700 dark:text-teal-300',
    },
};

export const PRIORIDADES: Record<PrioridadeInsight, string> = {
    alta: 'Prioridade alta',
    media: 'Prioridade média',
    baixa: 'Prioridade baixa',
    acompanhar: 'Para acompanhar',
};

export const MOTIVOS: Record<MotivoDispensa, string> = {
    ja_sei: 'Já sei disso',
    nao_se_aplica: 'Não se aplica ao meu negócio',
    numero_errado: 'Número errado',
};

export function formatarReais(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function rotuloDoPeriodo(ano: number, mes: number): string {
    const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });

    return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}
