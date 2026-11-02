import { parseMoneyValue } from '@/components/ui/money-input';
import type { ExtratoModalParcela, ExtratoOpcao, TipoLancamento } from './types';

export const NOME_FORMA_PADRAO = 'Espécie';

export function hojeISO(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

export function toInputValue(v: number | string | null | undefined): string {
    if (v === null || v === undefined) return '';
    return String(v);
}

export function toMoneyFormValue(input: unknown): string {
    const parsed = parseMoneyValue(input);
    if (parsed !== null) {
        return parsed.toFixed(2);
    }
    if (input === null || input === undefined) {
        return '';
    }
    return String(input);
}

/** Id numérico para o form; ausente (ou 0) vira `null`. */
export function idNumericoOuNull(id: number | string | null | undefined): number | null {
    return id ? Number(id) : null;
}

export function isCategoriaProduto(cat: ExtratoOpcao | null | undefined): boolean {
    if (!cat) return false;
    return String(cat.nome).toUpperCase() === 'PRODUTO' && Number(cat.padrao ?? 0) === 1;
}

export function isCategoriaSalario(cat: ExtratoOpcao | null | undefined): boolean {
    if (!cat) return false;
    return String(cat.nome).toUpperCase() === 'SALÁRIO' && Number(cat.padrao ?? 0) === 1;
}

export function tipoDaParcela(parcela: ExtratoModalParcela | null | undefined): TipoLancamento {
    return String(parcela?.tipo ?? parcela?.financeiro?.tipo ?? 'DESPESA').toUpperCase() === 'RECEITA' ? 'RECEITA' : 'DESPESA';
}

/** Nome digitado numa opção "+ Cadastrar" do `AsyncSelect`; `null` quando a opção é um registro existente. */
export function nomeDaOpcaoNova(opcao: ExtratoOpcao | null): string | null {
    if (!opcao?.__create) {
        return null;
    }

    return String(opcao.__createName ?? opcao.nome).trim();
}

export function rotuloTipo(tipo: TipoLancamento): string {
    return tipo === 'RECEITA' ? 'receita' : 'despesa';
}
