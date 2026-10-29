import InputError from '@/components/input-error';
import MenuBoardsConteudoAviso from '@/components/menu-boards/MenuBoardsConteudoAviso';
import MenuBoardsFonteGrupo from '@/components/menu-boards/MenuBoardsFonteGrupo';
import MenuBoardsProdutos from '@/components/menu-boards/MenuBoardsProdutos';
import MenuBoardsSeletorProduto from '@/components/menu-boards/MenuBoardsSeletorProduto';
import { MAXIMO_DESTAQUES } from '@/components/menu-boards/layouts';
import {
    formatarPreco,
    type ConfiguracaoPagina,
    type FonteProdutos,
    type GrupoDoBoard,
    type MenuBoardItemForm,
    type PaginaForm,
    type ProdutoDoBoard,
} from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Star, Upload, X } from 'lucide-react';

type Props = {
    indice: number;
    pagina: PaginaForm;
    produtos: ProdutoDoBoard[];
    grupos: GrupoDoBoard[];
    imagemPrevia: string | null;
    erros: Record<string, string | undefined>;
    onConfig: (campos: Partial<ConfiguracaoPagina>) => void;
    onItens: (itens: MenuBoardItemForm[]) => void;
    onImagem: (imagem: File | null) => void;
    onFoto: (produto: ProdutoDoBoard) => void;
};

/**
 * Conteúdo da página conforme o layout escolhido.
 */
export default function MenuBoardsConteudo(props: Props) {
    const { pagina } = props;

    switch (pagina.layout) {
        case 'destaques_grade':
            return <Destaques {...props} />;
        case 'categoria':
            return (
                <Bloco titulo="Produtos da categoria">
                    <MenuBoardsFonteGrupo
                        idBase={`pagina-${props.indice}`}
                        configuracao={pagina.configuracao}
                        grupos={props.grupos}
                        produtos={props.produtos}
                        erro={props.erros['configuracao.grupo_id']}
                        onConfig={props.onConfig}
                    />
                </Bloco>
            );
        case 'banner':
            return (
                <Bloco titulo="Imagem do banner">
                    <SeletorImagem
                        {...props}
                        dica="Ocupa a tela toda, sem cabeçalho. Tamanho ideal 1920 × 1080 px (16:9). JPG, PNG ou WEBP, até 4 MB."
                    />
                </Bloco>
            );
        case 'imagem_lista':
            return <ImagemLista {...props} />;
        case 'aviso':
            return (
                <MenuBoardsConteudoAviso
                    idBase={`pagina-${props.indice}`}
                    configuracao={pagina.configuracao}
                    erros={props.erros}
                    onConfig={props.onConfig}
                />
            );
        case 'produto_destaque':
            return <ProdutoDestaque {...props} />;
    }
}

function Bloco({ titulo, extra, children }: { titulo: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[15px] font-semibold">{titulo}</h3>
                {extra}
            </div>
            {children}
        </div>
    );
}

