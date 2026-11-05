import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogBody, FormDialogContent, FormDialogFooter, FormDialogHeader } from '@/components/ui/form-dialog';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

type Erros = Partial<Record<string, string | undefined>>;

type CorrecaoContexto = {
    /** Elemento do modal de correção que recebe os campos com erro, quando ele está aberto. */
    alvo: HTMLElement | null;
    erros: Erros;
    registrar: (nomes: string[]) => () => void;
};

const Contexto = React.createContext<CorrecaoContexto | null>(null);

function nomesComErro(erros: Erros): string[] {
    return Object.keys(erros).filter((nome) => Boolean(erros[nome]));
}

type FormDialogCorrecaoProps = {
    /** `errors` do useForm. Cada resposta com erro abre o modal de correção. */
    errors: Erros;
    /** id do `<form>` principal: o "Corrigir e salvar" envia esse formulário. */
    formId: string;
    processing?: boolean;
    titulo?: string;
    children: React.ReactNode;
};

/**
 * Padrão de validação dos modais (como na venda): quando o salvar volta com erro, abre um modal
 * por cima mostrando só os campos com erro. Os campos são os mesmos do formulário (marcados com
 * `FormDialogField`), levados para dentro do modal enquanto ele está aberto.
 */
function FormDialogCorrecao({ errors, formId, processing = false, titulo = 'Corrigir cadastro', children }: FormDialogCorrecaoProps) {
    const [aberto, setAberto] = React.useState(false);
    const [alvo, setAlvo] = React.useState<HTMLElement | null>(null);
    const [registrados, setRegistrados] = React.useState<Record<string, number>>({});

    const pendentes = nomesComErro(errors);

    // O useForm entrega um objeto de erros novo a cada resposta: com erro, abre; sem erro, fecha.
    React.useEffect(() => {
        setAberto(nomesComErro(errors).length > 0);
    }, [errors]);

    const registrar = React.useCallback((nomes: string[]) => {
        setRegistrados((atual) => {
            const proximo = { ...atual };
            nomes.forEach((nome) => (proximo[nome] = (proximo[nome] ?? 0) + 1));
            return proximo;
        });

        return () =>
            setRegistrados((atual) => {
                const proximo = { ...atual };
                nomes.forEach((nome) => (proximo[nome] = (proximo[nome] ?? 1) - 1));
                return proximo;
            });
    }, []);

    const contexto = React.useMemo<CorrecaoContexto>(() => ({ alvo: aberto ? alvo : null, erros: errors, registrar }), [aberto, alvo, errors, registrar]);

    // Erros sem campo na tela (ex.: regra geral) aparecem como texto no modal.
    const semCampo = pendentes.filter((nome) => !registrados[nome]).map((nome) => errors[nome] as string);
    const quantidade = pendentes.length;

    return (
        <Contexto.Provider value={contexto}>
            {children}

            <Dialog open={aberto} onOpenChange={setAberto}>
                <FormDialogContent
                    className="md:w-[480px]"
                    onInteractOutside={(event) => {
                        // Os campos chegam aqui por portal: no DOM estão dentro do modal, mas na árvore do React
                        // continuam no formulário, e o Radix trataria o foco neles como "fora". Não é.
                        if (alvo && event.target instanceof Node && alvo.contains(event.target)) {
                            event.preventDefault();
                        }
                    }}
                >
                    <FormDialogHeader title={titulo} description="Só aparecem aqui os campos que precisam de ajuste." hideDescriptionOnMobile />

                    <FormDialogBody>
                        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>
                                Falta pouco: corrija {quantidade} {quantidade === 1 ? 'ponto' : 'pontos'} para salvar.
                            </span>
                        </div>

                        {semCampo.map((mensagem) => (
                            <p key={mensagem} className="text-sm text-red-600">
                                {mensagem}
                            </p>
                        ))}

                        <div ref={setAlvo} className="flex flex-col gap-4" />
                    </FormDialogBody>

                    <FormDialogFooter>
                        <Button type="button" variant="secondary" className="w-full md:w-auto" onClick={() => setAberto(false)}>
                            Voltar
                        </Button>
                        <Button type="submit" form={formId} variant="confirm" className="w-full md:w-auto" disabled={processing}>
                            Corrigir e salvar
                        </Button>
                    </FormDialogFooter>
                </FormDialogContent>
            </Dialog>
        </Contexto.Provider>
    );
}

type FormDialogFieldProps = React.HTMLAttributes<HTMLDivElement> & {
    /** Nome(s) do campo no backend, como aparecem em `errors`. */
    name: string | string[];
};

/**
 * Envolve um campo do formulário. Com o modal de correção aberto e erro neste campo,
 * ele é mostrado lá dentro; fora disso, fica no lugar de sempre.
 */
function FormDialogField({ name, className, children, ...props }: FormDialogFieldProps) {
    const contexto = React.useContext(Contexto);
    const nomes = React.useMemo(() => (Array.isArray(name) ? name : [name]), [name]);
    const chave = nomes.join('|');
    const registrar = contexto?.registrar;

    React.useEffect(() => {
        if (!registrar) {
            return;
        }

        return registrar(chave.split('|'));
    }, [registrar, chave]);

    const temErro = nomes.some((nome) => Boolean(contexto?.erros[nome]));
    const campo = (
        <div className={cn('grid gap-2', className)} {...props}>
            {children}
        </div>
    );

    if (contexto?.alvo && temErro) {
        return createPortal(campo, contexto.alvo);
    }

    return campo;
}

export { FormDialogCorrecao, FormDialogField };
