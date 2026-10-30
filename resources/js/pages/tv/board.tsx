import { ESTILOS_TV, type TvBoard } from '@/components/tv/temas';
import TvPagina from '@/components/tv/TvPagina';
import TvProgresso from '@/components/tv/TvProgresso';
import { Head, router, usePage } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

type PageProps = {
    board: TvBoard | null;
};

export default function TvBoardPage() {
    const { props } = usePage<PageProps>();
    const { board } = props;
    const [sincronizando, setSincronizando] = useState(false);
    const [falhou, setFalhou] = useState(false);
    const [indice, setIndice] = useState(0);
    const estilo = ESTILOS_TV[board?.tema ?? 'dark'];
    const paginas = board?.paginas ?? [];
    const atual = paginas.length ? indice % paginas.length : 0;
    const pagina = paginas[atual];

    useEffect(() => {
        if (paginas.length < 2 || !pagina) {
            return;
        }

        const proxima = window.setTimeout(() => setIndice((anterior) => (anterior + 1) % paginas.length), pagina.duracao_segundos * 1000);

        return () => window.clearTimeout(proxima);
    }, [atual, pagina, paginas.length]);

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
                setIndice(0);
            },
            onFinish: () => {
                setSincronizando(false);
                setFalhou(!concluiu);
            },
        });
    }

    return (
        <>
            <Head title={board?.nome ?? 'Menu Board'} />
            <div className={`@container relative h-screen w-screen overflow-hidden ${estilo.fundo} ${estilo.texto}`}>
                {board && pagina ? (
                    <TvPagina key={atual} pagina={pagina} nomeBoard={board.nome} estilo={estilo} />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-[1cqw] text-center font-sans">
                        <h1 className="text-[2.9cqw] font-semibold">{board ? 'Este board ainda não tem páginas' : 'Nenhum Menu Board ativo'}</h1>
                        <p className={`text-[1.35cqw] ${estilo.suave}`}>
                            {board ? 'Adicione uma página no ERP e toque em Sync.' : 'Ative um board no ERP e toque em Sync.'}
                        </p>
                    </div>
                )}

                <TvProgresso
                    duracoes={paginas.map((item) => item.duracao_segundos)}
                    atual={atual}
                    corAtiva={estilo.regua}
                    corTrilho="bg-slate-500/30"
                    className="absolute bottom-[1.25cqw] left-[3.75cqw]"
                />

                <button
                    type="button"
                    onClick={sincronizar}
                    aria-label="Sincronizar dados do board"
                    className={`absolute right-[1.25cqw] bottom-[1cqw] inline-flex h-[2.5cqw] min-h-11 items-center gap-[0.5cqw] rounded-full px-[0.95cqw] font-sans text-[0.95cqw] font-semibold transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none ${falhou ? 'opacity-100' : 'opacity-20'} ${estilo.sync}`}
                >
                    <RefreshCw className={`size-[1.15cqw] ${sincronizando ? 'animate-spin' : ''}`} />
                    {sincronizando ? 'Sincronizando...' : falhou ? 'Sem conexão · Tentar de novo' : 'Sync'}
                </button>
            </div>
        </>
    );
}
