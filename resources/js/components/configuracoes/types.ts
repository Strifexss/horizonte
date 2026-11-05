export type PerguntaSemResposta = {
    id: number;
    pergunta: string;
    tela: string | null;
    empresa: string | null;
    created_at: string;
};

export type InteresseModulo = {
    id: number;
    modulo: string;
    empresa: string | null;
    usuario: string | null;
    created_at: string;
};
