import { useCallback, useRef, useState } from 'react';
import { apagarConversa, buscarAbertura, CopilotoErro, enviarPergunta, registrarInteresse } from './copilotoApi';
import type { CopilotoMensagem, CopilotoOferta } from './types';

type Estado = {
    carregando: boolean;
    digitando: boolean;
    erro: string | null;
    conversaId: string | null;
    mensagens: CopilotoMensagem[];
    sugestoes: string[];
    oferta: CopilotoOferta | null;
    suporteUrl: string | null;
};

const INICIAL: Estado = {
    carregando: false,
    digitando: false,
    erro: null,
    conversaId: null,
    mensagens: [],
    sugestoes: [],
    oferta: null,
    suporteUrl: null,
};

function mensagemDeErro(erro: unknown): string {
    return erro instanceof CopilotoErro ? erro.message : 'Não consegui responder agora. Tente de novo em instantes.';
}

/** Estado do chat do Copiloto. A tela atual (componente Inertia) só serve de dica e para as sugestões. */
export function useCopiloto(componente: string) {
    const [estado, setEstado] = useState<Estado>(INICIAL);
    const ocupado = useRef(false);

    const abrir = useCallback(async (): Promise<void> => {
        setEstado((atual) => ({ ...atual, carregando: true, erro: null }));

        try {
            const abertura = await buscarAbertura(componente);
            setEstado((atual) => ({
                ...atual,
                carregando: false,
                conversaId: abertura.conversa_id,
                mensagens: abertura.mensagens,
                sugestoes: abertura.sugestoes,
                oferta: abertura.oferta,
                suporteUrl: abertura.suporte_url,
            }));
        } catch (erro) {
            setEstado((atual) => ({ ...atual, carregando: false, erro: mensagemDeErro(erro) }));
        }
    }, [componente]);

    const perguntar = useCallback(
        async (texto: string): Promise<void> => {
            const mensagem = texto.trim();

            if (mensagem === '' || ocupado.current) {
                return;
            }

            ocupado.current = true;
            setEstado((atual) => ({
                ...atual,
                digitando: true,
                erro: null,
                mensagens: [...atual.mensagens, { papel: 'usuario', texto: mensagem }],
            }));

            try {
                const resposta = await enviarPergunta(mensagem, componente, estado.conversaId);
                setEstado((atual) => ({
                    ...atual,
                    digitando: false,
                    conversaId: resposta.conversa_id,
                    suporteUrl: resposta.suporte_url,
                    mensagens: [...atual.mensagens, { papel: 'copiloto', texto: resposta.resposta, semResposta: !resposta.respondeu }],
                }));
            } catch (erro) {
                setEstado((atual) => ({ ...atual, digitando: false, erro: mensagemDeErro(erro) }));
            } finally {
                ocupado.current = false;
            }
        },
        [componente, estado.conversaId],
    );

    const novaConversa = useCallback(async (): Promise<void> => {
        try {
            await apagarConversa();
            setEstado((atual) => ({ ...atual, conversaId: null, mensagens: [], erro: null }));
        } catch (erro) {
            setEstado((atual) => ({ ...atual, erro: mensagemDeErro(erro) }));
        }
    }, []);

    /** Mostra os benefícios do módulo sem chamar a IA. */
    const verOferta = useCallback((oferta: CopilotoOferta): void => {
        setEstado((atual) => ({
            ...atual,
            mensagens: [...atual.mensagens, { papel: 'usuario', texto: oferta.oferta }, { papel: 'copiloto', texto: oferta.texto, oferta }],
        }));
    }, []);

    const quero = useCallback(async (modulo: string): Promise<void> => {
        // A janela abre no clique (antes do await) para o navegador não bloquear como pop-up.
        const janela = window.open('', '_blank');

        if (janela) {
            janela.opener = null;
        }

        try {
            const { whatsapp_url } = await registrarInteresse(modulo);

            if (whatsapp_url && janela) {
                janela.location.href = whatsapp_url;
            } else {
                janela?.close();
            }
        } catch (erro) {
            janela?.close();
            setEstado((atual) => ({ ...atual, erro: mensagemDeErro(erro) }));
        }
    }, []);

    return { ...estado, abrir, perguntar, novaConversa, verOferta, quero };
}
