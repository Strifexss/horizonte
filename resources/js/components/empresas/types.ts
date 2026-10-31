export type EstadoAjuste = 'herdar' | 'ligar' | 'desligar';

export type EmpresaAdmin = {
    id: number;
    nome: string;
    segmento_id: number | null;
    segmento: string | null;
    modulos: string[];
    ajustes: Record<string, EstadoAjuste>;
    admin_master: { name: string; email: string; conta_google: boolean } | null;
    urls: {
        update: string;
        entrar_como: string | null;
    };
};

export type EmpresasFilters = {
    busca: string | null;
    segmento_id: number | null;
};
