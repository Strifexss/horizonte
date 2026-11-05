import { Fragment, type ReactNode } from 'react';

/** Converte **negrito** em <strong>. */
function comNegrito(linha: string): ReactNode[] {
    return linha
        .split(/(\*\*[^*]+\*\*)/g)
        .map((parte, indice) =>
            parte.startsWith('**') && parte.endsWith('**') ? (
                <strong key={indice}>{parte.slice(2, -2)}</strong>
            ) : (
                <Fragment key={indice}>{parte}</Fragment>
            ),
        );
}

/**
 * Markdown mínimo das respostas e da ajuda: parágrafos, "## " como subtítulo, listas "- " e "1. ", **negrito**.
 * O "# " do título do arquivo é omitido.
 */
export default function CopilotoTexto({ texto }: { texto: string }) {
    const blocos = texto
        .split('\n')
        .map((linha) => linha.trimEnd())
        .filter((linha) => !linha.startsWith('# '));

    return (
        <div className="flex flex-col gap-1.5">
            {blocos.map((linha, indice) => {
                if (linha === '') {
                    return <div key={indice} className="h-1" aria-hidden="true" />;
                }

                if (linha.startsWith('## ')) {
                    return (
                        <p key={indice} className="font-semibold">
                            {linha.slice(3)}
                        </p>
                    );
                }

                const item = /^(\d+\.|-)\s+(.*)$/.exec(linha);

                if (item) {
                    return (
                        <div key={indice} className="flex gap-2">
                            <span className="text-muted-foreground shrink-0 tabular-nums">{item[1] === '-' ? '•' : item[1]}</span>
                            <span>{comNegrito(item[2])}</span>
                        </div>
                    );
                }

                return <p key={indice}>{comNegrito(linha)}</p>;
            })}
        </div>
    );
}
