import type { GrupoDoBoard, LayoutPagina, PaginaEdicao, PaginaForm, ProdutoDoBoard } from '@/components/menu-boards/types';
import type { ProdutoNaTv, TvPagina } from '@/components/tv/temas';

export const MAXIMO_DESTAQUES = 3;

export const DURACAO_MINIMA = 5;

export const DURACAO_MAXIMA = 300;

export const DURACAO_PADRAO = 15;

export type LayoutInfo = {
    id: LayoutPagina;
    nome: string;
    descricao: string;
    nomePadrao: string;
};

export const LAYOUTS: LayoutInfo[] = [
    {
        id: 'destaques_grade',
        nome: 'Destaques + Grade',
        descricao: 'Até 3 destaques grandes no topo e os demais produtos em grade.',
        nomePadrao: 'Destaques do dia',
    },
    {
        id: 'categoria',
        nome: 'Categoria',
        descricao: 'Lista em colunas com o nome do grupo no topo. Os produtos do grupo entram sozinhos.',
        nomePadrao: 'Categoria',
    },
    {
        id: 'banner',
        nome: 'Banner cheio',
        descricao: 'Uma imagem sua ocupando a tela toda. Para campanhas e datas especiais.',
        nomePadrao: 'Banner',
    },
    {
        id: 'imagem_lista',
        nome: 'Imagem + Lista',
        descricao: 'Foto grande de um lado e lista de produtos (escolhidos ou por grupo) do outro.',
        nomePadrao: 'Imagem e lista',
    },
    {
        id: 'aviso',
        nome: 'Aviso',
        descricao: 'Texto grande com QR Code opcional: avaliação, Instagram, cardápio online.',
        nomePadrao: 'Aviso',
    },
    {
        id: 'produto_destaque',
        nome: 'Produto em destaque',
        descricao: 'Um produto só, em tela cheia: foto grande, nome, descrição, preço e selo opcional.',
        nomePadrao: 'Prato do dia',
    },
];

export function infoDoLayout(layout: LayoutPagina): LayoutInfo {
    return LAYOUTS.find((item) => item.id === layout) ?? LAYOUTS[0];
}

let sequencia = 0;

export function novaChave(): string {
    sequencia += 1;

    return `pagina-${Date.now()}-${sequencia}`;
}

export function paginaDoServidor(pagina: PaginaEdicao): PaginaForm {
    return { ...pagina, configuracao: { ...pagina.configuracao }, chave: novaChave(), imagem: null };
}

export function novaPagina(layout: LayoutPagina): PaginaForm {
    const configuracao: PaginaForm['configuracao'] = {
        destaques_grade: { fonte: 'manual' as const, grupo_id: null, ordenacao: 'nome' as const, ocultar_destaques: true },
        categoria: { grupo_id: null, ordenacao: 'nome' as const },
        banner: {},
        imagem_lista: { titulo: '', fonte: 'manual' as const, grupo_id: null, ordenacao: 'nome' as const },
        aviso: { titulo: '', texto: '', qr_ativo: false, qr_link: '', qr_legenda: '' },
        produto_destaque: { selo: '', chamada: '', mostrar_descricao: true, foto_posicao: 'direita' as const },
    }[layout];

    return {
        chave: novaChave(),
        nome: infoDoLayout(layout).nomePadrao,
        layout,
        duracao_segundos: DURACAO_PADRAO,
        configuracao,
        imagem: null,
        imagem_atual: null,
        imagem_url: null,
        itens: [],
    };
}

/**
 * Grupos que têm produtos ativos, para as páginas que listam um grupo.
 */
