import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

type Props<T> = {
    titulo: string;
    descricao: string;
    vazio: string;
    itens: T[];
    render: (item: T) => ReactNode;
};

export function formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data.replace(' ', 'T')));
}

export default function ConfiguracoesListaCopiloto<T extends { id: number }>({ titulo, descricao, vazio, itens, render }: Props<T>) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{titulo}</CardTitle>
                <CardDescription>{descricao}</CardDescription>
            </CardHeader>
            <CardContent>
                {itens.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center text-sm">{vazio}</p>
                ) : (
                    <ul className="divide-y">
                        {itens.map((item) => (
                            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                                {render(item)}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
