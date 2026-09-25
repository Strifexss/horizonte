import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    from: number | null;
    to: number | null;
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
};

const PER_PAGE_OPTIONS = [10, 20, 25, 50];

function buildPageNumbers(currentPage: number, lastPage: number): Array<number | 'ellipsis'> {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, lastPage, currentPage, currentPage - 1, currentPage + 1]);
    if (currentPage <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }
    if (currentPage >= lastPage - 2) {
        pages.add(lastPage - 1);
        pages.add(lastPage - 2);
        pages.add(lastPage - 3);
    }

    const sorted = [...pages].filter((page) => page >= 1 && page <= lastPage).sort((a, b) => a - b);
    const result: Array<number | 'ellipsis'> = [];

    for (let index = 0; index < sorted.length; index++) {
        const page = sorted[index];
        if (index > 0 && page - sorted[index - 1] > 1) {
            result.push('ellipsis');
        }
        result.push(page);
    }

    return result;
}

export default function ExtratoFooter({
    from,
    to,
    total,
    currentPage,
    lastPage,
    perPage,
    onPageChange,
    onPerPageChange,
}: Props) {
    const pageNumbers = buildPageNumbers(currentPage, Math.max(lastPage, 1));
    const showingLabel =
        total === 0 || from === null || to === null
            ? `Mostrando 0 de ${total} lançamentos`
            : `Mostrando ${from}–${to} de ${total} lançamentos`;

    return (
        <div className="extrato-table-footer mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">{showingLabel}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Por página:</span>
                    <select
                        name="perPage"
                        className="ml-1 rounded border px-2 py-1 text-sm"
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                    >
                        {PER_PAGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <button
                    type="button"
                    className="extrato-page-button rounded p-2 hover:bg-sidebar-border/20 disabled:opacity-40"
                    aria-label="Página anterior"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                {pageNumbers.map((page, index) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-soft">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            className={`extrato-page-button rounded px-3 py-1 ${
                                page === currentPage ? 'extrato-page-button-active bg-sidebar-border/10' : ''
                            }`}
                            aria-current={page === currentPage ? 'page' : undefined}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    ),
                )}
                <button
                    type="button"
                    className="extrato-page-button rounded p-2 hover:bg-sidebar-border/20 disabled:opacity-40"
                    aria-label="Próxima página"
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
