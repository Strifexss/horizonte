import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import MenuBoardsCard from '@/components/menu-boards/MenuBoardsCard';
import MenuBoardsEmpty from '@/components/menu-boards/MenuBoardsEmpty';
import MenuBoardsPareamento from '@/components/menu-boards/MenuBoardsPareamento';
import MenuBoardsSkeleton from '@/components/menu-boards/MenuBoardsSkeleton';
import type { MenuBoardResumo, PareamentoTv } from '@/components/menu-boards/types';
import { MobileFab, PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Tv } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menu Board',
        href: '/menu-boards',
    },
];

type PageProps = {
    boards?: MenuBoardResumo[];
    pareamento: PareamentoTv;
};

export default function MenuBoardsIndex() {
    const { props } = usePage<PageProps>();
    const [ativandoId, setAtivandoId] = useState<number | null>(null);
    const [boardToDelete, setBoardToDelete] = useState<MenuBoardResumo | null>(null);
    const [deleting, setDeleting] = useState(false);

    function ativar(board: MenuBoardResumo): void {
        router.post(
            route('menu-boards.ativar', board.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setAtivandoId(board.id),
                onFinish: () => setAtivandoId(null),
            },
        );
    }

    function excluir(): void {
        if (!boardToDelete) {
            return;
        }

        router.delete(route('menu-boards.destroy', boardToDelete.id), {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => {
                setDeleting(false);
                setBoardToDelete(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Board" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
                <PageTitle
                    title="Meus Menu Boards"
                    mobileTitle="Menu Boards"
                    subtitle="Monte cardápios para a TV do balcão. Só um board fica ativo na TV por vez."
                    actions={
                        <Button variant="primary" size="default" className="hidden items-center gap-2 md:inline-flex" asChild>
                            <Link href={route('menu-boards.create')}>
                                <Plus className="h-4 w-4" />
                                Novo Menu Board
                            </Link>
                        </Button>
                    }
                />

                <MobileFab
                    actions={[
                        {
                            key: 'novo-menu-board',
                            label: '+ Novo Menu Board',
                            icon: <Tv className="h-4 w-4" />,
                            className: 'bg-amber-500 text-white hover:bg-amber-600',
                            onClick: () => router.visit(route('menu-boards.create')),
                        },
                    ]}
                />

                <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-[999_1_560px]">
                        <Deferred data="boards" fallback={<MenuBoardsSkeleton />}>
                            {props.boards?.length ? (
                                <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                                    {props.boards.map((board) => (
                                        <MenuBoardsCard
                                            key={board.id}
                                            board={board}
                                            ativando={ativandoId === board.id}
                                            onAtivar={ativar}
                                            onDelete={setBoardToDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <MenuBoardsEmpty />
                            )}
                        </Deferred>
                    </div>
                    <div className="min-w-0 flex-[1_1_320px]">
                        <MenuBoardsPareamento pareamento={props.pareamento} />
                    </div>
                </div>

                <ConfirmDeleteModal
                    open={boardToDelete !== null}
                    onOpenChange={(aberto) => {
                        if (!aberto) {
                            setBoardToDelete(null);
                        }
                    }}
                    title="Excluir Menu Board"
                    description={`Deseja excluir o board "${boardToDelete?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
                    processing={deleting}
                    onConfirm={excluir}
                />
            </div>
        </AppLayout>
    );
}
