export type Usuario = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
    urls: {
        update: string;
        destroy: string;
        entrar_como: string;
    };
};

export type UsuariosUrls = {
    index: string;
    store: string;
};

export type UsuariosFilters = {
    busca: string | null;
};
