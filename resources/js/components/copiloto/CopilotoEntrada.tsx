import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Props = {
    desabilitado: boolean;
    onEnviar: (pergunta: string) => void;
};

export default function CopilotoEntrada({ desabilitado, onEnviar }: Props) {
    const [texto, setTexto] = useState('');

    function enviar(evento: FormEvent<HTMLFormElement>): void {
        evento.preventDefault();

        if (texto.trim() === '' || desabilitado) {
            return;
        }

        onEnviar(texto);
        setTexto('');
    }

    return (
        <form onSubmit={enviar} className="flex items-center gap-2">
            <label htmlFor="copiloto-pergunta" className="sr-only">
                Pergunta para o Copiloto
            </label>
            <input
                id="copiloto-pergunta"
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                maxLength={1000}
                autoComplete="off"
                placeholder="Pergunte ao Copiloto…"
                className="border-input bg-background focus-visible:ring-ring h-11 min-w-0 flex-1 rounded-xl border px-3.5 text-base outline-none focus-visible:ring-2 md:text-sm"
            />
            <Button
                type="submit"
                variant="primary"
                size="icon"
                className="size-11 shrink-0 rounded-xl"
                disabled={desabilitado || texto.trim() === ''}
            >
                <SendHorizontal className="size-4" />
                <span className="sr-only">Enviar</span>
            </Button>
        </form>
    );
}
