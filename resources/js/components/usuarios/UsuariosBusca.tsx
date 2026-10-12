import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    busca: string | null;
    onBuscar: (busca: string) => void;
};

export default function UsuariosBusca({ busca, onBuscar }: Props) {
    const [valor, setValor] = useState(busca ?? '');

    useEffect(() => {
        const termo = valor.trim();

        if (termo === (busca ?? '')) {
            return;
        }

        const timer = window.setTimeout(() => onBuscar(termo), 300);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valor]);

    return (
        <div className="relative w-full md:max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
                type="search"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                aria-label="Buscar usuários"
                className="pl-9"
            />
        </div>
    );
}
