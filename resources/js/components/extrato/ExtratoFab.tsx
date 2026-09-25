import { Package, Plus, UserRound, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Props = {
    onNovoLancamento: () => void;
    onCadastrarFuncionario: () => void;
    onCadastrarProduto: () => void;
};

export default function ExtratoFab({
    onNovoLancamento,
    onCadastrarFuncionario,
    onCadastrarProduto,
}: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const actions = [
        {
            key: 'lancamento',
            label: '+ Novo Lançamento',
            icon: <Wallet className="h-4 w-4" />,
            className: 'bg-emerald-500 text-white hover:bg-emerald-600',
            onClick: onNovoLancamento,
        },
        {
            key: 'funcionario',
            label: '+ Cadastrar Funcionário',
            icon: <UserRound className="h-4 w-4" />,
            className: 'bg-sky-500 text-white hover:bg-sky-600',
            onClick: onCadastrarFuncionario,
        },
        {
            key: 'produto',
            label: '+ Cadastrar Produto',
            icon: <Package className="h-4 w-4" />,
            className: 'bg-amber-500 text-white hover:bg-amber-600',
            onClick: onCadastrarProduto,
        },
    ] as const;

    return (
        <div className="pointer-events-none fixed right-4 bottom-[5.25rem] z-40 md:hidden">
            {open ? (
                <button
                    type="button"
                    aria-label="Fechar menu de ações"
                    className="pointer-events-auto fixed inset-0 z-40 bg-black/30"
                    onClick={() => setOpen(false)}
                />
            ) : null}

            <div className="pointer-events-auto relative z-50 flex flex-col items-end gap-3">
                {open ? (
                    <div className="mb-1 flex flex-col items-end gap-2">
                        {actions.map((action) => (
                            <button
                                key={action.key}
                                type="button"
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-lg ${action.className}`}
                                onClick={() => {
                                    setOpen(false);
                                    action.onClick();
                                }}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                <button
                    type="button"
                    aria-expanded={open}
                    aria-label={open ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-xl transition-transform hover:bg-amber-600 ${open ? 'rotate-45' : ''}`}
                    onClick={() => setOpen((v) => !v)}
                >
                    <Plus className="h-7 w-7" />
                </button>
            </div>
        </div>
    );
}
