type Props = {
    duracoes: number[];
    atual: number;
    corAtiva: string;
    corTrilho: string;
    className?: string;
};

/**
 * Barra de rotação: um trecho por página, proporcional ao tempo dela. A página atual enche
 * em animação CSS e reinicia a cada troca.
 */
export default function TvProgresso({ duracoes, atual, corAtiva, corTrilho, className = '' }: Props) {
    if (duracoes.length < 2) {
        return null;
    }

    return (
        <div role="img" aria-label={`Página ${atual + 1} de ${duracoes.length}`} className={`flex items-center gap-[0.45cqw] ${className}`}>
            {duracoes.map((duracao, indice) => (
                <span
                    key={indice}
                    className={`h-[0.3cqw] min-h-[3px] overflow-hidden rounded-full ${corTrilho}`}
                    style={{ width: `${Math.min(Math.max(duracao, 8), 40) * 0.3}cqw` }}
                >
                    {indice < atual ? <span className={`block h-full w-full ${corAtiva}`} /> : null}
                    {indice === atual ? (
                        <span
                            key={`${atual}-${duracao}`}
                            className={`block h-full w-full origin-left ${corAtiva}`}
                            style={{ animation: `tv-progresso ${duracao}s linear forwards` }}
                        />
                    ) : null}
                </span>
            ))}
        </div>
    );
}
