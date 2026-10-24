export type NovidadeCategoria = 'novo' | 'melhoria' | 'correcao';

export type NovidadeStatus = 'rascunho' | 'publicado';

export const CATEGORIAS_NOVIDADE: Record<NovidadeCategoria, string> = {
    novo: 'Novo',
    melhoria: 'Melhoria',
    correcao: 'Correção',
};

export type NovidadeImagem = {
    id: number;
    url: string;
};

export type Novidade = {
    id: number;
    titulo: string;
    descricao: string;
    categoria: NovidadeCategoria;
    status: NovidadeStatus;
    popup_automatico: boolean;
    imagens: NovidadeImagem[];
    cta_url: string | null;
    publicada_em: string | null;
    dispensas_count: number;
    urls: {
        update: string;
        destroy: string;
        status: string;
        relancar: string;
    };
};

/** Usuário do sistema e a data em que dispensou a novidade aberta no painel. */
export type UsuarioDispensa = {
    id: number;
    name: string;
    email: string;
    dispensada_em: string | null;
    urls: {
        marcar: string;
        desmarcar: string;
    };
};

/** Novidade publicada como o usuário final recebe (pop-up e gaveta). */
export type NovidadePublicada = {
    id: number;
    titulo: string;
    descricao: string;
    categoria: NovidadeCategoria;
    imagens: NovidadeImagem[];
    cta_url: string | null;
    publicada_em: string | null;
    dispensada: boolean;
    urls: {
        dispensar: string;
    };
};

/** Arquivo da pasta de imagens das novidades. */
export type ImagemDoDiretorio = {
    arquivo: string;
    url: string;
    tamanho: number;
    modificado_em: string;
    novidade: { id: number; titulo: string } | null;
    urls: {
        destroy: string;
    };
};

export type NovidadesUrls = {
    usuarios: string;
    index: string;
    store: string;
};

export type NovidadesSharedProps = {
    novidades_pendentes?: NovidadePublicada[];
    novidades?: NovidadePublicada[];
};
