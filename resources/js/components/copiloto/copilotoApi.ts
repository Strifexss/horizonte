import type { CopilotoAbertura, CopilotoResposta } from './types';

export class CopilotoErro extends Error {}

function tokenXsrf(): string {
    const cookie = document.cookie.split('; ').find((parte) => parte.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
}

async function requisitar<T>(url: string, metodo: 'GET' | 'POST' | 'DELETE', corpo?: Record<string, unknown>): Promise<T> {
    const resposta = await fetch(url, {
        method: metodo,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': tokenXsrf(),
        },
        body: corpo ? JSON.stringify(corpo) : undefined,
    });

    const dados = (await resposta.json().catch(() => ({}))) as { message?: string };

    if (!resposta.ok) {
        throw new CopilotoErro(dados.message ?? 'Não consegui responder agora. Tente de novo em instantes.');
    }

    return dados as T;
}

export function buscarAbertura(componente: string): Promise<CopilotoAbertura> {
    return requisitar(`${route('copiloto.abertura')}?componente=${encodeURIComponent(componente)}`, 'GET');
}

export function enviarPergunta(mensagem: string, componente: string, conversaId: string | null): Promise<CopilotoResposta> {
    return requisitar(route('copiloto.mensagens.store'), 'POST', { mensagem, componente, conversa_id: conversaId });
}

export function apagarConversa(): Promise<{ ok: boolean }> {
    return requisitar(route('copiloto.conversa.destroy'), 'DELETE');
}

export function registrarInteresse(modulo: string): Promise<{ whatsapp_url: string | null }> {
    return requisitar(route('copiloto.interesses.store'), 'POST', { modulo });
}
