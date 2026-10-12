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
    autocomplete: string;
    transfer: string;
    /** Contém o marcador `__ID__`, substituído pelo id do usuário de origem. */
    transfer_counts: string;
};

export type UsuariosFilters = {
    busca: string | null;
};
