<?php

namespace App\Repositories;

use App\Models\Novidade;
use App\Models\NovidadeDispensada;
use App\Models\NovidadeImagem;
use App\Models\User;
use App\Repositories\Interfaces\NovidadeRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class NovidadeRepository extends AbstractRepository implements NovidadeRepositoryInterface
{
    public function __construct(Novidade $novidade)
    {
        parent::__construct($novidade);
    }

    public function index($data = null)
    {
        return $this->model->newQuery()
            ->with('imagens')
            ->withCount('dispensas')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    public function findPublicada(int $id): Novidade
    {
        return $this->publicadasQuery()->findOrFail($id);
    }

    public function pendentesPopup(int $usuarioId): Collection
    {
        return $this->publicadasQuery()
            ->with('imagens')
            ->where('popup_automatico', true)
            ->whereDoesntHave('dispensas', fn (Builder $query) => $query->where('usuario_id', $usuarioId))
            ->orderBy('publicada_em')
            ->orderBy('id')
            ->get();
    }

    public function historicoDoUsuario(int $usuarioId): Collection
    {
        return $this->publicadasQuery()
            ->with('imagens')
            ->withExists(['dispensas as dispensada' => fn (Builder $query) => $query->where('usuario_id', $usuarioId)])
            ->orderByDesc('publicada_em')
            ->orderByDesc('id')
            ->get();
    }

    public function dispensar(int $usuarioId, int $novidadeId): void
    {
        NovidadeDispensada::query()->firstOrCreate(
            ['usuario_id' => $usuarioId, 'novidade_id' => $novidadeId],
            ['dispensada_em' => now()],
        );
    }

    public function desfazerDispensa(int $usuarioId, int $novidadeId): void
    {
        NovidadeDispensada::query()
            ->where('usuario_id', $usuarioId)
            ->where('novidade_id', $novidadeId)
            ->delete();
    }

    public function limparDispensas(int $novidadeId): void
    {
        NovidadeDispensada::query()->where('novidade_id', $novidadeId)->delete();
    }

    public function usuariosComDispensa(int $novidadeId): Collection
    {
        return User::query()
            ->select(['id', 'name', 'email'])
            ->addSelect(['dispensada_em' => NovidadeDispensada::query()
                ->select('dispensada_em')
                ->whereColumn('usuario_id', 'users.id')
                ->where('novidade_id', $novidadeId)
                ->limit(1),
            ])
            ->withCasts(['dispensada_em' => 'datetime'])
            ->orderBy('name')
            ->get();
    }

    public function salvarImagem(UploadedFile $imagem): string
    {
        return $imagem->store(Novidade::PASTA_IMAGENS, Novidade::discoImagens());
    }

    public function apagarImagem(string $caminho): void
    {
        Storage::disk(Novidade::discoImagens())->delete($caminho);
    }

    public function adicionarImagens(int $novidadeId, array $caminhos): void
    {
        $ordem = (int) NovidadeImagem::query()->where('novidade_id', $novidadeId)->max('ordem');

        foreach ($caminhos as $caminho) {
            NovidadeImagem::query()->create([
                'novidade_id' => $novidadeId,
                'caminho' => $caminho,
                'ordem' => ++$ordem,
            ]);
        }
    }

    public function removerImagens(int $novidadeId, array $ids): array
    {
        $imagens = NovidadeImagem::query()
            ->where('novidade_id', $novidadeId)
            ->whereIn('id', $ids)
            ->get();

        NovidadeImagem::query()->whereIn('id', $imagens->modelKeys())->delete();

        return $imagens->pluck('caminho')->all();
    }

    public function caminhosDasImagens(int $novidadeId): array
    {
        return NovidadeImagem::query()->where('novidade_id', $novidadeId)->pluck('caminho')->all();
    }

    public function diretorioImagens(): Collection
    {
        $disco = Storage::disk(Novidade::discoImagens());
        $caminhos = $disco->files(Novidade::PASTA_IMAGENS);
        $donas = NovidadeImagem::query()
            ->with('novidade:id,titulo')
            ->whereIn('caminho', $caminhos)
            ->get()
            ->keyBy('caminho');

        return collect($caminhos)
            ->map(fn (string $caminho): array => [
                'arquivo' => basename($caminho),
                'url' => $disco->url($caminho),
                'tamanho' => $disco->size($caminho),
                'modificado_em' => Carbon::createFromTimestamp($disco->lastModified($caminho)),
                'novidade_id' => $donas->get($caminho)?->novidade_id,
                'novidade_titulo' => $donas->get($caminho)?->novidade?->titulo,
            ])
            ->sortByDesc('modificado_em')
            ->values();
    }

    public function excluirDoDiretorio(string $arquivo): void
    {
        $caminho = Novidade::PASTA_IMAGENS.'/'.$arquivo;

        if (! Storage::disk(Novidade::discoImagens())->exists($caminho)) {
            throw (new ModelNotFoundException)->setModel(NovidadeImagem::class);
        }

        NovidadeImagem::query()->where('caminho', $caminho)->delete();
        $this->apagarImagem($caminho);
    }

    /**
     * @return Builder<Novidade>
     */
    private function publicadasQuery(): Builder
    {
        return $this->model->newQuery()->where('status', Novidade::STATUS_PUBLICADO);
    }
}
