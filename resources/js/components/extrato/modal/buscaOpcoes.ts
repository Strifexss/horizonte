import type { ExtratoOpcao, TipoLancamento } from './types';

async function buscarOpcoes(url: string): Promise<ExtratoOpcao[]> {
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
}

export function carregarContas(q: string = ''): Promise<ExtratoOpcao[]> {
    return buscarOpcoes(`/contas/autocomplete?q=${encodeURIComponent(q)}`);
}

export function carregarCategorias(q: string, tipo: TipoLancamento): Promise<ExtratoOpcao[]> {
    return buscarOpcoes(`/categorias/autocomplete?q=${encodeURIComponent(q)}&tipo=${encodeURIComponent(tipo.toLowerCase())}`);
}

export function carregarProdutos(q: string = ''): Promise<ExtratoOpcao[]> {
    return buscarOpcoes(`/produtos/autocomplete?q=${encodeURIComponent(q)}`);
}

export function carregarFornecedores(q: string = ''): Promise<ExtratoOpcao[]> {
    return buscarOpcoes(`/fornecedores/autocomplete?q=${encodeURIComponent(q)}`);
}

export function carregarFuncionarios(q: string = ''): Promise<ExtratoOpcao[]> {
    return buscarOpcoes(`/funcionarios/autocomplete?q=${encodeURIComponent(q)}`);
}
