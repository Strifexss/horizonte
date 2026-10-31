export type ModuloOpcional = {
    chave: string;
    nome: string;
    descricao: string;
};

export type Segmento = {
    id: number;
    chave: string;
    nome: string;
    descricao: string | null;
    modulos: string[];
    ativo: boolean;
    empresas_count?: number;
    urls?: {
        update: string;
        destroy: string;
    };
};
