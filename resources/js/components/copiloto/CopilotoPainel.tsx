import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import CopilotoEntrada from './CopilotoEntrada';
import CopilotoIcone from './CopilotoIcone';
import CopilotoInicio from './CopilotoInicio';
import CopilotoMensagens from './CopilotoMensagens';
import { useCopiloto } from './useCopiloto';

function Carregando() {
    return (
        <div className="animate-pulse space-y-3 pt-2" aria-hidden="true">
            <div className="bg-muted h-4 w-2/3 rounded" />
            <div className="bg-muted h-3 w-5/6 rounded" />
            <div className="bg-muted h-11 rounded-xl" />
            <div className="bg-muted h-11 rounded-xl" />
            <div className="bg-muted h-11 rounded-xl" />
        </div>
    );
}

/**
 * Chat de ajuda do Copiloto, aberto pelo headset no header. Gratuito para toda Empresa.
 * Desktop: painel lateral. Celular: folha de baixo com 85% da altura.
 */
export default function CopilotoPainel() {
    const { component, props } = usePage<SharedData>();
    const isMobile = useIsMobile();
    const [aberto, setAberto] = useState(false);
    const copiloto = useCopiloto(component);
    const primeiroNome = props.auth.user.name.trim().split(/\s+/)[0];
    const conversaVazia = copiloto.mensagens.length === 0 && !copiloto.digitando;

    function alternar(abrir: boolean): void {
        setAberto(abrir);

        if (abrir) {
            void copiloto.abrir();
        }
    }

    return (
        <Sheet open={aberto} onOpenChange={alternar}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        'h-9 gap-2 px-2.5 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:text-neutral-100 dark:hover:bg-neutral-800',
                        aberto && 'bg-blue-50 dark:bg-neutral-800',
                    )}
                >
                    <CopilotoIcone className="size-5" />
                    <span className="hidden text-sm font-medium sm:inline">Copiloto</span>
                    <span className="sr-only sm:hidden">Copiloto</span>
                </Button>
            </SheetTrigger>

            <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                className={cn('flex flex-col gap-0 p-0', isMobile ? 'h-[85dvh] max-h-[85dvh] rounded-t-2xl' : 'w-full sm:max-w-md')}
            >
                <SheetHeader className="flex-row items-center gap-3 space-y-0 border-b px-4 py-3 pr-12 text-left">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <CopilotoIcone className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <SheetTitle className="text-base">Copiloto</SheetTitle>
                        <SheetDescription className="text-xs">Tira dúvidas de uso do Horizonte</SheetDescription>
                    </div>
                    {!conversaVazia ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 shrink-0 gap-1.5 px-2.5 text-xs"
                            onClick={() => void copiloto.novaConversa()}
                        >
                            <Plus className="size-4" />
                            Nova conversa
                        </Button>
                    ) : null}
                </SheetHeader>

                <div className="bg-muted/30 min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    {copiloto.carregando ? (
                        <Carregando />
                    ) : conversaVazia ? (
                        <CopilotoInicio
                            primeiroNome={primeiroNome}
                            sugestoes={copiloto.sugestoes}
                            oferta={copiloto.oferta}
                            onSugestao={(pergunta) => void copiloto.perguntar(pergunta)}
                            onOferta={copiloto.verOferta}
                        />
                    ) : (
                        <CopilotoMensagens
                            mensagens={copiloto.mensagens}
                            digitando={copiloto.digitando}
                            suporteUrl={copiloto.suporteUrl}
                            onQuero={(modulo) => void copiloto.quero(modulo)}
                        />
                    )}

                    {copiloto.erro ? (
                        <p
                            role="alert"
                            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                        >
                            {copiloto.erro}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2 border-t px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <CopilotoEntrada
                        desabilitado={copiloto.digitando || copiloto.carregando}
                        onEnviar={(pergunta) => void copiloto.perguntar(pergunta)}
                    />
                    <p className="text-muted-foreground text-center text-xs">O Copiloto pode errar. Não digite senhas ou dados pessoais.</p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
