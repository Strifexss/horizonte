import { Sparkles } from 'lucide-react';
import type { CopilotoOferta } from './types';

type Props = {
    primeiroNome: string;
    sugestoes: string[];
    oferta: CopilotoOferta | null;
    onSugestao: (pergunta: string) => void;
    onOferta: (oferta: CopilotoOferta) => void;
};

const BOTAO = 'min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors';

export default function CopilotoInicio({ primeiroNome, sugestoes, oferta, onSugestao, onOferta }: Props) {
    return (
        <div className="flex flex-col gap-5 pt-2">
            <div>
                <p className="text-base font-semibold">Olá, {primeiroNome}! Como posso ajudar?</p>
                <p className="text-muted-foreground mt-1 text-sm">Tire dúvidas sobre como usar o Horizonte. Algumas perguntas para começar:</p>
            </div>

            <div className="flex flex-col gap-2">
                {sugestoes.map((sugestao) => (
                    <button
                        key={sugestao}
                        type="button"
                        onClick={() => onSugestao(sugestao)}
                        className={`${BOTAO} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800`}
                    >
                        {sugestao}
                    </button>
                ))}

                {oferta ? (
                    <button
                        type="button"
                        onClick={() => onOferta(oferta)}
                        className={`${BOTAO} flex items-center gap-2 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/70`}
                    >
                        <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                        <span>{oferta.oferta}</span>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
