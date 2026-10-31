type Props = {
    filtrando: boolean;
};

export default function EmpresasEmpty({ filtrando }: Props) {
    return (
        <div className="border-sidebar-border/40 rounded-lg border border-dashed bg-white/30 p-8 text-center dark:bg-slate-900/40">
            <h3 className="text-lg font-semibold">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground mt-2 text-sm">
                {filtrando ? 'Nenhuma empresa corresponde aos filtros.' : 'Ainda não há empresas cadastradas.'}
            </p>
        </div>
    );
}
