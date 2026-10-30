import MenuBoardsForm from '@/components/menu-boards/MenuBoardsForm';
import type { MenuBoardEdicao, PareamentoTv, ProdutoDoBoard } from '@/components/menu-boards/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type PageProps = {
    board: MenuBoardEdicao | null;
    produtos: ProdutoDoBoard[];
    pareamento: PareamentoTv;
};

export default function MenuBoardsFormPage() {
    const { props } = usePage<PageProps>();
    const { board, produtos, pareamento } = props;
    const titulo = board ? 'Editar Menu Board' : 'Novo Menu Board';

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const anterior = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlHeight: html.style.height,
            bodyHeight: body.style.height,
        };

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        html.style.height = '100%';
        body.style.height = '100%';

        return () => {
            html.style.overflow = anterior.htmlOverflow;
            body.style.overflow = anterior.bodyOverflow;
            html.style.height = anterior.htmlHeight;
            body.style.height = anterior.bodyHeight;
        };
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menu Board', href: '/menu-boards' },
        { title: board ? board.nome : 'Novo', href: board ? route('menu-boards.edit', board.id) : route('menu-boards.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={titulo} />
            <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-clip">
                <MenuBoardsForm key={board?.id ?? 'novo'} titulo={titulo} board={board} produtos={produtos} pareamento={pareamento} />
            </div>
        </AppLayout>
    );
}
