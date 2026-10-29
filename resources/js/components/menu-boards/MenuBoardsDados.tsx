import InputError from '@/components/input-error';
import MenuBoardsTemaPicker from '@/components/menu-boards/MenuBoardsTemaPicker';
import { nomeDoTema } from '@/components/menu-boards/temas';
import type { TemaMenuBoard } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type Props = {
    nome: string;
    tema: TemaMenuBoard;
    abertoDeInicio: boolean;
    erros: { nome?: string; tema?: string };
    onNome: (nome: string) => void;
    onTema: (tema: TemaMenuBoard) => void;
};

/**
 * Nome e tema mudam pouco: ficam recolhidos num resumo para o conteúdo das páginas aparecer logo.
 * Num board novo (ou com erro nesses campos) a seção já abre.
 */
export default function MenuBoardsDados({ nome, tema, abertoDeInicio, erros, onNome, onTema }: Props) {
    const [aberto, setAberto] = useState(abertoDeInicio);
    const expandido = aberto || Boolean(erros.nome || erros.tema);

    return (
        <section className="border-sidebar-border/70 flex flex-col gap-5 rounded-xl border bg-white px-4 py-4 shadow-sm md:px-6 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold">Dados do board</h2>
                    <p className="text-muted-foreground truncate text-sm">
                        {nome.trim() || 'Novo board'} · Tema {nomeDoTema(tema)}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 md:h-9"
                    aria-expanded={expandido}
                    onClick={() => setAberto(!expandido)}
                >
                    {expandido ? 'Fechar' : 'Editar nome e tema'}
                </Button>
            </div>

            {expandido ? (
                <div className="flex flex-wrap gap-6">
                    <div className="grid min-w-0 flex-[1_1_240px] content-start gap-2">
                        <Label htmlFor="menu_board_nome">Nome do Board</Label>
                        <Input
                            id="menu_board_nome"
                            value={nome}
                            onChange={(event) => onNome(event.target.value)}
                            placeholder="Ex.: Menu Almoço, Café da manhã"
                            maxLength={80}
                            className="h-11 text-base md:h-10 md:text-sm"
                        />
                        <span className="text-muted-foreground text-xs">Obrigatório. Aparece no cabeçalho de todas as páginas.</span>
                        <InputError message={erros.nome} />
                    </div>
                    <div className="min-w-0 flex-[2_1_360px]">
                        <MenuBoardsTemaPicker value={tema} onChange={onTema} />
                        <InputError message={erros.tema} />
                    </div>
                </div>
            ) : null}
        </section>
    );
}
