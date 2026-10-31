import type { Segmento } from '@/components/segmentos/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { EmpresasFilters } from './types';

type Props = {
    filtros: EmpresasFilters;
    segmentos: Segmento[];
    onFiltrar: (filtros: EmpresasFilters) => void;
};

export default function EmpresasFiltros({ filtros, segmentos, onFiltrar }: Props) {
    const [busca, setBusca] = useState(filtros.busca ?? '');

    useEffect(() => {
        const termo = busca.trim();

        if (termo === (filtros.busca ?? '')) {
            return;
        }

        const timer = window.setTimeout(() => onFiltrar({ ...filtros, busca: termo || null }), 300);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca]);

    return (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-sm">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar empresa ou e-mail"
                    aria-label="Buscar empresas"
                    className="pl-9"
                />
            </div>
            <select
                aria-label="Filtrar por segmento"
                value={filtros.segmento_id ?? ''}
                onChange={(e) => onFiltrar({ ...filtros, segmento_id: e.target.value === '' ? null : Number(e.target.value) })}
                className="border-input bg-background h-9 rounded-md border px-3 text-sm md:w-56"
            >
                <option value="">Todos os segmentos</option>
                {segmentos.map((segmento) => (
                    <option key={segmento.id} value={segmento.id}>
                        {segmento.nome}
                    </option>
                ))}
            </select>
        </div>
    );
}
