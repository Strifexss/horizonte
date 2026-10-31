type Props = {
    ativo: boolean;
};

export default function SeloAtivo({ ativo }: Props) {
    return ativo ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Ativo
        </span>
    ) : (
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            Inativo
        </span>
    );
}
