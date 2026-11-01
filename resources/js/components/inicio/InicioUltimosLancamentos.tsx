import { ExtratoCardContent } from '@/components/extrato/ExtratoMobileCardList';
import { extratoTableColumns } from '@/components/extrato/ExtratoTableColumns';
import type { ExtratoParcela } from '@/components/extrato/types';
import { MobileCardList, TableWithFilters } from '@/components/padrões';
import { Link, router } from '@inertiajs/react';
import { useMemo } from 'react';

const COLUNAS = ['data', 'descricao', 'categoria', 'forma_pagamento', 'valor', 'status'];

function abrirExtrato(): void {
    router.visit(route('extrato.index'));
}

export default function InicioUltimosLancamentos({ lancamentos }: { lancamentos?: ExtratoParcela[] }) {
    const columns = useMemo(
        () => extratoTableColumns({ onEdit: abrirExtrato, onDelete: abrirExtrato }).filter((coluna) => COLUNAS.includes(coluna.key)),
        [],
    );
    const data = lancamentos ?? [];

    return (
        <section aria-label="Últimos lançamentos">
            <TableWithFilters
                columns={columns}
                data={data}
                loaded={lancamentos !== undefined}
                onRowClick={abrirExtrato}
                toolbar={
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold">Últimos lançamentos</h2>
                        <Link href={route('extrato.index')} className="text-primary text-sm font-medium hover:underline">
                            Ver Extrato completo
                        </Link>
                    </div>
                }
                mobile={
                    <MobileCardList
                        items={data}
                        getKey={(item, index) => String(item.id ?? index)}
                        renderContent={(item) => <ExtratoCardContent item={item} />}
                        onPress={abrirExtrato}
                        actions={() => []}
                    />
                }
                empty={
                    <p className="text-muted-foreground text-sm">
                        Nenhum lançamento ainda. Faça uma venda ou lance uma receita ou despesa para ver aqui.
                    </p>
                }
            />
        </section>
    );
}
