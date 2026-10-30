type Props = {
    texto?: string;
};

/** Login com Google é uma navegação completa (redirect OAuth), não uma visita Inertia. */
export default function BotaoGoogle({ texto = 'Entrar com Google' }: Props) {
    return (
        <div className="flex flex-col gap-3">
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
                <span className="bg-border h-px flex-1" />
                ou
                <span className="bg-border h-px flex-1" />
            </div>
            <a
                href={route('google.redirect')}
                className="border-input hover:bg-accent flex h-10 w-full items-center justify-center gap-2 rounded-md border bg-white text-sm font-medium dark:bg-transparent"
            >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
                    <path
                        fill="#34A853"
                        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
                    />
                    <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3Z" />
                    <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
                </svg>
                {texto}
            </a>
            <p className="text-muted-foreground text-center text-xs">
                Conta Google e conta com senha são separadas: entre pelo mesmo caminho do cadastro.
            </p>
        </div>
    );
}