function OrigemProdutos({ valor, onChange }: { valor: FonteProdutos; onChange: (fonte: FonteProdutos) => void }) {
    return (
        <div
            role="group"
            aria-label="Origem dos produtos"
            className="grid w-full grid-cols-2 rounded-lg bg-slate-100 p-[3px] md:inline-flex md:w-auto dark:bg-slate-800"
        >
            {(['manual', 'categoria'] as const).map((fonte) => (
                <button
                    key={fonte}
                    type="button"
                    aria-pressed={valor === fonte}
                    onClick={() => onChange(fonte)}
                    className={`h-10 rounded-md px-3 text-sm md:h-[34px] ${valor === fonte ? 'bg-white font-semibold shadow-sm dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    {fonte === 'manual' ? 'Escolher produtos' : 'Categoria automática'}
                </button>
            ))}
        </div>
    );
}

function alternarItem(itens: MenuBoardItemForm[], produtoId: number, destaque = false): MenuBoardItemForm[] {
    return itens.some((item) => item.produto_id === produtoId)
        ? itens.filter((item) => item.produto_id !== produtoId)
        : [...itens, { produto_id: produtoId, destaque }];
}

function Destaques({ indice, pagina, produtos, grupos, erros, onConfig, onItens, onFoto }: Props) {
    const destaques = pagina.itens.filter((item) => item.destaque);
    const idsDestaque = destaques.map((item) => item.produto_id);
    const porId = new Map(produtos.map((produto) => [produto.id, produto]));
    const fonte = pagina.configuracao.fonte ?? 'manual';
    const disponiveisParaGrade = produtos.filter((produto) => !idsDestaque.includes(produto.id));

    return (
        <div className="flex flex-col gap-6">
            <Bloco
                titulo={
                    <span className="flex items-center gap-2">
                        <Star aria-hidden="true" className="size-4 fill-amber-600 text-amber-600" />
                        Destaques
                    </span>
                }
                extra={
                    <span className="text-muted-foreground text-[13px]">
                        <strong className="text-foreground">{destaques.length}</strong> de {MAXIMO_DESTAQUES}
                    </span>
                }
            >
                <ul className="rounded-lg border border-slate-200 dark:border-slate-700">
                    {destaques.map((item) => {
                        const produto = porId.get(item.produto_id);
                        if (!produto) {
                            return null;
                        }

                        return (
                            <li
                                key={item.produto_id}
                                className="flex items-center gap-3 border-b border-slate-100 py-2 pr-1 pl-3 dark:border-slate-800"
                            >
                                <FotoProduto produto={produto} />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">{produto.nome}</span>
                                    <span className="text-muted-foreground block truncate text-xs">{produto.descricao || 'Sem descrição'}</span>
                                </span>
                                <span className="text-sm font-semibold whitespace-nowrap tabular-nums">{formatarPreco(produto.preco_venda)}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-11 md:size-9"
                                    aria-label={`Tirar ${produto.nome} dos destaques`}
                                    onClick={() => onItens(pagina.itens.filter((atual) => atual.produto_id !== produto.id))}
                                >
                                    <X />
                                </Button>
                            </li>
                        );
                    })}
                    <li className="p-2 md:p-3">
                        {destaques.length < MAXIMO_DESTAQUES ? (
                            <MenuBoardsSeletorProduto
                                id={`pagina-${indice}-novo-destaque`}
                                produtos={produtos.filter((produto) => !idsDestaque.includes(produto.id))}
                                placeholder="+ Adicionar destaque"
                                onEscolher={(produtoId) =>
                                    onItens([
                                        ...pagina.itens.filter((item) => item.produto_id !== produtoId),
                                        { produto_id: produtoId, destaque: true },
                                    ])
                                }
                            />
                        ) : (
                            <p className="text-muted-foreground text-[13px]">Limite de {MAXIMO_DESTAQUES} destaques. Tire um para adicionar outro.</p>
                        )}
                    </li>
                </ul>
                <InputError message={erros.itens} />
            </Bloco>

            <Bloco titulo="Grade de produtos" extra={<OrigemProdutos valor={fonte} onChange={(nova) => onConfig({ fonte: nova })} />}>
                {fonte === 'categoria' ? (
                    <MenuBoardsFonteGrupo
                        idBase={`pagina-${indice}`}
                        configuracao={pagina.configuracao}
                        grupos={grupos}
                        produtos={produtos}
                        erro={erros['configuracao.grupo_id']}
                        onConfig={onConfig}
                    >
                        <label className="flex min-h-11 items-center gap-2.5 text-sm">
                            <Checkbox
                                checked={pagina.configuracao.ocultar_destaques ?? true}
                                onCheckedChange={(marcado) => onConfig({ ocultar_destaques: marcado === true })}
                            />
                            Não repetir produtos que já estão nos destaques
                        </label>
                    </MenuBoardsFonteGrupo>
                ) : (
                    <MenuBoardsProdutos
                        produtos={disponiveisParaGrade}
                        selecionados={pagina.itens.filter((item) => !item.destaque).map((item) => item.produto_id)}
                        onToggle={(produto) => onItens(alternarItem(pagina.itens, produto.id))}
                        onFoto={onFoto}
                    />
                )}
            </Bloco>
        </div>
    );
}

function ImagemLista(props: Props) {
    const { indice, pagina, produtos, grupos, erros, onConfig, onItens, onFoto } = props;
    const fonte = pagina.configuracao.fonte ?? 'manual';

    return (
        <div className="flex flex-col gap-6">
            <Bloco titulo="Imagem">
                <SeletorImagem
                    {...props}
                    dica="Ocupa a metade esquerda da tela. Foto vertical ou quadrada fica melhor. JPG, PNG ou WEBP, até 4 MB."
                />
            </Bloco>
            <div className="grid gap-2">
                <Label htmlFor={`pagina-${indice}-titulo`}>
                    Título da lista <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                    id={`pagina-${indice}-titulo`}
                    maxLength={60}
                    value={pagina.configuracao.titulo ?? ''}
                    onChange={(event) => onConfig({ titulo: event.target.value })}
                    placeholder="Ex.: Porções, Sobremesas"
                    className="h-11 max-w-md text-base md:h-10 md:text-sm"
                />
            </div>
            <Bloco titulo="Produtos da lista" extra={<OrigemProdutos valor={fonte} onChange={(nova) => onConfig({ fonte: nova })} />}>
                {fonte === 'categoria' ? (
                    <MenuBoardsFonteGrupo
                        idBase={`pagina-${indice}`}
                        configuracao={pagina.configuracao}
                        grupos={grupos}
                        produtos={produtos}
                        erro={erros['configuracao.grupo_id']}
                        onConfig={onConfig}
                    />
                ) : (
                    <MenuBoardsProdutos
                        produtos={produtos}
                        selecionados={pagina.itens.map((item) => item.produto_id)}
                        onToggle={(produto) => onItens(alternarItem(pagina.itens, produto.id))}
                        onFoto={onFoto}
                    />
                )}
            </Bloco>
        </div>
    );
}

function ProdutoDestaque({ indice, pagina, produtos, erros, onConfig, onItens, onFoto }: Props) {
    const produto = produtos.find((item) => item.id === pagina.itens[0]?.produto_id);
    const posicao = pagina.configuracao.foto_posicao ?? 'direita';
    const selo = pagina.configuracao.selo ?? '';
    const chamada = pagina.configuracao.chamada ?? '';

    return (
        <div className="flex flex-col gap-6">
            <Bloco titulo="Produto">
                <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <MenuBoardsSeletorProduto
                        id={`pagina-${indice}-produto`}
                        produtos={produtos}
                        valor={produto?.id}
                        placeholder="Escolha o produto"
                        onEscolher={(produtoId) => onItens([{ produto_id: produtoId, destaque: false }])}
                    />
                    {produto ? (
                        <div className="flex flex-wrap items-center gap-4">
                            <FotoProduto produto={produto} grande />
                            <div className="min-w-0 flex-[1_1_200px]">
                                <p className="font-semibold">{produto.nome}</p>
                                <p className="text-muted-foreground text-[13px]">
                                    {produto.grupo?.nome ? `${produto.grupo.nome} · ` : ''}
                                    {produto.descricao || 'Sem descrição'}
                                </p>
                                <p className="mt-1 text-[15px] font-bold tabular-nums">{formatarPreco(produto.preco_venda)}</p>
                            </div>
                            <Button type="button" variant="outline" className="h-11 md:h-9" onClick={() => onFoto(produto)}>
                                {produto.foto_url ? 'Trocar foto' : 'Adicionar foto'}
                            </Button>
                        </div>
                    ) : null}
                    <label className="flex min-h-11 items-center gap-2.5 text-sm">
                        <Checkbox
                            checked={pagina.configuracao.mostrar_descricao ?? true}
                            onCheckedChange={(marcado) => onConfig({ mostrar_descricao: marcado === true })}
                        />
                        Mostrar a descrição do produto
                    </label>
                    <p className="rounded-lg bg-sky-50 p-3 text-[13px] text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                        Nome, descrição, foto e preço vêm do cadastro do produto. Se o produto for desativado, esta página sai da TV.
                    </p>
                    <InputError message={erros.itens} />
                </div>
            </Bloco>

            <div className="flex flex-wrap gap-6">
                <div className="grid min-w-0 flex-[1_1_240px] content-start gap-2">
                    <Label htmlFor={`pagina-${indice}-selo`}>
                        Selo <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                        id={`pagina-${indice}-selo`}
                        maxLength={20}
                        value={selo}
                        onChange={(event) => onConfig({ selo: event.target.value })}
                        placeholder="Ex.: Mais pedido, Novidade, Só hoje"
                        className="h-11 text-base md:h-10 md:text-sm"
                    />
                    <span className="text-muted-foreground flex justify-between gap-2 text-xs">
                        <span>Aparece acima do nome. Em branco, a página fica sem selo.</span>
                        <span className="tabular-nums">{selo.length}/20</span>
                    </span>
                </div>
                <div className="grid min-w-0 flex-[2_1_320px] content-start gap-2">
                    <Label htmlFor={`pagina-${indice}-chamada`}>
                        Chamada <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                        id={`pagina-${indice}-chamada`}
                        maxLength={70}
                        value={chamada}
                        onChange={(event) => onConfig({ chamada: event.target.value })}
                        placeholder="Ex.: Feito na hora, do jeito que você pedir."
                        className="h-11 text-base md:h-10 md:text-sm"
                    />
                    <span className="text-muted-foreground flex justify-between gap-2 text-xs">
                        <span>Frase curta abaixo da descrição.</span>
                        <span className="tabular-nums">{chamada.length}/70</span>
                    </span>
                </div>
            </div>

            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Foto</legend>
                <div className="grid grid-cols-2 gap-2 md:flex">
                    {(['esquerda', 'direita'] as const).map((lado) => (
                        <button
                            key={lado}
                            type="button"
                            aria-pressed={posicao === lado}
                            onClick={() => onConfig({ foto_posicao: lado })}
                            className={`h-11 rounded-lg px-4 text-sm md:h-10 ${
                                posicao === lado
                                    ? 'border-2 border-amber-500 bg-amber-50 font-semibold dark:bg-amber-950/30'
                                    : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                            }`}
                        >
                            {lado === 'esquerda' ? 'À esquerda' : 'À direita'}
                        </button>
                    ))}
                </div>
            </fieldset>
        </div>
    );
}

function FotoProduto({ produto, grande = false }: { produto: ProdutoDoBoard; grande?: boolean }) {
    const tamanho = grande ? 'h-[90px] w-[120px]' : 'size-10';

    return produto.foto_url ? (
        <img src={produto.foto_url} alt="" className={`${tamanho} shrink-0 rounded-lg object-cover`} />
    ) : (
        <span aria-hidden="true" className={`${tamanho} flex shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700`}>
            <ImageIcon className="size-4" />
        </span>
    );
}

function SeletorImagem({ indice, pagina, imagemPrevia, erros, onImagem, dica }: Props & { dica: string }) {
    const imagem = imagemPrevia ?? pagina.imagem_url;
    const seletor = (
        <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
                onImagem(event.target.files?.[0] ?? null);
                event.target.value = '';
            }}
        />
    );

    return (
        <div className="flex flex-col gap-3">
            {imagem ? (
                <div className="flex flex-wrap items-center gap-4">
                    <img src={imagem} alt={`Imagem da página ${indice + 1}`} className="aspect-video w-56 rounded-lg bg-slate-100 object-cover" />
                    <label className="hover:bg-accent inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-medium focus-within:ring-2 focus-within:ring-amber-500 md:h-10">
                        {seletor}
                        <Upload className="size-4" />
                        Trocar imagem
                    </label>
                </div>
            ) : (
                <label className="text-muted-foreground flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center focus-within:ring-2 focus-within:ring-amber-500 hover:border-amber-500 hover:bg-amber-50 dark:border-slate-600 dark:bg-slate-800">
                    {seletor}
                    <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Upload className="size-5" />
                    </span>
                    <span className="text-foreground font-semibold">Escolher imagem</span>
                </label>
            )}
            <span className="text-muted-foreground text-xs">{dica}</span>
            <InputError message={erros.imagem} />
        </div>
    );
}
