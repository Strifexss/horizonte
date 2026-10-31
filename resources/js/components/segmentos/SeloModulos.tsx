import type { ModuloOpcional } from './types';

type Props = {
    modulos: string[];
    catalogo: ModuloOpcional[];
};

/** Módulos opcionais incluídos; os obrigatórios não aparecem porque toda Empresa tem. */
export default function SeloModulos({ modulos, catalogo }: Props) {
    const incluidos = catalogo.filter((modulo) => modulos.includes(modulo.chave));

    if (incluidos.length === 0) {
        return <span className="text-muted-foreground text-xs">Só os obrigatórios</span>;
    }

    return (
        <span className="flex flex-wrap gap-1">
            {incluidos.map((modulo) => (
                <span
                    key={modulo.chave}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                >
                    {modulo.nome}
                </span>
            ))}
        </span>
    );
}
