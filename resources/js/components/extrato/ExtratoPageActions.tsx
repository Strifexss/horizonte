import { ChevronDown, File, Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ExtratoPageActionsProps = {
    pdfLoading: boolean;
    onGerarPdf: () => void;
    onNovoLancamento: () => void;
    onOpenCategorias: () => void;
    onOpenProdutos: () => void;
    onOpenFuncionarios: () => void;
    onOpenFornecedores: () => void;
};

export default function ExtratoPageActions({
    pdfLoading,
    onGerarPdf,
    onNovoLancamento,
    onOpenCategorias,
    onOpenProdutos,
    onOpenFuncionarios,
    onOpenFornecedores,
}: ExtratoPageActionsProps) {
    return (
        <>
            <div className="relative hidden md:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="hidden items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-base font-medium text-muted-foreground hover:bg-sidebar-border/50 md:inline-flex dark:bg-slate-800 dark:text-muted-foreground"
                        >
                            Ações
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onSelect={onOpenCategorias}>Categorias</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onOpenProdutos}>Produtos</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onOpenFuncionarios}>Funcionários</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onOpenFornecedores}>Fornecedores</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <button
                type="button"
                className="hidden items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-base font-medium text-muted-foreground hover:bg-sidebar-border/50 md:inline-flex dark:bg-slate-800 dark:text-muted-foreground"
                onClick={onGerarPdf}
                disabled={pdfLoading}
            >
                {pdfLoading ? (
                    <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        <span>Gerando...</span>
                    </>
                ) : (
                    <>
                        <File className="h-5 w-5" />
                        Gerar PDF
                    </>
                )}
            </button>
            <button
                type="button"
                className="hidden items-center gap-3 rounded-lg bg-amber-500 px-4 py-2 text-base font-medium text-white hover:bg-amber-600 md:inline-flex"
                onClick={onNovoLancamento}
            >
                <Plus className="h-5 w-5" />
                Adicionar lançamento
            </button>
        </>
    );
}
