import TvCardDestaque from '@/components/tv/TvCardDestaque';
import TvCardItem from '@/components/tv/TvCardItem';
import { ESTILOS_TV, type TvBoard } from '@/components/tv/temas';
import { Head, router, usePage } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

type PageProps = {
    board: TvBoard | null;
};

export default function TvBoardPage() {
    const { props } = usePage<PageProps>();
    const { board } = props;
    const [sincronizando, setSincronizando] = useState(false);
    const [falhou, setFalhou] = useState(false);
    const estilo = ESTILOS_TV[board?.tema ?? 'dark'];

    function sincronizar(): void {
        if (sincronizando) {
            return;
        }

        let concluiu = false;

        router.reload({
            only: ['board'],
            onStart: () => setSincronizando(true),
            onSuccess: () => {
                concluiu = true;
            },
            onFinish: () => {
                setSincronizando(false);
                setFalhou(!concluiu);
            },
        });
    }

    const colunasDestaque = Math.min(Math.max(board?.destaques.length ?? 1, 1), 3);
    const colunasItens = (board?.itens.length ?? 0) > 9 ? 4 : 3;

    return (
        <>
            <Head title={board?.nome ?? 'Menu Board'} />
            <main
                className={`relative flex h-screen w-screen flex-col gap-[1.25vw] overflow-hidden px-[3.75vw] py-[2.5vw] font-sans ${estilo.fundo} ${estilo.texto}`}
            >
                {board ? (
                    <>
                        <header>
                            <h1 className={`text-[3.3vw] leading-none tracking-tight ${estilo.peso}`}>{board.nome}</h1>
                        </header>

                        <div aria-hidden="true" className={`h-[0.2vw] w-[5vw] rounded-sm ${estilo.regua}`} />

                        {board.destaques.length ? (
                            <section
                                aria-label="Destaques"
                                className="grid h-[19.8vw] gap-[1.05vw]"
                                style={{ gridTemplateColumns: `repeat(${colunasDestaque}, minmax(0, 1fr))` }}
                            >
                                {board.destaques.map((produto) => (
                                    <TvCardDestaque key={produto.id} produto={produto} estilo={estilo} />
                                ))}
                            </section>
                        ) : null}

                        {board.itens.length ? (
                            <>
                                <h2 className={`mt-[0.2vw] text-[1.15vw] font-semibold tracking-[0.2em] uppercase ${estilo.suave}`}>Cardápio</h2>
                                <section
                                    aria-label="Cardápio"
                                    className="grid gap-x-[1.05vw] gap-y-[0.85vw]"
                                    style={{ gridTemplateColumns: `repeat(${colunasItens}, minmax(0, 1fr))` }}
                                >
                                    {board.itens.map((produto) => (
                                        <TvCardItem key={produto.id} produto={produto} estilo={estilo} />
                                    ))}
                                </section>
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-[1vw] text-center">
                        <h1 className="text-[2.9vw] font-semibold">Nenhum Menu Board ativo</h1>
                        <p className={`text-[1.35vw] ${estilo.suave}`}>Ative um board no ERP e toque em Sync.</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={sincronizar}
                    aria-label="Sincronizar dados do board"
                    className={`absolute right-[1.25vw] bottom-[1vw] inline-flex h-[2.5vw] min-h-11 items-center gap-[0.5vw] rounded-full px-[0.95vw] text-[0.95vw] font-semibold transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none ${falhou ? 'opacity-100' : 'opacity-20'} ${estilo.sync}`}
                >
                    <RefreshCw className={`size-[1.15vw] ${sincronizando ? 'animate-spin' : ''}`} />
                    {sincronizando ? 'Sincronizando...' : falhou ? 'Sem conexão · Tentar de novo' : 'Sync'}
                </button>
            </main>
        </>
    );
}
