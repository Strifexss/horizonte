import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import CopilotoIcone from './CopilotoIcone';
import CopilotoTexto from './CopilotoTexto';
import type { CopilotoMensagem } from './types';

type Props = {
    mensagens: CopilotoMensagem[];
    digitando: boolean;
    suporteUrl: string | null;
    onQuero: (modulo: string) => void;
};

function Avatar() {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-neutral-800 dark:text-neutral-100">
            <CopilotoIcone className="size-4" />
        </span>
    );
}

function BotaoQuero({ titulo, modulo, onQuero }: { titulo: string; modulo: string; onQuero: (modulo: string) => void }) {
    return (
        <Button type="button" variant="primary" className="self-start text-sm" onClick={() => onQuero(modulo)}>
            Quero o {titulo}
        </Button>
    );
}

export default function CopilotoMensagens({ mensagens, digitando, suporteUrl, onQuero }: Props) {
    const fim = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fim.current?.scrollIntoView({ block: 'end' });
    }, [mensagens.length, digitando]);

    return (
        <div className="flex flex-col gap-4" aria-live="polite">
            {mensagens.map((mensagem, indice) =>
                mensagem.papel === 'usuario' ? (
                    <div
                        key={indice}
                        className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2.5 text-sm leading-relaxed text-white"
                    >
                        {mensagem.texto}
                    </div>
                ) : (
                    <div key={indice} className="flex max-w-[94%] items-start gap-2.5">
                        <Avatar />
                        <div className="flex min-w-0 flex-col gap-2">
                            <div className="bg-card rounded-2xl rounded-tl-sm border px-3.5 py-3 text-sm leading-relaxed">
                                <CopilotoTexto texto={mensagem.texto} />
                            </div>
                            {mensagem.oferta ? (
                                <BotaoQuero titulo={mensagem.oferta.titulo} modulo={mensagem.oferta.modulo} onQuero={onQuero} />
                            ) : null}
                            {mensagem.semResposta && suporteUrl ? (
                                <Button asChild variant="outline" className="self-start">
                                    <a href={suporteUrl} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="size-4" />
                                        Falar com o suporte no WhatsApp
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                ),
            )}

            {digitando ? (
                <div className="flex items-center gap-2.5">
                    <Avatar />
                    <div className="bg-card flex gap-1 rounded-2xl rounded-tl-sm border px-3.5 py-3" role="status" aria-label="Copiloto digitando">
                        {[0, 1, 2].map((ponto) => (
                            <span
                                key={ponto}
                                className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full motion-reduce:animate-none"
                                style={{ animationDelay: `${ponto * 150}ms` }}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            <div ref={fim} />
        </div>
    );
}