export function gruposDosProdutos(produtos: ProdutoDoBoard[]): GrupoDoBoard[] {
    const grupos = new Map<number, string>();

    produtos.forEach((produto) => {
        if (produto.grupo_id && produto.grupo?.nome) {
            grupos.set(produto.grupo_id, produto.grupo.nome);
        }
    });

    return [...grupos].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function produtoNaTv(produto: ProdutoDoBoard, comDescricao = true): ProdutoNaTv {
    return {
        id: produto.id,
        nome: produto.nome,
        descricao: comDescricao ? produto.descricao || null : null,
        preco: produto.preco_venda,
        foto_url: produto.foto_url,
    };
}

function produtosDoGrupo(pagina: PaginaForm, produtos: ProdutoDoBoard[]): ProdutoDoBoard[] {
    const { grupo_id: grupoId, ordenacao = 'nome' } = pagina.configuracao;
    const doGrupo = produtos.filter((produto) => grupoId && produto.grupo_id === grupoId);

    return doGrupo.sort((a, b) => {
        if (ordenacao === 'menor_preco') {
            return Number(a.preco_venda) - Number(b.preco_venda);
        }
        if (ordenacao === 'maior_preco') {
            return Number(b.preco_venda) - Number(a.preco_venda);
        }

        return a.nome.localeCompare(b.nome, 'pt-BR');
    });
}

/**
 * Monta a página como a TV vai mostrar, a partir do que está no editor (mesmas regras do TvBoardResource).
 * Devolve null quando a página ainda não tem conteúdo para exibir.
 */
export function paginaParaTv(pagina: PaginaForm, produtos: ProdutoDoBoard[], imagemPrevia: string | null): TvPagina | null {
    const porId = new Map(produtos.map((produto) => [produto.id, produto]));
    const escolhidos = (destaque?: boolean) =>
        pagina.itens
            .filter((item) => destaque === undefined || item.destaque === destaque)
            .map((item) => porId.get(item.produto_id))
            .filter((produto): produto is ProdutoDoBoard => produto !== undefined);
    const porCategoria = pagina.configuracao.fonte === 'categoria';
    const imagem = imagemPrevia ?? pagina.imagem_url;
    const base = { duracao_segundos: pagina.duracao_segundos };

    switch (pagina.layout) {
        case 'destaques_grade': {
            const destaques = escolhidos(true);
            let grade = porCategoria ? produtosDoGrupo(pagina, produtos) : escolhidos(false);
            if (porCategoria && pagina.configuracao.ocultar_destaques) {
                grade = grade.filter((produto) => !destaques.some((destaque) => destaque.id === produto.id));
            }

            return destaques.length || grade.length
                ? { ...base, layout: 'destaques_grade', destaques: destaques.map((p) => produtoNaTv(p)), itens: grade.map((p) => produtoNaTv(p)) }
                : null;
        }
        case 'categoria': {
            const itens = produtosDoGrupo(pagina, produtos);
            const grupo = produtos.find((produto) => produto.grupo_id === pagina.configuracao.grupo_id)?.grupo?.nome ?? null;

            return itens.length ? { ...base, layout: 'categoria', titulo: grupo, itens: itens.map((p) => produtoNaTv(p)) } : null;
        }
        case 'banner':
            return imagem ? { ...base, layout: 'banner', imagem_url: imagem } : null;
        case 'imagem_lista': {
            const itens = porCategoria ? produtosDoGrupo(pagina, produtos) : escolhidos();

            return imagem
                ? {
                      ...base,
                      layout: 'imagem_lista',
                      imagem_url: imagem,
                      titulo: pagina.configuracao.titulo || null,
                      itens: itens.map((p) => produtoNaTv(p)),
                  }
                : null;
        }
        case 'aviso': {
            const { titulo, texto, qr_ativo: qrAtivo, qr_link: link, qr_legenda: legenda } = pagina.configuracao;

            return titulo
                ? { ...base, layout: 'aviso', titulo, texto: texto || null, qr: qrAtivo && link ? { link, legenda: legenda || null } : null }
                : null;
        }
        case 'produto_destaque': {
            const [produto] = escolhidos();

            return produto
                ? {
                      ...base,
                      layout: 'produto_destaque',
                      produto: produtoNaTv(produto, pagina.configuracao.mostrar_descricao ?? true),
                      selo: pagina.configuracao.selo || null,
                      chamada: pagina.configuracao.chamada || null,
                      foto_posicao: pagina.configuracao.foto_posicao ?? 'direita',
                  }
                : null;
        }
    }
}
