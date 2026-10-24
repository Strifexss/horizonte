import MenuBoardsForm from '@/components/menu-boards/MenuBoardsForm';
import type { MenuBoardEdicao, PareamentoTv, ProdutoDoBoard } from '@/components/menu-boards/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type PageProps = {
    board: MenuBoardEdicao | null;
    produtos: ProdutoDoBoard[];
    pareamento: PareamentoTv;
};

export default function MenuBoardsFormPage() {
    const { props } = usePage<PageProps>();
    const { board, produtos, pareamento } = props;
    const titulo = board ? 'Editar Menu Board' : 'Novo Menu Board';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menu Board', href: '/menu-boards' },
        { title: board ? board.nome : 'Novo', href: board ? route('menu-boards.edit', board.id) : route('menu-boards.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={titulo} />
            <MenuBoardsForm key={board?.id ?? 'novo'} titulo={titulo} board={board} produtos={produtos} pareamento={pareamento} />
        </AppLayout>
    );
}
