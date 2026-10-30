import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import { formatarHora, type PareamentoTv, type TvDispositivoItem } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Copy, Info, RefreshCw, Tv } from 'lucide-react';
import { useState } from 'react';

type Props = {
    pareamento: PareamentoTv;
};

export default function MenuBoardsPareamento({ pareamento }: Props) {
    const [copiado, setCopiado] = useState(false);
    const [gerando, setGerando] = useState(false);
    const [desconectar, setDesconectar] = useState<TvDispositivoItem | null>(null);
    const [desconectando, setDesconectando] = useState(false);

    function copiarUrl(): void {
        void navigator.clipboard?.writeText(pareamento.url).then(() => setCopiado(true));
    }

    function gerarPin(): void {
        router.post(
            route('tv.pin.store'),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setGerando(true),
                onFinish: () => setGerando(false),
            },
        );
    }

    function confirmarDesconexao(): void {
        if (!desconectar) {
            return;
        }

        router.delete(route('tv.dispositivos.destroy', desconectar.id), {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setDesconectando(true),
            onFinish: () => {
                setDesconectando(false);
                setDesconectar(null);
            },
        });
    }

    return (
        <aside className="flex flex-col gap-4">
            <section
                aria-labelledby="pareamento-titulo"
                className="border-sidebar-border/70 flex flex-col gap-5 rounded-xl border bg-white p-4 shadow-sm md:p-6 dark:bg-slate-900"
            >
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#082845] text-blue-400">
                        <Tv className="size-[18px]" />
                    </span>
                    <h2 id="pareamento-titulo" className="text-base font-semibold">
                        Pareamento de TV
                    </h2>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">1. Abra este endereço no navegador da TV</span>
                    <div className="flex items-center gap-2 rounded-md border bg-slate-50 py-1 pr-1 pl-3 dark:bg-slate-800">
                        <code className="min-w-0 flex-1 truncate font-mono text-sm">{pareamento.url}</code>
                        <Button type="button" variant="outline" size="sm" onClick={copiarUrl}>
                            <Copy />
                            {copiado ? 'Copiado' : 'Copiar'}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">2. Digite o PIN na TV</span>
                    {pareamento.pin ? (
                        <>
                            <div role="group" aria-label={`PIN de pareamento ${pareamento.pin}`} className="grid grid-cols-4 gap-2">
                                {pareamento.pin.split('').map((digito, indice) => (
                                    <span
                                        key={indice}
                                        className="flex h-16 items-center justify-center rounded-lg bg-[#082845] text-3xl font-semibold text-white tabular-nums"
                                    >
                                        {digito}
                                    </span>
                                ))}
                            </div>
                            <span className="text-muted-foreground text-xs">
                                Válido até {formatarHora(pareamento.pin_expira_em)} e para uma única TV.
                            </span>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-sm">Nenhum PIN ativo. Gere um PIN para conectar uma TV.</p>
                    )}
                </div>

                <Button type="button" variant="outline" className="h-11 md:h-10" loading={gerando} onClick={gerarPin}>
                    <RefreshCw />
                    Gerar Novo PIN de Pareamento
                </Button>

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-muted-foreground text-xs font-semibold">TVS CONECTADAS</span>
                    {pareamento.dispositivos.length ? (
                        <ul className="flex flex-col gap-2">
                            {pareamento.dispositivos.map((dispositivo) => (
                                <li key={dispositivo.id} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{dispositivo.nome}</p>
                                        <p className="text-muted-foreground text-xs">
                                            Último acesso às {formatarHora(dispositivo.ultimo_acesso_em ?? dispositivo.conectada_em)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => setDesconectar(dispositivo)}
                                    >
                                        Desconectar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">Nenhuma TV conectada.</p>
                    )}
                </div>
            </section>

            <section className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>A TV não atualiza sozinha. Depois de salvar ou ativar um board, toque em Sync no canto da TV.</p>
            </section>

            <ConfirmDeleteModal
                open={desconectar !== null}
                onOpenChange={(aberto) => {
                    if (!aberto) {
                        setDesconectar(null);
                    }
                }}
                title="Desconectar TV"
                description={`A TV "${desconectar?.nome ?? ''}" volta para a tela de PIN e precisa ser pareada de novo.`}
                confirmLabel="Desconectar"
                processing={desconectando}
                onConfirm={confirmarDesconexao}
            />
        </aside>
    );
}
