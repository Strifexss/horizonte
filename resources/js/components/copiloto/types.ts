export type CopilotoMensagem = {
    papel: 'usuario' | 'copiloto';
    texto: string;
    /** Resposta em que o Copiloto não soube ajudar: mostra o botão do suporte. */
    semResposta?: boolean;
    /** Mensagem local com os benefícios de um módulo (não passa pela IA). */
    oferta?: CopilotoOferta;
};

export type CopilotoOferta = {
    modulo: string;
    titulo: string;
    oferta: string;
    texto: string;
};

export type CopilotoAbertura = {
    conversa_id: string | null;
    mensagens: CopilotoMensagem[];
    sugestoes: string[];
    oferta: CopilotoOferta | null;
    suporte_url: string | null;
};

export type CopilotoResposta = {
    conversa_id: string;
    resposta: string;
    respondeu: boolean;
    suporte_url: string | null;
};
